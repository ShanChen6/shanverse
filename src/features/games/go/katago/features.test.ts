import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import { BLACK, WHITE, newGame, parsePoint, play, type Position } from "../logic";
import { NUM_GLOBAL, NUM_META, NUM_SPATIAL, buildFeatures, buildMetadata, calculateArea, inverseRank } from "./features";
import { Network } from "./network";
import { analyse, chooseMove, deadStones } from "./player";

const at = (name: string, size = 9) => parsePoint(name, size);
const plane = (spatial: Float32Array, feature: number, point: number, size = 9) => spatial[feature * size * size + point];
const record = (names: string[], size = 9) => names.map((n) => (n === "pass" ? -1 : at(n, size)));

test("planes: stones from the side to move, liberties, ko and history", () => {
  const moves = record(["E5", "C3", "G7"]);
  const { spatial, global } = buildFeatures(9, "full", moves);
  assert.equal(spatial.length, NUM_SPATIAL * 81);
  assert.equal(global.length, NUM_GLOBAL);
  // White to move: white stones are "own" (plane 1), black are "opponent" (plane 2).
  assert.equal(plane(spatial, 1, at("C3")), 1);
  assert.equal(plane(spatial, 2, at("E5")), 1);
  assert.equal(plane(spatial, 5, at("E5")), 0, "four liberties is not 1-3");
  assert.equal(plane(spatial, 0, 80), 1, "on board");
  assert.equal(plane(spatial, 9, at("G7")), 1, "last move");
  assert.equal(plane(spatial, 10, at("C3")), 1, "move before");
  assert.equal(global[5], 7.5 / 20, "white's own komi");
});

test("planes: a pass shows up in the globals", () => {
  const { global } = buildFeatures(9, "full", record(["E5", "pass"]));
  assert.equal(global[0], 1);
  assert.equal(global[14], 1, "another pass would end the game");
  assert.equal(global[5], -7.5 / 20, "black gives komi");
});

test("ladders: a stone that cannot escape atari is marked", () => {
  // White A1 is in atari; extending to A2 still leaves one liberty, so it is lost.
  // Black B1, white A1, black B2.
  const { spatial } = buildFeatures(9, "full", record(["B1", "A1", "B2"]));
  assert.equal(plane(spatial, 14, at("A1")), 1);
  assert.equal(plane(spatial, 14, at("B1")), 0);
});

test("pass-alive area: a group with two eyes owns its corner", () => {
  const pos: Position = newGame(9, "full");
  const rows = [
    ".X.X.....",
    "XXXX.....",
    ".........",
    ".........",
    ".........",
    ".........",
    ".........",
    "........O",
    ".......O.",
  ];
  rows.forEach((row, y) => [...row].forEach((ch, x) => (pos.board[y * 9 + x] = ch === "X" ? BLACK : ch === "O" ? WHITE : 0)));
  const area = calculateArea(pos.board, 9);
  assert.equal(area[0], BLACK, "eye A9");
  assert.equal(area[2], BLACK, "eye C9");
  assert.equal(area[1], BLACK);
  assert.equal(area[40], 0, "the open middle is nobody's");
  // White's two lone stones are not pass-alive, but the empty corner they wall
  // off still counts as (unsafe) white territory, as in KataGo.
  assert.equal(area[80], WHITE);
});

test("human profile metadata", () => {
  assert.equal(inverseRank("9d"), 1);
  assert.equal(inverseRank("1d"), 9);
  assert.equal(inverseRank("1k"), 10);
  assert.equal(inverseRank("20k"), 29);
  const meta = buildMetadata("5k", 81);
  assert.equal(meta.length, NUM_META);
  assert.equal(meta.slice(6, 6 + 34).filter((v) => v === 1).length, 14);
  assert.equal(meta[153], 1, "KGS source");
});

// The full network check needs the converted network, which is a large file.
const NET = path.join(process.cwd(), "public/go/tianwu-human-b18c384.svgo");

test("network: matches KataGo's own output on reference positions", { skip: !fs.existsSync(NET) }, async () => {
  const buffer = fs.readFileSync(NET);
  const net = await Network.load(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));
  // Reference values from KataGo v1.18 (Eigen backend, fp32, kata-raw-human-nn, rank_5k).
  const cases = [
    { moves: ["F4", "A9", "G5", "H1", "G1", "E7", "E4"], top: "G7", prob: 0.0754, whiteWin: 0.4394 },
    { moves: ["D4", "E4", "C5", "D5", "D6", "E5", "C4", "D3", "E3", "C3", "E6", "F5", "B3", "F3"], top: "E2", prob: 0.9117, whiteWin: 0.3985 },
  ];
  for (const c of cases) {
    const a = analyse(net, 9, "full", record(c.moves), "5k");
    let best = 0;
    for (let p = 0; p < 81; p++) if (a.probs[p] > a.probs[best]) best = p;
    assert.equal(best, at(c.top));
    assert.ok(Math.abs(a.probs[best] - c.prob) < 0.01, `policy ${a.probs[best]} vs ${c.prob}`);
    const whiteWin = a.position.toPlay === WHITE ? a.winrate : 1 - a.winrate;
    assert.ok(Math.abs(whiteWin - c.whiteWin) < 0.01, `win ${whiteWin} vs ${c.whiteWin}`);
    // Sampling always gives a legal move.
    const move = chooseMove(a, 1, () => 0.5);
    assert.equal(play(a.position, move).legal, true);
    assert.ok(Array.isArray(deadStones(a.position, a.ownership, a.position.toPlay)));
  }
});
