"use client";

import * as React from "react";
import { Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/cn";
import { createSnake, step, tickMs, turn, type Direction, type SnakeState } from "./logic";

const BEST_KEY = "shanverse:snake:best";
const SWIPE_THRESHOLD = 20;

type Status = "ready" | "running" | "paused" | "over";

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

function readBest(): number {
  try {
    return Number(window.localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

function writeBest(value: number) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Not saved; the game still works.
  }
}

type Palette = { board: string; grid: string; head: string; body: string; tail: string; food: string; eye: string };

function readPalette(element: HTMLElement): Palette {
  const style = getComputedStyle(element);
  const get = (name: string, fallback: string) => style.getPropertyValue(name).trim() || fallback;
  return {
    board: get("--snake-board", "#0a1c45"),
    grid: get("--snake-grid", "rgba(255,255,255,0.04)"),
    head: get("--snake-head", "#d9af62"),
    body: get("--snake-body", "#8fb0f5"),
    tail: get("--snake-tail", "#2e5090"),
    food: get("--snake-food", "#e2873a"),
    eye: get("--snake-eye", "#031242"),
  };
}

function hexToRgb(hex: string): [number, number, number] | null {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!match) return null;
  const n = parseInt(match[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mix(a: string, b: string, t: number): string {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  if (!ca || !cb) return a;
  const c = ca.map((v, i) => Math.round(v + (cb[i] - v) * t));
  return `rgb(${c[0]} ${c[1]} ${c[2]})`;
}

function draw(canvas: HTMLCanvasElement, state: SnakeState, palette: Palette) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const size = canvas.width;
  const cell = size / state.size;

  ctx.fillStyle = palette.board;
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = palette.grid;
  for (let y = 0; y < state.size; y++) {
    for (let x = (y % 2); x < state.size; x += 2) ctx.fillRect(x * cell, y * cell, cell, cell);
  }

  if (state.food) {
    const cx = (state.food.x + 0.5) * cell;
    const cy = (state.food.y + 0.5) * cell;
    ctx.save();
    ctx.shadowColor = palette.food;
    ctx.shadowBlur = cell * 0.6;
    ctx.fillStyle = palette.food;
    // A four-point star, echoing the sparkles in the Shanverse emblem.
    const r = cell * 0.42;
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.quadraticCurveTo(cx + r * 0.18, cy - r * 0.18, cx + r, cy);
    ctx.quadraticCurveTo(cx + r * 0.18, cy + r * 0.18, cx, cy + r);
    ctx.quadraticCurveTo(cx - r * 0.18, cy + r * 0.18, cx - r, cy);
    ctx.quadraticCurveTo(cx - r * 0.18, cy - r * 0.18, cx, cy - r);
    ctx.fill();
    ctx.restore();
  }

  const length = state.snake.length;
  state.snake.forEach((part, index) => {
    const inset = index === 0 ? cell * 0.06 : cell * 0.12;
    // The head has its own colour; the body fades from `body` to `tail`.
    ctx.fillStyle = index === 0 ? palette.head : mix(palette.body, palette.tail, length > 2 ? (index - 1) / (length - 2) : 0);
    ctx.beginPath();
    ctx.roundRect(part.x * cell + inset, part.y * cell + inset, cell - inset * 2, cell - inset * 2, cell * 0.28);
    ctx.fill();
  });

  const head = state.snake[0];
  const dir = state.queue[0] ?? state.direction;
  const ex = dir === "left" ? -1 : dir === "right" ? 1 : 0;
  const ey = dir === "up" ? -1 : dir === "down" ? 1 : 0;
  ctx.fillStyle = palette.eye;
  for (const side of [-1, 1]) {
    const px = (head.x + 0.5 + ex * 0.18 + (ey ? side * 0.2 : 0)) * cell;
    const py = (head.y + 0.5 + ey * 0.18 + (ex ? side * 0.2 : 0)) * cell;
    ctx.beginPath();
    ctx.arc(px, py, cell * 0.08, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function SnakeGame() {
  const { t } = useI18n();
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const stateRef = React.useRef<SnakeState | null>(null);
  const statusRef = React.useRef<Status>("ready");
  const pointer = React.useRef<{ x: number; y: number; id: number } | null>(null);
  const [status, setStatusState] = React.useState<Status>("ready");
  const [score, setScore] = React.useState(0);
  const [best, setBest] = React.useState(0);
  const [newRecord, setNewRecord] = React.useState(false);
  const bestRef = React.useRef(0);

  const setStatus = (value: Status) => {
    statusRef.current = value;
    setStatusState(value);
  };

  const render = React.useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    const state = stateRef.current;
    if (canvas && wrap && state) draw(canvas, state, readPalette(wrap));
  }, []);

  const resize = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const cssSize = canvas.clientWidth;
    const pixels = Math.round(cssSize * ratio);
    if (canvas.width !== pixels) {
      canvas.width = pixels;
      canvas.height = pixels;
    }
    render();
  }, [render]);

  // The first food position is random, so the game is created after hydration.
  React.useEffect(() => {
    stateRef.current = createSnake();
    bestRef.current = readBest();
    setBest(bestRef.current);
    resize();
    const observer = new ResizeObserver(resize);
    if (canvasRef.current) observer.observe(canvasRef.current);
    // Redraw when the site theme switches between light and dark.
    const themeObserver = new MutationObserver(render);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => {
      observer.disconnect();
      themeObserver.disconnect();
    };
  }, [resize, render]);

  const start = React.useCallback(() => {
    if (statusRef.current === "over" || !stateRef.current) {
      stateRef.current = createSnake();
      setScore(0);
      setNewRecord(false);
    }
    setStatus("running");
    render();
  }, [render]);

  const pause = React.useCallback(() => {
    if (statusRef.current === "running") setStatus("paused");
  }, []);

  // Game loop: one tick at a time, getting faster as the score grows.
  React.useEffect(() => {
    if (status !== "running") return;
    let timer = 0;
    const tick = () => {
      const current = stateRef.current;
      if (!current || statusRef.current !== "running") return;
      const next = step(current);
      stateRef.current = next;
      render();
      if (next.score !== current.score) setScore(next.score);
      if (next.over) {
        setStatus("over");
        if (next.score > bestRef.current) {
          bestRef.current = next.score;
          writeBest(next.score);
          setBest(next.score);
          setNewRecord(true);
        }
        return;
      }
      timer = window.setTimeout(tick, tickMs(next.score));
    };
    timer = window.setTimeout(tick, tickMs(stateRef.current?.score ?? 0));
    return () => window.clearTimeout(timer);
  }, [status, render]);

  // Pause when the tab or window loses focus, so nobody dies while away.
  React.useEffect(() => {
    const onHide = () => {
      if (document.hidden) pause();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("blur", pause);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("blur", pause);
    };
  }, [pause]);

  const steer = React.useCallback(
    (direction: Direction) => {
      if (!stateRef.current) return;
      if (statusRef.current === "over") return;
      stateRef.current = turn(stateRef.current, direction);
      if (statusRef.current !== "running") start();
    },
    [start],
  );

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      if (key === " " || key === "p") {
        // Let Space still press a focused button.
        if (key === " " && target?.closest("button")) return;
        event.preventDefault();
        if (statusRef.current === "running") pause();
        else start();
        return;
      }
      const direction = KEYS[key];
      if (!direction) return;
      event.preventDefault();
      if (statusRef.current === "over") start();
      steer(direction);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pause, start, steer]);

  const onPointerDown = (event: React.PointerEvent) => {
    pointer.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
  };

  const onPointerMove = (event: React.PointerEvent) => {
    const origin = pointer.current;
    if (!origin || origin.id !== event.pointerId) return;
    const dx = event.clientX - origin.x;
    const dy = event.clientY - origin.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_THRESHOLD) return;
    steer(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up");
    // Allow chained swipes without lifting the finger.
    pointer.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
  };

  const endPointer = () => {
    pointer.current = null;
  };

  return (
    <div className="mx-auto w-full max-w-[30rem] space-y-4">
      <div className="flex items-stretch justify-center gap-3">
        <Stat label={t("games.score")} value={String(score)} highlight />
        <Stat label={t("games.best")} value={String(best)} icon={<Trophy aria-hidden="true" className="size-3.5" />} />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-auto self-stretch px-4"
          onClick={() => (status === "running" ? pause() : start())}
        >
          {t(status === "running" ? "games.snakePause" : status === "paused" ? "games.snakeResume" : status === "over" ? "games.tryAgain" : "games.snakeStart")}
        </Button>
      </div>

      <div ref={wrapRef} className="snake-wrap relative">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={t("games.snakeBoardLabel", { score })}
          className="block aspect-square w-full touch-none rounded-2xl"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endPointer}
          onPointerCancel={endPointer}
          onPointerLeave={endPointer}
        />
        {status !== "running" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl bg-background/55 p-6 text-center backdrop-blur-[2px]">
            {status === "over" ? (
              <>
                <p className="text-2xl font-extrabold">{t("games.snakeOver")}</p>
                <p className="text-foreground-secondary">{t("games.overDescription", { score })}</p>
                {newRecord ? <p className="text-sm font-semibold text-primary">{t("games.newRecord")}</p> : null}
              </>
            ) : status === "paused" ? (
              <p className="text-2xl font-extrabold">{t("games.snakePaused")}</p>
            ) : (
              <p className="max-w-xs text-sm text-foreground-secondary">{t("games.snakeReady")}</p>
            )}
            <Button type="button" onClick={start} autoFocus={status !== "ready"}>
              {t(status === "over" ? "games.tryAgain" : status === "paused" ? "games.snakeResume" : "games.snakeStart")}
            </Button>
          </div>
        ) : null}
      </div>

      <p aria-live="polite" className="sr-only">
        {status === "over" ? t("games.overDescription", { score }) : ""}
      </p>

      <div className="mx-auto grid w-44 grid-cols-3 gap-2 md:hidden" aria-label={t("games.snakePad")} role="group">
        <span />
        <PadButton label={t("games.dirUp")} onPress={() => steer("up")} rotate={0} />
        <span />
        <PadButton label={t("games.dirLeft")} onPress={() => steer("left")} rotate={-90} />
        <span />
        <PadButton label={t("games.dirRight")} onPress={() => steer("right")} rotate={90} />
        <span />
        <PadButton label={t("games.dirDown")} onPress={() => steer("down")} rotate={180} />
        <span />
      </div>
      <p className="hidden text-center text-xs text-muted md:block">{t("games.snakeHint")}</p>
    </div>
  );
}

function PadButton({ label, onPress, rotate }: { label: string; onPress: () => void; rotate: number }) {
  return (
    <button
      type="button"
      aria-label={label}
      // pointerdown reacts faster than click on touch screens.
      onPointerDown={(event) => {
        event.preventDefault();
        onPress();
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") onPress();
      }}
      className="flex aspect-square items-center justify-center rounded-xl border border-border bg-surface text-foreground-secondary shadow-sm active:bg-primary active:text-primary-foreground touch-manipulation focus-visible:ring-2 focus-visible:ring-primary"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6" style={{ transform: `rotate(${rotate}deg)` }}>
        <path d="M12 6l7 9H5z" fill="currentColor" />
      </svg>
    </button>
  );
}

function Stat({ label, value, icon, highlight }: { label: string; value: string; icon?: React.ReactNode; highlight?: boolean }) {
  return (
    <div className={cn("min-w-[4.25rem] rounded-xl border bg-surface px-2 py-1.5 text-center sm:min-w-20 sm:px-3", highlight ? "border-primary/40" : "border-border")}>
      <p className="flex items-center justify-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
        {icon}
        {label}
      </p>
      <p className={cn("text-lg font-extrabold tabular-nums", highlight && "text-primary")}>{value}</p>
    </div>
  );
}
