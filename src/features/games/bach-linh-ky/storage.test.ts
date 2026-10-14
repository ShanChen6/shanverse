import assert from "node:assert/strict";
import test from "node:test";

import { MAPS, buildBoard } from "./maps";
import { MONSTERS } from "./monsters";
import { apply, autoPlace, legalActions, newGame, randomTeam, type Unit } from "./rules";
import { readState } from "./storage";

const rng = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

test("a saved game reads back exactly, mid-game and after JSON", () => {
  const random = rng(9);
  const pool = MONSTERS.map((m) => m.id);
  const { terrain } = buildBoard(MAPS[2]);
  let state = newGame(MAPS[2].id, autoPlace(0, randomTeam(pool, random), terrain, random), autoPlace(1, randomTeam(pool, random), terrain, random));
  for (let i = 0; i < 30 && state.winner === null; i++) {
    const actions = legalActions(state).filter((a) => a.kind !== "pass");
    state = apply(state, actions[Math.floor(random() * actions.length)]).state;
  }
  const back = readState(JSON.parse(JSON.stringify(state)));
  assert.ok(back);
  // Optional unit fields come back filled in with their defaults.
  const full = (u: Unit): Unit => ({ ...u, boundUntil: u.boundUntil ?? 0, sealed: !!u.sealed, revived: !!u.revived });
  const expected = { ...state, units: state.units.map(full), fallen: (state.fallen ?? []).map(full) };
  assert.deepEqual(JSON.parse(JSON.stringify(back)), JSON.parse(JSON.stringify(expected)));
});

test("anything off in a save is refused", () => {
  const random = rng(3);
  const pool = MONSTERS.map((m) => m.id);
  const { terrain } = buildBoard(MAPS[0]);
  const good = JSON.parse(JSON.stringify(newGame(MAPS[0].id, autoPlace(0, randomTeam(pool, random), terrain, random), autoPlace(1, randomTeam(pool, random), terrain, random))));
  assert.ok(readState(good));
  const broken = [
    null,
    "nope",
    { ...good, mapId: "atlantis" },
    { ...good, terrain: good.terrain.slice(1) },
    { ...good, turn: -1 },
    { ...good, units: [{ ...good.units[0], monster: "pikachu" }, ...good.units.slice(1)] },
    { ...good, units: [{ ...good.units[0], level: 9 }, ...good.units.slice(1)] },
    { ...good, units: [good.units[0], { ...good.units[1], cell: good.units[0].cell }, ...good.units.slice(2)] },
    { ...good, winner: "tianwu" },
  ];
  for (const raw of broken) assert.equal(readState(raw), null, JSON.stringify(raw)?.slice(0, 60));
});
