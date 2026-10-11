"use client";

import * as React from "react";
import { RefreshCw, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/client";
import type { TranslationKey } from "@/i18n/messages";
import { cn } from "@/lib/cn";
import {
  DIFFICULTIES,
  createGame,
  minesLeft,
  open,
  toggleFlag,
  type Cell,
  type DifficultyId,
  type GameState,
} from "./logic";

const BEST_KEY = "shanverse:minesweeper:best";
const DIFFICULTY_KEY = "shanverse:minesweeper:difficulty";
const LONG_PRESS_MS = 420;

type Mode = "reveal" | "flag";
type BestTimes = Partial<Record<DifficultyId, number>>;

const DIFFICULTY_LABELS: Record<DifficultyId, TranslationKey> = {
  easy: "games.msEasy",
  medium: "games.msMedium",
  hard: "games.msHard",
};

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Not saved; the game still works.
  }
}

function readBest(): BestTimes {
  try {
    const value = JSON.parse(readStorage(BEST_KEY) ?? "{}") as Record<string, unknown>;
    const best: BestTimes = {};
    for (const id of Object.keys(DIFFICULTIES) as DifficultyId[]) {
      const time = value[id];
      if (typeof time === "number" && time > 0) best[id] = time;
    }
    return best;
  } catch {
    return {};
  }
}

const isDifficulty = (value: string | null): value is DifficultyId => value === "easy" || value === "medium" || value === "hard";

export function Minesweeper() {
  const { t } = useI18n();
  const [difficulty, setDifficulty] = React.useState<DifficultyId>("easy");
  const [game, setGame] = React.useState<GameState>(() => createGame(DIFFICULTIES.easy));
  const [mode, setMode] = React.useState<Mode>("reveal");
  const [focused, setFocused] = React.useState(0);
  const [startedAt, setStartedAt] = React.useState<number | null>(null);
  const [endedAt, setEndedAt] = React.useState<number | null>(null);
  const [now, setNow] = React.useState(0);
  const [best, setBest] = React.useState<BestTimes>({});
  const [newRecord, setNewRecord] = React.useState(false);
  const gridRef = React.useRef<HTMLDivElement>(null);
  const press = React.useRef<{ timer: number | null; suppressClick: boolean }>({ timer: null, suppressClick: false });

  React.useEffect(() => {
    setBest(readBest());
    const saved = readStorage(DIFFICULTY_KEY);
    if (isDifficulty(saved) && saved !== "easy") {
      setDifficulty(saved);
      setGame(createGame(DIFFICULTIES[saved]));
    }
  }, []);

  const finished = game.status === "won" || game.status === "lost";

  React.useEffect(() => {
    if (game.status !== "playing") return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [game.status]);

  const elapsedMs = startedAt === null ? 0 : (endedAt ?? (now || startedAt)) - startedAt;
  const seconds = Math.min(999, Math.floor(elapsedMs / 1000));

  const reset = React.useCallback((id: DifficultyId) => {
    setDifficulty(id);
    setGame(createGame(DIFFICULTIES[id]));
    setStartedAt(null);
    setEndedAt(null);
    setNewRecord(false);
    setFocused(0);
    writeStorage(DIFFICULTY_KEY, id);
  }, []);

  const apply = React.useCallback(
    (next: GameState) => {
      if (next === game) return;
      const stamp = Date.now();
      if (game.status === "ready" && next.status !== "ready") setStartedAt(stamp);
      if (next.status === "won" || next.status === "lost") {
        setEndedAt(stamp);
        if (next.status === "won") {
          const time = Math.max(1, Math.round((stamp - (startedAt ?? stamp)) / 1000));
          const previous = best[difficulty];
          if (previous === undefined || time < previous) {
            const updated = { ...best, [difficulty]: time };
            writeStorage(BEST_KEY, JSON.stringify(updated));
            setBest(updated);
            setNewRecord(true);
          }
        }
      }
      setGame(next);
    },
    [game, startedAt, difficulty, best],
  );

  const act = React.useCallback(
    (index: number, action: "primary" | "flag") => {
      if (finished) return;
      const flag = action === "flag" || (mode === "flag" && game.cells[index].state !== "revealed");
      apply(flag ? toggleFlag(game, index) : open(game, index));
    },
    [apply, finished, game, mode],
  );

  const focusCell = (index: number) => {
    setFocused(index);
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-index="${index}"]`)?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    const row = Math.floor(index / game.cols);
    const col = index % game.cols;
    const moves: Record<string, [number, number]> = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
    const step = moves[event.key];
    if (step) {
      event.preventDefault();
      const r = Math.min(game.rows - 1, Math.max(0, row + step[0]));
      const c = Math.min(game.cols - 1, Math.max(0, col + step[1]));
      focusCell(r * game.cols + c);
      return;
    }
    if (event.key === "f" || event.key === "F") {
      event.preventDefault();
      act(index, "flag");
    }
    // Enter and Space trigger the button's click, handled by onClick.
  };

  const clearPress = () => {
    if (press.current.timer !== null) window.clearTimeout(press.current.timer);
    press.current.timer = null;
  };

  const onPointerDown = (event: React.PointerEvent, index: number) => {
    press.current.suppressClick = false;
    if (event.pointerType !== "touch") return;
    clearPress();
    press.current.timer = window.setTimeout(() => {
      press.current.timer = null;
      press.current.suppressClick = true;
      act(index, "flag");
      navigator.vibrate?.(15);
    }, LONG_PRESS_MS);
  };

  // After a long press has flagged a cell, ignore the click (and on Android
  // the contextmenu) that the same touch produces.
  const onClick = (index: number) => {
    if (press.current.suppressClick) {
      press.current.suppressClick = false;
      return;
    }
    act(index, "primary");
  };

  const onContextMenu = (event: React.MouseEvent, index: number) => {
    event.preventDefault();
    if (press.current.suppressClick) return;
    const fromTouch = press.current.timer !== null;
    clearPress();
    if (fromTouch) press.current.suppressClick = true;
    act(index, "flag");
  };

  const status = game.status === "won"
    ? t("games.msWinDescription", { time: seconds })
    : game.status === "lost"
      ? t("games.msLostDescription")
      : "";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <div role="group" aria-label={t("games.msDifficulty")} className="inline-flex rounded-xl border border-border bg-surface p-1">
          {(Object.keys(DIFFICULTIES) as DifficultyId[]).map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={difficulty === id}
              onClick={() => reset(id)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-semibold text-foreground-secondary transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary",
                difficulty === id && "bg-primary text-primary-foreground hover:text-primary-foreground",
              )}
            >
              {t(DIFFICULTY_LABELS[id])}
              <span className="ml-1.5 hidden text-xs font-medium opacity-75 sm:inline">
                {DIFFICULTIES[id].cols}×{DIFFICULTIES[id].rows}
              </span>
            </button>
          ))}
        </div>
        <Button type="button" size="sm" onClick={() => reset(difficulty)} className="gap-1.5">
          <RefreshCw aria-hidden="true" className="size-4" /> {t("games.newGame")}
        </Button>
      </div>

      <div className="flex flex-wrap items-stretch justify-center gap-3">
        <Stat label={t("games.msMinesLeft")} value={String(minesLeft(game))} icon={<MineIcon className="size-3.5" />} />
        <Stat label={t("games.msTime")} value={String(seconds)} icon={<ClockIcon className="size-3.5" />} />
        <Stat
          label={t("games.best")}
          value={best[difficulty] !== undefined ? `${best[difficulty]}s` : "—"}
          icon={<Trophy aria-hidden="true" className="size-3.5" />}
        />
        <div role="group" aria-label={t("games.msModeLabel")} className="inline-flex items-center rounded-xl border border-border bg-surface p-1">
          {(["reveal", "flag"] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={mode === value}
              onClick={() => setMode(value)}
              className={cn(
                "inline-flex h-full items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-foreground-secondary transition-colors focus-visible:ring-2 focus-visible:ring-primary",
                mode === value && "bg-primary text-primary-foreground",
              )}
            >
              {value === "reveal" ? <PickIcon className="size-4" /> : <FlagIcon className="size-4" />}
              {t(value === "reveal" ? "games.msModeReveal" : "games.msModeFlag")}
            </button>
          ))}
        </div>
      </div>

      <div
        aria-live="polite"
        className={cn(
          "mx-auto max-w-md rounded-xl border px-4 py-3 text-center text-sm",
          game.status === "won" && "border-success/40 bg-success/10",
          game.status === "lost" && "border-danger/40 bg-danger/10",
          !finished && "sr-only",
        )}
      >
        {finished ? (
          <>
            <p className="text-base font-bold">{t(game.status === "won" ? "games.msWin" : "games.msLost")}</p>
            <p className="mt-0.5 text-foreground-secondary">{status}</p>
            {game.status === "won" && newRecord ? <p className="mt-1 font-semibold text-primary">{t("games.newRecord")}</p> : null}
          </>
        ) : null}
      </div>

      <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        <div
          ref={gridRef}
          role="grid"
          aria-label={t("games.msBoardLabel", { rows: game.rows, cols: game.cols, mines: game.mines })}
          className="ms-board mx-auto"
          data-size={difficulty}
          style={{ gridTemplateColumns: `repeat(${game.cols}, var(--ms-cell))` }}
        >
          {Array.from({ length: game.rows }, (_, row) => (
            <div key={row} role="row" className="contents">
              {game.cells.slice(row * game.cols, (row + 1) * game.cols).map((cell, col) => {
                const index = row * game.cols + col;
                return (
                  <MineCell
                    key={index}
                    index={index}
                    row={row}
                    col={col}
                    cell={cell}
                    exploded={game.exploded === index}
                    wrongFlag={game.status === "lost" && cell.state === "flagged" && !cell.mine}
                    finished={finished}
                    focusable={focused === index}
                    onFocus={setFocused}
                    onClick={onClick}
                    onContextMenu={onContextMenu}
                    onKeyDown={onKeyDown}
                    onPointerDown={onPointerDown}
                    onPointerEnd={clearPress}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <p className="hidden text-center text-xs text-muted sm:block">{t("games.msControlsHint")}</p>
    </div>
  );
}

type CellProps = {
  index: number;
  row: number;
  col: number;
  cell: Cell;
  exploded: boolean;
  wrongFlag: boolean;
  finished: boolean;
  focusable: boolean;
  onFocus: (index: number) => void;
  onClick: (index: number) => void;
  onContextMenu: (event: React.MouseEvent, index: number) => void;
  onKeyDown: (event: React.KeyboardEvent, index: number) => void;
  onPointerDown: (event: React.PointerEvent, index: number) => void;
  onPointerEnd: () => void;
};

function MineCell({ index, row, col, cell, exploded, wrongFlag, finished, focusable, onFocus, onClick, onContextMenu, onKeyDown, onPointerDown, onPointerEnd }: CellProps) {
  const { t } = useI18n();
  const position = { row: row + 1, col: col + 1 };
  let label: string;
  let content: React.ReactNode = null;

  if (cell.state === "flagged") {
    label = t("games.msCellFlagged", position);
    content = wrongFlag ? <MineIcon crossed className="size-[62%]" /> : <FlagIcon className="size-[62%] text-[var(--ms-flag)]" />;
  } else if (cell.state === "hidden") {
    label = t("games.msCellHidden", position);
  } else if (cell.mine) {
    label = t("games.msCellMine", position);
    content = <MineIcon className="size-[62%]" />;
  } else if (cell.adjacent) {
    label = t("games.msCellNumber", { ...position, count: cell.adjacent });
    content = cell.adjacent;
  } else {
    label = t("games.msCellEmpty", position);
  }

  return (
    <button
      type="button"
      role="gridcell"
      data-index={index}
      data-state={cell.state}
      data-n={cell.state === "revealed" && !cell.mine ? cell.adjacent : undefined}
      data-exploded={exploded || undefined}
      data-wrong={wrongFlag || undefined}
      aria-label={label}
      aria-disabled={finished || (cell.state === "revealed" && !cell.adjacent) || undefined}
      tabIndex={focusable ? 0 : -1}
      className="ms-cell"
      onFocus={() => onFocus(index)}
      onClick={() => onClick(index)}
      onContextMenu={(event) => onContextMenu(event, index)}
      onKeyDown={(event) => onKeyDown(event, index)}
      onPointerDown={(event) => onPointerDown(event, index)}
      onPointerUp={onPointerEnd}
      onPointerLeave={onPointerEnd}
      onPointerCancel={onPointerEnd}
    >
      {content}
    </button>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="min-w-20 rounded-xl border border-border bg-surface px-3 py-1.5 text-center">
      <p className="flex items-center justify-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
        {icon}
        {label}
      </p>
      <p className="text-lg font-extrabold tabular-nums">{value}</p>
    </div>
  );
}

function MineIcon({ className, crossed }: { className?: string; crossed?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" />
      </g>
      <circle cx="12" cy="12" r="6" fill="currentColor" />
      <circle cx="10" cy="10" r="1.6" fill="var(--ms-mine-shine, #fff)" opacity="0.8" />
      {crossed ? <path d="M4 4l16 16M20 4L4 20" stroke="var(--ms-wrong)" strokeWidth="2.5" strokeLinecap="round" /> : null}
    </svg>
  );
}

function FlagIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M6 21V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 4h11l-2.5 4L17 12H6z" fill="currentColor" />
    </svg>
  );
}

function PickIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 10 4 20" />
      <path d="M3 9c4-4 10-5 14-3M15 21c4-4 5-10 3-14" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2.5 2.5M9 2h6" />
    </svg>
  );
}
