"use client";

import * as React from "react";
import { FastForward, Lightbulb, RefreshCw, SkipForward } from "lucide-react";

import { MASCOT_NAME, TianwuBadge } from "@/components/mascot/Tianwu";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/cn";
import { randomSeed } from "./generator";
import { CELLS, SIZE, TORCHES, fire, isCleared, shipsLeft, type Frame } from "./logic";
import { AmmoIcon, Burst, Piece, Projectile } from "./pieces";
import { DEFAULT_THEME, PREFS_KEY, THEMES, THEME_EVENT, THEME_IDS, fill, isThemeId, stateText, type ThemeId } from "./themes";
import { useRedCliffsEngine } from "./use-engine";

const STORAGE_KEY = "shanverse:red-cliffs:progress";

/** One tick of flight, in milliseconds, per speed. */
const SPEEDS = { slow: 460, normal: 300, fast: 170 } as const;
type Speed = keyof typeof SPEEDS;
const SPEED_IDS = Object.keys(SPEEDS) as Speed[];

const DX = [0, 0, -1, 1];
const DY = [-1, 1, 0, 0];

/** The game only ends when the board is cleared (won) or every torch is used (lost). */
type Status = "playing" | "won" | "lost";

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
type Prefs = { theme: ThemeId; speed: Speed };

const emptyStats: Stats = { wins: 0, losses: 0, streak: 0, best: null };

const isBoard = (value: unknown): value is number[] =>
  Array.isArray(value) && value.length === CELLS && value.every((n) => Number.isInteger(n) && n >= 0 && n <= 4);

function readJson(key: string): unknown {
  try {
    return JSON.parse(window.localStorage.getItem(key) ?? "null");
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Not saved; the game still works.
  }
}

function readSaved(): Saved {
  const value = readJson(STORAGE_KEY) as Partial<Saved> | null;
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
      ? // Older saves could end early as "stuck"; that now counts as a loss.
        { ...g, status: (g.status as string) === "stuck" ? "lost" : g.status }
      : undefined;
  return { game, stats };
}

function readPrefs(): Prefs {
  const value = readJson(PREFS_KEY) as Partial<Prefs> | null;
  return {
    theme: isThemeId(value?.theme) ? value.theme : DEFAULT_THEME,
    speed: value?.speed && value.speed in SPEEDS ? value.speed : "normal",
  };
}

const newGame = (seed: number, board: number[]): Game => ({ seed, start: board, board, torches: TORCHES, hintUsed: false, status: "playing" });

/** Stats after a game ends. */
function record(stats: Stats, game: Game): Stats {
  if (game.status === "won") {
    const used = TORCHES - game.torches;
    return { wins: stats.wins + 1, losses: stats.losses, streak: stats.streak + 1, best: stats.best === null ? used : Math.min(stats.best, used) };
  }
  return { ...stats, losses: stats.losses + 1, streak: 0 };
}

/**
 * A click playing out. Step 0 shows the player's shot landing; step k ≥ 1
 * shows the result of frame k-1 (hits, bursts) while frame k's projectiles
 * fly in, so a target changes only once something has reached it.
 */
type Anim = { frames: Frame[]; step: number; before: number[]; cell: number; after: Game };

type HintNote = null | "shown" | "none" | "lost";

export function RedCliffs() {
  const { t, locale } = useI18n();
  const lang = locale === "en" ? "en" : "vi";
  const call = useRedCliffsEngine();
  const [saved, setSaved] = React.useState<Saved | null>(null);
  const [prefs, setPrefs] = React.useState<Prefs>({ theme: DEFAULT_THEME, speed: "normal" });
  const [busy, setBusy] = React.useState<"dealing" | "hint" | null>(null);
  const [error, setError] = React.useState(false);
  const [hintCell, setHintCell] = React.useState<number | null>(null);
  const [note, setNote] = React.useState<HintNote>(null);
  const [anim, setAnim] = React.useState<Anim | null>(null);
  const reducedMotion = React.useRef(false);

  const theme = THEMES[prefs.theme];
  const tick = SPEEDS[prefs.speed];
  const pause = Math.round(tick * 0.9);

  const commit = React.useCallback((next: Saved) => {
    writeJson(STORAGE_KEY, next);
    setSaved(next);
  }, []);

  const updatePrefs = (change: Partial<Prefs>) => {
    const next = { ...prefs, ...change };
    writeJson(PREFS_KEY, next);
    setPrefs(next);
    if (change.theme) window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: change.theme }));
  };

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
    setPrefs(readPrefs());
    const loaded = readSaved();
    if (loaded.game) setSaved(loaded);
    else void deal(loaded.stats);
  }, [deal]);

  const game = saved?.game;

  /**
   * After a click has fully played out. The game is won once the board is
   * clear, and lost only when every torch is used; a board that can no longer
   * be won is still played to the end.
   */
  const settle = React.useCallback(
    (current: Saved, after: Game) => {
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
    },
    [commit],
  );

  // How long each step stays on screen: a tick, plus a pause when something burst.
  const stepDuration = React.useCallback(
    (a: Anim) => {
      if (a.step === 0) return tick;
      const landed = a.frames[a.step - 1];
      const burst = landed.sunk.length > 0;
      if (a.step >= a.frames.length) return burst ? tick + pause : Math.round(tick * 0.8);
      return tick + (burst ? pause : 0);
    },
    [tick, pause],
  );

  React.useEffect(() => {
    if (!anim || !saved) return;
    const timer = window.setTimeout(() => {
      if (anim.step >= anim.frames.length) {
        setAnim(null);
        settle(saved, anim.after);
      } else {
        setAnim({ ...anim, step: anim.step + 1 });
      }
    }, stepDuration(anim));
    return () => window.clearTimeout(timer);
  }, [anim, saved, settle, stepDuration]);

  const onCell = (cell: number) => {
    if (!saved || !game || game.status !== "playing" || anim || busy || game.board[cell] === 0) return;
    setHintCell(null);
    setNote(null);
    const result = fire(game.board, cell, !reducedMotion.current);
    const after: Game = { ...game, board: result.board, torches: game.torches - 1 };
    if (reducedMotion.current || !result.frames.length) {
      settle(saved, after);
      return;
    }
    setAnim({ frames: result.frames, step: 0, before: game.board, cell, after });
  };

  const onSkip = () => {
    if (!anim || !saved) return;
    const after = anim.after;
    setAnim(null);
    settle(saved, after);
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
      // Proven: no way to win with what is left. Say so, but let the player
      // keep going; the result comes when the torches run out.
      commit({ ...saved, game: used });
      setNote("lost");
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

  const picker = (
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
      <div role="radiogroup" aria-label={t("games.rcTheme")} className="flex gap-1.5">
        {THEME_IDS.map((id) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={prefs.theme === id}
            onClick={() => updatePrefs({ theme: id })}
            className={cn(
              "min-h-9 rounded-full border px-3.5 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-primary",
              prefs.theme === id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface text-foreground-secondary hover:border-primary/50",
            )}
          >
            {THEMES[id].chip[lang]}
          </button>
        ))}
      </div>
      <div role="radiogroup" aria-label={t("games.rcSpeed")} className="flex items-center gap-1 rounded-full border border-border bg-surface p-1">
        <span className="px-2 text-[11px] font-semibold uppercase tracking-wider text-muted">{t("games.rcSpeed")}</span>
        {SPEED_IDS.map((id) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={prefs.speed === id}
            onClick={() => updatePrefs({ speed: id })}
            className={cn(
              "min-h-7 rounded-full px-2.5 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-primary",
              prefs.speed === id ? "bg-primary text-primary-foreground" : "text-foreground-secondary hover:text-foreground",
            )}
          >
            {t(`games.rcSpeed${id[0].toUpperCase()}${id.slice(1)}` as "games.rcSpeedSlow")}
          </button>
        ))}
      </div>
    </div>
  );

  if (!saved || (!game && busy === "dealing")) {
    return (
      <div className="space-y-5">
        {picker}
        <div className="mx-auto flex max-w-xl flex-col items-center gap-3 text-center" aria-live="polite">
          <div aria-hidden="true" className="rc-board animate-pulse opacity-60" data-theme={prefs.theme} />
          <p className="text-sm text-muted">{fill(theme.dealing, lang)}</p>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="mx-auto max-w-md space-y-3 rounded-2xl border border-border bg-surface p-6 text-center">
        <p className="text-foreground-secondary">{error ? t("games.rcError") : fill(theme.dealing, lang)}</p>
        <Button type="button" onClick={onNew} disabled={busy !== null}>
          {t("games.rcNew")}
        </Button>
      </div>
    );
  }

  // What the board shows right now.
  const landed = anim && anim.step > 0 ? anim.frames[anim.step - 1] : null;
  const flying = anim && anim.step > 0 && anim.step < anim.frames.length ? anim.frames[anim.step] : null;
  const shown = anim ? (landed ? landed.board : anim.before) : game.board;
  const flashes = new Set(landed?.hits ?? []);
  const flightDelay = landed && landed.sunk.length ? pause : 0;
  const chain = anim ? anim.frames.slice(0, anim.step).reduce((n, frame) => n + frame.sunk.length, 0) : 0;
  const torchesLeft = anim ? anim.after.torches : game.torches;
  const playing = game.status === "playing";
  const locked = !playing || anim !== null || busy !== null;
  const cellVars = (x: number, y: number, fx = x, fy = y) => ({ "--fx": fx, "--fy": fy, "--tx": x, "--ty": y }) as React.CSSProperties;

  return (
    <div className="space-y-5">
      {picker}

      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">{theme.name[lang]}</h2>
        <p className="mx-auto mt-1 max-w-lg text-sm text-foreground-secondary">{theme.intro[lang]}</p>
      </div>

      <div className="flex flex-wrap items-stretch justify-center gap-2 sm:gap-3">
        <div className="flex min-w-[9rem] items-center gap-2 rounded-xl border border-primary/40 bg-surface px-3 py-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">{theme.ammo[lang]}</span>
          <span aria-label={fill(theme.ammoLeft, lang, { n: torchesLeft })} className="flex gap-0.5">
            {Array.from({ length: TORCHES }, (_, i) => (
              <AmmoIcon key={i} theme={prefs.theme} lit={i < torchesLeft} />
            ))}
          </span>
        </div>
        <Stat label={theme.targetsLeft[lang]} value={String(shipsLeft(shown))} highlight />
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
        <div className="mb-2 flex min-h-7 items-center justify-between gap-3">
          <p className="text-xs text-muted">{t("games.rcBoardNumber", { seed: game.seed.toString(36).toUpperCase() })}</p>
          {chain >= 2 ? (
            <span key={chain} className="rc-chain rounded-full bg-[#f97316] px-2.5 py-0.5 text-xs font-extrabold text-white shadow">
              {t("games.rcChain", { n: chain })}
            </span>
          ) : null}
          {anim ? (
            <button type="button" onClick={onSkip} className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs font-semibold text-foreground-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary">
              <FastForward aria-hidden="true" className="size-3.5" /> {t("games.rcSkip")}
            </button>
          ) : null}
        </div>
        <div
          className="rc-board"
          data-theme={prefs.theme}
          role="group"
          aria-label={fill(theme.boardLabel, lang)}
          aria-busy={anim !== null || busy !== null}
          style={{ "--rc-tick": `${tick}ms`, "--rc-burst": `${tick + pause}ms` } as React.CSSProperties}
        >
          <div className="rc-grid">
            {shown.map((strength, cell) => {
              const row = Math.floor(cell / SIZE) + 1;
              const col = (cell % SIZE) + 1;
              const flash = flashes.has(cell);
              return (
                <button
                  key={cell}
                  type="button"
                  className="rc-cell"
                  data-hint={hintCell === cell ? "true" : undefined}
                  disabled={locked || strength === 0}
                  onClick={() => onCell(cell)}
                  aria-label={t("games.rcCell", { row, col, state: fill(stateText(theme, strength), lang) })}
                >
                  <span key={flash ? `hit-${anim?.step}` : "still"} className="block size-full" data-hit={flash ? "true" : undefined}>
                    <Piece theme={prefs.theme} strength={strength} />
                  </span>
                </button>
              );
            })}
          </div>

          {anim && anim.step === 0 ? (
            <span aria-hidden="true" className="rc-shot-in" style={cellVars(anim.cell % SIZE, Math.floor(anim.cell / SIZE))}>
              <Projectile theme={prefs.theme} direction={1} />
            </span>
          ) : null}

          {landed?.sunk.map((cell) => (
            <span
              key={`burst-${cell}-${anim?.step}`}
              aria-hidden="true"
              className="rc-burst"
              style={{ "--bx": `${(cell % SIZE) * 100}%`, "--by": `${Math.floor(cell / SIZE) * 100}%` } as React.CSSProperties}
            >
              <Burst theme={prefs.theme} />
            </span>
          ))}

          {flying
            ? [...flying.torches.map((shot) => ({ shot, strike: false })), ...flying.strikes.map((shot) => ({ shot, strike: true }))].map(({ shot, strike }) => (
                <span
                  key={`shot-${shot.origin}-${shot.direction}-${anim?.step}`}
                  aria-hidden="true"
                  className="rc-shot"
                  data-strike={strike ? "true" : undefined}
                  style={{ ...cellVars(shot.x, shot.y, shot.x - DX[shot.direction], shot.y - DY[shot.direction]), "--rc-delay": `${flightDelay}ms` } as React.CSSProperties}
                >
                  <Projectile theme={prefs.theme} direction={shot.direction} />
                </span>
              ))
            : null}
        </div>
      </div>

      <div aria-live="polite" className="mx-auto max-w-xl">
        {game.status === "won" ? (
          <EndPanel
            title={fill(theme.winTitle, lang)}
            text={fill(theme.winText, lang, { used: TORCHES - game.torches, left: game.torches })}
            onReplay={onReplay}
            onNew={onNew}
            replayLabel={t("games.rcReplay")}
            newLabel={t("games.rcNew")}
            good
          />
        ) : game.status === "lost" ? (
          <EndPanel
            title={fill(theme.loseTitle, lang)}
            text={fill(theme.loseText, lang, { n: shipsLeft(game.board) })}
            onReplay={onReplay}
            onNew={onNew}
            replayLabel={t("games.rcReplay")}
            newLabel={t("games.rcNew")}
          />
        ) : note === "lost" ? (
          <EndPanel
            title={t("games.rcStuckTitle", { name: MASCOT_NAME })}
            text={`${fill(theme.stuckText, lang, { n: game.torches })} ${t("games.rcKeepGoing")}`}
            onReplay={onReplay}
            onNew={onNew}
            replayLabel={t("games.rcReplay")}
            newLabel={t("games.rcNew")}
          />
        ) : note === "none" ? (
          <EndPanel
            title={t("games.rcHintNoneTitle", { name: MASCOT_NAME })}
            text={t("games.rcHintNoneText")}
            onReplay={onReplay}
            onNew={onNew}
            replayLabel={t("games.rcReplay")}
            newLabel={t("games.rcNew")}
          />
        ) : note === "shown" ? (
          <p className="text-center text-sm font-semibold text-primary">{fill(theme.hintShown, lang, { name: MASCOT_NAME })}</p>
        ) : busy === "hint" ? (
          <p className="text-center text-sm text-muted">{t("games.rcThinking", { name: MASCOT_NAME })}</p>
        ) : (
          <p className="text-center text-xs text-muted">{fill(theme.tip, lang)}</p>
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
