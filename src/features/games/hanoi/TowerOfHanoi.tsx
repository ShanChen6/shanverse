"use client";

import * as React from "react";
import { Lightbulb, RefreshCw, Trophy, Undo2 } from "lucide-react";

import { Tianwu } from "@/components/mascot/Tianwu";
import { Button } from "@/components/ui/button";
import { GameDifficultyPicker } from "@/features/games/components/GameDifficultyPicker";
import { GameResultDialog } from "@/features/games/components/GameResultDialog";
import { GameStatBar } from "@/features/games/components/GameStatBar";
import { GameToolbar } from "@/features/games/components/GameToolbar";
import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/cn";
import {
  DEFAULT_DISKS,
  DISK_OPTIONS,
  PEG_COUNT,
  canMove,
  createGame,
  isDiskCount,
  minMoves,
  move,
  nextBestMove,
  rating,
  topDisk,
  undo,
  type HanoiState,
  type Move,
} from "./logic";

const BEST_KEY = "shanverse:hanoi:best";
const DISKS_KEY = "shanverse:hanoi:disks";
const PEG_KEYS = ["1", "2", "3"];

type Best = Record<string, number>;

function storageGet(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function storageSet(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Not saved; the game still works.
  }
}

function readBest(): Best {
  try {
    const value = JSON.parse(storageGet(BEST_KEY) ?? "{}") as Record<string, unknown>;
    const best: Best = {};
    for (const disks of DISK_OPTIONS) {
      const moves = value[disks];
      if (typeof moves === "number" && moves >= minMoves(disks)) best[disks] = moves;
    }
    return best;
  } catch {
    return {};
  }
}

export function TowerOfHanoi() {
  const { t } = useI18n();
  const [game, setGame] = React.useState<HanoiState>(() => createGame(DEFAULT_DISKS));
  const [selected, setSelected] = React.useState<number | null>(null);
  const [hint, setHint] = React.useState<Move | null>(null);
  const [usedHint, setUsedHint] = React.useState(false);
  const [rejected, setRejected] = React.useState<number | null>(null);
  const [startedAt, setStartedAt] = React.useState<number | null>(null);
  const [endedAt, setEndedAt] = React.useState<number | null>(null);
  const [now, setNow] = React.useState(0);
  const [best, setBest] = React.useState<Best>({});
  const [newRecord, setNewRecord] = React.useState(false);

  const start = React.useCallback((disks: number) => {
    setGame(createGame(disks));
    setSelected(null);
    setHint(null);
    setUsedHint(false);
    setRejected(null);
    setStartedAt(null);
    setEndedAt(null);
    setNewRecord(false);
    storageSet(DISKS_KEY, String(disks));
  }, []);

  React.useEffect(() => {
    setBest(readBest());
    const saved = Number(storageGet(DISKS_KEY));
    if (isDiskCount(saved) && saved !== DEFAULT_DISKS) start(saved);
  }, [start]);

  const running = startedAt !== null && endedAt === null;
  React.useEffect(() => {
    if (!running) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(id);
  }, [running]);

  React.useEffect(() => {
    if (rejected === null) return;
    const id = window.setTimeout(() => setRejected(null), 400);
    return () => window.clearTimeout(id);
  }, [rejected]);

  const seconds = startedAt === null ? 0 : Math.floor(((endedAt ?? (now || startedAt)) - startedAt) / 1000);

  const apply = React.useCallback(
    (next: HanoiState) => {
      if (next === game) return;
      const stamp = Date.now();
      if (startedAt === null) setStartedAt(stamp);
      setHint(null);
      setGame(next);
      if (!next.won) return;
      setEndedAt(stamp);
      // A solve that leaned on hints does not count as a record.
      if (usedHint) return;
      const previous = best[next.disks];
      if (previous === undefined || next.moves < previous) {
        const updated = { ...best, [next.disks]: next.moves };
        setBest(updated);
        storageSet(BEST_KEY, JSON.stringify(updated));
        setNewRecord(true);
      }
    },
    [best, game, startedAt, usedHint],
  );

  const choosePeg = React.useCallback(
    (peg: number) => {
      if (game.won) return;
      if (selected === null) {
        if (topDisk(game.pegs[peg]) !== undefined) setSelected(peg);
        return;
      }
      if (selected === peg) {
        setSelected(null);
        return;
      }
      if (!canMove(game.pegs, selected, peg)) {
        setRejected(peg);
        // Picking another peg with disks switches the selection.
        if (topDisk(game.pegs[peg]) !== undefined) setSelected(peg);
        return;
      }
      setSelected(null);
      apply(move(game, selected, peg));
    },
    [apply, game, selected],
  );

  const takeBack = React.useCallback(() => {
    setSelected(null);
    apply(undo(game));
  }, [apply, game]);

  const showHint = React.useCallback(() => {
    if (game.won) return;
    const next = nextBestMove(game.pegs, game.disks);
    if (!next) return;
    setSelected(null);
    setHint(next);
    setUsedHint(true);
  }, [game]);

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      const key = event.key.toLowerCase();
      const peg = PEG_KEYS.indexOf(key);
      if (peg >= 0) {
        event.preventDefault();
        choosePeg(peg);
      } else if (key === "u" || key === "z") {
        event.preventDefault();
        takeBack();
      } else if (key === "h") {
        event.preventDefault();
        showHint();
      } else if (key === "escape") {
        setSelected(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [choosePeg, showHint, takeBack]);

  const target = minMoves(game.disks);
  const stars = game.won ? rating(game.moves, game.disks) : 0;
  const pegName = (peg: number) => t("games.hanoiPeg", { n: peg + 1 });

  let status = t("games.hanoiPick");
  if (selected !== null) status = t("games.hanoiHolding", { size: topDisk(game.pegs[selected]) ?? 0, peg: pegName(selected) });
  if (hint) status = t("games.hanoiHintText", { size: topDisk(game.pegs[hint.from]) ?? 0, from: pegName(hint.from), to: pegName(hint.to) });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <GameDifficultyPicker
          label={t("games.hanoiDisks")}
          value={String(game.disks)}
          onChange={(value) => start(Number(value))}
          options={DISK_OPTIONS.map((disks) => ({ id: String(disks), label: String(disks) }))}
        />
        <GameToolbar>
          <Button type="button" variant="outline" size="sm" onClick={takeBack} disabled={game.won || game.history.length === 0} aria-keyshortcuts="U" className="h-auto min-h-10 gap-1.5">
            <Undo2 aria-hidden="true" className="size-4" /> {t("games.undo")}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={showHint} disabled={game.won} aria-keyshortcuts="H" className="h-auto min-h-10 gap-1.5">
            <Lightbulb aria-hidden="true" className="size-4" /> {t("games.hanoiHint")}
          </Button>
          <Button type="button" size="sm" onClick={() => start(game.disks)} className="h-auto min-h-10 gap-1.5">
            <RefreshCw aria-hidden="true" className="size-4" /> {t("games.newGame")}
          </Button>
        </GameToolbar>
      </div>

      <GameStatBar
        stats={[
          { label: t("games.hanoiMoves"), value: game.moves, highlight: true },
          { label: t("games.hanoiTarget"), value: target },
          { label: t("games.msTime"), value: seconds },
          { label: t("games.best"), value: best[game.disks] !== undefined ? String(best[game.disks]) : "—", icon: <Trophy aria-hidden="true" className="size-3.5" /> },
        ]}
      />

      {game.won ? (
        <GameResultDialog
          variant="inline"
          tone="win"
          media={<Tianwu pose="wave" className="h-20 w-16" />}
          title={t("games.hanoiWin")}
          description={t("games.hanoiWinDescription", { moves: game.moves, target, time: seconds })}
          record={newRecord ? t("games.newRecord") : usedHint ? t("games.hanoiHintNoRecord") : undefined}
          actions={
            <>
              <Button type="button" onClick={() => start(game.disks)}>{t("games.tryAgain")}</Button>
              {game.disks < DISK_OPTIONS[DISK_OPTIONS.length - 1] ? (
                <Button type="button" variant="outline" onClick={() => start(game.disks + 1)}>{t("games.hanoiMoreDisks", { n: game.disks + 1 })}</Button>
              ) : null}
            </>
          }
        >
          <span aria-label={t("games.memoryStars", { stars })} className="block text-2xl tracking-widest text-primary">
            {"★".repeat(stars)}
            <span className="text-muted/50">{"★".repeat(3 - stars)}</span>
          </span>
        </GameResultDialog>
      ) : null}

      <div className="hn-board mx-auto" style={{ "--hn-disks": game.disks } as React.CSSProperties}>
        {Array.from({ length: PEG_COUNT }, (_, peg) => {
          const disks = game.pegs[peg];
          const top = topDisk(disks);
          const isTarget = peg === 2;
          return (
            <button
              key={peg}
              type="button"
              className="hn-peg"
              data-selected={selected === peg || undefined}
              data-droppable={selected !== null && selected !== peg && canMove(game.pegs, selected, peg) ? true : undefined}
              data-rejected={rejected === peg || undefined}
              data-hint={hint ? (hint.from === peg ? "from" : hint.to === peg ? "to" : undefined) : undefined}
              data-target={isTarget || undefined}
              disabled={game.won}
              aria-keyshortcuts={PEG_KEYS[peg]}
              aria-pressed={selected === peg}
              aria-label={t("games.hanoiPegLabel", { peg: pegName(peg), count: disks.length, top: top ?? "—" })}
              onClick={() => choosePeg(peg)}
            >
              <span className="hn-rod" aria-hidden="true" />
              <span className="hn-stack" aria-hidden="true">
                {disks.map((size, index) => (
                  <span
                    key={size}
                    className="hn-disk"
                    data-size={size}
                    data-lifted={selected === peg && index === disks.length - 1 ? true : undefined}
                    style={{ "--hn-size": size, "--hn-hue": (size - 1) / Math.max(1, game.disks - 1) } as React.CSSProperties}
                  >
                    {size}
                  </span>
                ))}
              </span>
              <span className="hn-base" aria-hidden="true" />
              <span className="hn-label">
                {PEG_KEYS[peg]}
                {isTarget ? <span className="ml-1 text-primary">★</span> : null}
              </span>
            </button>
          );
        })}
      </div>

      <p role="status" aria-live="polite" className={cn("text-center text-sm text-foreground-secondary", hint && "font-semibold text-primary")}>
        {game.won ? null : status}
      </p>
      <p className="hidden text-center text-xs text-muted sm:block">{t("games.hanoiKeys")}</p>
    </div>
  );
}
