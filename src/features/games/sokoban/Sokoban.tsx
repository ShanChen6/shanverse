"use client";

import * as React from "react";
import { Lock, RefreshCw } from "lucide-react";

import { MASCOT_NAME, Tianwu, TianwuBadge, TianwuTop } from "@/components/mascot/Tianwu";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/cn";
import { LEVELS } from "./levels";
import { cratesOnGoals, isSolved, move, parseLevel, rating, stuckCrates, type Direction, type SokobanState } from "./logic";

const STORAGE_KEY = "shanverse:sokoban:progress";
const SWIPE_THRESHOLD = 24;

const KEYS: Record<string, Direction> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  s: "down",
  a: "left",
  d: "right",
};

type Progress = {
  /** Fewest moves per solved level id. */
  best: Record<string, number>;
  /** Attempts per level id, including the current one. */
  attempts: Record<string, number>;
  last?: string;
};

const emptyProgress: Progress = { best: {}, attempts: {} };

function readProgress(): Progress {
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null") as Partial<Progress> | null;
    if (!value || typeof value !== "object") return emptyProgress;
    const clean = (record: unknown) =>
      Object.fromEntries(
        Object.entries(record && typeof record === "object" ? record : {}).filter(
          ([id, n]) => LEVELS.some((level) => level.id === id) && typeof n === "number" && n > 0,
        ),
      ) as Record<string, number>;
    return { best: clean(value.best), attempts: clean(value.attempts), last: typeof value.last === "string" ? value.last : undefined };
  } catch {
    return emptyProgress;
  }
}

function writeProgress(progress: Progress) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Progress is not saved; the game still works.
  }
}

/** A level is open once every level before it has been solved. */
const isUnlocked = (index: number, progress: Progress) =>
  index === 0 || LEVELS.slice(0, index).every((level) => progress.best[level.id] !== undefined);

export function Sokoban() {
  const { t, locale } = useI18n();
  const [index, setIndex] = React.useState(0);
  const [game, setGame] = React.useState<SokobanState>(() => parseLevel(LEVELS[0].map));
  const [progress, setProgress] = React.useState<Progress>(emptyProgress);
  const [bump, setBump] = React.useState(0);
  const [record, setRecord] = React.useState(false);
  const boardRef = React.useRef<HTMLDivElement>(null);
  const pointer = React.useRef<{ x: number; y: number; id: number } | null>(null);

  const level = LEVELS[index];
  const solved = isSolved(game);
  const stuck = !solved && stuckCrates(game).length > 0;
  const attempts = progress.attempts[level.id] ?? 1;
  const levelName = (i: number) => LEVELS[i].name[locale === "en" ? "en" : "vi"];

  const updateProgress = React.useCallback((change: (current: Progress) => Progress) => {
    setProgress((current) => {
      const next = change(current);
      writeProgress(next);
      return next;
    });
  }, []);

  const openLevel = React.useCallback(
    (nextIndex: number, saved: Progress) => {
      const id = LEVELS[nextIndex].id;
      setIndex(nextIndex);
      setGame(parseLevel(LEVELS[nextIndex].map));
      setRecord(false);
      updateProgress((current) => ({
        ...current,
        last: id,
        attempts: { ...current.attempts, [id]: current.attempts[id] ?? saved.attempts[id] ?? 1 },
      }));
    },
    [updateProgress],
  );

  // Resume where the player left off, after hydration.
  React.useEffect(() => {
    const saved = readProgress();
    setProgress(saved);
    const lastIndex = LEVELS.findIndex((l) => l.id === saved.last);
    if (lastIndex > 0 && isUnlocked(lastIndex, saved)) openLevel(lastIndex, saved);
  }, [openLevel]);

  const restart = React.useCallback(() => {
    setGame(parseLevel(level.map));
    setRecord(false);
    updateProgress((current) => ({
      ...current,
      attempts: { ...current.attempts, [level.id]: (current.attempts[level.id] ?? 1) + 1 },
    }));
    boardRef.current?.focus();
  }, [level, updateProgress]);

  const play = React.useCallback(
    (direction: Direction) => {
      if (isSolved(game)) return;
      const result = move(game, direction);
      if (result.blocked) setBump((n) => n + 1);
      setGame(result.state);
      if (result.pushed && isSolved(result.state)) {
        const moves = result.state.moves;
        const previous = progress.best[level.id];
        setRecord(previous === undefined || moves < previous);
        updateProgress((current) => ({
          ...current,
          best: { ...current.best, [level.id]: Math.min(moves, current.best[level.id] ?? Infinity) },
        }));
      }
    },
    [game, level, progress.best, updateProgress],
  );

  const goNext = React.useCallback(() => {
    if (index + 1 < LEVELS.length) openLevel(index + 1, progress);
  }, [index, openLevel, progress]);

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      if (key === "r") {
        event.preventDefault();
        restart();
        return;
      }
      if (key === "n" && solved) {
        event.preventDefault();
        goNext();
        return;
      }
      const direction = KEYS[key];
      if (!direction) return;
      event.preventDefault();
      play(direction);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [play, restart, goNext, solved]);

  const onPointerDown = (event: React.PointerEvent) => {
    pointer.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
  };

  const onPointerUp = (event: React.PointerEvent) => {
    const start = pointer.current;
    pointer.current = null;
    if (!start || start.id !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_THRESHOLD) return;
    play(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up");
  };

  const cells = React.useMemo(() => {
    const goals = new Set(game.goals);
    return game.walls.map((wall, cell) => ({ cell, kind: wall ? "wall" : game.inside[cell] ? (goals.has(cell) ? "goal" : "floor") : "space" }));
  }, [game.walls, game.inside, game.goals]);

  const position = (cell: number): React.CSSProperties => ({
    transform: `translate(${(cell % game.width) * 100}%, ${Math.floor(cell / game.width) * 100}%)`,
  });

  const stars = solved ? rating(game.moves, level.par) : 0;
  const allDone = solved && index === LEVELS.length - 1;

  return (
    <div className="space-y-5">
      <nav aria-label={t("games.skLevels")} className="mx-auto flex max-w-2xl flex-wrap justify-center gap-2">
        {LEVELS.map((item, i) => {
          const open = isUnlocked(i, progress);
          const best = progress.best[item.id];
          return (
            <button
              key={item.id}
              type="button"
              disabled={!open}
              aria-current={i === index ? "true" : undefined}
              aria-label={open ? t("games.skLevelButton", { n: i + 1, name: levelName(i) }) : t("games.skLocked", { n: i + 1 })}
              onClick={() => openLevel(i, progress)}
              className={cn(
                "relative flex size-11 items-center justify-center rounded-xl border text-sm font-bold transition-colors focus-visible:ring-2 focus-visible:ring-primary",
                i === index ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface text-foreground-secondary hover:border-primary/50",
                !open && "cursor-not-allowed opacity-50 hover:border-border",
              )}
            >
              {open ? i + 1 : <Lock aria-hidden="true" className="size-4" />}
              {best !== undefined ? (
                <span aria-hidden="true" className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-[#D9AF62] text-[9px] text-[#031242]">
                  ★
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">{t("games.skLevel", { n: index + 1 })}</p>
        <h2 className="text-2xl font-bold tracking-tight">{levelName(index)}</h2>
      </div>

      <div className="flex flex-wrap items-stretch justify-center gap-2 sm:gap-3">
        <Stat label={t("games.skMoves")} value={String(game.moves)} />
        <Stat label={t("games.skPushes")} value={String(game.pushes)} />
        <Stat label={t("games.skCrates")} value={`${cratesOnGoals(game)}/${game.crates.length}`} highlight />
        <Stat label={t("games.skAttempt")} value={String(attempts)} />
        <Stat label={t("games.skPar")} value={String(level.par)} />
        <Button type="button" variant="outline" size="sm" onClick={restart} aria-keyshortcuts="R" className="h-auto gap-1.5 self-stretch px-3">
          <RefreshCw aria-hidden="true" className="size-4" /> {t("games.skRestart")}
        </Button>
      </div>

      <div className="mx-auto w-fit max-w-full">
        <div
          ref={boardRef}
          role="application"
          tabIndex={0}
          aria-label={t("games.skBoardLabel", { n: index + 1 })}
          aria-describedby="sk-status"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {
            pointer.current = null;
          }}
          className="sk-board relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background"
          style={{ "--sk-cols": game.width, "--sk-rows": game.height } as React.CSSProperties}
        >
          <div className="sk-grid" aria-hidden="true">
            {cells.map(({ cell, kind }) => (
              <div key={cell} className="sk-tile" data-kind={kind}>
                {kind === "wall" ? <WallTile /> : kind === "goal" ? <GoalTile /> : null}
              </div>
            ))}
          </div>
          <div className="sk-layer" aria-hidden="true">
            {game.crates.map((cell, id) => (
              <div key={id} className="sk-piece sk-move" style={position(cell)}>
                <CrateTile done={game.goals.includes(cell)} stuck={stuck && stuckCrates(game).includes(cell)} />
              </div>
            ))}
            <div className="sk-piece sk-move sk-player" style={position(game.player)}>
              <div key={bump} className={cn("size-full", bump > 0 && "sk-bump")}>
                <TianwuTop facing={game.facing} className="size-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="sk-status" aria-live="polite" className="mx-auto max-w-xl">
        {solved ? (
          <div className="flex items-center gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-4 sm:p-5">
            <Tianwu pose="wave" className="h-24 w-22 shrink-0" />
            <div className="min-w-0 flex-1 space-y-1">
              <p aria-label={t("games.memoryStars", { stars })} className="text-xl tracking-widest text-[#D9AF62]">
                {"★".repeat(stars)}
                <span className="text-muted/40">{"★".repeat(3 - stars)}</span>
              </p>
              <p className="text-lg font-bold">{allDone ? t("games.skAllDoneTitle") : t("games.skWinTitle")}</p>
              <p className="text-sm text-foreground-secondary">
                {t("games.skWinMoves", { moves: game.moves, par: level.par })}
                {" · "}
                {attempts > 1 ? t("games.skWinPersist", { n: attempts }) : t("games.skWinFirst")}
              </p>
              {record ? <p className="text-sm font-semibold text-primary">{t("games.newRecord")}</p> : null}
              {allDone ? <p className="text-sm text-foreground-secondary">{t("games.skAllDone", { name: MASCOT_NAME })}</p> : null}
            </div>
            {!allDone ? (
              <Button type="button" onClick={goNext} autoFocus aria-keyshortcuts="N" className="shrink-0">
                {t("games.skNext")}
              </Button>
            ) : null}
          </div>
        ) : stuck ? (
          <div className="flex items-center gap-4 rounded-2xl border border-[#D9AF62] bg-[#102653] p-4 text-[#FAF7F0] sm:p-5">
            <TianwuBadge className="size-16 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-bold">{t("games.skStuckTitle", { n: attempts })}</p>
              <p className="text-sm text-[#E0E6F1]">{t("games.skStuck", { name: MASCOT_NAME })}</p>
            </div>
            <button
              type="button"
              onClick={restart}
              className="min-h-11 shrink-0 rounded-xl bg-[#D9AF62] px-4 text-sm font-bold text-[#031242] hover:bg-[#F0C27B] focus-visible:ring-2 focus-visible:ring-[#FAF7F0]"
            >
              {t("games.skRestart")}
            </button>
          </div>
        ) : (
          <p className="hidden text-center text-xs text-muted sm:block">{t("games.skHint")}</p>
        )}
      </div>

      <div className="mx-auto grid w-44 grid-cols-3 gap-2 md:hidden" role="group" aria-label={t("games.snakePad")}>
        <span />
        <PadButton label={t("games.dirUp")} onPress={() => play("up")} rotate={0} />
        <span />
        <PadButton label={t("games.dirLeft")} onPress={() => play("left")} rotate={-90} />
        <span />
        <PadButton label={t("games.dirRight")} onPress={() => play("right")} rotate={90} />
        <span />
        <PadButton label={t("games.dirDown")} onPress={() => play("down")} rotate={180} />
        <span />
      </div>
    </div>
  );
}

function WallTile() {
  return (
    <svg viewBox="0 0 100 100" className="size-full">
      <rect x="3" y="3" width="94" height="94" rx="14" fill="var(--sk-wall)" />
      <path d="M12 22 Q14 10 28 9 H72 Q86 10 88 22" stroke="var(--sk-wall-light)" strokeWidth="5" fill="none" strokeLinecap="round" />
      <circle cx="32" cy="60" r="9" fill="var(--sk-wall-dark)" />
      <circle cx="68" cy="42" r="6" fill="var(--sk-wall-dark)" />
      <circle cx="68" cy="74" r="4.5" fill="var(--sk-wall-dark)" />
    </svg>
  );
}

function GoalTile() {
  return (
    <svg viewBox="0 0 100 100" className="size-full">
      <circle cx="50" cy="50" r="30" fill="#D9AF62" opacity="0.14" />
      <circle cx="50" cy="50" r="30" fill="none" stroke="#D9AF62" strokeWidth="4" strokeDasharray="8 7" />
      <circle cx="50" cy="50" r="9" fill="#D9AF62" opacity="0.7" />
    </svg>
  );
}

function CrateTile({ done, stuck }: { done: boolean; stuck: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className={cn("size-full", done && "sk-done", stuck && "sk-stuck")}>
      {done ? <circle cx="50" cy="50" r="46" fill="#D9AF62" opacity="0.25" /> : null}
      <rect x="11" y="13" width="78" height="78" rx="9" fill="#020A26" opacity="0.35" />
      <rect x="11" y="9" width="78" height="78" rx="9" fill={done ? "#D9AF62" : "#1D3A7D"} stroke={stuck ? "#F97066" : done ? "#FFE6A6" : "#D9AF62"} strokeWidth="4" />
      <path d="M19 17 L81 79 M81 17 L19 79" stroke={done ? "#9A7531" : "#D9AF62"} strokeOpacity="0.3" strokeWidth="3" />
      <circle cx="50" cy="48" r="14" fill={done ? "#1D3A7D" : "#0E2156"} stroke={done ? "#FFE6A6" : "#D9AF62"} strokeWidth="2.5" />
      <path d="M50 37 Q52 46 61 48 Q52 50 50 59 Q48 50 39 48 Q48 46 50 37Z" fill={done ? "#FFE6A6" : "#F0C27B"} />
    </svg>
  );
}

function PadButton({ label, onPress, rotate }: { label: string; onPress: () => void; rotate: number }) {
  return (
    <button
      type="button"
      aria-label={label}
      onPointerDown={(event) => {
        event.preventDefault();
        onPress();
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") onPress();
      }}
      className="flex aspect-square touch-manipulation items-center justify-center rounded-xl border border-border bg-surface text-foreground-secondary shadow-sm active:bg-primary active:text-primary-foreground focus-visible:ring-2 focus-visible:ring-primary"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6" style={{ transform: `rotate(${rotate}deg)` }}>
        <path d="M12 6l7 9H5z" fill="currentColor" />
      </svg>
    </button>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={cn("min-w-[3.9rem] rounded-xl border bg-surface px-2 py-1.5 text-center sm:min-w-18 sm:px-3", highlight ? "border-primary/40" : "border-border")}>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</p>
      <p className={cn("text-lg font-extrabold tabular-nums", highlight && "text-primary")}>{value}</p>
    </div>
  );
}
