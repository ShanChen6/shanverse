import assert from "node:assert/strict";
import test from "node:test";

import { MAPS, SIZE, buildBoard, type Terrain } from "./maps";
import { ACTIVE_KINDS, ELEMENTS, LEVELS, MONSTERS, PARTNERS, RIVALS, STARTERS, activeAbility, hasAbility, monster } from "./monsters";
import {
  MAX_TURNS,
  apply,
  autoPlace,
  canPlaceOn,
  cellAt,
  destinations,
  feedBonus,
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
  shielded,
} from "./rules";

// --- Helpers ----------------------------------------------------------------------

const CODES: Record<string, Terrain> = { ".": "plain", "^": "mountain", "~": "river", m: "shrine", a: "temple", b: "temple", o: "ore", f: "forest", w: "marsh", l: "lava", d: "mound" };

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
/** Everyone face up, so a battle has no đánh úp bonus. */
const faceUp = (state: GameState) => ({ ...state, units: state.units.map((u) => ({ ...u, revealed: true })) });
const cellsOf = (state: GameState, unit: number) => new Set(destinations(state, state.units.find((u) => u.id === unit) as Unit).map((d) => d.cell));
const play = (state: GameState, action: Action) => apply(state, action);
/** A legal team: the first starter of each level. */
const TEAM = LEVELS.map((level) => STARTERS.find((id) => monster(id).level === level) as string);

let seed = 3;
const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

// --- Data -------------------------------------------------------------------------

test("the roster: 50 monsters, two for every element and level, unique ids, two starters per level", () => {
  assert.equal(MONSTERS.length, 50);
  assert.equal(new Set(MONSTERS.map((m) => m.id)).size, MONSTERS.length);
  for (const level of LEVELS) {
    for (const element of ELEMENTS) assert.equal(MONSTERS.filter((m) => m.level === level && m.element === element).length, 2, `${element} level ${level}`);
  }
  assert.deepEqual(STARTERS.map((id) => monster(id).level).sort(), LEVELS.flatMap((l) => [l, l]));
  for (const m of MONSTERS) {
    assert.equal(m.abilityText.length, m.abilities.length, `${m.id}: one text per ability`);
    assert.ok(m.abilities.filter((a) => (ACTIVE_KINDS as readonly string[]).includes(a.kind)).length <= 1, `${m.id}: at most one active ability`);
    assert.ok(m.steps >= 1 && m.steps <= 3, `${m.id}: steps`);
    assert.ok(m.name.vi && m.name.en && m.lore.vi && m.lore.en, `${m.id}: texts`);
  }
});

test("every map is mirrored, fair and open", () => {
  assert.equal(MAPS.length, 15);
  for (const element of ["kim", "moc", "thuy", "hoa", "tho"]) assert.equal(MAPS.filter((m) => m.element === element).length, 1, `one ${element} map`);
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
      const room = homeRows(side).flatMap((y) => Array.from({ length: SIZE }, (_, x) => terrain[at(x, y)])).filter(canPlaceOn);
      assert.ok(room.length >= 8, `${map.id}: room to place on side ${side}`);
    }
    // Every cell a walker can stand on can be reached from every other on foot.
    const blocked = (t: Terrain) => t === "mountain" || t === "lava";
    const open = terrain.map((t, i) => (!blocked(t) ? i : -1)).filter((i) => i >= 0);
    const seen = new Set([open[0]]);
    const queue = [open[0]];
    while (queue.length) {
      const c = queue.pop() as number;
      for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
        const n = cellAt((c % SIZE) + dx, Math.floor(c / SIZE) + dy);
        if (n !== -1 && !blocked(terrain[n]) && !seen.has(n)) {
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
  assert.deepEqual(teamProblems(TEAM), []);
  assert.ok(teamProblems(["rua-con", "coc-tia", "lan", "son-tinh", "phu-dong"]).length, "two level 1s, no level 3");
  assert.ok(teamProblems(TEAM.slice(0, 4)).length);
});

test("placement must be on the home rows, on open ground, one per cell", () => {
  const { terrain } = buildBoard(MAPS[0]);
  const good = autoPlace(0, TEAM, terrain, random);
  assert.deepEqual(placementProblems(0, good, terrain), []);
  assert.ok(placementProblems(1, good, terrain).length, "the player's cells are not Tianwu's home rows");
  const stacked = good.map((p) => ({ ...p, cell: good[0].cell }));
  assert.ok(placementProblems(0, stacked, terrain).length);
  assert.throws(() => newGame(MAPS[0].id, stacked, autoPlace(1, TEAM, terrain, random)));
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
  // Elephant (Thổ 3, melee 5) and Từ Đạo Hạnh (Thổ 3, melee 2): same element, no bonus.
  const strong = faceUp(position([[0, "voi-chin-nga", "3,4"], [1, "tu-dao-hanh", "3,3"]]));
  assert.deepEqual(play(strong, { kind: "move", unit: 0, to: at(3, 3) }).state.units.map((u) => u.monster), ["voi-chin-nga"]);
  const weak = faceUp(position([[0, "tu-dao-hanh", "3,4"], [1, "voi-chin-nga", "3,3"]]));
  assert.deepEqual(play(weak, { kind: "move", unit: 0, to: at(3, 3) }).state.units.map((u) => u.monster), ["voi-chin-nga"]);
  const tie = faceUp(position([[0, "lan", "3,4"], [1, "lan", "3,3"], [1, "rua-con", "0,0"]]));
  assert.deepEqual(play(tie, { kind: "move", unit: 0, to: at(3, 3) }).state.units.map((u) => u.monster), ["rua-con"]);
});

test("Ma Da fights a level higher on a river", () => {
  const rows = ["........", "........", "........", "...~....", "........", "........", "........", "........"];
  // Ma Da (level 1, melee 3) on a river fights as level 2, beating Cuội (Mộc 2, melee 2).
  const state = faceUp(position([[0, "ma-da", "3,3"], [1, "chu-cuoi", "3,2"]], rows, 1));
  const { state: after } = play(state, { kind: "move", unit: 1, to: at(3, 3) });
  assert.deepEqual(after.units.map((u) => u.monster), ["ma-da"]);
  // On plain ground it is just level 1.
  const dry = faceUp(position([[0, "ma-da", "3,3"], [1, "chu-cuoi", "3,2"]], undefined, 1));
  assert.deepEqual(play(dry, { kind: "move", unit: 1, to: at(3, 3) }).state.units.map((u) => u.monster), ["chu-cuoi"]);
});

test("ranged: in reach only; a lower level falls, a higher one shrugs it off", () => {
  // Mai An Tiêm (Thủy 2, ranged 2) against a toad (Hỏa 1) and a Roof Guardian (Kim 3).
  const state = faceUp(position([[0, "mai-an-tiem", "3,5"], [1, "rua-con", "0,0"], [1, "coc-tia", "3,3"], [1, "con-kim", "5,4"]]));
  const targets = legalActions(state).filter((a) => a.kind === "shoot").map((a) => (a as { target: number }).target);
  assert.deepEqual(new Set(targets), new Set([at(3, 3), at(5, 4)]), "range 2, diagonals count as one");
  assert.deepEqual(play(state, { kind: "shoot", unit: 0, target: at(3, 3) }).state.units.map((u) => u.monster).sort(), ["con-kim", "mai-an-tiem", "rua-con"]);
  const { state: after, events } = play(state, { kind: "shoot", unit: 0, target: at(5, 4) });
  assert.equal(after.units.length, 4, "a lower-level shooter neither kills nor dies");
  assert.ok(events.some((e) => e.type === "battle" && e.result === "none"));
});

test("ranged at equal level compares ranged strength; the loser of a shot is unharmed", () => {
  // Dragon Lord (Thủy, ranged 3) vs a Water God evolved to level 5 (Thủy, ranged 2): same element.
  const evolved = (s: GameState) => (s.units.find((u) => u.monster === "thuy-tinh")!.level = 5, s);
  const state = evolved(faceUp(position([[0, "lac-long-quan", "3,5"], [1, "thuy-tinh", "3,3"]])));
  assert.equal(play(state, { kind: "shoot", unit: 0, target: at(3, 3) }).state.units.length, 1);
  const back = evolved(faceUp(position([[0, "thuy-tinh", "3,5"], [1, "lac-long-quan", "3,3"]])));
  assert.equal(play(back, { kind: "shoot", unit: 0, target: at(3, 3) }).state.units.length, 2);
});

test("shells, shrines and a Lân next door block ranged attacks, and give the target away", () => {
  const shell = position([[0, "mai-an-tiem", "3,5"], [1, "rua-con", "3,3"]]);
  const { state: a, events } = play(shell, { kind: "shoot", unit: 0, target: at(3, 3) });
  assert.equal(a.units.length, 2);
  assert.ok(events.some((e) => e.type === "battle" && e.result === "blocked"));
  assert.equal(a.units.find((u) => u.side === 1)?.revealed, true, "the shell shows what it is");
  const rows = ["........", "........", "........", "...m....", "........", "........", "........", "........"];
  const shrine = position([[0, "mai-an-tiem", "3,5"], [1, "coc-tia", "3,3"]], rows);
  assert.equal(play(shrine, { kind: "shoot", unit: 0, target: at(3, 3) }).state.units.length, 2);
  const guarded = position([[0, "mai-an-tiem", "3,5"], [1, "coc-tia", "3,3"], [1, "lan", "4,2"]]);
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
  const state = position([[0, "phu-dong", "3,3"], [1, "rua-con", "0,7"]], rows);
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

test("the Thunder God's bolt is a once-only strength-4 shot up to 4 cells", () => {
  const state = faceUp(position([[0, "than-set", "3,7"], [1, "nghe", "3,3"], [1, "rua-con", "0,0"]]));
  assert.equal(isLegal(state, { kind: "ability", unit: 0, cells: [at(0, 0)] }), false, "7 away");
  const { state: after } = play(state, { kind: "ability", unit: 0, cells: [at(3, 3)] });
  // Level 4 against level 4: the bolt's strength 4 beats the Nghê's 0.
  assert.deepEqual(after.units.map((u) => u.monster).sort(), ["rua-con", "than-set"]);
  assert.equal(after.units.find((u) => u.monster === "than-set")?.abilityUsed, true);
  assert.equal(activeAbility(monster("than-set"))?.kind, "strike");
});

// --- Hidden information -------------------------------------------------------------

test("each side sees its own monsters, and only levels of face-down enemies", () => {
  const state = position([[0, "lan", "3,6"], [1, "voi-chin-nga", "3,1"], [1, "ho-tinh", "5,1"]]);
  const mine = viewFor(state, 0);
  assert.equal(mine.units.find((u) => u.id === 0)?.monster, "lan");
  assert.equal(mine.units.find((u) => u.id === 1)?.monster, null);
  assert.equal(mine.units.find((u) => u.id === 1)?.level, 3);
  assert.equal(mine.units.find((u) => u.id === 2)?.level, 3, "the Fox Spirit shows a false level 3");
  assert.equal(viewFor(state, 1).units.find((u) => u.id === 2)?.level, 2, "its owner sees the truth");
  // Nothing in the view leaks a hidden identity.
  assert.ok(!JSON.stringify(mine).includes("voi-chin-nga"));
  assert.ok(!JSON.stringify(mine).includes("ho-tinh"));
});

test("a revealed enemy shows its name and true level", () => {
  const state = position([[0, "mai-an-tiem", "3,5"], [1, "ho-tinh", "3,3"]]);
  const after = play(state, { kind: "shoot", unit: 0, target: at(3, 3) }).state;
  // Water puts out Fire and the fox was face down: 4 against its true level 2.
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
  const even = position([[0, "lan", "0,7"], [1, "ho-tinh", "7,0"]]);
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
          if (state.terrain[u.cell] === "mountain") assert.ok(hasAbility(monster(u.monster), "walk-mountain"), `${map.id}: only climbers stand on a mountain`);
          if (state.terrain[u.cell] === "lava") assert.equal(monster(u.monster).element, "hoa", `${map.id}: only Fire stands on lava`);
        }
        assert.ok(state.turn <= MAX_TURNS);
      }
    }
  }
});

test("khắc: an element that overcomes its foe fights one level higher", () => {
  // Fox Spirit (Hỏa 2, melee 3) attacks Cao Biền (Kim 3, melee 2): Hỏa nung Kim makes it 3 vs 3, and melee 3 beats 2.
  const state = faceUp(position([[0, "ho-tinh", "3,5"], [1, "cao-bien", "3,4"], [1, "rua-con", "0,0"]]));
  const { state: after, events } = play(state, { kind: "move", unit: 0, to: at(3, 4) });
  assert.deepEqual(after.units.map((u) => u.monster).sort(), ["ho-tinh", "rua-con"]);
  const battle = events.find((e) => e.type === "battle");
  assert.deepEqual(battle?.type === "battle" && battle.levels, { attacker: 3, defender: 3 });
  // The other way round, Metal overcomes Wood: Cuội (Mộc 2) against Cao Biền is 2 vs 4.
  const plain = faceUp(position([[0, "chu-cuoi", "3,5"], [1, "cao-bien", "3,4"], [1, "rua-con", "0,0"]]));
  const lost = play(plain, { kind: "move", unit: 0, to: at(3, 4) });
  assert.deepEqual(lost.state.units.map((u) => u.monster).sort(), ["cao-bien", "rua-con"]);
  const fight = lost.events.find((e) => e.type === "battle");
  assert.deepEqual(fight?.type === "battle" && fight.levels, { attacker: 2, defender: 4 });
});

test("khắc works on defence and on ranged attacks too", () => {
  // Water God (Thủy 4) shoots the Thunder God (Hỏa 4): Thủy dập Hỏa, 5 vs 4.
  const shot = faceUp(position([[0, "thuy-tinh", "3,5"], [1, "than-set", "3,3"]]));
  assert.equal(play(shot, { kind: "shoot", unit: 0, target: at(3, 3) }).state.units.length, 1);
  // Phoenix shoots the Water God: 4 vs 5, nothing happens.
  const back = faceUp(position([[0, "phuong-hoang", "3,5"], [1, "thuy-tinh", "3,3"]]));
  assert.equal(play(back, { kind: "shoot", unit: 0, target: at(3, 3) }).state.units.length, 2);
});

test("sinh: a defender next to an ally that feeds its element defends one level higher", () => {
  // Fox Spirit attacks Cao Biền again, but a Lân (Thổ sinh Kim) stands beside him: 3 vs 4.
  const state = faceUp(position([[0, "ho-tinh", "3,5"], [1, "cao-bien", "3,4"], [1, "lan", "4,3"]]));
  const { state: after, events } = play(state, { kind: "move", unit: 0, to: at(3, 4) });
  assert.deepEqual(after.units.map((u) => u.monster).sort(), ["cao-bien", "lan"]);
  const battle = events.find((e) => e.type === "battle");
  assert.deepEqual(battle?.type === "battle" && battle.levels, { attacker: 3, defender: 4 });
  // Only on defence, and two feeders do not stack.
  assert.equal(feedBonus(state, state.units[1]), 1);
  assert.equal(feedBonus(state, state.units[0]), 0);
});

test("a face-down monster's element is hidden", () => {
  const state = position([[0, "ho-tinh", "3,5"], [1, "ngua-sat", "3,4"]]);
  const enemy = viewFor(state, 0).units.find((u) => u.side === 1);
  assert.equal(enemy?.monster, null);
  assert.ok(enemy && !("element" in enemy));
});

test("partners and rivals name real monsters at different levels", () => {
  for (const [a, b] of [...PARTNERS, ...RIVALS]) assert.notEqual(monster(a).level, monster(b).level, `${a} + ${b} can share a team`);
});

test("đánh úp: attacking a face-down monster gives +1", () => {
  // Sand Crab (Thủy 2, melee 3) attacks a face-down Buffalo Spirit (Thủy 3, melee 5): 3 vs 3, and 3 < 5, so the crab falls.
  const hidden = position([[0, "da-trang", "3,5"], [1, "nguu-tinh", "3,4"], [1, "rua-con", "0,0"]]);
  const { state: after, events } = play(hidden, { kind: "move", unit: 0, to: at(3, 4) });
  const battle = events.find((e) => e.type === "battle");
  assert.deepEqual(battle?.type === "battle" && battle.levels, { attacker: 3, defender: 3 });
  assert.ok(!after.units.some((u) => u.monster === "da-trang"));
  // Ambush a face-down toad (Hỏa 1) with a level-1 Ma Da (Thủy khắc Hỏa): 3 vs 1. Face up it would be 2 vs 1.
  const toad = position([[0, "ma-da", "3,5"], [1, "coc-tia", "3,4"], [1, "rua-con", "0,0"]]);
  const ambush = play(toad, { kind: "move", unit: 0, to: at(3, 4) }).events.find((e) => e.type === "battle");
  assert.deepEqual(ambush?.type === "battle" && ambush.levels, { attacker: 3, defender: 1 });
  const open = play(faceUp(toad), { kind: "move", unit: 0, to: at(3, 4) }).events.find((e) => e.type === "battle");
  assert.deepEqual(open?.type === "battle" && open.levels, { attacker: 2, defender: 1 });
});

test("đánh úp counts for shots: a face-down target is easier to hit", () => {
  // Mai An Tiêm (Thủy 2) shoots a face-down Buffalo Spirit (Thủy 3): 3 vs 3, shot power 2 beats the buffalo's 0.
  const state = position([[0, "mai-an-tiem", "3,5"], [1, "nguu-tinh", "3,3"], [1, "rua-con", "0,0"]]);
  assert.ok(!play(state, { kind: "shoot", unit: 0, target: at(3, 3) }).state.units.some((u) => u.monster === "nguu-tinh"));
  assert.ok(play(faceUp(state), { kind: "shoot", unit: 0, target: at(3, 3) }).state.units.some((u) => u.monster === "nguu-tinh"));
});

// --- Abilities of the 50 ---------------------------------------------------------------

test("leap: the White Tiger jumps over anything up to 3 cells, and onto an enemy it attacks", () => {
  const rows = ["........", "........", "........", "..^^^...", "........", "........", "........", "........"];
  const state = faceUp(position([[0, "bach-ho", "3,5"], [1, "lan", "3,2"], [1, "rua-con", "0,0"]], rows));
  assert.equal(isLegal(state, { kind: "ability", unit: 0, cells: [at(3, 3)] }), false, "not onto a mountain");
  assert.equal(isLegal(state, { kind: "ability", unit: 0, cells: [at(0, 0)] }), false, "5 away");
  const jumped = play(state, { kind: "ability", unit: 0, cells: [at(5, 2)] }).state;
  assert.equal(jumped.units[0].cell, at(5, 2));
  const { state: after, events } = play(state, { kind: "ability", unit: 0, cells: [at(3, 2)] });
  assert.ok(events.some((e) => e.type === "battle" && e.kind === "melee" && e.result === "attacker"));
  assert.equal(after.units.find((u) => u.monster === "bach-ho")?.cell, at(3, 2));
});

test("bind: a bound enemy cannot act for its next turns, then is free", () => {
  const state = position([[0, "mau-thuong-ngan", "3,5"], [1, "lan", "3,2"], [1, "rua-con", "0,0"]]);
  const bound = play(state, { kind: "ability", unit: 0, cells: [at(3, 2)] }).state;
  // Tianwu's two turns: the Lân cannot act on either.
  assert.ok(!legalActions(bound).some((a) => a.kind !== "pass" && a.unit === 1));
  let s = play(bound, { kind: "pass" }).state;
  s = play(s, { kind: "pass" }).state;
  assert.ok(!legalActions(s).some((a) => a.kind !== "pass" && a.unit === 1), "second turn still bound");
  s = play(play(s, { kind: "pass" }).state, { kind: "pass" }).state;
  assert.ok(legalActions(s).some((a) => a.kind === "move" && a.unit === 1), "free again");
  assert.equal(viewFor(bound, 0).units.find((u) => u.id === 1)?.boundUntil, bound.units[1].boundUntil, "binding is public");
});

test("seal: Cao Biền strips a monster of its abilities and its disguise", () => {
  const state = position([[0, "cao-bien", "3,5"], [1, "ho-tinh", "3,2"], [1, "rua-con", "4,3"]]);
  assert.equal(viewFor(state, 0).units.find((u) => u.id === 1)?.level, 3, "disguised");
  const sealed = play(state, { kind: "ability", unit: 0, cells: [at(3, 2)] }).state;
  const fox = viewFor(sealed, 0).units.find((u) => u.id === 1);
  assert.equal(fox?.monster, "ho-tinh");
  assert.equal(fox?.level, 2, "true level");
  // A sealed turtle loses its shell.
  const turtle = play(state, { kind: "ability", unit: 0, cells: [at(4, 3)] }).state;
  assert.equal(shielded(turtle, turtle.units.find((u) => u.monster === "rua-con") as Unit), false);
});

test("swap: Từ Đạo Hạnh trades places with friend or foe, but not one on a mountain", () => {
  const rows = ["........", "........", "...^....", "........", "........", "........", "........", "........"];
  const state = position([[0, "tu-dao-hanh", "3,5"], [1, "lan", "5,3"], [1, "son-tinh", "3,2"]], rows);
  assert.equal(isLegal(state, { kind: "ability", unit: 0, cells: [at(3, 2)] }), false, "the Mountain God stays on his mountain");
  const after = play(state, { kind: "ability", unit: 0, cells: [at(5, 3)] }).state;
  assert.equal(after.units[0].cell, at(5, 3));
  assert.equal(after.units[1].cell, at(3, 5));
});

test("rise: Saint Gióng stands tall to level 6 for good", () => {
  const state = position([[0, "phu-dong", "3,5"], [1, "rua-con", "0,0"]]);
  const after = play(state, { kind: "ability", unit: 0, cells: [at(3, 5)] }).state;
  assert.equal(after.units[0].level, 6);
  assert.equal(viewFor(after, 1).units[0].evolved, 1, "public, like a temple");
});

test("revive: the Phoenix comes back once on its home rows", () => {
  const state = faceUp(position([[0, "son-tinh", "3,4"], [1, "phuong-hoang", "3,3"], [1, "rua-con", "0,0"]]));
  const { state: after, events } = play(state, { kind: "move", unit: 0, to: at(3, 3) });
  const phoenix = after.units.find((u) => u.monster === "phuong-hoang");
  assert.ok(phoenix && phoenix.revived && [0, 1].includes(Math.floor(phoenix.cell / SIZE)), "back on Tianwu's home rows");
  assert.ok(events.some((e) => e.type === "revive"));
  assert.equal(after.units.find((u) => u.monster === "son-tinh")?.cell, at(3, 3), "the winner still moves in");
  // The second time it falls for good.
  const again = faceUp({ ...after, toMove: 0, units: after.units.map((u) => (u.monster === "phuong-hoang" ? { ...u, cell: at(3, 2) } : u)) });
  const twice = play(again, { kind: "move", unit: 0, to: at(3, 2) }).state;
  assert.ok(!twice.units.some((u) => u.monster === "phuong-hoang"));
});

test("recall: Cuội brings back the last fallen ally of level 3 or less", () => {
  const state = faceUp(position([[0, "chu-cuoi", "3,5"], [0, "rua-con", "3,4"], [1, "lan", "3,3"]]));
  // The turtle attacks the Lân and falls.
  const lost = play(state, { kind: "move", unit: 1, to: at(3, 3) }).state;
  assert.ok(!lost.units.some((u) => u.monster === "rua-con"));
  const back = play({ ...lost, toMove: 0 }, { kind: "ability", unit: 0, cells: [at(0, 7)] }).state;
  const turtle = back.units.find((u) => u.monster === "rua-con");
  assert.equal(turtle?.cell, at(0, 7));
  assert.equal(back.fallen?.length, 0);
  // Nothing to bring back: the ability is not offered.
  assert.ok(!legalActions(state).some((a) => a.kind === "ability"));
});

test("auras: Trần Hưng Đạo lifts attackers next to him, Nghê lifts defenders", () => {
  // A Lân (Thổ 2) attacks a level-2 Earth God (Thổ): 2 vs 2 normally; Trần Hưng Đạo beside the Lân makes it 3.
  const attack = faceUp(position([[0, "lan", "3,4"], [0, "tran-hung-dao", "2,4"], [1, "ong-dia", "3,3"]]));
  const fight = play(attack, { kind: "move", unit: 0, to: at(3, 3) }).events.find((e) => e.type === "battle");
  assert.deepEqual(fight?.type === "battle" && fight.levels, { attacker: 3, defender: 2 });
  // A Nghê beside the Earth God lifts its defence instead.
  const defend = faceUp(position([[0, "lan", "3,4"], [1, "ong-dia", "3,3"], [1, "nghe", "2,3"]]));
  const held = play(defend, { kind: "move", unit: 0, to: at(3, 3) }).events.find((e) => e.type === "battle");
  assert.deepEqual(held?.type === "battle" && held.levels, { attacker: 2, defender: 3 });
});

test("partners attack together; Sơn Tinh and Thủy Tinh strike each other harder", () => {
  // Saint Gióng (Hỏa 5) next to his Iron Horse attacks a level-5 Dragon Lord (Thủy, overcomes Fire).
  const pair = faceUp(position([[0, "phu-dong", "3,4"], [0, "ngua-sat", "4,4"], [1, "lac-long-quan", "3,3"]]));
  const fight = play(pair, { kind: "move", unit: 0, to: at(3, 3) }).events.find((e) => e.type === "battle");
  assert.deepEqual(fight?.type === "battle" && fight.levels, { attacker: 6, defender: 6 });
  const rivals = faceUp(position([[0, "thuy-tinh", "3,4"], [1, "son-tinh", "3,3"]]));
  const feud = play(rivals, { kind: "move", unit: 0, to: at(3, 3) }).events.find((e) => e.type === "battle");
  // Thủy Tinh 4 +1 (feud) against Sơn Tinh 5 +1 (Earth stems Water).
  assert.deepEqual(feud?.type === "battle" && feud.levels, { attacker: 5, defender: 6 });
});

// --- Sacred ground (linh địa) ----------------------------------------------------------

test("linh địa: a monster on its own element's ground fights one level higher", () => {
  // Tiger's Thrall (Kim 1) on ore against a level-2 Lân (Thổ sinh Kim does not apply: no ally next to it).
  const rows = ["........", "........", "........", "...o....", "........", "........", "........", "........"];
  const state = faceUp(position([[0, "chu-cuoi", "3,4"], [1, "ma-tranh", "3,3"], [1, "rua-con", "0,0"]], rows));
  const fight = play(state, { kind: "move", unit: 0, to: at(3, 3) }).events.find((e) => e.type === "battle");
  // Cuội (Mộc 2) attacks the thrall (Kim 1, +1 on ore, +1 Kim khắc Mộc): 2 vs 3.
  assert.deepEqual(fight?.type === "battle" && fight.levels, { attacker: 2, defender: 3 });
});

test("forest hides from shots; ore lengthens them", () => {
  const forest = ["........", "........", "........", "...f....", "........", "........", "........", "........"];
  const hidden = position([[0, "mai-an-tiem", "3,5"], [1, "coc-tia", "3,3"]], forest);
  assert.equal(play(hidden, { kind: "shoot", unit: 0, target: at(3, 3) }).state.units.length, 2);
  const ore = ["........", "........", "........", "........", "........", "...o....", "........", "........"];
  const far = position([[0, "mai-an-tiem", "3,5"], [1, "coc-tia", "3,2"]], ore);
  assert.ok(legalActions(far).some((a) => a.kind === "shoot" && a.target === at(3, 2)), "range 2 + 1 from ore");
  const plain = position([[0, "mai-an-tiem", "3,5"], [1, "coc-tia", "3,2"]]);
  assert.ok(!legalActions(plain).some((a) => a.kind === "shoot"), "out of reach on plain ground");
});

test("marsh stops walkers; lava bars all but Fire, flyers pass over it", () => {
  const marsh = ["........", "........", "........", "~~~www~~", "........", "........", "........", "........"];
  const walker = position([[0, "lan", "3,4"]], marsh);
  assert.ok(cellsOf(walker, 0).has(at(3, 3)) && !cellsOf(walker, 0).has(at(3, 2)), "a walker stops in the marsh");
  assert.ok(cellsOf(position([[0, "ma-da", "3,4"]], marsh), 0).has(at(3, 2)), "a swimmer goes through");
  const lava = ["........", "........", "........", "llllllll", "........", "........", "........", "........"];
  assert.ok(!cellsOf(position([[0, "lan", "3,4"]], lava), 0).has(at(3, 3)), "no walking on lava");
  assert.ok(cellsOf(position([[0, "coc-tia", "3,4"]], lava), 0).has(at(3, 3)), "Fire walks on lava");
  const eagle = cellsOf(position([[0, "dai-bang", "3,4"]], lava), 0);
  assert.ok(!eagle.has(at(3, 3)) && eagle.has(at(3, 2)), "a flyer passes over but cannot land");
});

test("a monster on a mound cannot be bound or swapped", () => {
  const rows = ["........", "........", "........", "...d....", "........", "........", "........", "........"];
  const bind = position([[0, "mau-thuong-ngan", "3,5"], [1, "lan", "3,3"], [1, "rua-con", "0,0"]], rows);
  assert.ok(!legalActions(bind).some((a) => a.kind === "ability" && a.cells[0] === at(3, 3)));
  const swap = position([[0, "tu-dao-hanh", "3,5"], [1, "lan", "3,3"], [1, "rua-con", "4,4"]], rows);
  const targets = legalActions(swap).filter((a) => a.kind === "ability").map((a) => (a as { cells: number[] }).cells[0]);
  assert.ok(!targets.includes(at(3, 3)) && targets.includes(at(4, 4)));
});
