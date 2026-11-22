import assert from "node:assert/strict";
import test from "node:test";

import {
  BLUE,
  RED,
  START_LAYOUT,
  airDefence,
  commandersFacing,
  endGame,
  inCheck,
  isLegal,
  legalMoves,
  legalMovesFrom,
  moveName,
  newGame,
  parseSquare,
  play,
  squareName,
  writeLayout,
  type Move,
  type MoveKind,
  type Position,
} from "./logic";

const at = parseSquare;

/** A position from a layout, with only the pieces given. Rows are rank 12 first. */
function position(rows: string[], toMove = RED): Position {
  const pos = newGame(rows.join("/"));
  pos.toMove = toMove;
  return pos;
}

/** Empty board text with pieces placed by square name, e.g. { c1: "C", g12: "c" }. */
function board(pieces: Record<string, string>): string[] {
  const grid: string[][] = Array.from({ length: 12 }, () => new Array(11).fill(""));
  for (const [name, text] of Object.entries(pieces)) {
    const s = at(name);
    grid[11 - Math.floor(s / 11)][s % 11] = text;
  }
  return grid.map((row) => {
    let out = "";
    let empty = 0;
    for (const cell of row) {
      if (!cell) {
        empty++;
        continue;
      }
      if (empty) out += empty;
      empty = 0;
      out += cell;
    }
    return out + (empty ? empty : "");
  });
}

/** Both commanders tucked away in corners that never face each other. */
const KINGS = { k1: "C", c12: "c" } as const;

function targets(pos: Position, from: string, kind?: MoveKind): string[] {
  return legalMovesFrom(pos, at(from))
    .filter((m) => !kind || m.kind === kind)
    .map((m) => squareName(m.to))
    .sort();
}

function find(pos: Position, from: string, to: string, kind: MoveKind, unit: Move["unit"] = "stack"): Move {
  return { from: at(from), to: at(to), kind, unit };
}

test("squares are named a1 to k12", () => {
  assert.equal(squareName(0), "a1");
  assert.equal(squareName(131), "k12");
  assert.equal(at("g1"), 6);
  assert.ok(Number.isNaN(at("l1")));
  assert.ok(Number.isNaN(at("a13")));
});

test("the starting layout has 19 pieces a side and reads back the same", () => {
  const pos = newGame();
  const count = (color: string) => pos.board.filter((s) => s?.carrier.color === color).length;
  assert.equal(count(RED), 19);
  assert.equal(count(BLUE), 19);
  assert.equal(writeLayout(pos.board), START_LAYOUT);
  assert.deepEqual(pos.hqSquares.r.map(squareName), ["f2", "h2"]);
  assert.deepEqual(pos.hqSquares.b.map(squareName), ["f11", "h11"]);
  assert.ok(legalMoves(pos).length > 20);
});

test("infantry steps one square along files and ranks", () => {
  const pos = position(board({ ...KINGS, e4: "I" }));
  assert.deepEqual(targets(pos, "e4"), ["d4", "e3", "e5", "f4"]);
});

test("militia also steps diagonally", () => {
  const pos = position(board({ ...KINGS, e4: "M" }));
  assert.equal(targets(pos, "e4").length, 8);
});

test("tanks move up to two squares and cannot jump", () => {
  const pos = position(board({ ...KINGS, e4: "T", e5: "E" }));
  assert.deepEqual(targets(pos, "e4"), ["c4", "d4", "e2", "e3", "f4", "g4"]);
  // A tank may also pick up a friendly infantry.
  const pickup = position(board({ ...KINGS, e4: "T", e5: "I" }));
  assert.deepEqual(targets(pickup, "e4", "join"), ["e5"]);
});

test("land pieces cannot enter the open sea but may stand on the coast", () => {
  const pos = position(board({ ...KINGS, c4: "I" }));
  assert.deepEqual(targets(pos, "c4"), ["c3", "c5", "d4"]);
});

test("ships stay on the sea, the coast and the river mouth", () => {
  const pos = position(board({ ...KINGS, b4: "N" }));
  const moves = targets(pos, "b4", "move");
  assert.ok(moves.includes("a4"));
  assert.ok(moves.includes("c4"));
  assert.ok(!moves.includes("d4"));
  assert.ok(!moves.includes("e4"));
  const river = position(board({ ...KINGS, c6: "N" }));
  assert.ok(targets(river, "c6", "move").includes("e6"));
  assert.ok(!targets(river, "c6", "move").includes("f6"));
});

test("heavy pieces cross the river only over a bridge", () => {
  const gun = position(board({ ...KINGS, e6: "G" }));
  assert.ok(!targets(gun, "e6").includes("e7"));
  const bridge = position(board({ ...KINGS, f6: "G" }));
  assert.ok(targets(bridge, "f6").includes("f7"));
  const artillery = position(board({ ...KINGS, f5: "A", e5: "A" }));
  assert.ok(targets(artillery, "f5").includes("f8"));
  assert.ok(!targets(artillery, "e5").includes("e8"));
  assert.ok(!targets(artillery, "e5").includes("h8"));
});

test("an engineer carries a heavy piece across the river anywhere", () => {
  let pos = position(board({ ...KINGS, e6: "(EA)" }));
  assert.ok(targets(pos, "e6").includes("e7"));
  pos = play(pos, find(pos, "e6", "e7", "move"));
  assert.equal(writeLayout(pos.board).includes("(EA)"), true);
});

test("tanks and infantry cross the river anywhere", () => {
  const pos = position(board({ ...KINGS, d6: "T" }));
  assert.ok(targets(pos, "d6").includes("d8"));
});

test("artillery fires over pieces in the way, and may stay or advance", () => {
  const pos = position(board({ ...KINGS, e3: "A", e4: "I", e6: "i" }));
  const kinds = legalMovesFrom(pos, at("e3")).filter((m) => m.to === at("e6")).map((m) => m.kind).sort();
  assert.deepEqual(kinds, ["fire"]);
  const open = position(board({ ...KINGS, e3: "A", e5: "i" }));
  const openKinds = legalMovesFrom(open, at("e3")).filter((m) => m.to === at("e5")).map((m) => m.kind).sort();
  assert.deepEqual(openKinds, ["capture", "fire"]);
});

test("melee pieces only capture by moving in, unless they cannot stand there", () => {
  const pos = position(board({ ...KINGS, e4: "I", e5: "i" }));
  assert.deepEqual(legalMovesFrom(pos, at("e4")).filter((m) => m.to === at("e5")).map((m) => m.kind), ["capture"]);
  const ship = position(board({ ...KINGS, c4: "T", b4: "n" }));
  assert.deepEqual(legalMovesFrom(ship, at("c4")).filter((m) => m.to === at("b4")).map((m) => m.kind), ["fire"]);
});

test("ships fire at land up to three squares and at ships up to four", () => {
  const pos = position(board({ ...KINGS, b2: "N", f2: "i", b6: "n" }));
  assert.ok(!targets(pos, "b2", "fire").includes("f2"));
  assert.ok(targets(pos, "b2", "fire").includes("b6"));
  const near = position(board({ ...KINGS, b2: "N", e2: "i" }));
  assert.deepEqual(targets(near, "b2", "fire"), ["e2"]);
});

test("air defence zones: guns and ships radius 1, missiles 2 straight and 1 diagonal", () => {
  const pos = position(board({ ...KINGS, f6: "g", f9: "s" }));
  const zone = airDefence(pos, BLUE);
  assert.equal(zone[at("g7")], 1);
  assert.equal(zone[at("h6")], 0);
  assert.equal(zone[at("f11")], 1);
  assert.equal(zone[at("g10")], 1);
  assert.equal(zone[at("h10")], 0);
});

test("aircraft fly over pieces but not through air defence", () => {
  const pos = position(board({ ...KINGS, e2: "F", e3: "I", e4: "i", g5: "g" }));
  const moves = targets(pos, "e2", "move");
  assert.ok(moves.includes("e5"));
  assert.ok(moves.includes("e6"));
  // The gun on g5 guards f4 to h6, so the diagonal ends at f3.
  assert.ok(moves.includes("f3"));
  assert.ok(!moves.includes("g4"));
  assert.ok(!moves.includes("h5"));
});

test("an aircraft attacking inside air defence is lost along with its target", () => {
  let pos = position(board({ ...KINGS, e2: "F", e5: "g" }));
  const strike = legalMovesFrom(pos, at("e2")).find((m) => m.to === at("e5"));
  assert.equal(strike?.kind, "strike");
  pos = play(pos, strike!);
  assert.equal(pos.board[at("e5")], null);
  assert.equal(pos.board[at("e2")], null);
});

test("a hero aircraft ignores air defence", () => {
  const pos = position(board({ ...KINGS, e2: "F+", e5: "g" }));
  const kinds = legalMovesFrom(pos, at("e2")).filter((m) => m.to === at("e5")).map((m) => m.kind).sort();
  assert.deepEqual(kinds, ["capture", "fire"]);
});

test("infantry boards a tank, and the tank carries it", () => {
  let pos = position(board({ ...KINGS, e4: "I", e5: "T" }));
  pos = play(pos, find(pos, "e4", "e5", "join"));
  assert.match(writeLayout(pos.board), /\(TI\)/);
  pos.toMove = RED;
  pos = play(pos, find(pos, "e5", "e7", "move"));
  assert.match(writeLayout(pos.board), /\(TI\)/);
  pos.toMove = RED;
  // The rider steps off on its own.
  pos = play(pos, find(pos, "e7", "e8", "move", 0));
  assert.equal(pos.board[at("e8")]?.carrier.type, "i");
  assert.equal(pos.board[at("e7")]?.carrier.type, "t");
});

test("stacks only form when one piece can carry the rest", () => {
  const pos = position(board({ ...KINGS, e4: "I", e5: "E", d5: "A" }));
  assert.ok(!legalMovesFrom(pos, at("e4")).some((m) => m.to === at("e5")));
  assert.ok(legalMovesFrom(pos, at("d5")).some((m) => m.to === at("e5") && m.kind === "join"));
});

test("a ship carries an aircraft and a tank out to sea", () => {
  let pos = position(board({ ...KINGS, c3: "N", c4: "T", d3: "F" }));
  pos = play(pos, find(pos, "c4", "c3", "join"));
  pos.toMove = RED;
  pos = play(pos, find(pos, "d3", "c3", "join"));
  pos.toMove = RED;
  pos = play(pos, find(pos, "c3", "a3", "move"));
  const stack = pos.board[at("a3")]!;
  assert.equal(stack.carrier.type, "n");
  assert.deepEqual(stack.riders.map((p) => p.type).sort(), ["f", "t"]);
});

test("commanders slide along open lines but capture only next to them", () => {
  const pos = position(board({ f1: "C", c12: "c", f5: "i" }));
  const moves = targets(pos, "f1");
  assert.ok(moves.includes("f3"));
  // f4 is next to the enemy infantry, so the commander would be taken there.
  assert.ok(!moves.includes("f4"));
  assert.ok(!moves.includes("f5"));
  assert.ok(moves.includes("k1"));
});

test("commanders may not face each other on an open line", () => {
  const pos = position(board({ f1: "C", g12: "c", g5: "I" }));
  // The infantry on g5 stands between them, so g1 is allowed.
  assert.ok(targets(pos, "f1").includes("g1"));
  const open = position(board({ f1: "C", g12: "c" }));
  assert.ok(!targets(open, "f1").includes("g1"));
  assert.equal(commandersFacing(position(board({ g1: "C", g12: "c" }))), true);
  // A commander riding a tank is not facing.
  assert.equal(commandersFacing(position(board({ g1: "(TC)", g12: "c" }))), false);
});

test("you may not leave your commander open to capture", () => {
  const pos = position(board({ e1: "C", e3: "I", e5: "t", c12: "c" }));
  // The infantry on e3 stands between the tank and the commander.
  assert.equal(inCheck(pos, RED), false);
  const exposed = position(board({ e1: "C", e2: "I", e3: "t", c12: "c" }));
  // Moving the infantry sideways would let the tank take the commander.
  assert.ok(!targets(exposed, "e2").includes("d2"));
});

test("a piece that checks the enemy commander becomes a hero", () => {
  let pos = position(board({ k1: "C", e6: "c", e3: "T", a12: "i", b12: "i" }));
  pos = play(pos, find(pos, "e3", "e4", "move"));
  assert.equal(pos.board[at("e4")]?.carrier.hero, true);
  assert.equal(inCheck(pos, BLUE), true);
});

test("checkmate ends the game", () => {
  // Blue commander in the corner, its own infantry below it, two tanks closing in.
  let pos = position(board({ c1: "C", k12: "c", k10: "i", e12: "m", i11: "T", g12: "T" }));
  pos = play(pos, find(pos, "g12", "i12", "move"));
  assert.deepEqual(pos.result, { winner: RED, reason: "checkmate" });
});

test("holding a captured enemy headquarters for three turns wins", () => {
  let pos = position(board({ k1: "C", c12: "c", f11: "h", f10: "I", k11: "i" }));
  pos.hqSquares = { r: [], b: [at("f11")] };
  pos = play(pos, find(pos, "f10", "f11", "capture"));
  assert.equal(pos.hqHold.r, 1);
  pos = play(pos, find(pos, "k11", "k10", "move"));
  pos = play(pos, find(pos, "k1", "j1", "move"));
  assert.equal(pos.hqHold.r, 2);
  pos = play(pos, find(pos, "k10", "k9", "move"));
  pos = play(pos, find(pos, "j1", "i1", "move"));
  assert.deepEqual(pos.result, { winner: RED, reason: "headquarters" });
});

test("resigning or running out of time ends the game", () => {
  const pos = newGame();
  assert.deepEqual(endGame(pos, RED, "timeout").result, { winner: BLUE, reason: "timeout" });
  assert.deepEqual(endGame(pos, BLUE, "resign").result, { winner: RED, reason: "resign" });
  assert.equal(legalMoves(endGame(pos, RED, "resign")).length, 0);
});

test("move names show piece, squares and kind", () => {
  const pos = position(board({ ...KINGS, e3: "A", e6: "i" }));
  assert.equal(moveName(pos, find(pos, "e3", "e6", "fire")), "A e3*e6");
  assert.equal(isLegal(pos, find(pos, "e3", "e6", "fire")), true);
});
