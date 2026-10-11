"use client";

import * as React from "react";
import { RefreshCw, Trophy, Undo2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/client";
import {
  BOARD_SIZE,
  createGame,
  highestTile,
  move,
  parseSavedGame,
  showsWinScreen,
  type Direction,
  type GameState,
  type Tile,
} from "./logic";

const GAME_KEY = "shanverse:2048:game";
const BEST_KEY = "shanverse:2048:best";
const SWIPE_THRESHOLD = 24;

const KEY_DIRECTIONS: Record<string, Direction> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  s: "down",
  a: "left",
  d: "right",
};

// Browser storage can be missing or throw (private mode, blocked cookies).
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
    // The game still works, it just will not be remembered.
  }
}

function loadSavedGame(): GameState | null {
  const raw = readStorage(GAME_KEY);
  if (!raw) return null;
  try {
    return parseSavedGame(JSON.parse(raw));
  } catch {
    return null;
  }
}

const slotStyle = (tile: Pick<Tile, "row" | "col">): React.CSSProperties => ({
  transform: `translate(${tile.col * 100}%, ${tile.row * 100}%)`,
});

type RenderedTile = Tile & { key: string; state?: "new" | "merged"; ghost?: boolean };

/**
 * Tiles to draw: the current tiles, plus the two tiles each merge was made
 * from. Those keep their id (and so their DOM node), slide into the merge
 * cell, and sit under the merged tile while it pops.
 */
function renderedTiles(state: GameState, previous: GameState | null, animate: boolean): RenderedTile[] {
  const before = new Map(previous?.tiles.map((tile) => [tile.id, tile]) ?? []);
  const result: RenderedTile[] = [];
  for (const tile of state.tiles) {
    if (animate && tile.mergedFrom) {
      for (const sourceId of tile.mergedFrom) {
        const source = before.get(sourceId);
        if (source) result.push({ ...source, row: tile.row, col: tile.col, key: `t${source.id}`, ghost: true });
      }
    }
    result.push({
      ...tile,
      key: `t${tile.id}`,
      state: !animate ? undefined : tile.isNew ? "new" : tile.mergedFrom ? "merged" : undefined,
    });
  }
  return result;
}

export function Game2048() {
  const { t } = useI18n();
  const [game, setGame] = React.useState<GameState | null>(null);
  const [previous, setPrevious] = React.useState<GameState | null>(null);
  const [animate, setAnimate] = React.useState(false);
  const [best, setBest] = React.useState(0);
  const [bestAtStart, setBestAtStart] = React.useState(0);
  const [gain, setGain] = React.useState<{ value: number; key: number } | null>(null);
  const boardRef = React.useRef<HTMLDivElement>(null);
  const pointer = React.useRef<{ x: number; y: number; id: number } | null>(null);

  // The board is random, so it is created after hydration to avoid a mismatch.
  React.useEffect(() => {
    const savedBest = Number(readStorage(BEST_KEY)) || 0;
    const restored = loadSavedGame() ?? createGame();
    setBest(Math.max(savedBest, restored.score));
    setBestAtStart(savedBest);
    setGame(restored);
  }, []);

  React.useEffect(() => {
    if (!game) return;
    writeStorage(GAME_KEY, JSON.stringify(game));
    if (game.score > best) {
      setBest(game.score);
      writeStorage(BEST_KEY, String(game.score));
    }
  }, [game, best]);

  const paused = !game || game.over || showsWinScreen(game);

  const play = React.useCallback(
    (direction: Direction) => {
      if (!game || game.over || showsWinScreen(game)) return;
      const result = move(game, direction);
      if (!result.moved) return;
      setPrevious(game);
      setAnimate(true);
      setGame(result.state);
      if (result.gained) setGain({ value: result.gained, key: Date.now() });
    },
    [game],
  );

  const newGame = React.useCallback(() => {
    setBestAtStart(best);
    setPrevious(null);
    setAnimate(false);
    setGain(null);
    setGame(createGame());
    boardRef.current?.focus();
  }, [best]);

  const undo = React.useCallback(() => {
    if (!previous) return;
    setGame(previous);
    setPrevious(null);
    setAnimate(false);
    setGain(null);
  }, [previous]);

  const keepPlaying = () => {
    setGame((current) => (current ? { ...current, keepPlaying: true } : current));
    boardRef.current?.focus();
  };

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      if (key === "u") {
        event.preventDefault();
        undo();
        return;
      }
      const direction = KEY_DIRECTIONS[key];
      if (!direction) return;
      event.preventDefault();
      play(direction);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [play, undo]);

  const onPointerDown = (event: React.PointerEvent) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
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

  const tiles = game ? renderedTiles(game, previous, animate) : [];
  const highest = game ? highestTile(game) : 0;
  const isNewRecord = Boolean(game && game.score > 0 && game.score > bestAtStart && game.score >= best);

  return (
    <div className="mx-auto w-full max-w-[32rem] space-y-4">
      <div className="flex items-stretch gap-3">
        <ScoreBox label={t("games.score")} value={game?.score ?? 0}>
          {gain ? (
            <span key={gain.key} aria-hidden="true" className="g2048-score-gain pointer-events-none absolute inset-x-0 top-1 text-center text-sm font-bold text-primary">
              +{gain.value}
            </span>
          ) : null}
        </ScoreBox>
        <ScoreBox label={t("games.best")} value={best} icon={<Trophy aria-hidden="true" className="size-3.5" />} />
        <div className="ml-auto flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={undo} disabled={!previous || !game} aria-keyshortcuts="U" className="gap-1.5">
            <Undo2 aria-hidden="true" className="size-4" />
            <span className="hidden sm:inline">{t("games.undo")}</span>
            <span className="sr-only sm:hidden">{t("games.undo")}</span>
          </Button>
          <Button type="button" size="sm" onClick={newGame} className="gap-1.5">
            <RefreshCw aria-hidden="true" className="size-4" /> {t("games.newGame")}
          </Button>
        </div>
      </div>

      <div
        ref={boardRef}
        role="application"
        tabIndex={0}
        aria-label={t("games.boardLabel")}
        aria-describedby="g2048-status"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          pointer.current = null;
        }}
        className="g2048-board focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <div className="g2048-layer" aria-hidden="true">
          {Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, index) => (
            <div key={index} className="g2048-slot" style={slotStyle({ row: Math.floor(index / BOARD_SIZE), col: index % BOARD_SIZE })}>
              <div className="g2048-cell" />
            </div>
          ))}
        </div>

        <div className="g2048-layer" aria-hidden="true">
          {tiles.map((tile) => (
            <div key={tile.key} className="g2048-slot g2048-move" style={{ ...slotStyle(tile), zIndex: tile.ghost ? 1 : 2 }}>
              <div
                className="g2048-tile"
                data-value={tile.value}
                data-big={tile.value > 2048 ? "true" : undefined}
                data-digits={String(tile.value).length}
                data-state={tile.state}
              >
                {tile.value}
              </div>
            </div>
          ))}
        </div>

        {game && paused ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-[1.25rem] bg-background/80 p-6 text-center backdrop-blur-[2px]">
            {game.over ? (
              <>
                <p className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t("games.overTitle")}</p>
                <p className="text-foreground-secondary">{t("games.overDescription", { score: game.score })}</p>
                {isNewRecord ? <p className="text-sm font-semibold text-primary">{t("games.newRecord")}</p> : null}
                <div className="mt-2 flex flex-wrap justify-center gap-2">
                  {previous ? <Button type="button" variant="outline" onClick={undo}>{t("games.undo")}</Button> : null}
                  <Button type="button" onClick={newGame} autoFocus>{t("games.tryAgain")}</Button>
                </div>
              </>
            ) : (
              <>
                <p className="brand-gradient-text text-3xl font-extrabold tracking-tight sm:text-4xl">{t("games.winTitle")}</p>
                <p className="max-w-xs text-foreground-secondary">{t("games.winDescription")}</p>
                <div className="mt-2 flex flex-wrap justify-center gap-2">
                  <Button type="button" onClick={keepPlaying} autoFocus>{t("games.keepPlaying")}</Button>
                  <Button type="button" variant="outline" onClick={newGame}>{t("games.newGame")}</Button>
                </div>
              </>
            )}
          </div>
        ) : null}
      </div>

      <p id="g2048-status" aria-live="polite" className="sr-only">
        {game ? t("games.status", { score: game.score, highest }) : ""}
      </p>
      <p className="hidden text-center text-xs text-muted sm:block">{t("games.controlsHint")}</p>
    </div>
  );
}

function ScoreBox({ label, value, icon, children }: { label: string; value: number; icon?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="relative min-w-20 rounded-xl border border-border bg-surface px-3 py-2 text-center sm:min-w-24">
      <p className="flex items-center justify-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
        {icon}
        {label}
      </p>
      <p className="mt-0.5 text-xl font-extrabold tabular-nums text-foreground">{value}</p>
      {children}
    </div>
  );
}
