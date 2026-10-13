"use client";

import * as React from "react";
import { Flag, RotateCcw, SkipForward } from "lucide-react";

import { MASCOT_NAME, Tianwu, TianwuBadge } from "@/components/mascot/Tianwu";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/cn";
import { NET_STYLES, type Brain, type Level } from "./engine";
import {
  BLACK,
  BOARD_SIZES,
  KOMI,
  PASS,
  WHITE,
  columnLabel,
  groupAt,
  isLegal,
  isOver,
  opponent,
  play,
  pointName,
  replay,
  scoreArea,
  starPoints,
  type BoardSize,
  type Color,
  type Mode,
  type Position,
} from "./logic";
import { useGoEngine } from "./use-engine";

const GAME_KEY = "shanverse:go:game";
const STATS_KEY = "shanverse:go:stats";
/** Where the KataGo network is served from (see public/go/README.md). */
const NET_URL = process.env.NEXT_PUBLIC_GO_NET_URL || "/go/tianwu-human-b18c384.svgo";
const NET_SIZE_MB = 27;
/** Smallest comfortable distance between two intersections, in CSS pixels. */
const MIN_POINT_PX = 28;
const MIN_THINK_MS = 450;

type Settings = { mode: Mode; size: BoardSize; color: Color; level: Level };
type Phase = "setup" | "playing" | "scoring" | "over";
type Result = { winner: Color; reason: "score" | "resign" | "capture"; margin?: number };
type Saved = { v: 1; settings: Settings; moves: number[]; phase: Exclude<Phase, "setup">; brain: Brain; dead: number[]; result?: Result };
type Stats = Record<Mode, { wins: number; losses: number }>;
type NetState = { status: "idle" | "loading" | "ready" | "failed"; loaded: number; total: number };

const DEFAULT_SETTINGS: Settings = { mode: "full", size: 9, color: BLACK, level: "medium" };
const EMPTY_STATS: Stats = { full: { wins: 0, losses: 0 }, capture: { wins: 0, losses: 0 } };

function readJson<T>(key: string): T | null {
  try {
    return JSON.parse(window.localStorage.getItem(key) ?? "null") as T | null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Not saved; the game still works.
  }
}

function validSettings(value: unknown): value is Settings {
  const s = value as Settings;
  return (
    !!s &&
    (s.mode === "full" || s.mode === "capture") &&
    BOARD_SIZES.includes(s.size) &&
    (s.color === BLACK || s.color === WHITE) &&
    ["easy", "medium", "hard"].includes(s.level)
  );
}

/** Desktop-class device where the 27 MB network is worth downloading. */
function canUseNet(): boolean {
  try {
    return (
      typeof Worker !== "undefined" &&
      typeof WebAssembly === "object" &&
      window.matchMedia("(min-width: 1024px) and (pointer: fine)").matches
    );
  } catch {
    return false;
  }
}

const rankLabel = (rank: string) => rank.replace(/(\d+)k$/, "$1 kyu").replace(/(\d+)d$/, "$1 dan");

export function Go() {
  const { t } = useI18n();
  const engine = useGoEngine();
  const [settings, setSettings] = React.useState<Settings>(DEFAULT_SETTINGS);
  const [phase, setPhase] = React.useState<Phase>("setup");
  const [moves, setMoves] = React.useState<number[]>([]);
  const [brain, setBrain] = React.useState<Brain>("mcts");
  const [dead, setDead] = React.useState<number[]>([]);
  const [deadReady, setDeadReady] = React.useState(false);
  const [result, setResult] = React.useState<Result | undefined>();
  const [stats, setStats] = React.useState<Stats>(EMPTY_STATS);
  const [thinking, setThinking] = React.useState(false);
  const [net, setNet] = React.useState<NetState>({ status: "idle", loaded: 0, total: 0 });
  const [notice, setNotice] = React.useState<string | null>(null);
  const [announce, setAnnounce] = React.useState("");
  const [confirm, setConfirm] = React.useState<null | "resign" | "new">(null);
  const [maxSize, setMaxSize] = React.useState<BoardSize>(9);
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const gameToken = React.useRef(0);
  const loaded = React.useRef(false);

  const position = React.useMemo<Position>(
    () => replay(settings.size, settings.mode, moves) ?? replay(settings.size, settings.mode, [])!,
    [settings.size, settings.mode, moves],
  );
  const human = settings.color;
  const ai = opponent(human);
  const humanTurn = phase === "playing" && position.toPlay === human && !thinking;

  // ---- persistence ---------------------------------------------------------

  React.useEffect(() => {
    const savedStats = readJson<Stats>(STATS_KEY);
    if (savedStats?.full && savedStats.capture) setStats(savedStats);
    const saved = readJson<Saved>(GAME_KEY);
    if (saved?.v === 1 && validSettings(saved.settings) && Array.isArray(saved.moves)) {
      const pos = replay(saved.settings.size, saved.settings.mode, saved.moves);
      if (pos) {
        setSettings(saved.settings);
        setMoves(saved.moves);
        setPhase(saved.phase);
        setBrain(saved.brain === "net" && saved.settings.mode === "full" && canUseNet() ? "net" : "mcts");
        setDead(Array.isArray(saved.dead) ? saved.dead : []);
        setDeadReady(saved.phase !== "scoring");
        setResult(saved.result);
      }
    }
    loaded.current = true;
  }, []);

  React.useEffect(() => {
    if (!loaded.current) return;
    if (phase === "setup") {
      writeJson(GAME_KEY, null);
      return;
    }
    writeJson(GAME_KEY, { v: 1, settings, moves, phase, brain, dead, result } satisfies Saved);
  }, [settings, moves, phase, brain, dead, result]);

  // ---- board sizes that fit this screen -------------------------------------

  React.useEffect(() => {
    const element = wrapperRef.current;
    if (!element) return;
    const measure = () => {
      const width = element.clientWidth;
      const fits = BOARD_SIZES.filter((size) => size === 9 || width / (size + 1) >= MIN_POINT_PX);
      setMaxSize(fits[fits.length - 1]);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // ---- results ---------------------------------------------------------------

  const finish = React.useCallback(
    (next: Result) => {
      setResult(next);
      setPhase("over");
      setStats((current) => {
        const entry = current[settings.mode];
        const updated = {
          ...current,
          [settings.mode]: next.winner === human ? { ...entry, wins: entry.wins + 1 } : { ...entry, losses: entry.losses + 1 },
        };
        writeJson(STATS_KEY, updated);
        return updated;
      });
    },
    [settings.mode, human],
  );

  /** Applies a move for whoever is to play, and handles the end of the game. */
  const apply = React.useCallback(
    (move: number, by: Color, current: number[]) => {
      const before = replay(settings.size, settings.mode, current);
      if (!before) return;
      const { position: after, legal, captured } = play(before, move);
      if (!legal) return;
      const nextMoves = [...current, move];
      setMoves(nextMoves);
      if (move === PASS) setAnnounce(t(by === human ? "games.goAnnounceYouPass" : "games.goAnnounceTianwuPass"));
      else
        setAnnounce(
          `${t(by === human ? "games.goAnnounceYou" : "games.goAnnounceTianwu", { point: pointName(move, settings.size) })}${captured ? ` ${t("games.goAnnounceCaptured", { n: captured })}` : ""}`,
        );
      if (by === ai && move === PASS && settings.mode === "full" && after.passes < 2) setNotice(t("games.goTianwuPassed"));
      if (after.winner) finish({ winner: after.winner, reason: "capture" });
      else if (after.passes >= 2) {
        setDead([]);
        setDeadReady(false);
        setPhase("scoring");
      }
    },
    [settings.size, settings.mode, human, ai, finish, t],
  );

  // ---- the network -----------------------------------------------------------

  const startNet = React.useCallback(() => {
    setNet((current) => (current.status === "idle" || current.status === "failed" ? { status: "loading", loaded: 0, total: 0 } : current));
    void engine
      .loadNet(NET_URL, (loadedBytes, total) => setNet({ status: "loading", loaded: loadedBytes, total }))
      .then((response) => {
        if (response.kind === "net-ready") setNet((current) => ({ ...current, status: "ready" }));
        else {
          setNet((current) => ({ ...current, status: "failed" }));
          setBrain("mcts");
          setNotice(t("games.goBrainFailed"));
        }
      });
  }, [engine, t]);

  React.useEffect(() => {
    if (brain === "net" && phase !== "setup" && net.status === "idle") startNet();
  }, [brain, phase, net.status, startNet]);

  // ---- Tianwu's turn ---------------------------------------------------------

  React.useEffect(() => {
    if (phase !== "playing" || thinking || isOver(position) || position.toPlay !== ai) return;
    if (brain === "net" && net.status !== "ready") return;
    const token = gameToken.current;
    const snapshot = moves;
    setThinking(true);
    const started = Date.now();
    void engine
      .call({ kind: "move", size: settings.size, mode: settings.mode, moves: snapshot, level: settings.level, seed: (Math.random() * 2 ** 31) | 0, brain })
      .then((response) => {
        const wait = Math.max(0, MIN_THINK_MS - (Date.now() - started));
        window.setTimeout(() => {
          if (token !== gameToken.current) return;
          setThinking(false);
          if (response.kind !== "move") return;
          if (response.resign) finish({ winner: human, reason: "resign" });
          else apply(response.move, ai, snapshot);
        }, wait);
      });
  }, [phase, thinking, position, ai, brain, net.status, moves, engine, settings, apply, finish, human]);

  // ---- scoring ---------------------------------------------------------------

  React.useEffect(() => {
    if (phase !== "scoring" || deadReady) return;
    const token = gameToken.current;
    void engine
      .call({ kind: "dead", size: settings.size, mode: settings.mode, moves, seed: 7, brain })
      .then((response) => {
        if (token !== gameToken.current) return;
        if (response.kind === "dead") setDead(response.dead);
        setDeadReady(true);
      });
  }, [phase, deadReady, engine, settings.size, settings.mode, moves, brain]);

  const score = React.useMemo(
    () => (phase === "scoring" || (phase === "over" && result?.reason === "score") ? scoreArea(position.board, settings.size, dead) : null),
    [phase, result, position.board, settings.size, dead],
  );

  const toggleDead = (point: number) => {
    const group = groupAt(position.board, settings.size, point);
    if (group.length === 0) return;
    setDead((current) => (current.includes(point) ? current.filter((p) => !group.includes(p)) : [...current, ...group].sort((a, b) => a - b)));
  };

  const confirmScore = () => {
    if (!score) return;
    const winner = score.black > score.white ? BLACK : WHITE;
    finish({ winner, reason: "score", margin: Math.abs(score.black - score.white) });
  };

  const resume = () => {
    // Undo the two passes and keep playing from there.
    const trimmed = [...moves];
    while (trimmed.length && trimmed[trimmed.length - 1] === PASS) trimmed.pop();
    setMoves(trimmed);
    setDead([]);
    setPhase("playing");
  };

  // ---- player actions ----------------------------------------------------------

  const [illegal, setIllegal] = React.useState<string | null>(null);

  const playHuman = (point: number) => {
    if (!humanTurn) return;
    if (point !== PASS && !isLegal(position, point)) {
      const reason =
        position.board[point] !== 0 ? "games.goIllegalOccupied" : point === position.ko ? "games.goIllegalKo" : "games.goIllegalSuicide";
      setIllegal(t(reason));
      return;
    }
    setIllegal(null);
    setNotice(null);
    apply(point, human, moves);
  };

  const startGame = (next: Settings) => {
    gameToken.current++;
    const useNet = next.mode === "full" && canUseNet();
    setSettings(next);
    setMoves([]);
    setDead([]);
    setDeadReady(true);
    setResult(undefined);
    setNotice(null);
    setIllegal(null);
    setConfirm(null);
    setThinking(false);
    setBrain(useNet ? "net" : "mcts");
    setPhase("playing");
    if (useNet && net.status !== "ready" && net.status !== "loading") startNet();
  };

  const newGame = () => {
    gameToken.current++;
    setThinking(false);
    setConfirm(null);
    setPhase("setup");
    setMoves([]);
    setResult(undefined);
  };

  const resign = () => {
    gameToken.current++;
    setThinking(false);
    setConfirm(null);
    finish({ winner: ai, reason: "resign" });
  };

  // ---- render ----------------------------------------------------------------

  const levelText = (level: Level) => {
    const name = t(level === "easy" ? "games.goEasy" : level === "medium" ? "games.goMedium" : "games.goHard");
    return brain === "net" && settings.mode === "full" ? `${name} · ${t("games.goBrainNet", { rank: rankLabel(NET_STYLES[level].rank) })}` : name;
  };

  return (
    <div ref={wrapperRef} className="space-y-5">
      {phase === "setup" ? (
        <SetupPanel
          initial={settings}
          maxSize={maxSize}
          onStart={startGame}
          record={stats}
        />
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
          <div className="min-w-0 space-y-3">
            <GoBoard
              position={position}
              size={settings.size}
              interactive={humanTurn || phase === "scoring"}
              scoring={phase === "scoring" || (phase === "over" && result?.reason === "score")}
              dead={dead}
              owner={score?.owner ?? null}
              humanColor={human}
              onPlay={playHuman}
              onToggleDead={phase === "scoring" && deadReady ? toggleDead : undefined}
              label={t("games.goBoardLabel", { size: settings.size, pass: settings.mode === "full" ? t("games.goBoardPassHint") : "" })}
              tapAgainHint={t("games.goTapAgain")}
              onPass={settings.mode === "full" ? () => playHuman(PASS) : undefined}
            />
            <p aria-live="polite" className="min-h-5 text-center text-sm text-foreground-secondary">
              {illegal ?? announce}
            </p>
          </div>

          <aside className="space-y-4">
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4">
              <TianwuBadge className={cn("size-14 shrink-0", thinking && "tw-sway")} />
              <div className="min-w-0">
                <p className="font-bold">{MASCOT_NAME}</p>
                <p className="text-xs text-foreground-secondary">{levelText(settings.level)}</p>
                <p aria-live="polite" className="mt-1 text-sm font-medium text-primary">
                  {phase === "playing"
                    ? brain === "net" && net.status === "loading"
                      ? t("games.goBrainLoading")
                      : thinking
                        ? t("games.goThinking")
                        : position.toPlay === human
                          ? t("games.goYourTurn")
                          : ""
                    : ""}
                </p>
              </div>
            </div>

            {brain === "net" && net.status === "loading" ? (
              <div className="space-y-1.5 rounded-2xl border border-border bg-surface p-4" role="status">
                <p className="text-sm">{t("games.goBrainDownload", { mb: NET_SIZE_MB })}</p>
                <div className="h-2 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-primary transition-[width]"
                    style={{ width: `${net.total ? Math.min(100, (net.loaded / net.total) * 100) : 5}%` }}
                  />
                </div>
                <p className="text-xs text-foreground-secondary">
                  {(net.loaded / 1048576).toFixed(1)} / {net.total ? (net.total / 1048576).toFixed(1) : NET_SIZE_MB} MB · {t("games.goBrainCached")}
                </p>
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-2">
              <PlayerCard name={t("games.goYou")} color={human} captured={position.captures[human]} active={position.toPlay === human && phase === "playing"} capturedLabel={t("games.goCaptured")} colorLabel={t(human === BLACK ? "games.goBlack" : "games.goWhite")} />
              <PlayerCard name={MASCOT_NAME} color={ai} captured={position.captures[ai]} active={position.toPlay === ai && phase === "playing"} capturedLabel={t("games.goCaptured")} colorLabel={t(ai === BLACK ? "games.goBlack" : "games.goWhite")} />
            </div>
            {settings.mode === "full" ? <p className="text-center text-xs text-muted">{t("games.goKomiNote", { komi: KOMI })}</p> : null}

            {notice ? <p className="rounded-xl border border-[#D9AF62]/60 bg-[#D9AF62]/10 p-3 text-sm">{notice}</p> : null}

            {phase === "playing" ? (
              <div className="flex flex-wrap gap-2">
                {settings.mode === "full" ? (
                  <Button type="button" variant="outline" size="sm" disabled={!humanTurn} onClick={() => playHuman(PASS)} aria-keyshortcuts="P" className="gap-1.5">
                    <SkipForward aria-hidden="true" className="size-4" /> {t("games.goPass")}
                  </Button>
                ) : null}
                {confirm === "resign" ? (
                  <ConfirmRow text={t("games.goResignConfirm")} yes={t("games.goResign")} no={t("games.goCancel")} onYes={resign} onNo={() => setConfirm(null)} />
                ) : (
                  <Button type="button" variant="outline" size="sm" onClick={() => setConfirm("resign")} className="gap-1.5">
                    <Flag aria-hidden="true" className="size-4" /> {t("games.goResign")}
                  </Button>
                )}
                {confirm === "new" ? (
                  <ConfirmRow text={t("games.goNewGameConfirm")} yes={t("games.goNewGame")} no={t("games.goCancel")} onYes={newGame} onNo={() => setConfirm(null)} />
                ) : (
                  <Button type="button" variant="outline" size="sm" onClick={() => (moves.length ? setConfirm("new") : newGame())} className="gap-1.5">
                    <RotateCcw aria-hidden="true" className="size-4" /> {t("games.goNewGame")}
                  </Button>
                )}
              </div>
            ) : null}

            {phase === "scoring" ? (
              <div className="space-y-3 rounded-2xl border border-primary/30 bg-primary/5 p-4">
                <p className="font-bold">{t("games.goScoringTitle")}</p>
                <p className="text-sm text-foreground-secondary">{deadReady ? t("games.goScoringHelp") : t("games.goScoringWorking")}</p>
                {score ? <ScoreLines score={score} t={t} /> : null}
                <div className="flex flex-wrap gap-2">
                  <Button type="button" size="sm" disabled={!deadReady} onClick={confirmScore}>
                    {t("games.goConfirmScore")}
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={resume}>
                    {t("games.goResume")}
                  </Button>
                </div>
              </div>
            ) : null}

            {phase === "over" && result ? (
              <div className="space-y-3 rounded-2xl border border-primary/30 bg-primary/5 p-4" aria-live="polite">
                <div className="flex items-center gap-3">
                  <Tianwu pose={result.winner === human ? "wave" : "determined"} className="h-20 w-18 shrink-0" />
                  <div>
                    <p className="text-lg font-bold">{result.winner === human ? t("games.goYouWin") : t("games.goTianwuWins")}</p>
                    <p className="text-sm text-foreground-secondary">
                      {result.reason === "score"
                        ? t("games.goWinByScore", { margin: result.margin ?? 0 })
                        : result.reason === "resign"
                          ? t("games.goWinByResign")
                          : t("games.goWinByCapture")}
                    </p>
                  </div>
                </div>
                {score && result.reason === "score" ? <ScoreLines score={score} t={t} /> : null}
                <p className="text-sm text-foreground-secondary">{result.winner === human ? t("games.goYouWinNote") : t("games.goTianwuWinsNote")}</p>
                <Button type="button" onClick={newGame} autoFocus>
                  {t("games.goNewGame")}
                </Button>
              </div>
            ) : null}

            <p className="text-xs text-muted">
              {t("games.goRecord", { wins: stats[settings.mode].wins, losses: stats[settings.mode].losses })}
            </p>
          </aside>
        </div>
      )}
      {brain === "net" || (phase === "setup" && canUseNet()) ? <p className="text-center text-[11px] leading-relaxed text-muted">{t("games.goNetCredit")}</p> : null}
    </div>
  );
}

// ---------------------------------------------------------------------------

function ConfirmRow({ text, yes, no, onYes, onNo }: { text: string; yes: string; no: string; onYes: () => void; onNo: () => void }) {
  return (
    <div className="flex w-full flex-wrap items-center gap-2 rounded-xl border border-border p-2 text-sm">
      <span className="flex-1">{text}</span>
      <Button type="button" size="sm" onClick={onYes} autoFocus>
        {yes}
      </Button>
      <Button type="button" size="sm" variant="outline" onClick={onNo}>
        {no}
      </Button>
    </div>
  );
}

function StoneIcon({ color, className }: { color: Color; className?: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={className}>
      <circle cx="10" cy="10" r="8.5" fill={color === BLACK ? "#121A33" : "#F7F3EA"} stroke={color === BLACK ? "#6B7AA6" : "#9C9481"} strokeWidth="1" />
      {color === BLACK ? <circle cx="7.5" cy="7" r="2.5" fill="#FFFFFF" opacity="0.18" /> : null}
    </svg>
  );
}

function PlayerCard(props: { name: string; color: Color; captured: number; active: boolean; capturedLabel: string; colorLabel: string }) {
  return (
    <div className={cn("rounded-xl border bg-surface p-3", props.active ? "border-primary" : "border-border")}>
      <p className="flex items-center gap-2 text-sm font-semibold">
        <StoneIcon color={props.color} className="size-4 shrink-0" />
        <span className="truncate">{props.name}</span>
      </p>
      <p className="mt-1 text-xs text-foreground-secondary">
        {props.colorLabel} · {props.capturedLabel}: <span className="font-bold tabular-nums text-foreground">{props.captured}</span>
      </p>
    </div>
  );
}

function ScoreLines({ score, t }: { score: ReturnType<typeof scoreArea>; t: ReturnType<typeof useI18n>["t"] }) {
  return (
    <div className="space-y-1 text-sm tabular-nums">
      <p>{t("games.goScoreLine", { color: t("games.goBlack"), stones: score.blackStones, area: score.blackArea, komi: "", total: score.black })}</p>
      <p>
        {t("games.goScoreLine", {
          color: t("games.goWhite"),
          stones: score.whiteStones,
          area: score.whiteArea,
          komi: t("games.goScoreKomi", { komi: KOMI }),
          total: score.white,
        })}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------

function Segmented<T extends string | number>({
  label,
  value,
  options,
  onChange,
  name,
}: {
  label: string;
  name: string;
  value: T;
  options: Array<{ value: T; label: string; hint?: string; disabled?: boolean }>;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-semibold">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label
            key={String(option.value)}
            className={cn(
              "flex min-h-11 cursor-pointer flex-col justify-center rounded-xl border px-4 py-2 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary",
              value === option.value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface hover:border-primary/50",
              option.disabled && "cursor-not-allowed opacity-45 hover:border-border",
            )}
          >
            <input
              type="radio"
              name={name}
              className="sr-only"
              checked={value === option.value}
              disabled={option.disabled}
              onChange={() => onChange(option.value)}
            />
            <span className="font-semibold">{option.label}</span>
            {option.hint ? <span className={cn("text-xs", value === option.value ? "text-primary-foreground/80" : "text-foreground-secondary")}>{option.hint}</span> : null}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function SetupPanel({ initial, maxSize, onStart, record }: { initial: Settings; maxSize: BoardSize; onStart: (s: Settings) => void; record: Stats }) {
  const { t } = useI18n();
  const [draft, setDraft] = React.useState<Settings>({ ...initial, size: initial.size > maxSize ? maxSize : initial.size });
  React.useEffect(() => {
    setDraft((current) => (current.size > maxSize ? { ...current, size: maxSize } : current));
  }, [maxSize]);
  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => setDraft((current) => ({ ...current, [key]: value }));
  return (
    <form
      className="mx-auto max-w-2xl space-y-6 rounded-3xl border border-border bg-surface p-5 sm:p-8"
      onSubmit={(event) => {
        event.preventDefault();
        onStart(draft);
      }}
    >
      <div className="flex items-center gap-4">
        <Tianwu pose="stand" className="h-20 w-18 shrink-0" />
        <div>
          <h2 className="text-xl font-bold">{t("games.goSetupTitle")}</h2>
          <p className="text-sm text-foreground-secondary">{t("games.goIntro")}</p>
        </div>
      </div>
      <Segmented
        label={t("games.goMode")}
        name="go-mode"
        value={draft.mode}
        onChange={(v) => update("mode", v)}
        options={[
          { value: "full", label: t("games.goModeFull"), hint: t("games.goModeFullHint", { komi: KOMI }) },
          { value: "capture", label: t("games.goModeCapture"), hint: t("games.goModeCaptureHint") },
        ]}
      />
      <div className="space-y-2">
        <Segmented
          label={t("games.goSize")}
          name="go-size"
          value={draft.size}
          onChange={(v) => update("size", v)}
          options={BOARD_SIZES.map((size) => ({ value: size, label: `${size}×${size}`, disabled: size > maxSize }))}
        />
        {maxSize < 19 ? <p className="text-xs text-foreground-secondary">{t("games.goSizeLocked", { size: maxSize })}</p> : null}
      </div>
      <Segmented
        label={t("games.goColor")}
        name="go-color"
        value={draft.color}
        onChange={(v) => update("color", v)}
        options={[
          { value: BLACK, label: t("games.goBlack"), hint: t("games.goBlackHint") },
          { value: WHITE, label: t("games.goWhite"), hint: t("games.goWhiteHint") },
        ]}
      />
      <Segmented
        label={t("games.goLevel")}
        name="go-level"
        value={draft.level}
        onChange={(v) => update("level", v)}
        options={(["easy", "medium", "hard"] as const).map((level) => ({
          value: level,
          label: t(level === "easy" ? "games.goEasy" : level === "medium" ? "games.goMedium" : "games.goHard"),
          hint: draft.mode === "full" && canUseNet() ? t("games.goBrainNet", { rank: rankLabel(NET_STYLES[level].rank) }) : undefined,
        }))}
      />
      {draft.mode === "full" && canUseNet() ? <p className="text-xs text-foreground-secondary">{t("games.goBrainNote", { mb: NET_SIZE_MB })}</p> : null}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted">{t("games.goRecord", { wins: record[draft.mode].wins, losses: record[draft.mode].losses })}</p>
        <Button type="submit" size="lg">
          {t("games.goStart")}
        </Button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------

type BoardProps = {
  position: Position;
  size: number;
  interactive: boolean;
  scoring: boolean;
  dead: number[];
  owner: Int8Array | null;
  humanColor: Color;
  onPlay: (point: number) => void;
  onPass?: () => void;
  onToggleDead?: (point: number) => void;
  label: string;
  tapAgainHint: string;
};

function GoBoard({ position, size, interactive, scoring, dead, owner, humanColor, onPlay, onPass, onToggleDead, label, tapAgainHint }: BoardProps) {
  const svgRef = React.useRef<SVGSVGElement>(null);
  const [hover, setHover] = React.useState<number | null>(null);
  const [pending, setPending] = React.useState<number | null>(null);
  const [cursor, setCursor] = React.useState<number | null>(null);
  const deadSet = React.useMemo(() => new Set(dead), [dead]);
  const stars = React.useMemo(() => starPoints(size), [size]);
  const area = size * size;

  React.useEffect(() => {
    setPending(null);
    setHover(null);
  }, [position.moveNumber]);

  const pointAt = (clientX: number, clientY: number): number | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const unit = rect.width / (size + 1);
    const x = Math.round((clientX - rect.left) / unit - 1);
    const y = Math.round((clientY - rect.top) / unit - 1);
    if (x < 0 || y < 0 || x >= size || y >= size) return null;
    return y * size + x;
  };

  const onPointerUp = (event: React.PointerEvent<SVGSVGElement>) => {
    const point = pointAt(event.clientX, event.clientY);
    if (point === null) return;
    if (onToggleDead) {
      if (position.board[point] !== 0) onToggleDead(point);
      return;
    }
    if (!interactive) return;
    if (event.pointerType === "touch" || event.pointerType === "pen") {
      // Two taps on phones: preview first, play on the second tap.
      if (pending === point) {
        setPending(null);
        onPlay(point);
      } else setPending(point);
      return;
    }
    onPlay(point);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    const move = (dx: number, dy: number) => {
      event.preventDefault();
      const current = cursor ?? Math.floor(area / 2);
      const x = Math.min(size - 1, Math.max(0, (current % size) + dx));
      const y = Math.min(size - 1, Math.max(0, Math.floor(current / size) + dy));
      setCursor(y * size + x);
    };
    if (event.key === "ArrowLeft") move(-1, 0);
    else if (event.key === "ArrowRight") move(1, 0);
    else if (event.key === "ArrowUp") move(0, -1);
    else if (event.key === "ArrowDown") move(0, 1);
    else if ((event.key === "Enter" || event.key === " ") && cursor !== null) {
      event.preventDefault();
      if (onToggleDead) onToggleDead(cursor);
      else if (interactive) onPlay(cursor);
    } else if ((event.key === "p" || event.key === "P") && onPass && interactive) {
      event.preventDefault();
      onPass();
    }
  };

  const ghost = pending ?? (interactive && !onToggleDead ? hover : null);
  const last = position.lastMove !== null && position.lastMove >= 0 ? position.lastMove : null;
  const r = 0.47;
  const coord = (p: number) => ({ cx: (p % size) + 1, cy: Math.floor(p / size) + 1 });

  return (
    <div className="mx-auto w-full max-w-[min(100%,42rem)]">
      <div
        role="application"
        tabIndex={0}
        aria-label={label}
        onKeyDown={onKeyDown}
        onBlur={() => setCursor(null)}
        className="go-board relative rounded-2xl p-1 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background"
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${size + 1} ${size + 1}`}
          className={cn("block h-auto w-full touch-manipulation select-none", interactive || onToggleDead ? "cursor-pointer" : "cursor-default")}
          onPointerMove={(event) => event.pointerType === "mouse" && setHover(pointAt(event.clientX, event.clientY))}
          onPointerLeave={() => setHover(null)}
          onPointerUp={onPointerUp}
          aria-hidden="true"
        >
          <rect x="0" y="0" width={size + 1} height={size + 1} rx="0.35" fill="var(--go-wood)" />
          {Array.from({ length: size }, (_, i) => (
            <g key={i} stroke="var(--go-line)" strokeWidth={0.035}>
              <line x1={1} y1={i + 1} x2={size} y2={i + 1} />
              <line x1={i + 1} y1={1} x2={i + 1} y2={size} />
            </g>
          ))}
          {stars.map((p) => (
            <circle key={p} {...coord(p)} r={size >= 13 ? 0.11 : 0.09} fill="var(--go-line)" />
          ))}
          {Array.from({ length: size }, (_, i) => (
            <g key={`c${i}`} fill="var(--go-line)" fontSize={0.36} fontFamily="ui-sans-serif, system-ui" textAnchor="middle" dominantBaseline="central" opacity={0.75}>
              <text x={i + 1} y={0.42}>{columnLabel(i)}</text>
              <text x={i + 1} y={size + 0.6}>{columnLabel(i)}</text>
              <text x={0.38} y={i + 1}>{size - i}</text>
              <text x={size + 0.62} y={i + 1}>{size - i}</text>
            </g>
          ))}
          {Array.from(position.board).map((stone, p) => {
            if (stone === 0) return null;
            const { cx, cy } = coord(p);
            const isDead = scoring && deadSet.has(p);
            return (
              <g key={p} opacity={isDead ? 0.38 : 1}>
                <circle cx={cx + 0.04} cy={cy + 0.06} r={r} fill="#000" opacity={0.18} />
                <circle cx={cx} cy={cy} r={r} fill={stone === BLACK ? "#121A33" : "#F7F3EA"} stroke={stone === BLACK ? "#0A1024" : "#9C9481"} strokeWidth={0.03} />
                {stone === BLACK ? <circle cx={cx - 0.14} cy={cy - 0.15} r={0.14} fill="#FFFFFF" opacity={0.16} /> : null}
                {isDead ? (
                  <path d={`M${cx - 0.2} ${cy - 0.2} L${cx + 0.2} ${cy + 0.2} M${cx + 0.2} ${cy - 0.2} L${cx - 0.2} ${cy + 0.2}`} stroke="#E5484D" strokeWidth={0.08} strokeLinecap="round" />
                ) : null}
              </g>
            );
          })}
          {scoring && owner
            ? Array.from(owner).map((who, p) =>
                who && (position.board[p] === 0 || deadSet.has(p)) ? (
                  <rect key={`o${p}`} x={coord(p).cx - 0.15} y={coord(p).cy - 0.15} width={0.3} height={0.3} rx={0.04} fill={who === BLACK ? "#121A33" : "#F7F3EA"} stroke={who === BLACK ? "none" : "#9C9481"} strokeWidth={0.02} />
                ) : null,
              )
            : null}
          {last !== null && !scoring ? (
            <circle {...coord(last)} r={0.2} fill="none" stroke={position.board[last] === BLACK ? "#F0C27B" : "#1D3A7D"} strokeWidth={0.07} />
          ) : null}
          {ghost !== null && position.board[ghost] === 0 ? (
            <circle {...coord(ghost)} r={r} fill={humanColor === BLACK ? "#121A33" : "#F7F3EA"} opacity={pending !== null ? 0.6 : 0.4} stroke={pending !== null ? "#D9AF62" : "none"} strokeWidth={0.06} />
          ) : null}
          {cursor !== null ? (
            <rect x={coord(cursor).cx - 0.5} y={coord(cursor).cy - 0.5} width={1} height={1} rx={0.12} fill="none" stroke="var(--primary)" strokeWidth={0.07} />
          ) : null}
        </svg>
      </div>
      {pending !== null ? <p className="mt-2 text-center text-xs text-foreground-secondary">{tapAgainHint}</p> : null}
    </div>
  );
}
