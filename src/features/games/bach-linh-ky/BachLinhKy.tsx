"use client";

import * as React from "react";
import { Flag, Shuffle, Sparkles, Swords, Target, Wand2, X } from "lucide-react";

import { MASCOT_NAME, TianwuBadge } from "@/components/mascot/Tianwu";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/cn";
import { tianwuTeam, type Difficulty } from "./ai";
import { Token } from "./art";
import { afterGame, canField, LOSSES_PER_SUMMON, type Collection } from "./collection";
import { describe, highlights, type Highlight, type LogLine } from "./describe";
import { MAPS, MAP_BY_ID, SIZE, buildBoard, type Terrain } from "./maps";
import { MonsterInfo } from "./MonsterInfo";
import { LEVELS, MONSTERS, activeAbility, monster } from "./monsters";
import {
  MAX_TURNS,
  abilityCells,
  apply,
  autoPlace,
  canPlaceOn,
  destinations,
  homeRows,
  isBound,
  isLegal,
  levelTotal,
  newGame,
  shootTargets,
  usableAbility,
  viewFor,
  type Action,
  type GameState,
  type Placement,
  type Side,
  type UnitView,
} from "./rules";
import { DIFFICULTIES, loadCollection, loadGame, loadPrefs, saveCollection, saveGame, savePrefs, type MapChoice, type Prefs, type SavedGame } from "./storage";
import { useBachLinhKyEngine } from "./use-engine";

type Phase = "loading" | "setup" | "place" | "play";
type Mode = "move" | "shoot" | "ability";
type Mark = "move" | "attack" | "shoot" | "ability" | "picked" | "home";

/** Tianwu takes at least this long, so its move does not land before the player's settles. */
const MIN_THINK_MS = 550;
const COLS = "ABCDEFGH";
const DIFFICULTY_KEY = { easy: "games.blkEasy", medium: "games.blkMedium", hard: "games.blkHard" } as const;

const random = () => Math.random();
const cellName = (cell: number) => `${COLS[cell % SIZE]}${SIZE - Math.floor(cell / SIZE)}`;
const abilityName = (id: string, lang: "vi" | "en") => {
  const m = monster(id);
  const index = m.abilities.findIndex((a) => a === activeAbility(m));
  return (m.abilityText[index]?.[lang] ?? "").split(/[:(]/)[0].trim();
};

export function BachLinhKy() {
  const { t, locale } = useI18n();
  const lang = locale === "en" ? "en" : "vi";
  const think = useBachLinhKyEngine();

  const [phase, setPhase] = React.useState<Phase>("loading");
  const [collection, setCollection] = React.useState<Collection | null>(null);
  const [prefs, setPrefs] = React.useState<Prefs>({ difficulty: "medium", map: "random", team: null });
  const [team, setTeam] = React.useState<(string | null)[]>([null, null, null, null, null]);
  const [mapId, setMapId] = React.useState<string>(MAPS[0].id);
  const [placement, setPlacement] = React.useState<Placement>([]);
  const [tray, setTray] = React.useState<string | null>(null);
  const [game, setGame] = React.useState<SavedGame | null>(null);
  const [selected, setSelected] = React.useState<number | null>(null);
  const [inspect, setInspect] = React.useState<number | null>(null);
  const [mode, setMode] = React.useState<Mode>("move");
  const [picks, setPicks] = React.useState<number[]>([]);
  const [thinking, setThinking] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const [log, setLog] = React.useState<LogLine[]>([]);
  const [marks, setMarks] = React.useState<{ key: number; cells: Highlight[] }>({ key: 0, cells: [] });
  const [resignArmed, setResignArmed] = React.useState(false);
  const logKey = React.useRef(0);
  const thinkingFor = React.useRef<GameState | null>(null);

  // --- Loading -------------------------------------------------------------------

  React.useEffect(() => {
    const c = loadCollection();
    const p = loadPrefs();
    setCollection(c);
    setPrefs(p);
    setTeam(LEVELS.map((level) => p.team?.find((id) => monster(id).level === level && c.owned.includes(id)) ?? null));
    const saved = loadGame();
    if (saved) {
      setGame(saved);
      setMapId(saved.state.mapId);
      setPhase("play");
    } else setPhase("setup");
  }, []);

  const updatePrefs = (change: Partial<Prefs>) => {
    const next = { ...prefs, ...change };
    savePrefs(next);
    setPrefs(next);
  };

  // --- Setup -----------------------------------------------------------------------

  const owned = collection?.owned ?? [];
  const pickRandomTeam = () => setTeam(LEVELS.map((level) => {
    const options = owned.filter((id) => monster(id).level === level);
    return options[Math.floor(random() * options.length)] ?? null;
  }));
  const teamReady = team.every(Boolean) && collection !== null && canField(collection, team as string[]);

  const toPlacement = () => {
    if (!teamReady) return;
    const chosenMap = prefs.map === "random" ? MAPS[Math.floor(random() * MAPS.length)].id : prefs.map;
    updatePrefs({ team: team as string[] });
    setMapId(chosenMap);
    setPlacement([]);
    setTray((team as string[])[0]);
    setPhase("place");
  };

  // --- Placement -------------------------------------------------------------------

  const board = React.useMemo(() => buildBoard(MAP_BY_ID.get(mapId) ?? MAPS[0]), [mapId]);
  const placedAt = (cell: number) => placement.find((p) => p.cell === cell);
  const unplaced = (team.filter(Boolean) as string[]).filter((id) => !placement.some((p) => p.monster === id));

  const onPlaceCell = (cell: number) => {
    const here = placedAt(cell);
    if (here) {
      setPlacement(placement.filter((p) => p !== here));
      setTray(here.monster);
      return;
    }
    if (!tray || !homeRows(0).includes(Math.floor(cell / SIZE)) || !canPlaceOn(board.terrain[cell])) return;
    const next = [...placement.filter((p) => p.monster !== tray), { monster: tray, cell }];
    setPlacement(next);
    setTray((team as string[]).find((id) => !next.some((p) => p.monster === id)) ?? null);
  };

  const onAutoPlace = () => {
    setPlacement(autoPlace(0, team as string[], board.terrain, random));
    setTray(null);
  };

  const startBattle = () => {
    if (unplaced.length || !collection) return;
    const tianwu = autoPlace(1, tianwuTeam(random), board.terrain, random);
    const first: Side = random() < 0.5 ? 0 : 1;
    const state = newGame(mapId, placement, tianwu, first);
    const saved: SavedGame = { state, difficulty: prefs.difficulty };
    saveGame(saved);
    setGame(saved);
    setLog([{ key: ++logKey.current, side: null, text: t(first === 0 ? "games.blkFirstYou" : "games.blkFirstTianwu") }]);
    setMarks({ key: 0, cells: [] });
    clearSelection();
    setFailed(false);
    setPhase("play");
  };

  // --- Playing ---------------------------------------------------------------------

  const state = game?.state ?? null;
  const view = React.useMemo(() => (state ? viewFor(state, 0) : null), [state]);

  function clearSelection() {
    setSelected(null);
    setMode("move");
    setPicks([]);
    setResignArmed(false);
  }

  const play = React.useCallback(
    (current: SavedGame, action: Action) => {
      const before = current.state;
      const { state: after, events } = apply(before, action);
      let next: SavedGame = { ...current, state: after };
      if (after.winner !== null && !current.recorded && collection) {
        const result = after.winner === "draw" ? "draw" : after.winner === 0 ? "win" : "loss";
        const r = afterGame(collection, result, random);
        saveCollection(r.collection);
        setCollection(r.collection);
        next = { ...next, recorded: true, summoned: r.summoned[0] ?? null };
      }
      saveGame(next);
      setGame(next);
      const lines = describe(events, viewFor(before, 0), viewFor(after, 0), before.toMove, lang, t);
      setLog((old) => [...lines.map((text) => ({ key: ++logKey.current, side: before.toMove, text })), ...old].slice(0, 40));
      setMarks((old) => ({ key: old.key + 1, cells: highlights(events, before) }));
    },
    [collection, lang, t],
  );

  // Tianwu's turn: ask the worker, then play its move.
  React.useEffect(() => {
    if (phase !== "play" || !game || game.state.winner !== null || game.state.toMove !== 1 || failed) return;
    if (thinkingFor.current === game.state) return;
    thinkingFor.current = game.state;
    const asked = game;
    const started = Date.now();
    setThinking(true);
    void think({ kind: "move", view: viewFor(asked.state, 1), difficulty: asked.difficulty, seed: Math.floor(random() * 2 ** 31) }).then((response) => {
      const wait = Math.max(0, MIN_THINK_MS - (Date.now() - started));
      window.setTimeout(() => {
        setThinking(false);
        if (thinkingFor.current !== asked.state) return;
        if (response.kind !== "move" || !isLegal(asked.state, response.action)) {
          thinkingFor.current = null;
          setFailed(true);
          return;
        }
        play(asked, response.action);
      }, wait);
    });
  }, [phase, game, failed, think, play]);

  const mine = state?.toMove === 0 && state.winner === null && !thinking;
  const selectedUnit = state && selected !== null ? state.units.find((u) => u.id === selected) : undefined;
  const active = selectedUnit ? usableAbility(selectedUnit) : undefined;

  // What each cell shows for the selected piece and mode.
  const cellMarks = React.useMemo(() => {
    const out = new Map<number, Mark>();
    if (!state || !selectedUnit || !mine || isBound(state, selectedUnit)) return out;
    if (mode === "move") for (const d of destinations(state, selectedUnit)) out.set(d.cell, d.attack ? "attack" : "move");
    if (mode === "shoot") for (const cell of shootTargets(state, selectedUnit)) out.set(cell, "shoot");
    if (mode === "ability") for (const cell of abilityCells(state, selectedUnit)) out.set(cell, picks.includes(cell) ? "picked" : "ability");
    return out;
  }, [state, selectedUnit, mine, mode, picks]);

  const act = (action: Action) => {
    if (!game || !isLegal(game.state, action)) return;
    clearSelection();
    play(game, action);
  };

  const onPlayCell = (cell: number) => {
    if (!state || !view) return;
    const unit = state.units.find((u) => u.cell === cell);
    const mark = cellMarks.get(cell);
    if (selectedUnit && mark) {
      if (mode === "move") return act({ kind: "move", unit: selectedUnit.id, to: cell });
      if (mode === "shoot") return act({ kind: "shoot", unit: selectedUnit.id, target: cell });
      if (active?.kind === "terraform") {
        setPicks((old) => (old.includes(cell) ? old.filter((c) => c !== cell) : old.length < active.count ? [...old, cell] : old));
        return;
      }
      return act({ kind: "ability", unit: selectedUnit.id, cells: [cell] });
    }
    if (unit) {
      setInspect(unit.id);
      if (unit.side === 0 && mine) {
        setSelected(unit.id === selected ? null : unit.id);
        setMode("move");
        setPicks([]);
      }
    } else {
      setSelected(null);
      setPicks([]);
    }
  };

  const onPass = () => act({ kind: "pass" });

  const onResign = () => {
    if (!game || game.state.winner !== null) return;
    if (!resignArmed) {
      setResignArmed(true);
      return;
    }
    let next: SavedGame = { ...game, state: { ...game.state, winner: 1 }, resigned: true };
    if (!game.recorded && collection) {
      const r = afterGame(collection, "loss", random);
      saveCollection(r.collection);
      setCollection(r.collection);
      next = { ...next, recorded: true, summoned: r.summoned[0] ?? null };
    }
    saveGame(next);
    setGame(next);
    clearSelection();
  };

  const newSetup = (keepTeam: boolean) => {
    saveGame(null);
    setGame(null);
    setLog([]);
    setMarks({ key: 0, cells: [] });
    clearSelection();
    setInspect(null);
    thinkingFor.current = null;
    if (keepTeam && teamReady) toPlacement();
    else setPhase("setup");
  };

  // --- Rendering -------------------------------------------------------------------

  if (phase === "loading" || !collection) {
    return <div aria-hidden="true" className="blk-board mx-auto animate-pulse opacity-60" />;
  }

  if (phase === "setup") {
    return (
      <div className="space-y-6">
        <section aria-labelledby="blk-team" className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 id="blk-team" className="text-xl font-bold">{t("games.blkTeam")}</h2>
              <p className="text-sm text-foreground-secondary">
                {t("games.blkTeamHint")} {t("games.blkOwned", { n: owned.length, total: MONSTERS.length })} · {t("games.blkRecord", { w: collection.wins, l: collection.losses })}
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={pickRandomTeam} className="gap-1.5">
              <Shuffle aria-hidden="true" className="size-4" /> {t("games.blkRandomTeam")}
            </Button>
          </div>
          <div className="space-y-2">
            {LEVELS.map((level, i) => (
              <div key={level} role="radiogroup" aria-label={t("games.blkLevel", { n: level })} className="flex items-center gap-2 overflow-x-auto pb-1">
                <span className="w-14 shrink-0 text-xs font-semibold uppercase tracking-wider text-muted">{t("games.blkLevel", { n: level })}</span>
                {MONSTERS.filter((m) => m.level === level).sort((a, b) => Number(owned.includes(b.id)) - Number(owned.includes(a.id))).map((m) => {
                  const has = owned.includes(m.id);
                  const on = team[i] === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      disabled={!has}
                      onClick={() => setTeam(team.map((id, j) => (j === i ? m.id : id)))}
                      title={has ? m.name[lang] : `${m.name[lang]} (${t("games.blkLevel", { n: level })})`}
                      className={cn(
                        "flex w-[4.6rem] shrink-0 flex-col items-center gap-1 rounded-xl border p-1.5 text-center transition-colors focus-visible:ring-2 focus-visible:ring-primary",
                        on ? "border-primary bg-primary/10" : "border-border bg-surface hover:border-primary/50",
                        !has && "cursor-not-allowed opacity-45",
                      )}
                    >
                      <Token monsterId={m.id} level={m.level} side={0} locked={!has} className="size-12" />
                      <span className="line-clamp-2 text-[11px] leading-tight">{has ? m.name[lang] : "???"}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="blk-map" className="space-y-2">
          <h2 id="blk-map" className="text-lg font-bold">{t("games.blkMap")}</h2>
          <div role="radiogroup" aria-labelledby="blk-map" className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {[...MAPS.map((m) => m.id), "random"].map((id) => {
              const on = prefs.map === id;
              const map = MAP_BY_ID.get(id);
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => updatePrefs({ map: id as MapChoice })}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-xl border p-2 text-center text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-primary",
                    on ? "border-primary bg-primary/10" : "border-border bg-surface hover:border-primary/50",
                  )}
                >
                  {map ? <MiniMap terrain={buildBoard(map).terrain} /> : <span aria-hidden="true" className="grid size-16 place-items-center rounded-md bg-surface-hover text-2xl">?</span>}
                  <span>{map ? map.name[lang] : t("games.blkMapRandom")}</span>
                </button>
              );
            })}
          </div>
          {prefs.map !== "random" ? <p className="text-sm text-foreground-secondary">{MAP_BY_ID.get(prefs.map)?.blurb[lang]}</p> : null}
        </section>

        <section className="flex flex-wrap items-center justify-between gap-3">
          <div role="radiogroup" aria-label={t("games.blkDifficulty")} className="flex items-center gap-1 rounded-full border border-border bg-surface p-1">
            <span className="px-2 text-[11px] font-semibold uppercase tracking-wider text-muted">{t("games.blkDifficulty")}</span>
            {DIFFICULTIES.map((d: Difficulty) => (
              <button
                key={d}
                type="button"
                role="radio"
                aria-checked={prefs.difficulty === d}
                onClick={() => updatePrefs({ difficulty: d })}
                className={cn(
                  "min-h-8 rounded-full px-3 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-primary",
                  prefs.difficulty === d ? "bg-primary text-primary-foreground" : "text-foreground-secondary hover:text-foreground",
                )}
              >
                {t(DIFFICULTY_KEY[d])}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {!teamReady ? <p className="text-sm text-muted">{t("games.blkPickAll")}</p> : null}
            <Button type="button" onClick={toPlacement} disabled={!teamReady}>
              {t("games.blkToPlace")}
            </Button>
          </div>
        </section>
      </div>
    );
  }

  if (phase === "place") {
    const homes = new Set(homeRows(0).flatMap((y) => Array.from({ length: SIZE }, (_, x) => y * SIZE + x)).filter((c) => canPlaceOn(board.terrain[c])));
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-bold">{t("games.blkPlaceTitle")}</h2>
          <p className="mx-auto max-w-lg text-sm text-foreground-secondary">{t("games.blkPlaceHint")}</p>
        </div>
        <div className="mx-auto w-fit max-w-full">
        <Board
          terrain={board.terrain}
          templeOwner={board.templeOwner}
          units={placement.map((p, i) => ({ id: i, side: 0, cell: p.cell, level: monster(p.monster).level, evolved: 0, monster: p.monster, revealed: false, abilityUsed: false, boundUntil: 0, sealed: false, revived: false }))}
          marks={new Map([...homes].filter((c) => !placedAt(c) && tray).map((c) => [c, "home" as Mark]))}
          selectedCell={null}
          flash={{ key: 0, cells: [] }}
          onCell={onPlaceCell}
          cellLabel={(cell) => {
            const p = placedAt(cell);
            return `${cellName(cell)}${p ? `, ${monster(p.monster).name[lang]}` : ""}`;
          }}
        />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {(team as string[]).map((id) => {
            const placed = placement.some((p) => p.monster === id);
            return (
              <button
                key={id}
                type="button"
                aria-pressed={tray === id}
                onClick={() => setTray(id)}
                className={cn(
                  "flex w-20 flex-col items-center gap-1 rounded-xl border p-1.5 text-center transition-colors focus-visible:ring-2 focus-visible:ring-primary",
                  tray === id ? "border-primary bg-primary/10" : "border-border bg-surface",
                  placed && tray !== id && "opacity-50",
                )}
              >
                <Token monsterId={id} level={monster(id).level} side={0} className="size-11" />
                <span className="line-clamp-2 text-[11px] leading-tight">{monster(id).name[lang]}</span>
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setPhase("setup")}>
            {t("games.blkChangeTeam")}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onAutoPlace} className="gap-1.5">
            <Shuffle aria-hidden="true" className="size-4" /> {t("games.blkAutoPlace")}
          </Button>
          <Button type="button" onClick={startBattle} disabled={unplaced.length > 0} className="gap-1.5">
            <Swords aria-hidden="true" className="size-4" /> {unplaced.length ? t("games.blkUnplaced", { n: unplaced.length }) : t("games.blkStart")}
          </Button>
        </div>
      </div>
    );
  }

  // phase === "play"
  if (!game || !state || !view) return null;
  const over = state.winner !== null;
  const inspected = view.units.find((u) => u.id === (inspect ?? selected));
  const turnShown = Math.min(state.turn + 1, MAX_TURNS);
  const lossesToSummon = LOSSES_PER_SUMMON - collection.lossStreak;

  return (
    <div className="grid gap-5 lg:grid-cols-[auto_1fr] lg:items-start">
      <div className="mx-auto w-fit max-w-full space-y-2">
        <div className="flex min-h-9 flex-wrap items-center justify-between gap-2">
          <p aria-live="polite" className={cn("flex items-center gap-2 text-sm font-semibold", thinking && "text-primary")}>
            {thinking ? <TianwuBadge className="size-6 animate-pulse" title={MASCOT_NAME} /> : null}
            {over ? null : thinking || state.toMove === 1 ? t("games.blkThinking") : t("games.blkYourTurn")}
          </p>
          <p className="text-xs text-muted">
            {MAP_BY_ID.get(state.mapId)?.name[lang]} · {t(DIFFICULTY_KEY[game.difficulty])} · {t("games.blkTurn", { n: turnShown, max: MAX_TURNS })}
          </p>
        </div>

        <div className="relative">
          <Board
            terrain={state.terrain}
            templeOwner={state.templeOwner}
            units={view.units}
            marks={cellMarks}
            selectedCell={selectedUnit?.cell ?? null}
            flash={marks}
            onCell={onPlayCell}
            cellLabel={(cell) => {
              const u = view.units.find((x) => x.cell === cell);
              const who = u ? (u.monster ? monster(u.monster).name[lang] : t("games.blkHiddenLevel", { n: u.level })) : "";
              return `${cellName(cell)}${who ? `, ${who}` : ""}`;
            }}
          />
          {over ? (
            <Result
              game={game}
              you={levelTotal(state, 0)}
              them={levelTotal(state, 1)}
              lossesToSummon={lossesToSummon}
              complete={collection.owned.length === MONSTERS.length}
              onNew={() => newSetup(false)}
              onRematch={() => newSetup(true)}
            />
          ) : null}
        </div>

        {!over ? (
          <div className="flex flex-wrap items-center justify-center gap-2">
            {selectedUnit ? (
              <>
                <ModeButton on={mode === "move"} onClick={() => { setMode("move"); setPicks([]); }} icon={<Swords aria-hidden="true" className="size-4" />}>
                  {t("games.blkModeMove")}
                </ModeButton>
                {monster(selectedUnit.monster).ranged ? (
                  <ModeButton on={mode === "shoot"} onClick={() => { setMode("shoot"); setPicks([]); }} icon={<Target aria-hidden="true" className="size-4" />}>
                    {t("games.blkModeShoot")}
                  </ModeButton>
                ) : null}
                {active ? (
                  <ModeButton on={mode === "ability"} onClick={() => { setMode("ability"); setPicks([]); }} icon={<Wand2 aria-hidden="true" className="size-4" />}>
                    {abilityName(selectedUnit.monster, lang) || t("games.blkModeAbility")}
                  </ModeButton>
                ) : null}
                {mode === "ability" && active?.kind === "terraform" ? (
                  <Button type="button" size="sm" disabled={!picks.length} onClick={() => act({ kind: "ability", unit: selectedUnit.id, cells: picks })}>
                    {t("games.blkConfirm", { n: picks.length })}
                  </Button>
                ) : null}
                <Button type="button" variant="outline" size="sm" onClick={clearSelection} className="gap-1">
                  <X aria-hidden="true" className="size-4" /> {t("games.blkCancel")}
                </Button>
              </>
            ) : null}
            <Button type="button" variant="outline" size="sm" onClick={onPass} disabled={!mine}>
              {t("games.blkPass")}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={onResign} disabled={thinking} className={cn("gap-1.5", resignArmed && "border-red-500 text-red-500")}>
              <Flag aria-hidden="true" className="size-4" /> {resignArmed ? t("games.blkResignConfirm") : t("games.blkResign")}
            </Button>
          </div>
        ) : null}
        {!over && mine ? (
          <p className="min-h-5 text-center text-xs text-muted">
            {!selectedUnit
              ? t("games.blkSelectHint")
              : isBound(state, selectedUnit)
                ? t("games.blkBoundNow")
                : mode === "ability" && active?.kind === "terraform"
                  ? t("games.blkTerraformHint", { n: active.count })
                  : cellMarks.size === 0
                    ? t("games.blkNoMoves")
                    : ""}
          </p>
        ) : null}
        {failed ? (
          <div className="flex items-center justify-center gap-2 text-sm text-red-500">
            {t("games.blkError")}
            <Button type="button" size="sm" variant="outline" onClick={() => setFailed(false)}>
              {t("games.blkRetry")}
            </Button>
          </div>
        ) : null}
      </div>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-border bg-surface p-4">
          {inspected ? <MonsterInfo unit={inspected} mine={inspected.side === 0} /> : <p className="text-sm text-muted">{t("games.blkSelectHint")}</p>}
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4">
          <h3 className="mb-2 text-sm font-semibold">{t("games.blkLog")}</h3>
          <ol aria-live="polite" className="max-h-64 space-y-1 overflow-y-auto text-sm">
            {log.map((line) => (
              <li key={line.key} className={cn("border-l-2 pl-2", line.side === 0 ? "border-[#e2b84a]" : line.side === 1 ? "border-[#5a1414]" : "border-border text-muted")}>
                {line.text}
              </li>
            ))}
          </ol>
        </div>
      </aside>
    </div>
  );
}

function ModeButton({ on, onClick, icon, children }: { on: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-8 items-center gap-1.5 rounded-full border px-3 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-primary",
        on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface text-foreground-secondary hover:border-primary/50",
      )}
    >
      {icon}
      {children}
    </button>
  );
}

type BoardProps = {
  terrain: Terrain[];
  templeOwner: (Side | null)[];
  units: UnitView[];
  marks: Map<number, Mark>;
  selectedCell: number | null;
  flash: { key: number; cells: Highlight[] };
  onCell: (cell: number) => void;
  cellLabel: (cell: number) => string;
};

/** The 8×8 board: terrain cells you can press, and a layer of pieces that slide between them. */
function Board({ terrain, templeOwner, units, marks, selectedCell, flash, onCell, cellLabel }: BoardProps) {
  const { locale } = useI18n();
  const lang = locale === "en" ? "en" : "vi";
  return (
    <div className="blk-board">
      <div className="blk-grid">
        {terrain.map((kind, cell) => {
          const mark = marks.get(cell);
          const lit = flash.cells.filter((h) => h.cell === cell).map((h) => h.kind);
          return (
            <button
              key={cell}
              type="button"
              className="blk-cell"
              data-terrain={kind}
              data-owner={kind === "temple" ? String(templeOwner[cell]) : undefined}
              data-mark={mark}
              data-selected={selectedCell === cell || undefined}
              data-flash={lit.length ? lit.join(" ") : undefined}
              aria-label={cellLabel(cell)}
              onClick={() => onCell(cell)}
            >
              {lit.length ? <span key={flash.key} aria-hidden="true" className="blk-flash" data-kind={lit.includes("battle") ? "battle" : lit[0]} /> : null}
            </button>
          );
        })}
      </div>
      <div className="blk-pieces" aria-hidden="true">
        {units.map((u) => (
          <div
            key={u.id}
            className="blk-piece"
            data-side={u.side}
            data-bound={u.boundUntil > 0 || undefined}
            style={{ "--x": u.cell % SIZE, "--y": Math.floor(u.cell / SIZE) } as React.CSSProperties}
          >
            <span key={u.monster ?? "hidden"} className="blk-token" data-reveal={u.monster && u.side === 1 ? "" : undefined}>
              <Token monsterId={u.monster} level={u.level} side={u.side} className="size-full" />
            </span>
            {u.side === 0 && !u.revealed ? <span className="blk-veil" title={lang === "vi" ? "Còn úp" : "Face down"} /> : null}
            {u.sealed ? <span className="blk-badge" data-kind="seal">封</span> : null}
            {u.boundUntil > 0 ? <span className="blk-badge" data-kind="bind">⛓</span> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniMap({ terrain }: { terrain: Terrain[] }) {
  return (
    <span aria-hidden="true" className="grid size-16 grid-cols-8 overflow-hidden rounded-md">
      {terrain.map((kind, cell) => (
        <span key={cell} className="blk-swatch-mini" data-terrain={kind} />
      ))}
    </span>
  );
}

function Result({ game, you, them, lossesToSummon, complete, onNew, onRematch }: { game: SavedGame; you: number; them: number; lossesToSummon: number; complete: boolean; onNew: () => void; onRematch: () => void }) {
  const { t, locale } = useI18n();
  const lang = locale === "en" ? "en" : "vi";
  const winner = game.state.winner;
  const title = winner === 0 ? t("games.blkWon") : winner === 1 ? t("games.blkLost") : t("games.blkDraw");
  const reason = game.resigned
    ? t("games.blkByResign")
    : game.state.turn >= MAX_TURNS && game.state.units.some((u) => u.side === 0) && game.state.units.some((u) => u.side === 1)
      ? t("games.blkByTurns", { max: MAX_TURNS, a: you, b: them })
      : t("games.blkByElimination");
  return (
    <div role="status" className="blk-result absolute inset-0 grid place-items-center p-3">
      <div className="w-full max-w-xs space-y-3 rounded-2xl border border-border bg-surface/95 p-5 text-center shadow-xl backdrop-blur">
        <p className={cn("text-2xl font-extrabold", winner === 0 ? "text-primary" : winner === 1 ? "text-red-500" : "text-foreground")}>{title}</p>
        <p className="text-sm text-foreground-secondary">{reason}</p>
        {game.summoned ? (
          <div className="blk-summon flex flex-col items-center gap-1.5 rounded-xl bg-primary/10 p-3">
            <Sparkles aria-hidden="true" className="size-5 text-primary" />
            <Token monsterId={game.summoned} level={monster(game.summoned).level} side={0} className="size-16" />
            <p className="text-sm font-semibold">{t("games.blkSummoned", { name: monster(game.summoned).name[lang] })}</p>
          </div>
        ) : complete ? (
          <p className="text-xs text-muted">{t("games.blkComplete")}</p>
        ) : winner === 1 ? (
          <p className="text-xs text-muted">{t("games.blkSummonIn", { n: lossesToSummon })}</p>
        ) : null}
        <div className="flex flex-wrap justify-center gap-2">
          <Button type="button" size="sm" onClick={onRematch}>
            {t("games.blkRematch")}
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={onNew}>
            {t("games.blkNewGame")}
          </Button>
        </div>
      </div>
    </div>
  );
}
