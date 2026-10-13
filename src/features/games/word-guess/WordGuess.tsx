"use client";

import * as React from "react";
import { Lightbulb, Lock, SkipForward } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/cn";
import {
  MAX_HINTS,
  guessesLeft,
  newRound,
  pickNext,
  poolIds,
  stars,
  submitGuess,
  takeHint,
  type Round,
  type Verdict,
  type WordEntry,
} from "./logic";
import type { TopicLabels } from "./notion-words";

const STORAGE_KEY = "shanverse:word-guess:progress";

/** The words this page was rendered with (built-in plus Notion), indexed. */
type Library = {
  words: WordEntry[];
  byId: Map<string, WordEntry>;
  /** Topics in the order they first appear in the data. */
  topicIds: string[];
};

const makeLibrary = (words: WordEntry[]): Library => ({
  words,
  byId: new Map(words.map((word) => [word.id, word])),
  topicIds: [...new Set(words.map((word) => word.topic))],
});

type Stats = { solved: number; failed: number; stars: number; streak: number; bestStreak: number };

type Saved = {
  /** Ids finished (won or lost) since their topic last started over. */
  played: string[];
  /** Chosen topic, or null for all topics. */
  topic: string | null;
  /** The word being played, kept so a reload resumes it. */
  current?: Round;
  stats: Stats;
};

const emptyStats: Stats = { solved: 0, failed: 0, stars: 0, streak: 0, bestStreak: 0 };
const emptySaved: Saved = { played: [], topic: null, stats: emptyStats };

const fitsTopic = (lib: Library, id: string, topic: string | null) => topic === null || lib.byId.get(id)?.topic === topic;

/**
 * Saved progress, cleaned against the current word list: words removed or
 * unpublished in Notion drop out of `played`, and a saved word in progress
 * that no longer exists is discarded.
 */
function readSaved(lib: Library): Saved {
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null") as Partial<Saved> | null;
    if (!value || typeof value !== "object") return emptySaved;
    const topic = typeof value.topic === "string" && lib.topicIds.includes(value.topic) ? value.topic : null;
    const played = Array.isArray(value.played) ? value.played.filter((id): id is string => typeof id === "string" && lib.byId.has(id)) : [];
    const raw = value.stats && typeof value.stats === "object" ? value.stats : {};
    const count = (n: unknown) => (typeof n === "number" && Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0);
    const stats: Stats = {
      solved: count((raw as Stats).solved),
      failed: count((raw as Stats).failed),
      stars: count((raw as Stats).stars),
      streak: count((raw as Stats).streak),
      bestStreak: count((raw as Stats).bestStreak),
    };
    const round = value.current;
    const current =
      round &&
      typeof round.id === "string" &&
      lib.byId.has(round.id) &&
      fitsTopic(lib, round.id, topic) &&
      Array.isArray(round.guesses) &&
      round.guesses.every((g) => typeof g === "string") &&
      Number.isInteger(round.hints) &&
      round.hints >= 0 &&
      round.hints <= MAX_HINTS &&
      (round.status === "playing" || round.status === "won" || round.status === "lost")
        ? round
        : undefined;
    return { played, topic, current, stats };
  } catch {
    return emptySaved;
  }
}

function writeSaved(saved: Saved) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  } catch {
    // Progress is not saved; the game still works.
  }
}

/** Starts a fresh word from the topic, starting the topic over if it is used up. */
function withNextWord(lib: Library, saved: Saved): Saved {
  const next = pickNext(lib.words, saved.topic, saved.played);
  if (!next) return { ...saved, current: undefined };
  return { ...saved, played: next.played, current: newRound(next.id) };
}

export function WordGuess({ words, topics }: { words: WordEntry[]; topics: TopicLabels }) {
  const { t, locale } = useI18n();
  const lang = locale === "en" ? "en" : "vi";
  const lib = React.useMemo(() => makeLibrary(words), [words]);
  const [saved, setSaved] = React.useState<Saved | null>(null);
  const [text, setText] = React.useState("");
  const [verdict, setVerdict] = React.useState<Verdict | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Next state is computed from the current render's state, outside any
  // React updater: picking a word is random, and updaters may run twice.
  const commit = (next: Saved) => {
    writeSaved(next);
    setSaved(next);
  };

  // Load after hydration: the word is random, so it cannot be rendered on the server.
  React.useEffect(() => {
    const loaded = readSaved(lib);
    const ready = loaded.current ? loaded : withNextWord(lib, loaded);
    writeSaved(ready);
    setSaved(ready);
  }, [lib]);

  const round = saved?.current;
  const word = round ? lib.byId.get(round.id) : undefined;
  const finished = round ? round.status !== "playing" : false;

  /** Records a finished round: marks the word played and updates the stats. */
  const finish = (current: Saved, done: Round): Saved => {
    const won = done.status === "won";
    const streak = won ? current.stats.streak + 1 : 0;
    return {
      ...current,
      current: done,
      played: current.played.includes(done.id) ? current.played : [...current.played, done.id],
      stats: {
        solved: current.stats.solved + (won ? 1 : 0),
        failed: current.stats.failed + (won ? 0 : 1),
        stars: current.stats.stars + stars(done),
        streak,
        bestStreak: Math.max(current.stats.bestStreak, streak),
      },
    };
  };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!saved || !round || !word || finished) return;
    const result = submitGuess(round, word, text);
    setVerdict(result.verdict);
    if (result.verdict === "wrong" || result.verdict === "correct") setText("");
    if (result.round === round) return;
    commit(result.round.status === "playing" ? { ...saved, current: result.round } : finish(saved, result.round));
    if (result.round.status === "playing") inputRef.current?.focus();
  };

  const onHint = () => {
    if (!saved || !round || finished || round.hints >= MAX_HINTS) return;
    setVerdict(null);
    commit({ ...saved, current: takeHint(round) });
    inputRef.current?.focus();
  };

  const onNext = () => {
    if (!saved) return;
    setText("");
    setVerdict(null);
    commit(withNextWord(lib, saved));
    // The input mounts again on the next render.
    window.requestAnimationFrame(() => inputRef.current?.focus());
  };

  /** Switching topic drops the word in progress without counting it as played. */
  const onTopic = (topic: string | null) => {
    if (!saved || topic === saved.topic) return;
    setText("");
    setVerdict(null);
    // A finished word is already in `played`; an unfinished one is simply dropped.
    commit(withNextWord(lib, { ...saved, topic, current: undefined }));
  };

  const topicName = (id: string) => topics[id]?.[lang] ?? id;

  if (!saved) {
    return <div aria-busy="true" className="mx-auto h-[28rem] max-w-2xl animate-pulse rounded-2xl border border-border bg-surface" />;
  }

  const pool = poolIds(lib.words, saved.topic);
  const playedInPool = pool.filter((id) => saved.played.includes(id)).length;
  const shown = finished ? MAX_HINTS : (round?.hints ?? 0);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <nav aria-label={t("games.wgTopics")} className="flex flex-wrap justify-center gap-2">
        {[null, ...lib.topicIds].map((topic) => {
          const active = saved.topic === topic;
          return (
            <button
              key={topic ?? "all"}
              type="button"
              aria-pressed={active}
              onClick={() => onTopic(topic)}
              className={cn(
                "min-h-10 rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-primary",
                active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface text-foreground-secondary hover:border-primary/50",
              )}
            >
              {topic === null ? t("games.wgAll") : topicName(topic)}
            </button>
          );
        })}
      </nav>

      <div className="flex flex-wrap items-stretch justify-center gap-2 sm:gap-3">
        <Stat label={t("games.wgSolved")} value={String(saved.stats.solved)} highlight />
        <Stat label={t("games.wgStreak")} value={String(saved.stats.streak)} />
        <Stat label={t("games.wgStars")} value={`${saved.stats.stars}★`} />
        <Stat label={t("games.wgProgress")} value={`${playedInPool}/${pool.length}`} />
      </div>

      {lang === "en" ? <p className="text-center text-xs text-muted">{t("games.wgContentNote")}</p> : null}

      {round && word ? (
        <section aria-labelledby="wg-question" className="space-y-4 rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-widest">
            <span className="text-primary">{t("games.wgQuestion")}</span>
            {saved.topic === null ? <span className="rounded-full bg-primary/10 px-2.5 py-1 text-primary">{topicName(word.topic)}</span> : null}
          </div>
          <h2 id="wg-question" className="text-lg font-bold leading-snug sm:text-xl">
            {word.question}
          </h2>

          <ol aria-label={t("games.wgHints")} className="space-y-2">
            {word.hints.map((hint, i) => {
              const open = i < shown;
              return (
                <li
                  key={i}
                  className={cn(
                    "flex gap-3 rounded-xl border px-3 py-2.5 text-sm transition-colors",
                    open ? "border-[#D9AF62]/50 bg-[#D9AF62]/10" : "border-dashed border-border text-muted",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      open ? "bg-[#D9AF62] text-[#031242]" : "bg-muted/15 text-muted",
                    )}
                  >
                    {open ? i + 1 : <Lock className="size-3" />}
                  </span>
                  <span className="min-w-0 self-center">{open ? hint : t("games.wgHintLocked", { n: i + 1 })}</span>
                </li>
              );
            })}
          </ol>

          {round.guesses.length ? (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">{t("games.wgTried")}</span>
              {round.guesses.map((guess, i) => (
                <span key={i} className="rounded-full border border-border px-2.5 py-0.5 text-foreground-secondary line-through decoration-danger/60">
                  {guess}
                </span>
              ))}
            </div>
          ) : null}

          {finished ? (
            <div aria-live="polite" className="flex flex-wrap items-center gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-4">
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-lg font-bold">{round.status === "won" ? t("games.wgWinTitle") : t("games.wgLoseTitle")}</p>
                <p className="text-sm text-foreground-secondary">{t("games.wgAnswerWas", { answer: word.answer })}</p>
                {round.status === "won" ? (
                  <p aria-label={t("games.wgStarsLabel", { stars: stars(round) })} className="text-xl tracking-widest text-[#D9AF62]">
                    {"★".repeat(stars(round))}
                    <span className="text-muted/40">{"★".repeat(MAX_HINTS - stars(round))}</span>
                  </p>
                ) : null}
              </div>
              <Button type="button" onClick={onNext} autoFocus className="shrink-0 gap-1.5">
                <SkipForward aria-hidden="true" className="size-4" /> {t("games.wgNext")}
              </Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-3">
              <label htmlFor="wg-answer" className="sr-only">
                {t("games.wgInputLabel")}
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  ref={inputRef}
                  id="wg-answer"
                  value={text}
                  onChange={(event) => {
                    setText(event.target.value);
                    if (verdict === "near" || verdict === "repeat") setVerdict(null);
                  }}
                  placeholder={t("games.wgPlaceholder")}
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  inputSize="lg"
                  aria-describedby="wg-feedback"
                  className="flex-1"
                />
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1 sm:flex-none">
                    {t("games.wgSubmit")}
                  </Button>
                  <Button type="button" variant="outline" onClick={onHint} disabled={round.hints >= MAX_HINTS} className="flex-1 gap-1.5 sm:flex-none">
                    <Lightbulb aria-hidden="true" className="size-4" /> {t("games.wgHintButton")}
                  </Button>
                </div>
              </div>
              <p id="wg-feedback" aria-live="polite" className="min-h-5 text-sm">
                {verdict === "near" ? (
                  <span className="font-semibold text-primary">{t("games.wgNear")}</span>
                ) : verdict === "repeat" ? (
                  <span className="text-foreground-secondary">{t("games.wgRepeat")}</span>
                ) : verdict === "wrong" ? (
                  <span className="text-danger">{guessesLeft(round) === 1 ? t("games.wgWrongLast") : t("games.wgWrong")}</span>
                ) : (
                  <span className="text-muted">{t("games.wgGuessesLeft", { n: guessesLeft(round) })}</span>
                )}
              </p>
            </form>
          )}
        </section>
      ) : (
        <p className="rounded-2xl border border-border bg-surface p-6 text-center text-foreground-secondary">{t("games.wgEmpty")}</p>
      )}
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={cn("min-w-[4.5rem] rounded-xl border bg-surface px-2 py-1.5 text-center sm:min-w-20 sm:px-3", highlight ? "border-primary/40" : "border-border")}>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</p>
      <p className={cn("text-lg font-extrabold tabular-nums", highlight && "text-primary")}>{value}</p>
    </div>
  );
}
