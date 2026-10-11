// Pure Snake rules. No React, no canvas: everything here is unit-tested.

export const GRID = 17;

export type Point = { x: number; y: number };
export type Direction = "up" | "down" | "left" | "right";

export type SnakeState = {
  /** Head first. */
  snake: Point[];
  direction: Direction;
  /** Turns pressed faster than the tick, applied one per step. */
  queue: Direction[];
  food: Point | null;
  score: number;
  over: boolean;
  won: boolean;
  size: number;
};

export type Random = () => number;

const VECTORS: Record<Direction, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const OPPOSITE: Record<Direction, Direction> = { up: "down", down: "up", left: "right", right: "left" };

const same = (a: Point, b: Point) => a.x === b.x && a.y === b.y;

export function placeFood(snake: Point[], size: number, random: Random = Math.random): Point | null {
  const taken = new Set(snake.map((p) => p.y * size + p.x));
  const free: Point[] = [];
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (!taken.has(y * size + x)) free.push({ x, y });
  if (!free.length) return null;
  return free[Math.min(free.length - 1, Math.floor(random() * free.length))];
}

export function createSnake(size = GRID, random: Random = Math.random): SnakeState {
  const y = Math.floor(size / 2);
  const x = Math.floor(size / 4) + 2;
  const snake = [{ x, y }, { x: x - 1, y }, { x: x - 2, y }];
  return { snake, direction: "right", queue: [], food: placeFood(snake, size, random), score: 0, over: false, won: false, size };
}

/**
 * Queues a turn. Reversing into yourself and repeating the same direction are
 * ignored; at most two turns wait, so quick "up, left" combos still work.
 */
export function turn(state: SnakeState, direction: Direction): SnakeState {
  if (state.over) return state;
  const last = state.queue.length ? state.queue[state.queue.length - 1] : state.direction;
  if (direction === last || direction === OPPOSITE[last] || state.queue.length >= 2) return state;
  return { ...state, queue: [...state.queue, direction] };
}

/** Advances one tick. Walls and the snake's own body end the game. */
export function step(state: SnakeState, random: Random = Math.random): SnakeState {
  if (state.over) return state;
  const [nextDirection, ...queue] = state.queue.length ? state.queue : [state.direction];
  const vector = VECTORS[nextDirection];
  const head = { x: state.snake[0].x + vector.x, y: state.snake[0].y + vector.y };
  const eating = state.food !== null && same(head, state.food);

  if (head.x < 0 || head.y < 0 || head.x >= state.size || head.y >= state.size) {
    return { ...state, direction: nextDirection, queue, over: true };
  }
  // The tail moves away this tick unless we are growing, so it is not an obstacle.
  const body = eating ? state.snake : state.snake.slice(0, -1);
  if (body.some((part) => same(part, head))) {
    return { ...state, direction: nextDirection, queue, over: true };
  }

  const snake = [head, ...body];
  if (!eating) return { ...state, snake, direction: nextDirection, queue };

  const food = placeFood(snake, state.size, random);
  return {
    ...state,
    snake,
    direction: nextDirection,
    queue,
    food,
    score: state.score + 1,
    over: food === null,
    won: food === null,
  };
}

/** Milliseconds per tick: starts relaxed and speeds up as the snake grows. */
export const tickMs = (score: number) => Math.max(65, 150 - score * 4);
