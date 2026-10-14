import assert from "node:assert/strict";
import test from "node:test";

import { candidatesFor, chooseAction, evaluate, guessHidden, tianwuTeam, worldFrom, type Difficulty } from "./ai";
import { MAPS, SIZE, buildBoard, type Terrain } from "./maps";
import { MONSTERS, monster } from "./monsters";
import { apply, autoPlace, cellAt, destinations, isLegal, newGame, randomTeam, teamProblems, viewFor, type GameState, type Side } from "./rules";

const rng = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const at = (x: number, y: number) => cellAt(x, y);

/** A hand-built position on open plain. Units: [side, monster, "x,y", revealed?]. */
function position(units: [Side, string, string, boolean?][], toMove: Side = 1): GameState {
  const terrain: Terrain[] = Array(SIZE * SIZE).fill("plain");
  return {
    mapId: "test",
    terrain,
    templeOwner: terrain.map(() => null),
    units: units.map(([side, id, xy, revealed], i) => {
      const [x, y] = xy.split(",").map(Number);
      return { id: i, side, monster: id, level: monster(id).level, cell: at(x, y), revealed: !!revealed, abilityUsed: false };
    }),
    toMove,
    turn: 0,
    winner: null,
  };
}

test("candidates match the shown level, and a shown 3 may be a Fox Spirit in disguise", () => {
  assert.deepEqual(new Set(candidatesFor(1)), new Set(["rua-con", "coc-tia", "ma-da"]));
  assert.ok(candidatesFor(3).includes("ho-tinh"));
  assert.ok(!candidatesFor(2).includes("ho-tinh"), "a Fox Spirit never shows its true level while hidden");
});

test("guesses respect one monster per level and never repeat a known one", () => {
  const state = position([
    [1, "lan", "3,1", true],
    [0, "chan-tinh", "3,6"], // shows 3
    [0, "ho-tinh", "4,6"], // also shows 3
    [0, "rua-con", "5,6"],
  ]);
  const view = viewFor(state, 1);
  for (let s = 1; s <= 30; s++) {
    const guess = guessHidden(view, rng(s));
    assert.ok(guess);
    const ids = [...guess.values()];
    const levels = ids.map((id) => monster(id).level);
    assert.equal(new Set(levels).size, levels.length, "one per level");
    // Two enemies show level 3, so one of them must be the Fox Spirit.
    assert.ok(ids.includes("ho-tinh"), `seed ${s}: ${ids}`);
  }
});

test("Tianwu cannot tell hidden monsters apart: same view, same move", () => {
  // The two games differ only in which level-3 monster the player hid at (3,5).
  const make = (hidden: string) =>
    position([
      [1, "lan", "3,2", true],
      [1, "dai-bang", "6,1"],
      [0, hidden, "3,5"],
      [0, "rua-con", "0,6"],
    ]);
  for (const difficulty of ["easy", "medium"] as Difficulty[]) {
    const a = chooseAction(viewFor(make("chan-tinh"), 1), difficulty, rng(7), { timeMs: 10_000 });
    const b = chooseAction(viewFor(make("ngua-sat"), 1), difficulty, rng(7), { timeMs: 10_000 });
    assert.deepEqual(a.action, b.action, difficulty);
  }
});

test("every level takes a free piece", () => {
  for (const difficulty of ["easy", "medium", "hard"] as Difficulty[]) {
    const state = position([
      [1, "chan-tinh", "3,3", true],
      [0, "rua-con", "3,4", true],
      [0, "lan", "7,7", true],
    ]);
    const { action } = chooseAction(viewFor(state, 1), difficulty, rng(3), { looseness: 0, timeMs: 10_000 });
    assert.deepEqual(action, { kind: "move", unit: 0, to: at(3, 4) }, difficulty);
  }
});

test("Medium and Hard run from a known stronger enemy", () => {
  for (const difficulty of ["medium", "hard"] as Difficulty[]) {
    // A level-2 eagle next to a revealed level-3 ogre that moves next.
    const state = position([
      [1, "dai-bang", "3,3"],
      [1, "rua-con", "0,0"],
      [0, "chan-tinh", "3,4", true],
      [0, "rua-con", "7,7", true],
    ]);
    const { action } = chooseAction(viewFor(state, 1), difficulty, rng(5), { timeMs: 10_000 });
    const after = apply(state, action).state;
    const ogre = after.units.find((u) => u.monster === "chan-tinh");
    const eagle = after.units.find((u) => u.monster === "dai-bang");
    assert.ok(eagle, difficulty);
    if (ogre) {
      assert.ok(!destinations(after, ogre).some((d) => d.cell === eagle.cell), `${difficulty}: the eagle is still in reach`);
    }
  }
});

test("Tianwu wins a won position quickly and sees the end", () => {
  const state = position([[1, "thanh-giong", "3,3", true], [0, "coc-tia", "3,5", true]]);
  const { action } = chooseAction(viewFor(state, 1), "medium", rng(1), { timeMs: 10_000 });
  const after = apply(state, action).state;
  // Either it captures now, or it is still winning.
  assert.ok(after.winner === 1 || evaluate(after, 1) > 0);
});

test("worldFrom keeps everything Tianwu knows and fills only the hidden", () => {
  const state = position([[1, "lan", "3,1"], [0, "chan-tinh", "3,6"], [0, "kim-quy", "0,7", true]]);
  const view = viewFor(state, 1);
  const world = worldFrom(view, guessHidden(view, rng(2)) as Map<number, string>);
  assert.equal(world.units.find((u) => u.id === 0)?.monster, "lan");
  assert.equal(world.units.find((u) => u.id === 2)?.monster, "kim-quy");
  assert.equal(monster(world.units.find((u) => u.id === 1)?.monster as string).level, 3);
});

test("tianwuTeam is a legal team", () => {
  for (let s = 1; s < 20; s++) assert.deepEqual(teamProblems(tianwuTeam(rng(s))), []);
});

test("Tianwu only ever plays legal moves, on every map", () => {
  const pool = MONSTERS.map((m) => m.id);
  const random = rng(11);
  for (const map of MAPS) {
    const { terrain } = buildBoard(map);
    let state = newGame(map.id, autoPlace(0, randomTeam(pool, random), terrain, random), autoPlace(1, tianwuTeam(random), terrain, random), 0);
    for (let ply = 0; ply < 24 && state.winner === null; ply++) {
      const side = state.toMove;
      const { action } = chooseAction(viewFor(state, side), side === 1 ? "medium" : "easy", random, { worlds: 2, timeMs: 10_000 });
      assert.ok(isLegal(state, action), `${map.id}: ${JSON.stringify(action)}`);
      state = apply(state, action).state;
    }
  }
});

test("Medium beats Easy more often than not", () => {
  const pool = MONSTERS.map((m) => m.id);
  const random = rng(21);
  let mediumWins = 0;
  let easyWins = 0;
  const games = 8;
  for (let g = 0; g < games; g++) {
    const map = MAPS[g % MAPS.length];
    const { terrain } = buildBoard(map);
    // Alternate which side Medium plays.
    const mediumSide: Side = g % 2 === 0 ? 1 : 0;
    let state = newGame(map.id, autoPlace(0, randomTeam(pool, random), terrain, random), autoPlace(1, randomTeam(pool, random), terrain, random), 0);
    while (state.winner === null) {
      const side = state.toMove;
      const difficulty: Difficulty = side === mediumSide ? "medium" : "easy";
      const { action } = chooseAction(viewFor(state, side), difficulty, random, { worlds: 2, timeMs: 10_000 });
      state = apply(state, action).state;
    }
    if (state.winner === mediumSide) mediumWins++;
    else if (state.winner !== "draw") easyWins++;
  }
  assert.ok(mediumWins > easyWins, `medium ${mediumWins}, easy ${easyWins}`);
});
