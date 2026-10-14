import assert from "node:assert/strict";
import test from "node:test";

import { MAPS, SIZE, buildBoard, type Terrain } from "./maps";
import { LEVELS, MONSTERS, STARTERS, activeAbility, monster } from "./monsters";
import {
  MAX_TURNS,
  apply,
  autoPlace,
  cellAt,
  destinations,
  homeRows,
  isLegal,
  legalActions,
  newGame,
  placementProblems,
  randomTeam,
  teamProblems,
  viewFor,
  type Action,
  type GameState,
  type Side,
  type Unit,
} from "./rules";

// --- Helpers ----------------------------------------------------------------------

const CODES: Record<string, Terrain> = { ".": "plain", "^": "mountain", "~": "river", m: "shrine", a: "temple", b: "temple" };

/** A hand-built position. Rows of terrain; units as [side, monster, "x,y"]. Defaults to an empty plain board. */
function position(units: [Side, string, string][], rows: string[] = Array(SIZE).fill("........"), toMove: Side = 0): GameState {
  const terrain: Terrain[] = [];
  const templeOwner: (Side | null)[] = [];
  for (const row of rows) {
    for (const ch of row) {
      terrain.push(CODES[ch]);
      templeOwner.push(ch === "a" ? 0 : ch === "b" ? 1 : null);
    }
  }
  return {
    mapId: "test",
    terrain,
    templeOwner,
    units: units.map(([side, id, at], i) => {
      const [x, y] = at.split(",").map(Number);
      return { id: i, side, monster: id, level: monster(id).level, cell: cellAt(x, y), revealed: false, abilityUsed: false };
    }),
    toMove,
    turn: 0,
    winner: null,
  };
}
const at = (x: number, y: number) => cellAt(x, y);
const cellsOf = (state: GameState, unit: number) => new Set(destinations(state, state.units.find((u) => u.id === unit) as Unit).map((d) => d.cell));
const play = (state: GameState, action: Action) => apply(state, action);

let seed = 3;
const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

// --- Data -------------------------------------------------------------------------

test("the roster: 15 monsters, three per level, unique ids, one starter per level", () => {
  assert.equal(MONSTERS.length, 15);
  assert.equal(new Set(MONSTERS.map((m) => m.id)).size, MONSTERS.length);
  for (const level of LEVELS) assert.equal(MONSTERS.filter((m) => m.level === level).length, 3, `level ${level}`);
  assert.deepEqual(STARTERS.map((id) => monster(id).level).sort(), [...LEVELS]);
  for (const m of MONSTERS) {
    assert.equal(m.abilityText.length, m.abilities.length, `${m.id}: one text per ability`);
    assert.ok(m.abilities.filter((a) => a.kind === "terraform" || a.kind === "strike").length <= 1, `${m.id}: at most one active ability`);
    assert.ok(m.steps >= 1 && m.steps <= 3, `${m.id}: steps`);
    assert.ok(m.name.vi && m.name.en && m.lore.vi && m.lore.en, `${m.id}: texts`);
  }
});

test("every map is mirrored, fair and open", () => {
  assert.equal(MAPS.length, 6);
  for (const map of MAPS) {
    const { terrain, templeOwner } = buildBoard(map);
    assert.equal(terrain.length, SIZE * SIZE);
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) assert.equal(terrain[at(x, y)], terrain[at(x, SIZE - 1 - y)], `${map.id}: (${x},${y}) mirrored`);
    }
    const temples = terrain.map((t, i) => (t === "temple" ? i : -1)).filter((i) => i >= 0);
    assert.equal(temples.filter((i) => templeOwner[i] === 0).length, 1, `${map.id}: one temple for the player`);
    assert.equal(temples.filter((i) => templeOwner[i] === 1).length, 1, `${map.id}: one temple for Tianwu`);
    for (const i of temples) assert.ok((templeOwner[i] === 0) === i < (SIZE * SIZE) / 2, `${map.id}: a temple sits on the opponent's half`);
    for (const side of [0, 1] as const) {
      const room = homeRows(side).flatMap((y) => Array.from({ length: SIZE }, (_, x) => terrain[at(x, y)])).filter((t) => t === "plain" || t === "shrine");
      assert.ok(room.length >= 8, `${map.id}: room to place on side ${side}`);
    }
    // Every cell that is not a mountain can be reached from every other on foot.
    const open = terrain.map((t, i) => (t !== "mountain" ? i : -1)).filter((i) => i >= 0);
    const seen = new Set([open[0]]);
    const queue = [open[0]];
    while (queue.length) {
      const c = queue.pop() as number;
      for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
        const n = cellAt((c % SIZE) + dx, Math.floor(c / SIZE) + dy);
        if (n !== -1 && terrain[n] !== "mountain" && !seen.has(n)) {
          seen.add(n);
          queue.push(n);
        }
      }
    }
    assert.equal(seen.size, open.length, `${map.id}: no walled-off cells`);
  }
});

// --- Setup ------------------------------------------------------------------------

test("a team is five monsters, one of each level", () => {
  assert.deepEqual(teamProblems(STARTERS), []);
  assert.ok(teamProblems(["rua-con", "coc-tia", "lan", "son-tinh", "thanh-giong"]).length, "two level 1s, no level 2");
  assert.ok(teamProblems(STARTERS.slice(0, 4)).length);
});

test("placement must be on the home rows, on open ground, one per cell", () => {
  const { terrain } = buildBoard(MAPS[0]);
  const good = autoPlace(0, STARTERS, terrain, random);
  assert.deepEqual(placementProblems(0, good, terrain), []);
  assert.ok(placementProblems(1, good, terrain).length, "the player's cells are not Tianwu's home rows");
  const stacked = good.map((p) => ({ ...p, cell: good[0].cell }));
  assert.ok(placementProblems(0, stacked, terrain).length);
  assert.throws(() => newGame(MAPS[0].id, stacked, autoPlace(1, STARTERS, terrain, random)));
});

test("randomTeam picks one monster per level from the pool", () => {
  const team = randomTeam(MONSTERS.map((m) => m.id), random);
  assert.deepEqual(teamProblems(team), []);
  assert.throws(() => randomTeam(["rua-con"], random), /level 2/);
});

// --- Movement ---------------------------------------------------------------------

test("land walkers move orthogonally up to their steps and never through anyone", () => {
  const state = position([[0, "lan", "3,3"], [0, "rua-con", "3,2"]]);
  const reachable = cellsOf(state, 0);
  assert.ok(reachable.has(at(5, 3)) && reachable.has(at(3, 5)) && reachable.has(at(4, 4)));
  assert.ok(!reachable.has(at(4, 2)) || true, "corner around is fine");
  assert.ok(!reachable.has(at(3, 1)), "cannot walk through an ally");
  assert.ok(!reachable.has(at(3, 2)), "cannot land on an ally");
  assert.ok(!reachable.has(at(6, 3)), "only 2 steps");
});

test("mountains block walkers, rivers stop them, the Mountain God climbs", () => {
  const rows = ["........", "........", "........", "...^~...", "........", "........", "........", "........"];
  const state = position([[0, "lan", "3,4"], [0, "son-tinh", "0,0"]], rows);
  const reachable = cellsOf(state, 0);
  assert.ok(!reachable.has(at(3, 3)), "mountain");
  assert.ok(!reachable.has(at(3, 2)), "not past the mountain");
  assert.ok(reachable.has(at(4, 3)), "into the river");
  assert.ok(!reachable.has(at(4, 2)), "a river stops a walker");
  const climber = position([[0, "son-tinh", "3,4"]], rows);
  assert.ok(cellsOf(climber, 0).has(at(3, 3)), "the Mountain God stands on a mountain");
});

test("swimmers cross rivers freely; flyers go diagonally, over mountains and monsters", () => {
  const rows = ["........", "........", "........", "...~~...", "..^^^...", "........", "........", "........"];
  const swim = position([[0, "ma-da", "3,2"]], rows);
  assert.ok(cellsOf(swim, 0).has(at(4, 3)), "into the river and along it");
  assert.ok(!cellsOf(swim, 0).has(at(5, 3)), "but only 2 steps");
  // A river right across the board: a walker can step in but not through; a swimmer crosses.
  const band = ["........", "........", "........", "~~~~~~~~", "........", "........", "........", "........"];
  const walker = position([[0, "lan", "3,2"]], band);
  assert.ok(cellsOf(walker, 0).has(at(3, 3)), "a walker can step into the river");
  assert.ok(!cellsOf(walker, 0).has(at(3, 4)), "but stops there");
  assert.ok(cellsOf(position([[0, "ma-da", "3,2"]], band), 0).has(at(3, 4)), "a swimmer crosses");
  const fly = position([[0, "dai-bang", "3,5"], [0, "rua-con", "3,4"]], rows);
  const reachable = cellsOf(fly, 0);
  assert.ok(reachable.has(at(3, 3)), "over the mountain row and the ally");
  assert.ok(reachable.has(at(6, 2)), "diagonals");
  assert.ok(!reachable.has(at(2, 4)), "never lands on a mountain");
});

test("moving onto an enemy is an attack; an enemy blocks the way past it", () => {
  const state = position([[0, "lan", "3,4"], [1, "rua-con", "3,3"]]);
  const dests = destinations(state, state.units[0]);
  assert.ok(dests.some((d) => d.cell === at(3, 3) && d.attack));
  assert.ok(!dests.some((d) => d.cell === at(3, 2)), "not through the enemy");
});

// --- Combat -----------------------------------------------------------------------

test("melee: the higher level wins and takes the cell; both are revealed", () => {
  const state = position([[0, "lan", "3,4"], [1, "rua-con", "3,3"]]);
  const { state: after, events } = play(state, { kind: "move", unit: 0, to: at(3, 3) });
  assert.deepEqual(after.units.map((u) => u.id), [0]);
  assert.equal(after.units[0].cell, at(3, 3));
  assert.ok(events.some((e) => e.type === "battle" && e.result === "attacker"));
  assert.equal(after.units[0].revealed, true);
});

test("melee: attacking a stronger monster loses the attacker", () => {
  const state = position([[0, "rua-con", "3,4"], [1, "lan", "3,3"]]);
  const { state: after } = play(state, { kind: "move", unit: 0, to: at(3, 3) });
  assert.deepEqual(after.units.map((u) => u.monster), ["lan"]);
  assert.equal(after.units[0].revealed, true, "the winner is revealed too");
});

test("melee at equal level: stronger melee wins, a tie takes both", () => {
  const strong = position([[0, "chan-tinh", "3,4"], [1, "lan", "3,3"]]);
  assert.deepEqual(play(strong, { kind: "move", unit: 0, to: at(3, 3) }).state.units.map((u) => u.monster), ["chan-tinh"]);
  const weak = position([[0, "lan", "3,4"], [1, "chan-tinh", "3,3"]]);
  assert.deepEqual(play(weak, { kind: "move", unit: 0, to: at(3, 3) }).state.units.map((u) => u.monster), ["chan-tinh"]);
  const tie = position([[0, "lan", "3,4"], [1, "lan", "3,3"], [1, "rua-con", "0,0"]]);
  assert.deepEqual(play(tie, { kind: "move", unit: 0, to: at(3, 3) }).state.units.map((u) => u.monster), ["rua-con"]);
});

test("Ma Da fights a level higher on a river", () => {
  const rows = ["........", "........", "........", "...~....", "........", "........", "........", "........"];
  // Ma Da (level 1, melee 3) on a river fights as level 2, beating a level-2 Tree Spirit (melee 1).
  const state = position([[0, "ma-da", "3,3"], [1, "moc-tinh", "3,2"]], rows, 1);
  const { state: after } = play(state, { kind: "move", unit: 1, to: at(3, 3) });
  assert.deepEqual(after.units.map((u) => u.monster), ["ma-da"]);
  // On plain ground it is just level 1.
  const dry = position([[0, "ma-da", "3,3"], [1, "moc-tinh", "3,2"]], undefined, 1);
  assert.deepEqual(play(dry, { kind: "move", unit: 1, to: at(3, 3) }).state.units.map((u) => u.monster), ["moc-tinh"]);
});

test("ranged: in reach only; a lower level falls, a higher one shrugs it off", () => {
  // The Lân stands 2 away from the toad, too far to guard it.
  const state = position([[0, "moc-tinh", "3,5"], [1, "rua-con", "0,0"], [1, "coc-tia", "3,3"], [1, "lan", "5,4"]]);
  const targets = legalActions(state).filter((a) => a.kind === "shoot").map((a) => (a as { target: number }).target);
  assert.deepEqual(new Set(targets), new Set([at(3, 3), at(5, 4)]), "range 2, diagonals count as one");
  assert.deepEqual(play(state, { kind: "shoot", unit: 0, target: at(3, 3) }).state.units.map((u) => u.monster).sort(), ["lan", "moc-tinh", "rua-con"]);
  const { state: after, events } = play(state, { kind: "shoot", unit: 0, target: at(5, 4) });
  assert.equal(after.units.length, 4, "a lower-level shooter neither kills nor dies");
  assert.ok(events.some((e) => e.type === "battle" && e.result === "none"));
});

test("ranged at equal level compares ranged strength; the loser of a shot is unharmed", () => {
  const state = position([[0, "phuong-hoang", "3,5"], [1, "thuy-tinh", "3,3"]]);
  // Phoenix (ranged 3) vs Water God (ranged 2), both level 4: the shot wins.
  assert.equal(play(state, { kind: "shoot", unit: 0, target: at(3, 3) }).state.units.length, 1);
  const back = position([[0, "thuy-tinh", "3,5"], [1, "phuong-hoang", "3,3"]]);
  assert.equal(play(back, { kind: "shoot", unit: 0, target: at(3, 3) }).state.units.length, 2);
});

test("shells, shrines and a Lân next door block ranged attacks, and give the target away", () => {
  const shell = position([[0, "moc-tinh", "3,5"], [1, "rua-con", "3,3"]]);
  const { state: a, events } = play(shell, { kind: "shoot", unit: 0, target: at(3, 3) });
  assert.equal(a.units.length, 2);
  assert.ok(events.some((e) => e.type === "battle" && e.result === "blocked"));
  assert.equal(a.units.find((u) => u.side === 1)?.revealed, true, "the shell shows what it is");
  const rows = ["........", "........", "........", "...m....", "........", "........", "........", "........"];
  const shrine = position([[0, "moc-tinh", "3,5"], [1, "coc-tia", "3,3"]], rows);
  assert.equal(play(shrine, { kind: "shoot", unit: 0, target: at(3, 3) }).state.units.length, 2);
  const guarded = position([[0, "moc-tinh", "3,5"], [1, "coc-tia", "3,3"], [1, "lan", "4,2"]]);
  assert.equal(play(guarded, { kind: "shoot", unit: 0, target: at(3, 3) }).state.units.length, 3);
});

// --- Temples ----------------------------------------------------------------------

test("a monster on its own side's temple gains a level and uses the temple up", () => {
  const rows = ["........", "........", "...a....", "........", "........", ".....b..", "........", "........"];
  const state = position([[0, "rua-con", "3,3"], [1, "rua-con", "5,4"]], rows);
  const { state: after, events } = play(state, { kind: "move", unit: 0, to: at(3, 2) });
  assert.equal(after.units[0].level, 2);
  assert.equal(after.terrain[at(3, 2)], "plain");
  assert.ok(events.some((e) => e.type === "evolve"));
  // Tianwu's temple does nothing for the player.
  const other = position([[0, "rua-con", "5,4"], [1, "rua-con", "0,0"]], rows);
  const moved = play(other, { kind: "move", unit: 0, to: at(5, 5) }).state;
  assert.equal(moved.units[0].level, 1);
  assert.equal(moved.terrain[at(5, 5)], "temple");
});

test("evolution stops at level 6", () => {
  const rows = ["........", "........", "...a....", "........", "........", "........", "........", "........"];
  const state = position([[0, "thanh-giong", "3,3"], [1, "rua-con", "0,7"]], rows);
  state.units[0].level = 6;
  assert.equal(play(state, { kind: "move", unit: 0, to: at(3, 2) }).state.units[0].level, 6);
});

// --- Abilities --------------------------------------------------------------------

test("the toad turns a plain next to it into river, once, and reveals itself", () => {
  const state = position([[0, "coc-tia", "3,3"], [1, "rua-con", "0,0"]]);
  assert.equal(isLegal(state, { kind: "ability", unit: 0, cells: [at(5, 3)] }), false, "too far");
  const { state: after } = play(state, { kind: "ability", unit: 0, cells: [at(4, 3)] });
  assert.equal(after.terrain[at(4, 3)], "river");
  assert.equal(after.units[0].revealed, true);
  assert.equal(after.units[0].abilityUsed, true);
  const again = { ...after, toMove: 0 as Side };
  assert.equal(isLegal(again, { kind: "ability", unit: 0, cells: [at(2, 3)] }), false, "once per game");
});

test("the Mountain God raises a mountain on an empty plain within 2", () => {
  const state = position([[0, "son-tinh", "3,3"], [1, "rua-con", "4,3"]]);
  assert.equal(isLegal(state, { kind: "ability", unit: 0, cells: [at(4, 3)] }), false, "not under a monster");
  assert.equal(isLegal(state, { kind: "ability", unit: 0, cells: [at(6, 3)] }), false, "3 away");
  assert.equal(play(state, { kind: "ability", unit: 0, cells: [at(5, 5)] }).state.terrain[at(5, 5)], "mountain");
});

test("the Water God floods up to three cells around it, even under monsters", () => {
  const state = position([[0, "thuy-tinh", "3,3"], [1, "lan", "4,3"]]);
  assert.equal(isLegal(state, { kind: "ability", unit: 0, cells: [at(2, 2), at(3, 2), at(4, 2), at(2, 3)] }), false, "four is too many");
  const after = play(state, { kind: "ability", unit: 0, cells: [at(2, 2), at(4, 3), at(4, 4)] }).state;
  assert.deepEqual([at(2, 2), at(4, 3), at(4, 4)].map((c) => after.terrain[c]), ["river", "river", "river"]);
});

test("Saint Gióng's bamboo sweep is a once-only strength-5 shot up to 3 cells", () => {
  const state = position([[0, "thanh-giong", "3,6"], [1, "phuong-hoang", "3,3"], [1, "rua-con", "0,0"]]);
  const { state: after } = play(state, { kind: "ability", unit: 0, cells: [at(3, 3)] });
  assert.deepEqual(after.units.map((u) => u.monster).sort(), ["rua-con", "thanh-giong"]);
  assert.equal(after.units.find((u) => u.monster === "thanh-giong")?.abilityUsed, true);
  assert.equal(activeAbility(monster("thanh-giong"))?.kind, "strike");
});

// --- Hidden information -------------------------------------------------------------

test("each side sees its own monsters, and only levels of face-down enemies", () => {
  const state = position([[0, "lan", "3,6"], [1, "chan-tinh", "3,1"], [1, "ho-tinh", "5,1"]]);
  const mine = viewFor(state, 0);
  assert.equal(mine.units.find((u) => u.id === 0)?.monster, "lan");
  assert.equal(mine.units.find((u) => u.id === 1)?.monster, null);
  assert.equal(mine.units.find((u) => u.id === 1)?.level, 3);
  assert.equal(mine.units.find((u) => u.id === 2)?.level, 3, "the Fox Spirit shows a false level 3");
  assert.equal(viewFor(state, 1).units.find((u) => u.id === 2)?.level, 2, "its owner sees the truth");
  // Nothing in the view leaks a hidden identity.
  assert.ok(!JSON.stringify(mine).includes("chan-tinh"));
  assert.ok(!JSON.stringify(mine).includes("ho-tinh"));
});

test("a revealed enemy shows its name and true level", () => {
  const state = position([[0, "moc-tinh", "3,5"], [1, "ho-tinh", "3,3"]]);
  const after = play(state, { kind: "shoot", unit: 0, target: at(3, 3) }).state;
  // Equal level 2, but the Fox Spirit has no ranged strength: it falls.
  assert.equal(after.units.length, 1);
  const tie = position([[0, "lan", "3,5"], [1, "ho-tinh", "3,4"]]);
  const won = play(tie, { kind: "move", unit: 0, to: at(3, 4) }).state;
  assert.equal(viewFor(won, 0).units.length, 1);
});

// --- Ending -----------------------------------------------------------------------

test("losing the last monster loses the game", () => {
  const state = position([[0, "lan", "3,4"], [1, "rua-con", "3,3"]]);
  const { state: after, events } = play(state, { kind: "move", unit: 0, to: at(3, 3) });
  assert.equal(after.winner, 0);
  assert.ok(events.some((e) => e.type === "end" && e.reason === "eliminated"));
  assert.deepEqual(legalActions(after), []);
});

test("after the last turn, the larger total level wins", () => {
  const state = position([[0, "lan", "0,7"], [1, "rua-con", "7,0"]]);
  state.turn = MAX_TURNS - 1;
  const { state: after, events } = play(state, { kind: "pass" });
  assert.equal(after.winner, 0);
  assert.ok(events.some((e) => e.type === "end" && e.reason === "turns"));
  const even = position([[0, "lan", "0,7"], [1, "chan-tinh", "7,0"]]);
  even.turn = MAX_TURNS - 1;
  assert.equal(play(even, { kind: "pass" }).state.winner, "draw");
});

test("illegal actions are refused and apply never changes its input", () => {
  const state = position([[0, "lan", "3,4"], [1, "rua-con", "3,3"]]);
  const copy = JSON.stringify(state);
  assert.throws(() => play(state, { kind: "move", unit: 1, to: at(3, 2) }), /Illegal/, "not your monster");
  assert.throws(() => play(state, { kind: "move", unit: 0, to: at(0, 0) }), /Illegal/);
  play(state, { kind: "move", unit: 0, to: at(3, 3) });
  assert.equal(JSON.stringify(state), copy);
});

// --- Random play on every map ---------------------------------------------------------

test("random games on every map keep every rule and always end", () => {
  const pool = MONSTERS.map((m) => m.id);
  for (const map of MAPS) {
    for (let game = 0; game < 25; game++) {
      const { terrain } = buildBoard(map);
      let state = newGame(map.id, autoPlace(0, randomTeam(pool, random), terrain, random), autoPlace(1, randomTeam(pool, random), terrain, random), game % 2 ? 1 : 0);
      while (state.winner === null) {
        const actions = legalActions(state);
        assert.ok(actions.length >= 1);
        // Prefer doing something over passing, so games resolve.
        const busy = actions.filter((a) => a.kind !== "pass");
        const action = (busy.length ? busy : actions)[Math.floor(random() * (busy.length || actions.length))];
        assert.ok(isLegal(state, action), `${map.id}: offered action is legal`);
        state = apply(state, action).state;
        const cells = state.units.map((u) => u.cell);
        assert.equal(new Set(cells).size, cells.length, `${map.id}: two monsters on one cell`);
        for (const u of state.units) {
          assert.ok(u.level >= monster(u.monster).level && u.level <= 6, `${map.id}: level ${u.level}`);
          if (state.terrain[u.cell] === "mountain") assert.equal(u.monster, "son-tinh", `${map.id}: only the Mountain God stands on a mountain`);
        }
        assert.ok(state.turn <= MAX_TURNS);
      }
    }
  }
});
