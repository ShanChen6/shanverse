"use client";

import * as React from "react";
import { RefreshCw, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GameDifficultyPicker } from "@/features/games/components/GameDifficultyPicker";
import { GameResultDialog } from "@/features/games/components/GameResultDialog";
import { GameStatBar } from "@/features/games/components/GameStatBar";
import { GameToolbar } from "@/features/games/components/GameToolbar";
import { useI18n } from "@/i18n/client";
import type { TranslationKey } from "@/i18n/messages";
import { TECH_CARDS, TECH_CARD_BY_ID } from "./cards";
import { MEMORY_LEVELS, createDeck, flip, hideMismatch, rating, type MemoryLevelId, type MemoryState } from "./logic";

const BEST_KEY = "shanverse:memory:best";
const LEVEL_KEY = "shanverse:memory:level";
const MISMATCH_MS = 900;
const FACE_IDS = TECH_CARDS.map((card) => card.id);

const LEVEL_LABELS: Record<MemoryLevelId, TranslationKey> = {
  easy: "games.msEasy",
  medium: "games.msMedium",
  hard: "games.msHard",
};

type Best = Partial<Record<MemoryLevelId, number>>;

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
    for (const id of Object.keys(MEMORY_LEVELS) as MemoryLevelId[]) {
      if (typeof value[id] === "number") best[id] = value[id] as number;
    }
    return best;
  } catch {
    return {};
  }
}

const isLevel = (value: string | null): value is MemoryLevelId => value === "easy" || value === "medium" || value === "hard";

export function MemoryMatch() {
  const { t } = useI18n();
  const [level, setLevel] = React.useState<MemoryLevelId>("medium");
  const [game, setGame] = React.useState<MemoryState | null>(null);
  const [startedAt, setStartedAt] = React.useState<number | null>(null);
  const [endedAt, setEndedAt] = React.useState<number | null>(null);
  const [now, setNow] = React.useState(0);
  const [best, setBest] = React.useState<Best>({});
  const [newRecord, setNewRecord] = React.useState(false);

  const config = MEMORY_LEVELS[level];

  const deal = React.useCallback((id: MemoryLevelId) => {
    setLevel(id);
    setGame(createDeck(FACE_IDS, MEMORY_LEVELS[id].pairs));
    setStartedAt(null);
    setEndedAt(null);
    setNewRecord(false);
    storageSet(LEVEL_KEY, id);
  }, []);

  // The deck is random, so it is dealt after hydration.
  React.useEffect(() => {
    setBest(readBest());
    const saved = storageGet(LEVEL_KEY);
    deal(isLevel(saved) ? saved : "medium");
  }, [deal]);

  React.useEffect(() => {
    if (!game?.mismatch) return;
    const id = window.setTimeout(() => setGame((current) => (current ? hideMismatch(current) : current)), MISMATCH_MS);
    return () => window.clearTimeout(id);
  }, [game?.mismatch]);

  const running = startedAt !== null && endedAt === null;
  React.useEffect(() => {
    if (!running) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(id);
  }, [running]);

  const seconds = startedAt === null ? 0 : Math.floor(((endedAt ?? (now || startedAt)) - startedAt) / 1000);

  const onFlip = (id: number) => {
    if (!game) return;
    const next = flip(game, id);
    if (next === game) return;
    const stamp = Date.now();
    if (startedAt === null) setStartedAt(stamp);
    if (next.won) {
      setEndedAt(stamp);
      const previous = best[level];
      if (previous === undefined || next.moves < previous) {
        const updated = { ...best, [level]: next.moves };
        setBest(updated);
        storageSet(BEST_KEY, JSON.stringify(updated));
        setNewRecord(true);
      }
    }
    setGame(next);
  };

  const stars = game?.won ? rating(game) : 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <GameDifficultyPicker
          label={t("games.msDifficulty")}
          value={level}
          onChange={deal}
          options={(Object.keys(MEMORY_LEVELS) as MemoryLevelId[]).map((id) => ({ id, label: t(LEVEL_LABELS[id]), hint: String(MEMORY_LEVELS[id].pairs * 2) }))}
        />
        <GameToolbar>
          <Button type="button" size="sm" onClick={() => deal(level)} className="h-auto min-h-10 gap-1.5">
            <RefreshCw aria-hidden="true" className="size-4" /> {t("games.newGame")}
          </Button>
        </GameToolbar>
      </div>

      <GameStatBar
        className="justify-center"
        stats={[
          { label: t("games.memoryMoves"), value: game?.moves ?? 0 },
          { label: t("games.memoryPairs"), value: `${game?.matchedPairs ?? 0}/${config.pairs}` },
          { label: t("games.msTime"), value: seconds },
          { label: t("games.best"), value: best[level] !== undefined ? String(best[level]) : "—", icon: <Trophy aria-hidden="true" className="size-3.5" /> },
        ]}
      />

      {game?.won ? (
        <GameResultDialog
          variant="inline"
          title={
            <>
              <span aria-label={t("games.memoryStars", { stars })} className="block text-2xl tracking-widest text-primary">
                {"★".repeat(stars)}
                <span className="text-muted/50">{"★".repeat(3 - stars)}</span>
              </span>
              <span className="text-lg font-bold">{t("games.memoryWin")}</span>
            </>
          }
          description={t("games.memoryWinDescription", { moves: game.moves, time: seconds })}
          record={newRecord ? t("games.newRecord") : undefined}
          actions={<Button type="button" onClick={() => deal(level)}>{t("games.tryAgain")}</Button>}
        />
      ) : null}

      <div
        className="mem-grid mx-auto"
        style={{ "--mem-cols": config.cols, "--mem-mobile-cols": config.mobileCols } as React.CSSProperties}
        data-level={level}
      >
        {(game?.cards ?? Array.from({ length: config.pairs * 2 }, (_, id) => ({ id, face: "", open: false, matched: false }))).map((card, index) => {
          const tech = TECH_CARD_BY_ID.get(card.face);
          const faceUp = card.open || card.matched;
          return (
            <button
              key={`${level}-${card.id}`}
              type="button"
              className="mem-card"
              data-open={faceUp || undefined}
              data-matched={card.matched || undefined}
              data-wrong={game?.mismatch?.includes(card.id) || undefined}
              disabled={!game || card.matched}
              aria-label={faceUp && tech ? tech.name : t("games.memoryHidden", { n: index + 1 })}
              onClick={() => onFlip(card.id)}
            >
              <span className="mem-inner">
                <span className="mem-back" aria-hidden="true">
                  {/* Small static PNG already used across the site, so no image optimisation needed. */}
                  <img src="/logo/logo_shanverse.png" alt="" width={150} height={160} draggable={false} className="mem-back-logo" />
                </span>
                <span className="mem-face" aria-hidden="true" style={tech ? { background: tech.background, color: tech.foreground } : undefined}>
                  {tech ? (
                    <>
                      <span className="mem-mark">{tech.mark}</span>
                      <span className="mem-name">{tech.name}</span>
                    </>
                  ) : null}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
