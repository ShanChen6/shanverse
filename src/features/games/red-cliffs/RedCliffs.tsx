"use client";

import * as React from "react";
import { Lightbulb, RefreshCw, SkipForward } from "lucide-react";

import { MASCOT_NAME, TianwuBadge } from "@/components/mascot/Tianwu";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/cn";
import { randomSeed } from "./generator";
import { CELLS, SIZE, TORCHES, fire, isCleared, shipsLeft, type Frame } from "./logic";
import { EXACT_LIMIT } from "./solver";
import { Blast, FlyingTorch, Ship, TorchIcon } from "./sprites";
import { useRedCliffsEngine } from "./use-engine";

const STORAGE_KEY = "shanverse:red-cliffs:progress";
/** One tick of torch flight, in milliseconds. */
const TICK_MS = 130;

type Status = "playing" | "won" | "lost" | "stuck";

type Game = {
  seed: number;
  /** The board as dealt, for "play this board again". */
  start: number[];
  board: number[];
  torches: number;
  hintUsed: boolean;
  status: Status;
};

type Stats = { wins: number; losses: number; streak: number; best: number | null };

type Saved = { game?: Game; stats: Stats };

const emptyStats: Stats = { wins: 0, losses: 0, streak: 0, best: null };

const isBoard = (value: unknown): value is number[] =>
  Array.isArray(value) && value.length === CELLS && value.every((n) => Number.isInteger(n) && n >= 0 && n <= 4);

function readSaved(): Saved {
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null") as Partial<Saved> | null;
    if (!value || typeof value !== "object") return { stats: emptyStats };
    const raw = (value.stats ?? {}) as Partial<Stats>;
    const count = (n: unknown) => (typeof n === "number" && Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0);
    const stats: Stats = {
      wins: count(raw.wins),
      losses: count(raw.losses),
      streak: count(raw.streak),
      best: typeof raw.best === "number" && raw.best >= 1 && raw.best <= TORCHES ? Math.floor(raw.best) : null,
    };
    const g = value.game;
    const game =
      g &&
      typeof g.seed === "number" &&
      isBoard(g.start) &&
      isBoard(g.board) &&
      Number.isInteger(g.torches) &&
      g.torches >= 0 &&
      g.torches <= TORCHES &&
      typeof g.hintUsed === "boolean" &&
      ["playing", "won", "lost", "stuck"].includes(g.status)
        ? g
        : undefined;
    return { game, stats };
  } catch {
    return { stats: emptyStats };
  }
}

function writeSaved(saved: Saved) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  } catch {
    // Progress is not saved; the game still works.
  }
}

const newGame = (seed: number, board: number[]): Game => ({ seed, start: board, board, torches: TORCHES, hintUsed: false, status: "playing" });

/** Stats after a game ends. */
function record(stats: Stats, game: Game): Stats {
  if (game.status === "won") {
    const used = TORCHES - game.torches;
    const streak = stats.streak + 1;
    return { wins: stats.wins + 1, losses: stats.losses, streak, best: stats.best === null ? used : Math.min(stats.best, used) };
  }
  return { ...stats, losses: stats.losses + 1, streak: 0 };
}

type HintNote = null | "shown" | "none";

export function RedCliffs() {
  const { t } = useI18n();
  const call = useRedCliffsEngine();
  const [saved, setSaved] = React.useState<Saved | null>(null);
  const [busy, setBusy] = React.useState<"dealing" | "hint" | "check" | null>(null);
  const [error, setError] = React.useState(false);
  const [hintCell, setHintCell] = React.useState<number | null>(null);
  const [note, setNote] = React.useState<HintNote>(null);
  const [anim, setAnim] = React.useState<{ frames: Frame[]; index: number; after: Game } | null>(null);
  const reducedMotion = React.useRef(false);

  const commit = React.useCallback((next: Saved) => {
    writeSaved(next);
    setSaved(next);
  }, []);

  const deal = React.useCallback(
    async (stats: Stats, seed = randomSeed()) => {
      setBusy("dealing");
      setError(false);
      setHintCell(null);
      setNote(null);
      const response = await call({ kind: "generate", seed });
      setBusy(null);
      if (response.kind !== "generated") {
        setError(true);
        setSaved({ stats });
        return;
      }
      commit({ stats, game: newGame(response.seed, response.board) });
    },
    [call, commit],
  );

  React.useEffect(() => {
    reducedMotion.current = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const loaded = readSaved();
    if (loaded.game) setSaved(loaded);
    else void deal(loaded.stats);
  }, [deal]);

  const game = saved?.game;

  /** After a click has fully played out: win, loss, or check whether a win is still possible. */
  const settle = React.useCallback(
    async (current: Saved, after: Game) => {
      if (isCleared(after.board)) {
        const done: Game = { ...after, status: "won" };
        commit({ game: done, stats: record(current.stats, done) });
        return;
      }
      if (after.torches === 0) {
        const done: Game = { ...after, status: "lost" };
        commit({ game: done, stats: record(current.stats, done) });
        return;
      }
      commit({ ...current, game: after });
      if (after.torches <= EXACT_LIMIT) {
        setBusy("check");
        const response = await call({ kind: "check", board: after.board, torches: after.torches });
        setBusy(null);
        if (response.kind === "check" && !response.winnable) {
          const done: Game = { ...after, status: "stuck" };
          commit({ game: done, stats: record(current.stats, done) });
        }
      }
    },
    [call, commit],
  );

  // Play the animation one tick at a time, then settle the result.
  React.useEffect(() => {
    if (!anim || !saved) return;
    const last = anim.index >= anim.frames.length - 1;
    const timer = window.setTimeout(
      () => {
        if (last) {
          setAnim(null);
          void settle(saved, anim.after);
        } else {
          setAnim({ ...anim, index: anim.index + 1 });
        }
      },
      last ? TICK_MS * 2 : TICK_MS,
    );
    return () => window.clearTimeout(timer);
  }, [anim, saved, settle]);

  const onCell = (cell: number) => {
    if (!saved || !game || game.status !== "playing" || anim || busy || game.board[cell] === 0) return;
    setHintCell(null);
    setNote(null);
    const result = fire(game.board, cell, !reducedMotion.current);
    const after: Game = { ...game, board: result.board, torches: game.torches - 1 };
    if (reducedMotion.current || !result.frames.length) {
      void settle(saved, after);
      return;
    }
    setAnim({ frames: result.frames, index: 0, after });
  };

  const onHint = async () => {
    if (!saved || !game || game.status !== "playing" || game.hintUsed || anim || busy) return;
    setBusy("hint");
    const response = await call({ kind: "hint", board: game.board, torches: game.torches });
    setBusy(null);
    const used: Game = { ...game, hintUsed: true };
    if (response.kind === "hint" && response.cell !== null) {
      commit({ ...saved, game: used });
      setHintCell(response.cell);
      setNote("shown");
    } else if (response.kind === "hint" && response.exact) {
      // Proven: no way to win with the torches left.
      const done: Game = { ...used, status: "stuck" };
      commit({ game: done, stats: record(saved.stats, done) });
    } else {
      commit({ ...saved, game: used });
      setNote("none");
    }
  };

  const onReplay = () => {
    if (!saved || !game || anim || busy) return;
    setHintCell(null);
    setNote(null);
    commit({ ...saved, game: newGame(game.seed, game.start) });
  };

  const onNew = () => {
    if (!saved || anim || busy) return;
    void deal(saved.stats);
  };

  if (!saved || (!game && busy === "dealing")) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-3 py-10 text-center" aria-live="polite">
        <div aria-hidden="true" className="rc-board animate-pulse opacity-60" />
        <p className="text-sm text-muted">{t("games.rcDealing")}</p>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="mx-auto max-w-md space-y-3 rounded-2xl border border-border bg-surface p-6 text-center">
        <p className="text-foreground-secondary">{error ? t("games.rcError") : t("games.rcDealing")}</p>
        <Button type="button" onClick={onNew} disabled={busy !== null}>
          {t("games.rcNew")}
        </Button>
      </div>
    );
  }

  const frame = anim ? anim.frames[anim.index] : null;
  const shown = frame ? frame.board : game.board;
  const hits = new Set(frame?.hits ?? []);
  const blasts = anim ? anim.frames.slice(Math.max(0, anim.index - 2), anim.index + 1).flatMap((f) => f.sunk.map((cell) => ({ cell, tick: f.tick }))) : [];
  const torchesLeft = anim ? anim.after.torches : game.torches;
  const playing = game.status === "playing";
  const locked = !playing || anim !== null || busy !== null;
  const stateName = (strength: number) =>
    strength === 0 ? t("games.rcWater") : t(`games.rcState${strength}` as "games.rcState1");
  const position = (x: number, y: number): React.CSSProperties => ({ transform: `translate(${x * 100}%, ${y * 100}%)` });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-stretch justify-center gap-2 sm:gap-3">
        <div className="flex min-w-[9rem] items-center gap-2 rounded-xl border border-primary/40 bg-surface px-3 py-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">{t("games.rcTorches")}</span>
          <span aria-label={t("games.rcTorchesLeft", { n: torchesLeft })} className="flex gap-0.5">
            {Array.from({ length: TORCHES }, (_, i) => (
              <TorchIcon key={i} lit={i < torchesLeft} />
            ))}
          </span>
        </div>
        <Stat label={t("games.rcShips")} value={String(shipsLeft(shown))} highlight />
        <Stat label={t("games.rcWins")} value={String(saved.stats.wins)} />
        <Stat label={t("games.rcStreak")} value={String(saved.stats.streak)} />
        <Stat label={t("games.rcBest")} value={saved.stats.best === null ? "–" : String(saved.stats.best)} />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onHint} disabled={locked || game.hintUsed} className="gap-1.5">
          <Lightbulb aria-hidden="true" className="size-4" /> {game.hintUsed ? t("games.rcHintUsed") : t("games.rcHint")}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onReplay} disabled={anim !== null || busy !== null} className="gap-1.5">
          <RefreshCw aria-hidden="true" className="size-4" /> {t("games.rcReplay")}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onNew} disabled={anim !== null || busy !== null} className="gap-1.5">
          <SkipForward aria-hidden="true" className="size-4" /> {t("games.rcNew")}
        </Button>
      </div>

      <div className="mx-auto w-fit max-w-full">
        <p className="mb-2 text-center text-xs text-muted">{t("games.rcBoardNumber", { seed: game.seed.toString(36).toUpperCase() })}</p>
        <div className="rc-board" role="group" aria-label={t("games.rcBoardLabel")} aria-busy={anim !== null || busy !== null} style={{ "--rc-tick": `${TICK_MS}ms` } as React.CSSProperties}>
          <div className="rc-grid">
            {shown.map((strength, cell) => {
              const row = Math.floor(cell / SIZE) + 1;
              const col = (cell % SIZE) + 1;
              return (
                <button
                  key={cell}
                  type="button"
                  className="rc-cell"
                  data-hint={hintCell === cell ? "true" : undefined}
                  disabled={locked || strength === 0}
                  onClick={() => onCell(cell)}
                  aria-label={t("games.rcCell", { row, col, state: stateName(strength) })}
                >
                  <span key={hits.has(cell) ? `hit-${frame?.tick}` : "still"} className="block size-full" data-hit={hits.has(cell) ? "true" : undefined}>
                    <Ship strength={strength} />
                  </span>
                </button>
              );
            })}
          </div>
          {blasts.map(({ cell, tick }) => (
            <span key={`blast-${cell}-${tick}`} aria-hidden="true" className="rc-blast" style={position(cell % SIZE, Math.floor(cell / SIZE))}>
              <Blast />
            </span>
          ))}
          {frame?.torches.map((torch) => (
            <span key={`torch-${torch.origin}-${torch.direction}`} aria-hidden="true" className="rc-torch" style={position(torch.x, torch.y)}>
              <FlyingTorch direction={torch.direction} />
            </span>
          ))}
        </div>
      </div>

      <div aria-live="polite" className="mx-auto max-w-xl">
        {game.status === "won" ? (
          <EndPanel
            title={t("games.rcWinTitle")}
            text={t("games.rcWinText", { used: TORCHES - game.torches, left: game.torches })}
            onReplay={onReplay}
            onNew={onNew}
            replayLabel={t("games.rcReplay")}
            newLabel={t("games.rcNew")}
            good
          />
        ) : game.status === "lost" ? (
          <EndPanel
            title={t("games.rcLoseTitle")}
            text={t("games.rcLoseText", { n: shipsLeft(game.board) })}
            onReplay={onReplay}
            onNew={onNew}
            replayLabel={t("games.rcReplay")}
            newLabel={t("games.rcNew")}
          />
        ) : game.status === "stuck" ? (
          <EndPanel
            title={t("games.rcStuckTitle", { name: MASCOT_NAME })}
            text={t("games.rcStuckText", { n: game.torches })}
            onReplay={onReplay}
            onNew={onNew}
            replayLabel={t("games.rcReplay")}
            newLabel={t("games.rcNew")}
          />
        ) : note === "none" ? (
          <EndPanel
            title={t("games.rcHintNoneTitle", { name: MASCOT_NAME })}
            text={t("games.rcHintNoneText", { n: game.torches })}
            onReplay={onReplay}
            onNew={onNew}
            replayLabel={t("games.rcReplay")}
            newLabel={t("games.rcNew")}
          />
        ) : note === "shown" ? (
          <p className="text-center text-sm font-semibold text-primary">{t("games.rcHintShown", { name: MASCOT_NAME })}</p>
        ) : busy === "hint" ? (
          <p className="text-center text-sm text-muted">{t("games.rcThinking", { name: MASCOT_NAME })}</p>
        ) : (
          <p className="text-center text-xs text-muted">{t("games.rcTip")}</p>
        )}
      </div>
    </div>
  );
}

function EndPanel({
  title,
  text,
  onReplay,
  onNew,
  replayLabel,
  newLabel,
  good,
}: {
  title: string;
  text: string;
  onReplay: () => void;
  onNew: () => void;
  replayLabel: string;
  newLabel: string;
  good?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-4 rounded-2xl border p-4 sm:flex-nowrap sm:p-5",
        good ? "border-primary/30 bg-primary/5" : "border-[#D9AF62] bg-[#102653] text-[#FAF7F0]",
      )}
    >
      <TianwuBadge className="size-14 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="font-bold">{title}</p>
        <p className={cn("text-sm", good ? "text-foreground-secondary" : "text-[#E0E6F1]")}>{text}</p>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onReplay} className={good ? undefined : "border-[#D9AF62]/60 bg-transparent text-[#FAF7F0] hover:bg-white/10"}>
          {replayLabel}
        </Button>
        <Button type="button" size="sm" onClick={onNew} autoFocus>
          {newLabel}
        </Button>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={cn("min-w-[4.5rem] rounded-xl border bg-surface px-2 py-1.5 text-center sm:px-3", highlight ? "border-primary/40" : "border-border")}>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</p>
      <p className={cn("text-lg font-extrabold tabular-nums", highlight && "text-primary")}>{value}</p>
    </div>
  );
}
