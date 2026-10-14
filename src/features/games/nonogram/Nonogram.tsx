"use client";

import * as React from "react";
import { ArrowLeft, Lightbulb, Lock, RefreshCw, SkipForward, Undo2 } from "lucide-react";

import { MASCOT_NAME, TianwuBadge } from "@/components/mascot/Tianwu";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/cn";
import {
  CROSSED,
  EMPTY,
  FILLED,
  SIZES,
  cluesOf,
  column,
  filledOf,
  hint as findHint,
  isSolved,
  lineState,
  parsePicture,
  randomPicture,
  row,
  type Clues,
  type Hint,
  type LineState,
  type Mark,
  type Picture,
  type Size,
} from "./logic";
import { PICTURES } from "./pictures";

const STORAGE_KEY = "shanverse:nonogram:v1";
export const HINTS_PER_PUZZLE = 3;
/** Below this width a 15×15 board is too small to play; those puzzles stay locked. */
const WIDE_QUERY = "(min-width: 640px)";

type Mode = "pictures" | "random";
type Tool = typeof FILLED | typeof CROSSED;

/** An attempt in progress, saved so it survives a reload or a switch to another puzzle. */
type Attempt = { marks: string; elapsed: number; hints: number };
type PictureSave = { solved?: boolean; best?: number; attempt?: Attempt };
type RandomSave = { seed: number; best?: number; wins?: number; attempt?: Attempt };
type Saved = {
  mode: Mode;
  size: Size;
  pictures: Record<string, PictureSave>;
  random: Partial<Record<`${Size}`, RandomSave>>;
};

const emptySaved: Saved = { mode: "pictures", size: 10, pictures: {}, random: {} };
const PICTURE_BY_ID = new Map(PICTURES.map((entry) => [entry.id, entry]));
const PARSED = new Map(PICTURES.map((entry) => [entry.id, parsePicture(entry.rows)]));

const encode = (marks: readonly Mark[]) => marks.join("");
const decode = (text: string | undefined, length: number): Mark[] | null =>
  text && text.length === length && /^[012]+$/.test(text) ? (Array.from(text, Number) as Mark[]) : null;

function readSaved(): Saved {
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null") as Partial<Saved> | null;
    if (!value || typeof value !== "object") return emptySaved;
    const num = (n: unknown) => (typeof n === "number" && Number.isFinite(n) && n >= 0 ? n : undefined);
    const attempt = (a: unknown): Attempt | undefined => {
      const x = a as Partial<Attempt> | undefined;
      return x && typeof x.marks === "string" && num(x.elapsed) !== undefined && num(x.hints) !== undefined
        ? { marks: x.marks, elapsed: x.elapsed as number, hints: Math.min(HINTS_PER_PUZZLE, x.hints as number) }
        : undefined;
    };
    const pictures: Record<string, PictureSave> = {};
    for (const [id, save] of Object.entries(value.pictures ?? {})) {
      if (!PICTURE_BY_ID.has(id) || !save || typeof save !== "object") continue;
      pictures[id] = { solved: save.solved === true, best: num(save.best), attempt: attempt(save.attempt) };
    }
    const random: Saved["random"] = {};
    for (const size of SIZES) {
      const save = value.random?.[`${size}`];
      if (save && typeof save.seed === "number") random[`${size}`] = { seed: save.seed >>> 0, best: num(save.best), wins: num(save.wins), attempt: attempt(save.attempt) };
    }
    return {
      mode: value.mode === "random" ? "random" : "pictures",
      size: SIZES.includes(value.size as Size) ? (value.size as Size) : 10,
      pictures,
      random,
    };
  } catch {
    return emptySaved;
  }
}

function writeSaved(saved: Saved) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  } catch {
    // Not saved; the game still works.
  }
}

const newSeed = () => Math.floor(Math.random() * 2 ** 32) >>> 0;

function useWide() {
  const [wide, setWide] = React.useState(true);
  React.useEffect(() => {
    const query = window.matchMedia?.(WIDE_QUERY);
    if (!query) return;
    const update = () => setWide(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return wide;
}

export const formatTime = (ms: number) => {
  const total = Math.floor(ms / 1000);
  const minutes = Math.floor(total / 60);
  return `${minutes}:${String(total % 60).padStart(2, "0")}`;
};

/** Which puzzle is open: a picture by id, or the random puzzle of a size. */
type Open = { kind: "picture"; id: string } | { kind: "random"; size: Size };

export function Nonogram() {
  const { t, locale } = useI18n();
  const lang = locale === "en" ? "en" : "vi";
  const wide = useWide();
  const [saved, setSaved] = React.useState<Saved | null>(null);
  const [open, setOpen] = React.useState<Open | null>(null);

  const commit = React.useCallback((next: Saved) => {
    writeSaved(next);
    setSaved(next);
  }, []);

  React.useEffect(() => {
    const loaded = readSaved();
    setSaved(loaded);
    if (loaded.mode === "random") setOpen({ kind: "random", size: loaded.size });
  }, []);

  // A random puzzle needs its seed saved before the board mounts: the board's
  // key includes the seed, and a key change would reset the board mid-game.
  const missingSeed = saved && open?.kind === "random" && saved.random[`${open.size}`] === undefined ? open.size : null;
  React.useEffect(() => {
    if (!saved || missingSeed === null) return;
    commit({ ...saved, random: { ...saved.random, [`${missingSeed}`]: { seed: newSeed() } } });
  }, [saved, missingSeed, commit]);

  if (!saved || missingSeed !== null) return <div aria-busy="true" className="mx-auto h-96 max-w-3xl animate-pulse rounded-2xl border border-border bg-surface" />;

  const setMode = (mode: Mode) => {
    commit({ ...saved, mode });
    setOpen(mode === "random" ? { kind: "random", size: saved.size } : null);
  };

  return (
    <div className="space-y-6">
      <div role="radiogroup" aria-label={t("games.ngMode")} className="flex justify-center gap-2">
        {(["pictures", "random"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            role="radio"
            aria-checked={saved.mode === mode}
            onClick={() => setMode(mode)}
            className={cn(
              "min-h-10 rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-primary",
              saved.mode === mode ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface text-foreground-secondary hover:border-primary/50",
            )}
          >
            {mode === "pictures" ? t("games.ngModePictures") : t("games.ngModeRandom")}
          </button>
        ))}
      </div>

      {saved.mode === "pictures" && !open ? (
        <Gallery saved={saved} wide={wide} lang={lang} onOpen={(id) => setOpen({ kind: "picture", id })} />
      ) : null}

      {saved.mode === "random" ? (
        <div role="radiogroup" aria-label={t("games.ngSize")} className="flex flex-wrap justify-center gap-2">
          {SIZES.map((size) => {
            const locked = size === 15 && !wide;
            const label = t(size === 5 ? "games.ngEasy" : size === 10 ? "games.ngMedium" : "games.ngHard");
            return (
              <button
                key={size}
                type="button"
                role="radio"
                aria-checked={saved.size === size}
                disabled={locked}
                title={locked ? t("games.ngWideOnly") : undefined}
                onClick={() => {
                  commit({ ...saved, size });
                  setOpen({ kind: "random", size });
                }}
                className={cn(
                  "inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50",
                  saved.size === size ? "border-primary bg-primary/10 text-primary" : "border-border bg-surface text-foreground-secondary hover:border-primary/50",
                )}
              >
                {locked ? <Lock aria-hidden="true" className="size-3.5" /> : null}
                {label} · {size}×{size}
              </button>
            );
          })}
        </div>
      ) : null}

      {saved.mode === "random" && open?.kind === "random" && open.size === 15 && !wide ? (
        <p className="mx-auto max-w-md rounded-2xl border border-border bg-surface p-4 text-center text-sm text-foreground-secondary">{t("games.ngWideOnly")}</p>
      ) : open ? (
        <Board key={open.kind === "picture" ? open.id : `random-${open.size}-${saved.random[`${open.size}`]?.seed}`} open={open} saved={saved} commit={commit} lang={lang} onBack={() => setOpen(null)} />
      ) : null}
    </div>
  );
}

function Gallery({ saved, wide, lang, onOpen }: { saved: Saved; wide: boolean; lang: "vi" | "en"; onOpen: (id: string) => void }) {
  const { t } = useI18n();
  const solvedCount = PICTURES.filter((entry) => saved.pictures[entry.id]?.solved).length;
  return (
    <section aria-labelledby="ng-gallery" className="space-y-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="ng-gallery" className="text-xl font-semibold tracking-tight">
          {t("games.ngGallery")}
        </h2>
        <p className="text-sm text-muted">{t("games.ngSolvedCount", { n: solvedCount, total: PICTURES.length })}</p>
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {PICTURES.map((entry, index) => {
          const picture = PARSED.get(entry.id) as Picture;
          const save = saved.pictures[entry.id];
          const solved = save?.solved === true;
          const locked = picture.width === 15 && !wide;
          const started = !solved && !!save?.attempt;
          const name = solved ? entry.name[lang] : t("games.ngPictureN", { n: index + 1 });
          return (
            <li key={entry.id}>
              <button
                type="button"
                disabled={locked}
                onClick={() => onOpen(entry.id)}
                aria-label={`${name}, ${picture.width}×${picture.height}${solved ? `, ${t("games.ngSolved")}` : ""}${locked ? `, ${t("games.ngWideOnly")}` : ""}`}
                className="group flex w-full flex-col gap-2 rounded-2xl border border-border bg-surface p-3 text-left transition-colors hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:border-border"
              >
                <span className="flex aspect-square items-center justify-center rounded-xl bg-background/60 p-3">
                  {solved ? (
                    <Thumbnail picture={picture} />
                  ) : (
                    <span aria-hidden="true" className="text-4xl font-extrabold text-muted/60">
                      {locked ? <Lock className="size-8" /> : "?"}
                    </span>
                  )}
                </span>
                <span className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate font-semibold">{name}</span>
                  <span className="shrink-0 text-xs text-muted">
                    {picture.width}×{picture.height}
                  </span>
                </span>
                <span className="text-xs text-muted">
                  {locked ? t("games.ngWideOnly") : solved && save?.best !== undefined ? t("games.ngBestTime", { time: formatTime(save.best) }) : started ? t("games.ngInProgress") : t("games.ngNotStarted")}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Thumbnail({ picture }: { picture: Picture }) {
  return (
    <svg viewBox={`0 0 ${picture.width} ${picture.height}`} aria-hidden="true" className="size-full" shapeRendering="crispEdges">
      {picture.cells.map((filled, i) => (filled ? <rect key={i} x={i % picture.width} y={Math.floor(i / picture.width)} width="1" height="1" fill="#d9af62" /> : null))}
    </svg>
  );
}

type Stroke = { tool: Tool; set: boolean; start: number; axis: "row" | "col" | null; base: Mark[] };

function Board({ open, saved, commit, lang, onBack }: { open: Open; saved: Saved; commit: (next: Saved) => void; lang: "vi" | "en"; onBack: () => void }) {
  const { t } = useI18n();

  // The puzzle: a picture from the set, or the random puzzle of this size
  // from its saved seed (the parent saves one before mounting the board).
  const seed = open.kind === "random" ? (saved.random[`${open.size}`]?.seed ?? 0) : 0;
  const picture: Picture = React.useMemo(
    () => (open.kind === "picture" ? (PARSED.get(open.id) as Picture) : randomPicture(open.size, seed)),
    [open, seed],
  );
  const { width, height } = picture;
  const clues: Clues = React.useMemo(() => cluesOf(picture), [picture]);

  const savedAttempt = open.kind === "picture" ? saved.pictures[open.id]?.attempt : saved.random[`${open.size}`]?.attempt;
  const [marks, setMarks] = React.useState<Mark[]>(() => decode(savedAttempt?.marks, width * height) ?? new Array<Mark>(width * height).fill(EMPTY));
  const [history, setHistory] = React.useState<Mark[][]>([]);
  const [hintsUsed, setHintsUsed] = React.useState(savedAttempt?.hints ?? 0);
  // The clock: time banked so far, plus time since it last started (null when paused).
  const [clock, setClock] = React.useState<{ base: number; since: number | null }>({ base: savedAttempt?.elapsed ?? 0, since: null });
  const [, setTick] = React.useState(0);
  const [tool, setTool] = React.useState<Tool>(FILLED);
  const [shownHint, setShownHint] = React.useState<Hint | null>(null);
  const [cursor, setCursor] = React.useState<number | null>(null);
  const [won, setWon] = React.useState<{ time: number; record: boolean } | null>(() =>
    isSolved(clues, decode(savedAttempt?.marks, width * height) ?? [], width, height) ? { time: savedAttempt?.elapsed ?? 0, record: false } : null,
  );
  const stroke = React.useRef<Stroke | null>(null);
  const marksRef = React.useRef(marks);
  const updateMarks = (next: Mark[]) => {
    marksRef.current = next;
    setMarks(next);
  };
  const boardRef = React.useRef<HTMLDivElement>(null);

  const elapsedNow = () => clock.base + (clock.since === null ? 0 : Date.now() - clock.since);
  const running = clock.since !== null;
  const startClock = () => setClock((c) => (c.since === null ? { base: c.base, since: Date.now() } : c));
  const stopClock = (at?: number) => setClock((c) => ({ base: at ?? c.base + (c.since === null ? 0 : Date.now() - c.since), since: null }));

  // The clock runs from the first move until the picture is done. It pauses
  // while the tab is hidden and picks up again when it comes back.
  React.useEffect(() => {
    if (!running) return;
    const tick = window.setInterval(() => setTick((n) => n + 1), 1000);
    return () => window.clearInterval(tick);
  }, [running]);
  const wasRunning = React.useRef(false);
  React.useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        wasRunning.current = running;
        if (running) stopClock();
      } else if (wasRunning.current && !won) {
        wasRunning.current = false;
        startClock();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [running, won]);

  const persist = React.useCallback(
    (nextMarks: Mark[], extra: { hints?: number; win?: number } = {}) => {
      const attempt: Attempt = { marks: encode(nextMarks), elapsed: Math.round(extra.win ?? elapsedNow()), hints: extra.hints ?? hintsUsed };
      if (open.kind === "picture") {
        const prev = saved.pictures[open.id] ?? {};
        const best = extra.win !== undefined ? Math.min(prev.best ?? Infinity, extra.win) : prev.best;
        commit({
          ...saved,
          pictures: { ...saved.pictures, [open.id]: { solved: prev.solved || extra.win !== undefined, best, attempt: extra.win !== undefined ? undefined : attempt } },
        });
      } else {
        const key = `${open.size}` as const;
        const prev = saved.random[key];
        const best = extra.win !== undefined ? Math.min(prev?.best ?? Infinity, extra.win) : prev?.best;
        commit({
          ...saved,
          random: {
            ...saved.random,
            [key]: { seed, best, wins: (prev?.wins ?? 0) + (extra.win !== undefined ? 1 : 0), attempt: extra.win !== undefined ? undefined : attempt },
          },
        });
      }
    },
    // `clock` is listed because elapsedNow reads it.
    [open, saved, commit, clock, hintsUsed, seed],
  );

  /** Settles a finished stroke: save, undo history, win check. */
  const finish = (before: Mark[], after: Mark[]) => {
    if (encode(before) === encode(after)) return;
    setHistory((h) => [...h, before]);
    setShownHint(null);
    if (isSolved(clues, after, width, height)) {
      const time = Math.round(elapsedNow());
      const prevBest = open.kind === "picture" ? saved.pictures[open.id]?.best : saved.random[`${open.size}`]?.best;
      stopClock(time);
      setWon({ time, record: prevBest === undefined || time < prevBest });
      persist(after, { win: time });
    } else {
      persist(after);
    }
  };

  /** The cells a stroke covers: one, or a straight run from its start along the locked axis. */
  const strokeCells = (s: Stroke, to: number): number[] => {
    const sx = s.start % width;
    const sy = Math.floor(s.start / width);
    const tx = to % width;
    const ty = Math.floor(to / width);
    const axis = s.axis ?? (ty === sy && tx !== sx ? "row" : tx === sx && ty !== sy ? "col" : null);
    if (!axis) return [s.start];
    s.axis = axis;
    if (axis === "row") {
      const [a, b] = sx < tx ? [sx, tx] : [tx, sx];
      return Array.from({ length: b - a + 1 }, (_, i) => sy * width + a + i);
    }
    const [a, b] = sy < ty ? [sy, ty] : [ty, sy];
    return Array.from({ length: b - a + 1 }, (_, i) => (a + i) * width + sx);
  };

  const apply = (s: Stroke, cells: number[]): Mark[] => {
    const next = s.base.slice();
    for (const cell of cells) {
      if (s.set) {
        // Setting paints empty cells; the first cell is painted whatever it held.
        if (cell === s.start || next[cell] === EMPTY) next[cell] = s.tool;
      } else if (next[cell] === s.tool) {
        next[cell] = EMPTY;
      }
    }
    return next;
  };

  const cellAt = (x: number, y: number): number | null => {
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    const value = el?.closest<HTMLElement>("[data-cell]")?.dataset.cell;
    return value === undefined ? null : Number(value);
  };

  const onPointerDown = (event: React.PointerEvent) => {
    if (won) return;
    const cell = cellAt(event.clientX, event.clientY);
    if (cell === null) return;
    event.preventDefault();
    const strokeTool: Tool = event.button === 2 ? CROSSED : tool;
    const s: Stroke = { tool: strokeTool, set: marks[cell] !== strokeTool, start: cell, axis: null, base: marks.slice() };
    stroke.current = s;
    boardRef.current?.setPointerCapture(event.pointerId);
    setCursor(null);
    startClock();
    updateMarks(apply(s, [cell]));
  };

  const onPointerMove = (event: React.PointerEvent) => {
    const s = stroke.current;
    if (!s) return;
    const cell = cellAt(event.clientX, event.clientY);
    if (cell === null) return;
    updateMarks(apply(s, strokeCells(s, cell)));
  };

  const endStroke = () => {
    const s = stroke.current;
    if (!s) return;
    stroke.current = null;
    finish(s.base, marksRef.current);
  };

  const undo = () => {
    if (won || !history.length) return;
    const previous = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    updateMarks(previous);
    setShownHint(null);
    persist(previous);
  };

  const restart = () => {
    const blank = new Array<Mark>(width * height).fill(EMPTY);
    updateMarks(blank);
    setHistory([]);
    setHintsUsed(0);
    setClock({ base: 0, since: null });
    setWon(null);
    setShownHint(null);
    if (open.kind === "picture") {
      const prev = saved.pictures[open.id] ?? {};
      commit({ ...saved, pictures: { ...saved.pictures, [open.id]: { ...prev, attempt: undefined } } });
    } else {
      const key = `${open.size}` as const;
      const prev = saved.random[key];
      commit({ ...saved, random: { ...saved.random, [key]: { seed, best: prev?.best, wins: prev?.wins } } });
    }
  };

  const newPuzzle = () => {
    if (open.kind !== "random") return;
    const key = `${open.size}` as const;
    const prev = saved.random[key];
    // A new seed remounts the board (its key includes the seed).
    commit({ ...saved, random: { ...saved.random, [key]: { seed: newSeed(), best: prev?.best, wins: prev?.wins } } });
  };

  const takeHint = () => {
    if (won || hintsUsed >= HINTS_PER_PUZZLE) return;
    const result = findHint(clues, marks, width, height);
    const used = hintsUsed + 1;
    setHintsUsed(used);
    setShownHint(result);
    persist(marks, { hints: used });
  };

  // Keyboard: arrows move a cursor, Space fills, X crosses, Z undoes, H hints.
  const onKeyDown = (event: React.KeyboardEvent) => {
    if (won) return;
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    const at = cursor ?? 0;
    const moves: Record<string, number> = { ArrowUp: -width, ArrowDown: width, ArrowLeft: -1, ArrowRight: 1 };
    if (key in moves) {
      event.preventDefault();
      const x = at % width;
      if ((key === "ArrowLeft" && x === 0) || (key === "ArrowRight" && x === width - 1)) return;
      const next = at + moves[key];
      if (next >= 0 && next < width * height) setCursor(cursor === null ? 0 : next);
      return;
    }
    if (key === " " || key === "Enter" || key === "x") {
      event.preventDefault();
      if (cursor === null) return setCursor(0);
      const k: Tool = key === "x" ? CROSSED : FILLED;
      const next = marks.slice();
      next[cursor] = next[cursor] === k ? EMPTY : k;
      startClock();
      updateMarks(next);
      finish(marks, next);
      return;
    }
    if (key === "z") {
      event.preventDefault();
      undo();
    } else if (key === "h") {
      event.preventDefault();
      takeHint();
    }
  };

  const filled = filledOf(marks);
  const rowStates: LineState[] = clues.rows.map((clue, y) => lineState(clue, row(filled, width, y)));
  const colStates: LineState[] = clues.cols.map((clue, x) => lineState(clue, column(filled, width, height, x)));
  const rowSlots = Math.max(1, ...clues.rows.map((clue) => clue.length));
  const colSlots = Math.max(1, ...clues.cols.map((clue) => clue.length));
  const hintLine = shownHint?.kind === "line" ? shownHint : null;
  const entry = open.kind === "picture" ? PICTURE_BY_ID.get(open.id) : null;
  const title = open.kind === "picture" ? (won ? entry?.name[lang] : t("games.ngPictureN", { n: PICTURES.findIndex((p) => p.id === open.id) + 1 })) : t("games.ngRandomTitle", { size: `${width}×${height}` });
  const maxCell = width <= 5 ? "3.25rem" : width <= 10 ? "2.6rem" : "2rem";

  return (
    <section aria-label={title} className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {open.kind === "picture" ? (
            <Button type="button" variant="outline" size="sm" onClick={onBack} className="gap-1.5">
              <ArrowLeft aria-hidden="true" className="size-4" /> {t("games.ngBack")}
            </Button>
          ) : null}
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Stat label={t("games.ngTime")} value={formatTime(elapsedNow())} />
          <Stat label={t("games.ngHints")} value={`${HINTS_PER_PUZZLE - hintsUsed}/${HINTS_PER_PUZZLE}`} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div role="radiogroup" aria-label={t("games.ngTool")} className="inline-flex rounded-full border border-border bg-surface p-1">
          {([FILLED, CROSSED] as const).map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={tool === value}
              onClick={() => setTool(value)}
              className={cn(
                "inline-flex min-h-8 items-center gap-1.5 rounded-full px-3 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-primary",
                tool === value ? "bg-primary text-primary-foreground" : "text-foreground-secondary hover:text-foreground",
              )}
            >
              <span aria-hidden="true" className={cn("inline-block size-3.5", value === FILLED ? "rounded-sm bg-current" : "")}>
                {value === CROSSED ? "✕" : null}
              </span>
              {value === FILLED ? t("games.ngFill") : t("games.ngCross")}
            </button>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={undo} disabled={!!won || !history.length} aria-keyshortcuts="Z" className="gap-1.5">
          <Undo2 aria-hidden="true" className="size-4" /> {t("games.ngUndo")}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={takeHint} disabled={!!won || hintsUsed >= HINTS_PER_PUZZLE} aria-keyshortcuts="H" className="gap-1.5">
          <Lightbulb aria-hidden="true" className="size-4" /> {t("games.ngHint")}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={restart} className="gap-1.5">
          <RefreshCw aria-hidden="true" className="size-4" /> {t("games.ngRestart")}
        </Button>
        {open.kind === "random" ? (
          <Button type="button" variant="outline" size="sm" onClick={newPuzzle} className="gap-1.5">
            <SkipForward aria-hidden="true" className="size-4" /> {t("games.ngNew")}
          </Button>
        ) : null}
      </div>

      <div className="overflow-x-auto pb-1">
        <div
          ref={boardRef}
          role="application"
          tabIndex={0}
          aria-label={t("games.ngBoardLabel", { size: `${width}×${height}` })}
          aria-describedby="ng-status"
          data-solved={won ? "true" : undefined}
          className="ng-board mx-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background"
          style={
            {
              "--ng-cols": width,
              "--ng-rows": height,
              "--ng-row-slots": rowSlots,
              "--ng-col-slots": colSlots,
              "--ng-max": maxCell,
            } as React.CSSProperties
          }
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endStroke}
          onPointerCancel={endStroke}
          onContextMenu={(event) => event.preventDefault()}
          onKeyDown={onKeyDown}
          onBlur={() => setCursor(null)}
        >
          {/* Column clues: stacked at the bottom of their column. */}
          {clues.cols.map((clue, x) => {
            const shown = clue.length ? clue : [0];
            return shown.map((n, i) => (
              <span
                key={`c${x}-${i}`}
                className="ng-clue"
                data-state={colStates[x]}
                data-hint={hintLine?.axis === "col" && hintLine.index === x ? "true" : undefined}
                style={{ gridColumn: rowSlots + x + 1, gridRow: colSlots - shown.length + i + 1 }}
              >
                {n}
              </span>
            ));
          })}
          {/* Row clues: right-aligned against their row. */}
          {clues.rows.map((clue, y) => {
            const shown = clue.length ? clue : [0];
            return shown.map((n, i) => (
              <span
                key={`r${y}-${i}`}
                className="ng-clue"
                data-state={rowStates[y]}
                data-hint={hintLine?.axis === "row" && hintLine.index === y ? "true" : undefined}
                style={{ gridColumn: rowSlots - shown.length + i + 1, gridRow: colSlots + y + 1 }}
              >
                {n}
              </span>
            ));
          })}
          {marks.map((mark, cell) => {
            const x = cell % width;
            const y = Math.floor(cell / width);
            const inHint = hintLine && ((hintLine.axis === "row" && hintLine.index === y) || (hintLine.axis === "col" && hintLine.index === x));
            return (
              <span
                key={cell}
                data-cell={cell}
                className="ng-cell"
                data-mark={mark}
                data-x0={x === 0 ? "true" : undefined}
                data-y0={y === 0 ? "true" : undefined}
                data-x5={x % 5 === 4 && x !== width - 1 ? "true" : undefined}
                data-y5={y % 5 === 4 && y !== height - 1 ? "true" : undefined}
                data-hint={inHint ? "true" : undefined}
                data-cursor={cursor === cell ? "true" : undefined}
                style={{ gridColumn: rowSlots + x + 1, gridRow: colSlots + y + 1, ...(won ? ({ "--ng-delay": `${(x + y) * 25}ms` } as React.CSSProperties) : null) }}
              />
            );
          })}
        </div>
      </div>

      <div id="ng-status" aria-live="polite" className="mx-auto max-w-xl">
        {won ? (
          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-4 sm:flex-nowrap">
            <TianwuBadge className="size-14 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-bold">{open.kind === "picture" ? t("games.ngWinPicture", { name: entry?.name[lang] ?? "" }) : t("games.ngWin")}</p>
              <p className="text-sm text-foreground-secondary">
                {t("games.ngWinTime", { time: formatTime(won.time), hints: hintsUsed })}
                {won.record ? ` · ${t("games.newRecord")}` : ""}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button type="button" variant="outline" size="sm" onClick={restart}>
                {t("games.ngRestart")}
              </Button>
              {open.kind === "picture" ? (
                <Button type="button" size="sm" onClick={onBack} autoFocus>
                  {t("games.ngBack")}
                </Button>
              ) : (
                <Button type="button" size="sm" onClick={newPuzzle} autoFocus>
                  {t("games.ngNew")}
                </Button>
              )}
            </div>
          </div>
        ) : shownHint?.kind === "line" ? (
          <p className="text-center text-sm font-semibold text-primary">
            {t(shownHint.axis === "row" ? "games.ngHintRow" : "games.ngHintCol", { name: MASCOT_NAME, n: shownHint.index + 1 })}
          </p>
        ) : shownHint?.kind === "mistake" ? (
          <p className="text-center text-sm font-semibold text-[#f43f5e]">{t("games.ngHintMistake", { name: MASCOT_NAME })}</p>
        ) : (
          <p className="text-center text-xs text-muted">{t("games.ngTip")}</p>
        )}
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[4.5rem] rounded-xl border border-border bg-surface px-2.5 py-1 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">{label}</p>
      <p className="text-base font-extrabold tabular-nums">{value}</p>
    </div>
  );
}
