"use client";

import * as React from "react";
import { Lightbulb, Lock, RefreshCw, Undo2 } from "lucide-react";

import { MASCOT_NAME, Tianwu, TianwuBadge, TianwuTop } from "@/components/mascot/Tianwu";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/cn";
import { LEVELS } from "./levels";
import {
  UNDO_LIMIT,
  cratesOnGoals,
  isSolved,
  move,
  parseLevel,
  rating,
  stuckCrates,
  undoMove,
  type Direction,
  type MoveRecord,
  type PlanStep,
  type SokobanState,
} from "./logic";
import { PLANS } from "./plans.generated";

const STORAGE_KEY = "shanverse:sokoban:progress";
const SWIPE_THRESHOLD = 24;
/** A swipe counts only when it is mostly along one axis. */
const SWIPE_STRAIGHTNESS = 2;

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
  /** Levels cleared at least once with no undo and no hint (value is always 1). */
  clean: Record<string, number>;
  last?: string;
};

/** One play-through of a level, from opening it or restarting it. */
type Attempt = {
  /** Moves made so far, newest last, for undo. */
  history: MoveRecord[];
  undosLeft: number;
  hintUsed: boolean;
  showHint: boolean;
  /** Set on the first move; the hint stays locked even if the player undoes back to the start. */
  moved: boolean;
  /** How many moves had been made when the level became lost, or null. */
  stuckAt: number | null;
};

const emptyProgress: Progress = { best: {}, attempts: {}, clean: {} };

const freshAttempt = (): Attempt => ({ history: [], undosLeft: UNDO_LIMIT, hintUsed: false, showHint: false, moved: false, stuckAt: null });

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
    return {
      best: clean(value.best),
      attempts: clean(value.attempts),
      clean: clean(value.clean),
      last: typeof value.last === "string" ? value.last : undefined,
    };
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
  const [attempt, setAttempt] = React.useState<Attempt>(freshAttempt);
  const [progress, setProgress] = React.useState<Progress>(emptyProgress);
  const [bump, setBump] = React.useState(0);
  const [record, setRecord] = React.useState(false);
  const [cleanWin, setCleanWin] = React.useState(false);
  const boardRef = React.useRef<HTMLDivElement>(null);
  const pointer = React.useRef<{ x: number; y: number; id: number } | null>(null);

  const lang = locale === "en" ? "en" : "vi";
  const level = LEVELS[index];
  const plan: PlanStep[] = PLANS[level.id] ?? [];
  const solved = isSolved(game);
  const stuckList = React.useMemo(() => (solved ? [] : stuckCrates(game)), [game, solved]);
  const stuck = stuckList.length > 0;
  const attempts = progress.attempts[level.id] ?? 1;
  const levelName = (i: number) => LEVELS[i].name[lang];
  /** Undos needed to get back to just before the move that lost the level. */
  const stepsBack = stuck && attempt.stuckAt !== null ? attempt.history.length - attempt.stuckAt + 1 : 0;
  const hintAvailable = !attempt.moved && !solved;

  const updateProgress = React.useCallback((change: (current: Progress) => Progress) => {
    setProgress((current) => {
      const next = change(current);
      writeProgress(next);
      return next;
    });
  }, []);

  const startAttempt = React.useCallback((map: string[]) => {
    setGame(parseLevel(map));
    setAttempt(freshAttempt());
    setRecord(false);
    setCleanWin(false);
  }, []);

  const openLevel = React.useCallback(
    (nextIndex: number, saved: Progress) => {
      const id = LEVELS[nextIndex].id;
      setIndex(nextIndex);
      startAttempt(LEVELS[nextIndex].map);
      updateProgress((current) => ({
        ...current,
        last: id,
        attempts: { ...current.attempts, [id]: current.attempts[id] ?? saved.attempts[id] ?? 1 },
      }));
    },
    [startAttempt, updateProgress],
  );

  // Resume where the player left off, after hydration.
  React.useEffect(() => {
    const saved = readProgress();
    setProgress(saved);
    const lastIndex = LEVELS.findIndex((l) => l.id === saved.last);
    if (lastIndex > 0 && isUnlocked(lastIndex, saved)) openLevel(lastIndex, saved);
  }, [openLevel]);

  const restart = React.useCallback(() => {
    startAttempt(level.map);
    updateProgress((current) => ({
      ...current,
      attempts: { ...current.attempts, [level.id]: (current.attempts[level.id] ?? 1) + 1 },
    }));
    boardRef.current?.focus();
  }, [level, startAttempt, updateProgress]);

  const play = React.useCallback(
    (direction: Direction) => {
      if (isSolved(game)) return;
      const result = move(game, direction);
      if (result.blocked) setBump((n) => n + 1);
      setGame(result.state);
      if (!result.record) return;

      const moveRecord = result.record;
      const madeMoves = attempt.history.length + 1;
      const becameStuck = result.pushed && stuckCrates(game).length === 0 && stuckCrates(result.state).length > 0;
      setAttempt((current) => ({
        ...current,
        history: [...current.history, moveRecord],
        moved: true,
        showHint: false,
        stuckAt: becameStuck ? madeMoves : current.stuckAt,
      }));

      if (result.pushed && isSolved(result.state)) {
        const moves = result.state.moves;
        const previous = progress.best[level.id];
        const clean = attempt.undosLeft === UNDO_LIMIT && !attempt.hintUsed;
        setRecord(previous === undefined || moves < previous);
        setCleanWin(clean);
        updateProgress((current) => ({
          ...current,
          best: { ...current.best, [level.id]: Math.min(moves, current.best[level.id] ?? Infinity) },
          clean: clean ? { ...current.clean, [level.id]: 1 } : current.clean,
        }));
      }
    },
    [game, attempt, level, progress.best, updateProgress],
  );

  /** Takes back up to `count` moves, limited by the undos left in this attempt. */
  const undo = React.useCallback(
    (count = 1) => {
      if (isSolved(game)) return;
      const steps = Math.min(count, attempt.undosLeft, attempt.history.length);
      if (steps <= 0) {
        setBump((n) => n + 1);
        return;
      }
      let state = game;
      const history = attempt.history.slice();
      for (let i = 0; i < steps; i++) state = undoMove(state, history.pop() as MoveRecord);
      setGame(state);
      setAttempt((current) => ({ ...current, history, undosLeft: current.undosLeft - steps }));
      boardRef.current?.focus();
    },
    [game, attempt],
  );

  const revealHint = React.useCallback(() => {
    if (!hintAvailable) return;
    setAttempt((current) => ({ ...current, hintUsed: true, showHint: true }));
  }, [hintAvailable]);

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
      if (key === "z" || key === "u") {
        event.preventDefault();
        undo();
        return;
      }
      if (key === "h") {
        event.preventDefault();
        revealHint();
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
  }, [play, restart, undo, revealHint, goNext, solved]);

  const onPointerDown = (event: React.PointerEvent) => {
    pointer.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
  };

  const onPointerUp = (event: React.PointerEvent) => {
    const start = pointer.current;
    pointer.current = null;
    if (!start || start.id !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    const major = Math.max(Math.abs(dx), Math.abs(dy));
    const minor = Math.min(Math.abs(dx), Math.abs(dy));
    // Too short, or too diagonal to tell which way was meant: ignore it.
    if (major < SWIPE_THRESHOLD || major < minor * SWIPE_STRAIGHTNESS) return;
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
          const shell = progress.clean[item.id] !== undefined;
          const label = open ? t("games.skLevelButton", { n: i + 1, name: levelName(i) }) : t("games.skLocked", { n: i + 1 });
          return (
            <button
              key={item.id}
              type="button"
              disabled={!open}
              aria-current={i === index ? "true" : undefined}
              aria-label={shell ? `${label}, ${t("games.skShellBadge")}` : label}
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
                  {shell ? "🐢" : "★"}
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
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => undo()}
          disabled={solved || attempt.undosLeft === 0 || attempt.history.length === 0}
          aria-keyshortcuts="Z"
          aria-label={t("games.skUndoLabel", { n: attempt.undosLeft })}
          className="gap-1.5"
        >
          <Undo2 aria-hidden="true" className="size-4" /> {t("games.skUndo", { n: attempt.undosLeft, max: UNDO_LIMIT })}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={revealHint}
          disabled={!hintAvailable || attempt.showHint}
          aria-keyshortcuts="H"
          title={hintAvailable ? undefined : t("games.skHintLocked")}
          className="gap-1.5"
        >
          <Lightbulb aria-hidden="true" className="size-4" /> {attempt.hintUsed ? t("games.skHintUsed") : t("games.skHintButton")}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={restart} aria-keyshortcuts="R" className="gap-1.5">
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
                <CrateTile done={game.goals.includes(cell)} stuck={stuckList.includes(cell)} />
              </div>
            ))}
            <div className="sk-piece sk-move sk-player" style={position(game.player)}>
              <div key={bump} className={cn("size-full", bump > 0 && "sk-bump")}>
                <TianwuTop facing={game.facing} className="size-full" />
              </div>
            </div>
          </div>
          {attempt.showHint ? <HintOverlay plan={plan} width={game.width} height={game.height} /> : null}
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
              {cleanWin ? <p className="text-sm font-semibold text-[#D9AF62]">🐢 {t("games.skShellWin")}</p> : null}
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
          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-[#D9AF62] bg-[#102653] p-4 text-[#FAF7F0] sm:flex-nowrap sm:p-5">
            <TianwuBadge className="size-16 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-bold">{t("games.skStuckTitle", { name: MASCOT_NAME })}</p>
              <p className="text-sm text-[#E0E6F1]">
                {stepsBack > 0 && stepsBack <= attempt.undosLeft
                  ? t("games.skStuckUndo", { n: stepsBack })
                  : t("games.skStuckRestart", { name: MASCOT_NAME })}
              </p>
            </div>
            {stepsBack > 0 && stepsBack <= attempt.undosLeft ? (
              <button
                type="button"
                onClick={() => undo(stepsBack)}
                className="min-h-11 shrink-0 rounded-xl bg-[#D9AF62] px-4 text-sm font-bold text-[#031242] hover:bg-[#F0C27B] focus-visible:ring-2 focus-visible:ring-[#FAF7F0]"
              >
                {t("games.skStuckUndoButton", { n: stepsBack })}
              </button>
            ) : (
              <button
                type="button"
                onClick={restart}
                className="min-h-11 shrink-0 rounded-xl bg-[#D9AF62] px-4 text-sm font-bold text-[#031242] hover:bg-[#F0C27B] focus-visible:ring-2 focus-visible:ring-[#FAF7F0]"
              >
                {t("games.skRestart")}
              </button>
            )}
          </div>
        ) : attempt.showHint ? (
          <div className="flex gap-3 rounded-2xl border border-[#D9AF62]/60 bg-surface p-4">
            <Lightbulb aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#D9AF62]" />
            <div className="min-w-0 space-y-1 text-sm">
              <p className="font-semibold">{t("games.skHintTitle")}</p>
              <p className="text-foreground-secondary">{t("games.skHintPlan")}</p>
              {level.note ? <p className="text-foreground-secondary">{level.note[lang]}</p> : null}
            </div>
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

/**
 * The hint, drawn over the starting board: each crate gets a number, and a
 * dashed arrow leads it to its pad. Numbers give the order to finish them in.
 */
function HintOverlay({ plan, width, height }: { plan: PlanStep[]; width: number; height: number }) {
  const center = (cell: number) => ({ x: (cell % width) + 0.5, y: Math.floor(cell / width) + 0.5 });
  return (
    <svg viewBox={`0 0 ${width} ${height}`} aria-hidden="true" className="pointer-events-none absolute inset-0 z-[3] size-full">
      <defs>
        <marker id="sk-hint-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="#F0C27B" />
        </marker>
      </defs>
      {plan.map((item, order) => {
        const from = center(item.crate);
        const to = center(item.goal);
        const length = Math.hypot(to.x - from.x, to.y - from.y);
        // Stop the line short of both centres so the badges stay readable.
        const trim = (distance: number) => (length === 0 ? from : { x: from.x + ((to.x - from.x) * distance) / length, y: from.y + ((to.y - from.y) * distance) / length });
        const start = trim(0.32);
        const end = trim(Math.max(length - 0.36, 0.32));
        return (
          <g key={`${item.crate}-${order}`}>
            {length > 0 ? (
              <line
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke="#F0C27B"
                strokeWidth={0.07}
                strokeDasharray="0.16 0.12"
                strokeLinecap="round"
                markerEnd="url(#sk-hint-arrow)"
                opacity={0.9}
              />
            ) : null}
            <circle cx={to.x} cy={to.y} r={0.3} fill="none" stroke="#F0C27B" strokeWidth={0.06} />
            <text x={to.x} y={to.y} textAnchor="middle" dominantBaseline="central" fontSize={0.3} fontWeight={700} fill="#F0C27B">
              {order + 1}
            </text>
            <circle cx={from.x - 0.28} cy={from.y - 0.28} r={0.2} fill="#F0C27B" stroke="#031242" strokeWidth={0.04} />
            <text x={from.x - 0.28} y={from.y - 0.28} textAnchor="middle" dominantBaseline="central" fontSize={0.24} fontWeight={800} fill="#031242">
              {order + 1}
            </text>
          </g>
        );
      })}
    </svg>
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
