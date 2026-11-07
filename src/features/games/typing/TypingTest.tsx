"use client";

import * as React from "react";
import { RefreshCw, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GameResultDialog } from "@/features/games/components/GameResultDialog";
import { GameStatBar } from "@/features/games/components/GameStatBar";
import { GameToolbar } from "@/features/games/components/GameToolbar";
import { GameDifficultyPicker } from "@/features/games/components/GameDifficultyPicker";
import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/cn";
import {
  applyInput,
  charStates,
  computeStats,
  emptyProgress,
  isComplete,
  pickIndex,
  type Progress,
} from "./logic";
import { CODE_PASSAGES, TEXT_PASSAGES, type TypingMode } from "./passages";

const BEST_KEY = "shanverse:typing:best";
type Best = Partial<Record<TypingMode, number>>;

function readBest(): Best {
  try {
    const value = JSON.parse(window.localStorage.getItem(BEST_KEY) ?? "{}") as Record<string, unknown>;
    return {
      ...(typeof value.text === "number" ? { text: value.text } : {}),
      ...(typeof value.code === "number" ? { code: value.code } : {}),
    };
  } catch {
    return {};
  }
}

function writeBest(best: Best) {
  try {
    window.localStorage.setItem(BEST_KEY, JSON.stringify(best));
  } catch {
    // Not saved; the test still works.
  }
}

export function TypingTest() {
  const { t, locale } = useI18n();
  const [mode, setMode] = React.useState<TypingMode>("text");
  const passages = mode === "code" ? CODE_PASSAGES : TEXT_PASSAGES[locale === "en" ? "en" : "vi"];
  const [index, setIndex] = React.useState(0);
  const passage = passages[Math.min(index, passages.length - 1)];
  const target = passage.text;

  const [progress, setProgress] = React.useState<Progress>(emptyProgress);
  const [startedAt, setStartedAt] = React.useState<number | null>(null);
  const [endedAt, setEndedAt] = React.useState<number | null>(null);
  const [now, setNow] = React.useState(0);
  const [focused, setFocused] = React.useState(false);
  const [best, setBest] = React.useState<Best>({});
  const [newRecord, setNewRecord] = React.useState(false);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const cursorRef = React.useRef<HTMLSpanElement>(null);

  // A random passage is picked after hydration so server and client match.
  React.useEffect(() => {
    setBest(readBest());
    setIndex(pickIndex(TEXT_PASSAGES.vi.length, null));
  }, []);

  const running = startedAt !== null && endedAt === null;
  React.useEffect(() => {
    if (!running) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 200);
    return () => window.clearInterval(id);
  }, [running]);

  // Keep the cursor visible inside the box on long code passages.
  React.useEffect(() => {
    if (focused) cursorRef.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [progress.value.length, focused]);

  const elapsed = startedAt === null ? 0 : (endedAt ?? (now || startedAt)) - startedAt;
  const stats = computeStats(target, progress, elapsed);
  const finished = endedAt !== null;

  const restart = React.useCallback((nextIndex?: number, nextMode?: TypingMode) => {
    if (nextMode) setMode(nextMode);
    if (nextIndex !== undefined) setIndex(nextIndex);
    setProgress(emptyProgress);
    setStartedAt(null);
    setEndedAt(null);
    setNewRecord(false);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const nextPassage = React.useCallback(() => {
    restart(pickIndex(passages.length, index));
  }, [restart, passages.length, index]);

  const switchMode = (value: TypingMode) => {
    if (value === mode) return;
    const count = value === "code" ? CODE_PASSAGES.length : TEXT_PASSAGES.vi.length;
    restart(pickIndex(count, null), value);
  };

  const onChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (finished) return;
    const next = applyInput(target, progress, event.target.value);
    const stamp = Date.now();
    const start = startedAt ?? (next.value.length ? stamp : null);
    if (startedAt === null && start !== null) setStartedAt(start);
    setProgress(next);
    if (start !== null && isComplete(target, next.value)) {
      setEndedAt(stamp);
      const result = computeStats(target, next, stamp - start);
      const previous = best[mode];
      if (result.wpm > 0 && (previous === undefined || result.wpm > previous)) {
        const updated = { ...best, [mode]: result.wpm };
        setBest(updated);
        writeBest(updated);
        setNewRecord(true);
      }
    }
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      restart();
    } else if (event.key === "Tab") {
      // Tab moves to the next passage instead of leaving the box.
      event.preventDefault();
      nextPassage();
    } else if (finished && event.key === "Enter") {
      event.preventDefault();
      nextPassage();
    }
  };

  const states = charStates(target, progress.value);
  const isCode = mode === "code";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <GameDifficultyPicker
          label={t("games.typingModeLabel")}
          value={mode}
          onChange={switchMode}
          options={(["text", "code"] as const).map((value) => ({ id: value, label: t(value === "text" ? "games.typingModeText" : "games.typingModeCode") }))}
        />
        <GameToolbar>
          <Button type="button" variant="outline" size="sm" onClick={nextPassage} className="h-auto min-h-10 gap-1.5">
            <RefreshCw aria-hidden="true" className="size-4" /> {t("games.typingNext")}
          </Button>
        </GameToolbar>
      </div>

      <GameStatBar
        stats={[
          { label: "WPM", value: String(stats.wpm), highlight: true },
          { label: t("games.typingAccuracy"), value: `${stats.accuracy}%` },
          { label: t("games.msTime"), value: (elapsed / 1000).toFixed(1) },
          { label: t("games.best"), value: best[mode] !== undefined ? `${best[mode]}` : "—", icon: <Trophy aria-hidden="true" className="size-3.5" /> },
        ]}
      />

      <div className="mx-auto max-w-3xl">
        <p className="mb-2 text-center text-xs font-medium uppercase tracking-widest text-muted">{passage.label}</p>
        <div
          className={cn(
            "relative max-h-80 overflow-auto rounded-2xl border bg-surface p-5 transition-colors sm:p-6",
            focused ? "border-primary/60 shadow-[0_0_0_3px] shadow-primary/15" : "border-border",
          )}
          onClick={() => inputRef.current?.focus()}
        >
          <p
            aria-hidden="true"
            className={cn(
              "select-none break-words",
              isCode ? "whitespace-pre font-mono text-[15px] leading-7" : "whitespace-pre-wrap text-lg leading-9 sm:text-xl sm:leading-10",
            )}
          >
            {Array.from(target).map((char, i) => {
              const state = states[i];
              const atCursor = i === progress.value.length && !finished;
              return (
                <span
                  key={i}
                  ref={atCursor ? cursorRef : undefined}
                  className={cn(
                    "typing-char",
                    state === "correct" && "text-foreground",
                    state === "pending" && "text-muted",
                    state === "incorrect" && "rounded-sm bg-danger/15 text-danger",
                    atCursor && focused && "typing-cursor",
                  )}
                >
                  {char === "\n" ? (
                    <>
                      <span className="text-muted/40">↵</span>
                      {"\n"}
                    </>
                  ) : state === "incorrect" && char === " " ? (
                    "·"
                  ) : (
                    char
                  )}
                </span>
              );
            })}
          </p>
          <textarea
            ref={inputRef}
            value={progress.value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onSelect={(event) => {
              // Typing always happens at the end, never in the middle.
              const box = event.currentTarget;
              const end = box.value.length;
              if (box.selectionStart !== end || box.selectionEnd !== end) box.setSelectionRange(end, end);
            }}
            onPaste={(event) => event.preventDefault()}
            onDrop={(event) => event.preventDefault()}
            aria-label={t("games.typingInputLabel")}
            aria-describedby="typing-target"
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className="absolute inset-0 h-full w-full resize-none cursor-text bg-transparent text-base text-transparent caret-transparent opacity-0 outline-none"
          />
          {!focused && !finished ? (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-background/60 backdrop-blur-[1px]">
              <span className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold shadow-sm">
                {t(progress.value ? "games.typingResume" : "games.typingStart")}
              </span>
            </div>
          ) : null}
        </div>
        <p id="typing-target" className="sr-only">{target}</p>
      </div>

      {finished ? (
        <GameResultDialog
          variant="inline"
          title={t("games.typingDone")}
          description={t("games.typingSummary", { accuracy: stats.accuracy, raw: stats.rawWpm, errors: progress.errors, time: (elapsed / 1000).toFixed(1) })}
          record={newRecord ? t("games.newRecord") : undefined}
          actions={
            <>
              <Button type="button" variant="outline" onClick={() => restart()}>{t("games.tryAgain")}</Button>
              <Button type="button" onClick={nextPassage}>{t("games.typingNext")}</Button>
            </>
          }
        >
          <p className="text-4xl font-extrabold tabular-nums">
            {stats.wpm} <span className="text-lg font-semibold text-foreground-secondary">WPM</span>
          </p>
        </GameResultDialog>
      ) : (
        <p className="hidden text-center text-xs text-muted sm:block">{t("games.typingHint")}</p>
      )}
    </div>
  );
}
