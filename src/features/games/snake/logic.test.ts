import assert from "node:assert/strict";
import test from "node:test";

import { GRID, createSnake, placeFood, step, tickMs, turn, type SnakeState } from "./logic";

const state = (snake: [number, number][], extra: Partial<SnakeState> = {}): SnakeState => ({
  snake: snake.map(([x, y]) => ({ x, y })),
  direction: "right",
  queue: [],
  food: { x: 0, y: 0 },
  score: 0,
  over: false,
  won: false,
  size: 6,
  ...extra,
});

test("a new game has a 3-long snake heading right and food off the snake", () => {
  const game = createSnake();
  assert.equal(game.size, GRID);
  assert.equal(game.snake.length, 3);
  assert.equal(game.direction, "right");
  assert.ok(game.food);
  assert.ok(!game.snake.some((p) => p.x === game.food!.x && p.y === game.food!.y));
});

test("moves one cell per step and keeps its length", () => {
  const next = step(state([[2, 2], [1, 2], [0, 2]]));
  assert.deepEqual(next.snake, [{ x: 3, y: 2 }, { x: 2, y: 2 }, { x: 1, y: 2 }]);
});

test("eating grows the snake, scores and places new food", () => {
  const next = step(state([[2, 2], [1, 2]], { food: { x: 3, y: 2 } }), () => 0);
  assert.equal(next.snake.length, 3);
  assert.equal(next.score, 1);
  assert.ok(next.food && !next.snake.some((p) => p.x === next.food!.x && p.y === next.food!.y));
});

test("hitting a wall ends the game", () => {
  assert.equal(step(state([[5, 2], [4, 2]])).over, true);
  assert.equal(step(state([[0, 0], [0, 1]], { direction: "up" })).over, true);
});

test("hitting the body ends the game", () => {
  const curled = state([[2, 2], [2, 3], [3, 3], [3, 2], [3, 1]], { direction: "right" });
  assert.equal(step(curled).over, true);
});

test("moving into the cell the tail is leaving is allowed", () => {
  const loop = state([[2, 2], [2, 3], [3, 3], [3, 2]], { direction: "right" });
  const next = step(loop);
  assert.equal(next.over, false);
  assert.deepEqual(next.snake[0], { x: 3, y: 2 });
});

test("cannot reverse straight into itself", () => {
  const game = state([[2, 2], [1, 2], [0, 2]]);
  assert.equal(turn(game, "left"), game);
  assert.equal(turn(game, "right"), game);
  assert.deepEqual(turn(game, "up").queue, ["up"]);
});

test("quick double turns are queued and applied one per step", () => {
  let game = turn(turn(state([[2, 2], [1, 2], [0, 2]]), "up"), "left");
  assert.deepEqual(game.queue, ["up", "left"]);
  game = step(game);
  assert.deepEqual(game.snake[0], { x: 2, y: 1 });
  game = step(game);
  assert.deepEqual(game.snake[0], { x: 1, y: 1 });
  assert.equal(game.direction, "left");
  assert.deepEqual(turn(turn(turn(state([[2, 2], [1, 2]]), "up"), "left"), "down").queue, ["up", "left"]);
});

test("a reversal relative to a queued turn is rejected", () => {
  const game = turn(state([[2, 2], [1, 2], [0, 2]]), "up");
  assert.deepEqual(turn(game, "down").queue, ["up"]);
});

test("filling the board wins", () => {
  // A 2x2 board with a 3-long snake: eating the last cell leaves no room for food.
  const game = state([[0, 1], [0, 0], [1, 0]], { size: 2, direction: "right", food: { x: 1, y: 1 } });
  const next = step(game);
  assert.equal(next.won, true);
  assert.equal(next.over, true);
  assert.equal(placeFood(next.snake, 2), null);
});

test("speed increases with score but has a floor", () => {
  assert.equal(tickMs(0), 150);
  assert.ok(tickMs(5) < tickMs(0));
  assert.equal(tickMs(100), 65);
});
