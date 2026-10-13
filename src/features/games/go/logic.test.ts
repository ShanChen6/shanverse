import assert from "node:assert/strict";
import test from "node:test";

import { BLACK, KOMI, PASS, WHITE, isEyeOf, isLegal, isOver, newGame, parsePoint, play, playInPlace, pointName, replay, scoreArea, singleLiberty, starPoints, type Position } from "./logic";

/** Builds a position from rows of "." "X" (black) "O" (white). */
function fromRows(rows: string[], toPlay = BLACK as typeof BLACK | typeof WHITE): Position {
  const size = rows.length;
  const pos = newGame(size, "full");
  rows.forEach((row, y) => [...row].forEach((ch, x) => {
    pos.board[y * size + x] = ch === "X" ? BLACK : ch === "O" ? WHITE : 0;
  }));
  pos.toPlay = toPlay;
  return pos;
}

const at = (pos: Position, name: string) => parsePoint(name, pos.size);

test("coordinates skip the letter I and count rows from the bottom", () => {
  assert.equal(pointName(0, 9), "A9");
  assert.equal(pointName(80, 9), "J1");
  assert.equal(parsePoint("J1", 9), 80);
  assert.equal(parsePoint("D4", 19), 15 * 19 + 3);
  assert.ok(Number.isNaN(parsePoint("I5", 9)));
  assert.equal(pointName(PASS, 9), "pass");
});

test("star points match the usual boards", () => {
  assert.equal(starPoints(9).length, 5);
  assert.equal(starPoints(13).length, 9);
  assert.deepEqual(starPoints(19).map((p) => pointName(p, 19)).sort(), ["D10", "D16", "D4", "K10", "K16", "K4", "Q10", "Q16", "Q4"].sort());
});

test("black and white alternate and stones stay put", () => {
  let pos = newGame(9, "full");
  pos = play(pos, parsePoint("E5", 9)).position;
  assert.equal(pos.toPlay, WHITE);
  assert.equal(pos.board[parsePoint("E5", 9)], BLACK);
  const occupied = play(pos, parsePoint("E5", 9));
  assert.equal(occupied.legal, false);
  assert.equal(occupied.position, pos);
});

test("captures a single stone and a group, counting prisoners", () => {
  const pos = fromRows([
    ".X.......",
    "XOX......",
    ".........",
    ".........",
    ".........",
    ".........",
    ".........",
    ".........",
    ".........",
  ]);
  const result = play(pos, at(pos, "B7"));
  assert.equal(result.captured, 1);
  assert.equal(result.position.board[at(pos, "B8")], 0);
  assert.equal(result.position.captures[BLACK], 1);

});

test("a group in the corner is captured when its last liberty is filled", () => {
  const pos = fromRows([
    "OO.X.....",
    "XXXX.....",
    ".........",
    ".........",
    ".........",
    ".........",
    ".........",
    ".........",
    ".........",
  ]);
  assert.equal(singleLiberty(pos.board, 9, 0), 2);
  const result = play(pos, 2);
  assert.equal(result.captured, 2);
  assert.equal(result.position.board[0], 0);
  assert.equal(result.position.board[1], 0);
});

test("suicide is illegal, but filling a liberty that captures is fine", () => {
  const suicide = fromRows([
    ".X.......",
    "X........",
    ".........",
    ".........",
    ".........",
    ".........",
    ".........",
    ".........",
    ".........",
  ], WHITE);
  assert.equal(isLegal(suicide, 0), false);
  assert.equal(play(suicide, 0).legal, false);

  const capture = fromRows([
    ".XO......",
    "XO.......",
    "O........",
    ".........",
    ".........",
    ".........",
    ".........",
    ".........",
    ".........",
  ], WHITE);
  // A9 has no liberties for White, but it captures both black stones.
  assert.equal(isLegal(capture, 0), true);
  assert.equal(play(capture, 0).captured, 2);
});

test("simple ko: the stone cannot be taken back straight away", () => {
  const pos = fromRows([
    ".XO......",
    "XO.O.....",
    ".XO......",
    ".........",
    ".........",
    ".........",
    ".........",
    ".........",
    ".........",
  ]);
  // Black takes at C8, capturing B8.
  const take = play(pos, at(pos, "C8"));
  assert.equal(take.captured, 1);
  const koPoint = at(pos, "B8");
  assert.equal(take.position.ko, koPoint);
  assert.equal(isLegal(take.position, koPoint), false);
  // After a move elsewhere the ko can be retaken.
  const away = play(take.position, at(pos, "H2")).position;
  const reply = play(away, at(pos, "G2")).position;
  assert.equal(isLegal(reply, koPoint), true);
});

test("capturing two stones is not ko", () => {
  const pos = fromRows([
    "XOO.X....",
    ".XXOX....",
    "...X.....",
    ".........",
    ".........",
    ".........",
    ".........",
    ".........",
    ".........",
  ], WHITE);
  const result = play(pos, at(pos, "A8"));
  assert.equal(result.captured, 1);
  assert.equal(result.position.ko, -1);
});

test("two passes end a full game; capture mode ends at the first capture", () => {
  let pos = newGame(9, "full");
  pos = play(pos, PASS).position;
  assert.equal(isOver(pos), false);
  pos = play(pos, PASS).position;
  assert.equal(isOver(pos), true);
  assert.equal(isLegal(pos, 0), false);

  const capture = newGame(9, "capture");
  assert.equal(capture.board.filter((v) => v !== 0).length, 4, "starts from the crosscut");
  // Black ataris and captures a white crosscut stone: D6 (white) has liberties D7 and C6.
  let game = capture;
  for (const name of ["D7", "A1", "C6"]) game = play(game, parsePoint(name, 9)).position;
  assert.equal(game.winner, BLACK);
  assert.equal(isOver(game), true);
});

test("area scoring counts stones, surrounded points and komi", () => {
  const pos = fromRows([
    "..X.O....",
    "..X.O....",
    "..X.O....",
    "..X.O....",
    "..X.O....",
    "..X.O....",
    "..X.O....",
    "..X.O....",
    "..X.O....",
  ]);
  const score = scoreArea(pos.board, 9);
  assert.equal(score.black, 27);
  assert.equal(score.white, 9 + 36 + KOMI);
  assert.equal(score.owner[3], 0, "the column between them is neutral");
  // A dead white stone inside black's area counts for black once removed.
  pos.board[0] = WHITE;
  assert.equal(scoreArea(pos.board, 9).black, 9, "a live-looking intruder makes the area neutral");
  assert.equal(scoreArea(pos.board, 9, [0]).black, 27);
});

test("eyes: true eyes are recognised, false eyes are not", () => {
  const pos = fromRows([
    ".X.......",
    "XX.......",
    ".........",
    ".XXX.....",
    ".X.X.....",
    ".XXO.....",
    ".........",
    ".........",
    ".........",
  ]);
  assert.equal(isEyeOf(pos, 0, BLACK), true, "corner eye");
  assert.equal(isEyeOf(pos, at(pos, "C5"), BLACK), true, "one enemy diagonal is fine in the middle");
  pos.board[at(pos, "B6")] = WHITE;
  assert.equal(isEyeOf(pos, at(pos, "C5"), BLACK), false);
});

test("replay rebuilds a game and rejects illegal records", () => {
  const moves = ["E5", "E4", "D4", "F5"].map((n) => parsePoint(n, 9));
  const pos = replay(9, "full", moves);
  assert.ok(pos);
  assert.equal(pos.moveNumber, 4);
  assert.equal(replay(9, "full", [40, 40]), null);
  const direct = newGame(9, "full");
  for (const m of moves) playInPlace(direct, m);
  assert.deepEqual([...direct.board], [...pos.board]);
});
