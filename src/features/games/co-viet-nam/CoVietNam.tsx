"use client";

import * as React from "react";
import { FlipVertical2, Flag, RotateCcw, Undo2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GameResultDialog } from "@/features/games/components/GameResultDialog";
import { GameToolbar } from "@/features/games/components/GameToolbar";
import { useI18n } from "@/i18n/client";
import type { TranslationKey } from "@/i18n/messages";
import { cn } from "@/lib/cn";

import { PieceGlyph, glyph } from "./icons";
import {
  BLUE,
  BRIDGE_FILES,
  FILES,
  RANKS,
  RED,
  endGame,
  fileOf,
  inCheck,
  legalMovesFrom,
  moveName,
  newGame,
  play,
  rankOf,
  sq,
  squareName,
  stackPieces,
  unitPiece,
  type Color,
  type Move,
  type MoveKind,
  type PieceType,
  type Position,
  type Stack,
} from "./logic";

const GAME_KEY = "shanverse:co-viet-nam:game";
const CLOCK_OPTIONS = [0, 10, 15, 30] as const;
type ClockMinutes = (typeof CLOCK_OPTIONS)[number];

type Saved = {
  v: 1;
  clock: ClockMinutes;
  moves: Move[];
  timeLeft: Record<Color, number>;
  ended?: { loser: Color; reason: "resign" | "timeout" };
};

export const PIECE_NAME_KEYS: Record<PieceType, TranslationKey> = {
  c: "games.cvnPieceC",
  h: "games.cvnPieceH",
  i: "games.cvnPieceI",
  m: "games.cvnPieceM",
  e: "games.cvnPieceE",
  t: "games.cvnPieceT",
  a: "games.cvnPieceA",
  g: "games.cvnPieceG",
  s: "games.cvnPieceS",
  f: "games.cvnPieceF",
  n: "games.cvnPieceN",
};

export const PIECE_MOVE_KEYS: Record<PieceType, TranslationKey> = {
  c: "games.cvnMoveC",
  h: "games.cvnMoveH",
  i: "games.cvnMoveI",
  m: "games.cvnMoveM",
  e: "games.cvnMoveE",
  t: "games.cvnMoveT",
  a: "games.cvnMoveA",
  g: "games.cvnMoveG",
  s: "games.cvnMoveS",
  f: "games.cvnMoveF",
  n: "games.cvnMoveN",
};

const KIND_KEYS: Record<MoveKind, TranslationKey> = {
  move: "games.cvnKindMove",
  join: "games.cvnKindJoin",
  capture: "games.cvnKindCapture",
  fire: "games.cvnKindFire",
  strike: "games.cvnKindStrike",
};

function readSaved(): Saved | null {
  try {
    const value = JSON.parse(window.localStorage.getItem(GAME_KEY) ?? "null") as Saved | null;
    return value && value.v === 1 && Array.isArray(value.moves) ? value : null;
  } catch {
    return null;
  }
}

function writeSaved(value: Saved | null) {
  try {
    if (value) window.localStorage.setItem(GAME_KEY, JSON.stringify(value));
    else window.localStorage.removeItem(GAME_KEY);
  } catch {
    // Not saved; the game still works.
  }
}

/** Replays saved moves, keeping each position for the move list and undo. */
function positionsFor(moves: Move[]): Position[] {
  const list = [newGame()];
  for (const m of moves) {
    const last = list[list.length - 1];
    try {
      list.push(play(last, m));
    } catch {
      break;
    }
  }
  return list;
}

const formatClock = (ms: number) => {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
};

export function CoVietNam() {
  const { t } = useI18n();
  const [clock, setClock] = React.useState<ClockMinutes>(15);
  const [moves, setMoves] = React.useState<Move[]>([]);
  const [timeLeft, setTimeLeft] = React.useState<Record<Color, number>>({ r: 15 * 60_000, b: 15 * 60_000 });
  const [ended, setEnded] = React.useState<Saved["ended"]>();
  const [flipped, setFlipped] = React.useState(false);
  const [selected, setSelected] = React.useState<number | null>(null);
  const [unit, setUnit] = React.useState<Move["unit"]>("stack");
  const [choice, setChoice] = React.useState<Move[] | null>(null);
  const [confirm, setConfirm] = React.useState<"resign" | "new" | null>(null);
  const [announce, setAnnounce] = React.useState("");
  const loaded = React.useRef(false);

  const positions = React.useMemo(() => positionsFor(moves), [moves]);
  const current = positions[positions.length - 1];
  const position = React.useMemo(() => (ended ? endGame(current, ended.loser, ended.reason) : current), [current, ended]);
  const result = position.result;
  const started = moves.length > 0;

  // ---- saving -----------------------------------------------------------------

  React.useEffect(() => {
    const saved = readSaved();
    if (saved) {
      setClock(CLOCK_OPTIONS.includes(saved.clock) ? saved.clock : 15);
      setMoves(saved.moves);
      setTimeLeft(saved.timeLeft);
      setEnded(saved.ended);
    }
    loaded.current = true;
  }, []);

  React.useEffect(() => {
    if (!loaded.current) return;
    writeSaved(moves.length || ended ? { v: 1, clock, moves, timeLeft, ended } : null);
  }, [clock, moves, timeLeft, ended]);

  // ---- clocks -------------------------------------------------------------------

  const ticking = clock > 0 && started && !result;
  React.useEffect(() => {
    if (!ticking) return;
    const side = position.toMove;
    let last = Date.now();
    const id = window.setInterval(() => {
      const now = Date.now();
      const spent = now - last;
      last = now;
      setTimeLeft((times) => {
        const left = times[side] - spent;
        if (left <= 0) setEnded({ loser: side, reason: "timeout" });
        return { ...times, [side]: Math.max(0, left) };
      });
    }, 200);
    return () => window.clearInterval(id);
  }, [ticking, position.toMove]);

  // ---- actions ---------------------------------------------------------------------

  const clearSelection = () => {
    setSelected(null);
    setUnit("stack");
    setChoice(null);
  };

  const sideName = (color: Color) => t(color === RED ? "games.cvnRed" : "games.cvnBlue");

  const commit = (move: Move) => {
    const next = play(current, move);
    setMoves((list) => [...list, move]);
    clearSelection();
    const name = moveName(current, move);
    const check = !next.result && inCheck(next, next.toMove) ? ` ${t("games.cvnCheck")}` : "";
    setAnnounce(`${sideName(current.toMove)}: ${name}.${check}`);
  };

  const unitMovesNow = React.useMemo(
    () => (selected === null || result ? [] : legalMovesFrom(position, selected).filter((m) => m.unit === unit)),
    [position, selected, unit, result],
  );

  const onSquare = (s: number) => {
    if (result) return;
    setChoice(null);
    const stack = position.board[s];
    if (selected !== null) {
      const options = unitMovesNow.filter((m) => m.to === s);
      if (options.length === 1) return commit(options[0]);
      if (options.length > 1) return setChoice(options);
    }
    if (stack && stack.carrier.color === position.toMove && s !== selected) {
      setSelected(s);
      setUnit(stack.carrier.type === "h" && stack.riders.length ? 0 : "stack");
      return;
    }
    clearSelection();
  };

  const undo = () => {
    if (!moves.length) return;
    setEnded(undefined);
    setMoves((list) => list.slice(0, -1));
    clearSelection();
    setAnnounce(t("games.cvnUndone"));
  };

  const restart = () => {
    setMoves([]);
    setEnded(undefined);
    setTimeLeft({ r: clock * 60_000, b: clock * 60_000 });
    setConfirm(null);
    clearSelection();
    setAnnounce("");
  };

  const pickClock = (minutes: ClockMinutes) => {
    setClock(minutes);
    setTimeLeft({ r: minutes * 60_000, b: minutes * 60_000 });
  };

  const resign = () => {
    setEnded({ loser: position.toMove, reason: "resign" });
    setConfirm(null);
    clearSelection();
  };

  const selectedStack = selected !== null ? position.board[selected] : null;
  const inCheckNow = !result && inCheck(position, position.toMove);

  const resultText = (() => {
    if (!result) return null;
    if (result.winner === null) return { title: t("games.cvnDraw"), description: t("games.cvnDrawStalemate") };
    const reason: Record<typeof result.reason, TranslationKey> = {
      checkmate: "games.cvnWinCheckmate",
      headquarters: "games.cvnWinHeadquarters",
      resign: "games.cvnWinResign",
      timeout: "games.cvnWinTimeout",
    };
    return { title: t("games.cvnWins", { side: sideName(result.winner) }), description: t(reason[result.reason]) };
  })();

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
      <div className="min-w-0 space-y-3">
        <div className="relative">
          <Board
            position={position}
            flipped={flipped}
            selected={selected}
            targets={unitMovesNow}
            lastMove={moves.length ? moves[moves.length - 1] : null}
            onSquare={onSquare}
            label={t("games.cvnBoardLabel")}
            pieceLabel={(stack) =>
              stackPieces(stack)
                .map((p) => `${sideName(p.color)} ${t(PIECE_NAME_KEYS[p.type])}${p.hero ? ` (${t("games.cvnHero")})` : ""}`)
                .join(", ")
            }
          />
          {resultText ? (
            <GameResultDialog
              title={resultText.title}
              description={resultText.description}
              tone="win"
              actions={
                <div className="flex flex-wrap justify-center gap-2">
                  <Button onClick={restart} autoFocus>
                    {t("games.cvnNewGame")}
                  </Button>
                  {ended?.reason !== "timeout" ? (
                    <Button variant="outline" onClick={undo}>
                      {t("games.cvnUndo")}
                    </Button>
                  ) : null}
                </div>
              }
            />
          ) : null}
        </div>
        {choice ? (
          <div className="flex flex-wrap items-center justify-center gap-2 rounded-card border border-border bg-surface p-3" role="group" aria-label={t("games.cvnChoose")}>
            <span className="text-sm font-medium">{t("games.cvnChoose")}</span>
            {choice.map((m) => (
              <Button key={m.kind} size="sm" variant={m.kind === "capture" ? "default" : "outline"} onClick={() => commit(m)}>
                {t(KIND_KEYS[m.kind])}
              </Button>
            ))}
          </div>
        ) : null}
        <p aria-live="polite" className="min-h-5 text-center text-sm text-foreground-secondary">
          {announce}
        </p>
      </div>

      <aside className="space-y-4">
        <div className="space-y-2 rounded-card border border-border bg-surface p-4">
          {([RED, BLUE] as Color[]).map((color) => (
            <div
              key={color}
              className={cn(
                "flex items-center justify-between rounded-control border px-3 py-2",
                position.toMove === color && !result ? "border-primary bg-primary/5" : "border-transparent",
              )}
            >
              <span className="flex items-center gap-2 font-semibold">
                <span aria-hidden="true" className={cn("size-3 rounded-full", color === RED ? "bg-[var(--cvn-red)]" : "bg-[var(--cvn-blue)]")} />
                {sideName(color)}
                {position.toMove === color && !result ? <span className="text-xs font-normal text-foreground-secondary">{t("games.cvnToMove")}</span> : null}
              </span>
              {clock ? <span className="font-mono text-lg tabular-nums">{formatClock(timeLeft[color])}</span> : null}
            </div>
          ))}
          {inCheckNow ? <p className="text-sm font-semibold text-[var(--cvn-red)]">{t("games.cvnInCheck", { side: sideName(position.toMove) })}</p> : null}
          {position.hqHold.r || position.hqHold.b ? (
            <p className="text-xs text-foreground-secondary">
              {t("games.cvnHolding", { side: sideName(position.hqHold.r ? RED : BLUE), n: position.hqHold.r || position.hqHold.b })}
            </p>
          ) : null}
        </div>

        {selectedStack ? <SelectedPanel stack={selectedStack} unit={unit} onUnit={(u) => { setUnit(u); setChoice(null); }} /> : null}

        <GameToolbar label={t("games.cvnActions")}>
          <Button variant="outline" size="sm" onClick={undo} disabled={!moves.length}>
            <Undo2 aria-hidden="true" className="size-4" /> {t("games.cvnUndo")}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setFlipped((f) => !f)} aria-pressed={flipped}>
            <FlipVertical2 aria-hidden="true" className="size-4" /> {t("games.cvnFlip")}
          </Button>
          {!result && started ? (
            <Button variant="outline" size="sm" onClick={() => setConfirm("resign")}>
              <Flag aria-hidden="true" className="size-4" /> {t("games.cvnResign")}
            </Button>
          ) : null}
          <Button variant="outline" size="sm" onClick={() => (started && !result ? setConfirm("new") : restart())}>
            <RotateCcw aria-hidden="true" className="size-4" /> {t("games.cvnNewGame")}
          </Button>
        </GameToolbar>
        {confirm ? (
          <div className="flex flex-wrap items-center gap-2 rounded-card border border-border bg-surface p-3 text-sm">
            <span className="font-medium">
              {confirm === "resign" ? t("games.cvnResignConfirm", { side: sideName(position.toMove) }) : t("games.cvnNewGameConfirm")}
            </span>
            <Button size="sm" variant="destructive" onClick={confirm === "resign" ? resign : restart}>
              {confirm === "resign" ? t("games.cvnResign") : t("games.cvnNewGame")}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirm(null)}>
              {t("games.cvnCancel")}
            </Button>
          </div>
        ) : null}

        {!started ? (
          <fieldset className="space-y-2 rounded-card border border-border bg-surface p-4">
            <legend className="sr-only">{t("games.cvnClock")}</legend>
            <p className="text-sm font-semibold">{t("games.cvnClock")}</p>
            <div className="flex flex-wrap gap-2">
              {CLOCK_OPTIONS.map((minutes) => (
                <label
                  key={minutes}
                  className={cn(
                    "flex min-h-10 cursor-pointer items-center rounded-control border px-3 text-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary",
                    clock === minutes ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50",
                  )}
                >
                  <input type="radio" name="cvn-clock" className="sr-only" checked={clock === minutes} onChange={() => pickClock(minutes)} />
                  {minutes ? t("games.cvnMinutes", { n: minutes }) : t("games.cvnNoClock")}
                </label>
              ))}
            </div>
            <p className="text-xs text-foreground-secondary">{t("games.cvnClockHint")}</p>
          </fieldset>
        ) : null}

        <MoveList positions={positions} moves={moves} />
      </aside>
    </div>
  );
}

// ---------------------------------------------------------------------------

function SelectedPanel({ stack, unit, onUnit }: { stack: Stack; unit: Move["unit"]; onUnit: (unit: Move["unit"]) => void }) {
  const { t } = useI18n();
  const piece = unitPiece(stack, unit);
  const units: Move["unit"][] = stack.carrier.type === "h" ? stack.riders.map((_, i) => i) : ["stack", ...stack.riders.map((_, i) => i)];
  return (
    <div className="space-y-3 rounded-card border border-border bg-surface p-4">
      {units.length > 1 ? (
        <div className="space-y-2">
          <p className="text-sm font-semibold">{t("games.cvnWhichPiece")}</p>
          <div className="flex flex-wrap gap-2">
            {units.map((u) => {
              const p = unitPiece(stack, u);
              return (
                <button
                  key={String(u)}
                  type="button"
                  onClick={() => onUnit(u)}
                  aria-pressed={unit === u}
                  className={cn(
                    "flex min-h-10 items-center gap-1.5 rounded-control border px-3 text-sm focus-visible:ring-2 focus-visible:ring-primary",
                    unit === u ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50",
                  )}
                >
                  <PieceGlyph type={p.type} className="size-4" />
                  {u === "stack" ? t("games.cvnWholeStack", { piece: t(PIECE_NAME_KEYS[p.type]) }) : t(PIECE_NAME_KEYS[p.type])}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
      <div className="flex gap-3">
        <span className={cn("cvn-token flex size-11 shrink-0 items-center justify-center rounded-full border-2", piece.color === RED ? "cvn-red" : "cvn-blue")}>
          <PieceGlyph type={piece.type} className="size-6" />
        </span>
        <div className="min-w-0">
          <p className="font-semibold">
            {t(PIECE_NAME_KEYS[piece.type])}
            {piece.hero ? <span className="ml-2 text-xs font-medium text-[var(--cvn-gold)]">★ {t("games.cvnHero")}</span> : null}
          </p>
          <p className="text-sm text-foreground-secondary">{t(PIECE_MOVE_KEYS[piece.type])}</p>
        </div>
      </div>
    </div>
  );
}

function MoveList({ positions, moves }: { positions: Position[]; moves: Move[] }) {
  const { t } = useI18n();
  const listRef = React.useRef<HTMLOListElement>(null);
  React.useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [moves.length]);
  const rows: { n: number; red: string; blue?: string }[] = [];
  moves.forEach((m, i) => {
    const name = moveName(positions[i], m);
    if (i % 2 === 0) rows.push({ n: i / 2 + 1, red: name });
    else rows[rows.length - 1].blue = name;
  });
  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <p className="mb-2 text-sm font-semibold">{t("games.cvnMoveList")}</p>
      {rows.length ? (
        <ol ref={listRef} className="max-h-56 space-y-0.5 overflow-y-auto font-mono text-xs tabular-nums">
          {rows.map((row) => (
            <li key={row.n} className="grid grid-cols-[2rem_1fr_1fr] gap-2">
              <span className="text-muted">{row.n}.</span>
              <span>{row.red}</span>
              <span>{row.blue ?? ""}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-xs text-foreground-secondary">{t("games.cvnNoMoves")}</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

type BoardProps = {
  position: Position;
  flipped: boolean;
  selected: number | null;
  targets: Move[];
  lastMove: Move | null;
  onSquare: (s: number) => void;
  label: string;
  pieceLabel: (stack: Stack) => string;
};

/** Board drawn in SVG: one unit between intersections, a margin of one unit around. */
function Board({ position, flipped, selected, targets, lastMove, onSquare, label, pieceLabel }: BoardProps) {
  const [cursor, setCursor] = React.useState<number | null>(null);
  const svgRef = React.useRef<SVGSVGElement>(null);
  const W = FILES + 1;
  const H = RANKS + 1;
  const x = (file: number) => (flipped ? FILES - file : file + 1);
  const y = (rank: number) => (flipped ? rank + 1 : RANKS - rank);
  const at = (s: number) => ({ cx: x(fileOf(s)), cy: y(rankOf(s)) });

  const squareAt = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const ux = ((clientX - rect.left) / rect.width) * W;
    const uy = ((clientY - rect.top) / rect.height) * H;
    const col = Math.round(ux);
    const row = Math.round(uy);
    if (col < 1 || col > FILES || row < 1 || row > RANKS) return null;
    const file = flipped ? FILES - col : col - 1;
    const rank = flipped ? row - 1 : RANKS - row;
    return sq(file, rank);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    const step = (df: number, dr: number) => {
      event.preventDefault();
      const s = cursor ?? sq(5, flipped ? 6 : 5);
      const sign = flipped ? -1 : 1;
      const file = Math.min(FILES - 1, Math.max(0, fileOf(s) + df * sign));
      const rank = Math.min(RANKS - 1, Math.max(0, rankOf(s) + dr * sign));
      setCursor(sq(file, rank));
    };
    if (event.key === "ArrowLeft") step(-1, 0);
    else if (event.key === "ArrowRight") step(1, 0);
    else if (event.key === "ArrowUp") step(0, 1);
    else if (event.key === "ArrowDown") step(0, -1);
    else if ((event.key === "Enter" || event.key === " ") && cursor !== null) {
      event.preventDefault();
      onSquare(cursor);
    }
  };

  // River band between ranks 6 and 7, sea on files a-b.
  const riverY = (y(5) + y(6)) / 2;
  const seaRight = flipped ? x(1) - 0.5 : x(1) + 0.5;
  const seaRect = flipped ? { x: seaRight, width: W - seaRight } : { x: 0, width: seaRight };
  const targetSquares = new Map<number, Move[]>();
  for (const m of targets) targetSquares.set(m.to, [...(targetSquares.get(m.to) ?? []), m]);

  const cursorStack = cursor !== null ? position.board[cursor] : null;
  const cursorText = cursor !== null ? `${squareName(cursor)}${cursorStack ? `: ${pieceLabel(cursorStack)}` : ""}` : "";

  return (
    <div className="mx-auto w-full max-w-[min(100%,40rem)]">
      <div
        role="application"
        tabIndex={0}
        aria-label={label}
        aria-describedby="cvn-cursor"
        onKeyDown={onKeyDown}
        onBlur={() => setCursor(null)}
        className="cvn-board relative rounded-card p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background"
      >
        <span id="cvn-cursor" className="sr-only" aria-live="polite">
          {cursorText}
        </span>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="block h-auto w-full cursor-pointer touch-manipulation select-none"
          onPointerUp={(event) => {
            const s = squareAt(event.clientX, event.clientY);
            if (s !== null) onSquare(s);
          }}
          aria-hidden="true"
        >
          <rect x="0" y="0" width={W} height={H} rx="0.3" fill="var(--cvn-land)" />
          <rect {...seaRect} y="0" height={H} fill="var(--cvn-sea)" rx="0.3" />
          {/* coast */}
          <rect x={Math.min(x(2), seaRight)} y="0" width="0.5" height={H} fill="var(--cvn-coast)" opacity="0.7" />
          <rect x={flipped ? 0.5 : seaRight} y={riverY - 0.32} width={W - 0.5 - seaRect.width} height="0.64" fill="var(--cvn-river)" />

          {/* grid lines: ranks cut at the river, files cross only on bridges and at sea */}
          <g stroke="var(--cvn-line)" strokeWidth="0.03">
            {Array.from({ length: RANKS }, (_, r) => (
              <line key={`r${r}`} x1={1} y1={y(r)} x2={FILES} y2={y(r)} />
            ))}
            {Array.from({ length: FILES }, (_, f) => {
              const crosses = f <= 2 || BRIDGE_FILES.includes(f);
              if (crosses) return <line key={`f${f}`} x1={x(f)} y1={1} x2={x(f)} y2={RANKS} />;
              return (
                <g key={`f${f}`}>
                  <line x1={x(f)} y1={y(0)} x2={x(f)} y2={y(5)} />
                  <line x1={x(f)} y1={y(6)} x2={x(f)} y2={y(11)} />
                </g>
              );
            })}
          </g>
          {BRIDGE_FILES.map((f) => (
            <g key={`b${f}`}>
              <rect x={x(f) - 0.2} y={riverY - 0.42} width="0.4" height="0.84" rx="0.06" fill="var(--cvn-bridge)" />
              <line x1={x(f) - 0.2} y1={riverY} x2={x(f) + 0.2} y2={riverY} stroke="var(--cvn-line)" strokeWidth="0.03" />
            </g>
          ))}
          {/* labels */}
          <g fill="var(--cvn-line)" fontSize="0.32" fontFamily="ui-sans-serif, system-ui" textAnchor="middle" dominantBaseline="central" opacity="0.75">
            {Array.from({ length: FILES }, (_, f) => (
              <text key={`lf${f}`} x={x(f)} y={H - 0.35}>
                {String.fromCharCode(97 + f)}
              </text>
            ))}
            {Array.from({ length: RANKS }, (_, r) => (
              <text key={`lr${r}`} x={0.38} y={y(r)}>
                {r + 1}
              </text>
            ))}
          </g>

          {lastMove ? (
            <g fill="none" stroke="var(--cvn-gold)" strokeWidth="0.06">
              <circle {...at(lastMove.from)} r="0.2" strokeDasharray="0.08 0.08" />
              <circle {...at(lastMove.to)} r="0.5" />
            </g>
          ) : null}

          {position.board.map((stack, s) => (stack ? <Token key={s} stack={stack} {...at(s)} selected={selected === s} /> : null))}

          {[...targetSquares.entries()].map(([s, list]) => {
            const { cx, cy } = at(s);
            const attack = list.some((m) => m.kind !== "move" && m.kind !== "join");
            const strike = list.every((m) => m.kind === "strike");
            if (attack)
              return (
                <circle key={`t${s}`} cx={cx} cy={cy} r="0.48" fill="none" stroke={strike ? "var(--cvn-gold)" : "var(--cvn-target)"} strokeWidth="0.08" strokeDasharray={strike ? "0.12 0.08" : undefined} />
              );
            if (list.some((m) => m.kind === "join"))
              return <circle key={`t${s}`} cx={cx} cy={cy} r="0.48" fill="none" stroke="var(--cvn-move)" strokeWidth="0.07" />;
            return <circle key={`t${s}`} cx={cx} cy={cy} r="0.14" fill="var(--cvn-move)" />;
          })}

          {cursor !== null ? (
            <rect x={at(cursor).cx - 0.5} y={at(cursor).cy - 0.5} width="1" height="1" rx="0.12" fill="none" stroke="var(--primary)" strokeWidth="0.07" />
          ) : null}
        </svg>
      </div>
    </div>
  );
}

function Token({ stack, cx, cy, selected }: { stack: Stack; cx: number; cy: number; selected: boolean }) {
  const piece = stack.carrier;
  const side = piece.color === RED ? "var(--cvn-red)" : "var(--cvn-blue)";
  const r = 0.42;
  return (
    <g>
      <circle cx={cx + 0.03} cy={cy + 0.05} r={r} fill="#000" opacity="0.15" />
      <circle cx={cx} cy={cy} r={r} fill="var(--cvn-token)" stroke={side} strokeWidth={selected ? 0.1 : 0.06} />
      {selected ? <circle cx={cx} cy={cy} r={r + 0.08} fill="none" stroke="var(--primary)" strokeWidth="0.05" /> : null}
      <g transform={`translate(${cx - 0.26} ${cy - 0.26}) scale(${0.52 / 24})`} color={side} style={{ color: side }}>
        {glyph(piece.type)}
      </g>
      {piece.hero ? <circle cx={cx + 0.3} cy={cy - 0.3} r="0.1" fill="var(--cvn-gold)" stroke="var(--cvn-token)" strokeWidth="0.03" /> : null}
      {stack.riders.map((rider, i) => (
        <g key={i}>
          <circle cx={cx + 0.32 - i * 0.3} cy={cy + 0.33} r="0.16" fill={side} stroke="var(--cvn-token)" strokeWidth="0.03" />
          <g transform={`translate(${cx + 0.32 - i * 0.3 - 0.11} ${cy + 0.22}) scale(${0.22 / 24})`} style={{ color: "#fff" }}>
            {glyph(rider.type)}
          </g>
          {rider.hero ? <circle cx={cx + 0.42 - i * 0.3} cy={cy + 0.22} r="0.05" fill="var(--cvn-gold)" /> : null}
        </g>
      ))}
    </g>
  );
}

/** Legend for the rules box: every piece with its symbol and how it moves. */
export function PieceLegend() {
  const { t } = useI18n();
  const order: PieceType[] = ["c", "h", "i", "m", "e", "t", "a", "g", "s", "f", "n"];
  return (
    <ul className="mt-4 space-y-2 text-sm">
      {order.map((type) => (
        <li key={type} className="flex gap-2">
          <span className="cvn-token cvn-red mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border-2">
            <PieceGlyph type={type} className="size-4" />
          </span>
          <span>
            <span className="font-semibold">{t(PIECE_NAME_KEYS[type])}.</span> <span className="text-foreground-secondary">{t(PIECE_MOVE_KEYS[type])}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
