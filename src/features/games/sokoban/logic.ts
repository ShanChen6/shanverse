// Pure Sokoban rules. No React, no DOM: everything here is unit-tested.
//
// Levels use the standard text format:
//   #  wall          @  player         $  crate
//   .  landing pad   +  player on pad  *  crate on pad
//   (space) floor; anything outside the walls is drawn as empty space.

export type Direction = "up" | "down" | "left" | "right";

export type SokobanState = {
  width: number;
  height: number;
  /** One flag per cell. */
  walls: boolean[];
  /** Cells reachable from the start, i.e. inside the walls. */
  inside: boolean[];
  goals: number[];
  /** Crate positions. The array index is the crate's stable id, for animation. */
  crates: number[];
  player: number;
  facing: Direction;
  moves: number;
  pushes: number;
};

/** Everything needed to take one move back, without storing whole states. */
export type MoveRecord = {
  direction: Direction;
  /** Id of the pushed crate, or -1 for a plain walk. */
  crate: number;
  /** Which way the player faced before the move. */
  facing: Direction;
};

export type MoveResult = {
  state: SokobanState;
  moved: boolean;
  pushed: boolean;
  /** Walked into a wall or a crate that cannot move. */
  blocked: boolean;
  /** Present when the player actually moved, for undo. */
  record?: MoveRecord;
};

/** Undos per attempt. Restarting the level refills them. */
export const UNDO_LIMIT = 5;

const DELTA: Record<Direction, [number, number]> = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};

const OPPOSITE: Record<Direction, Direction> = { up: "down", down: "up", left: "right", right: "left" };
const DIRECTIONS = Object.keys(DELTA) as Direction[];

export function step(state: Pick<SokobanState, "width" | "height">, cell: number, direction: Direction): number {
  const [dx, dy] = DELTA[direction];
  const x = (cell % state.width) + dx;
  const y = Math.floor(cell / state.width) + dy;
  if (x < 0 || y < 0 || x >= state.width || y >= state.height) return -1;
  return y * state.width + x;
}

export function parseLevel(map: readonly string[]): SokobanState {
  const height = map.length;
  const width = Math.max(...map.map((row) => row.length));
  const size = width * height;
  const walls = new Array<boolean>(size).fill(false);
  const goals: number[] = [];
  const crates: number[] = [];
  let player = -1;

  map.forEach((row, y) => {
    for (let x = 0; x < width; x++) {
      const ch = row[x] ?? " ";
      const cell = y * width + x;
      if (ch === "#") walls[cell] = true;
      if (ch === "." || ch === "*" || ch === "+") goals.push(cell);
      if (ch === "$" || ch === "*") crates.push(cell);
      if (ch === "@" || ch === "+") {
        if (player !== -1) throw new Error("Level has more than one player");
        player = cell;
      }
      if (!"#.$*@+ -_".includes(ch)) throw new Error(`Unknown level character "${ch}"`);
    }
  });

  if (player === -1) throw new Error("Level has no player");
  if (!crates.length || crates.length !== goals.length) throw new Error("Level needs as many crates as pads");

  // Flood fill from the player: anything reached is inside the station.
  const inside = new Array<boolean>(size).fill(false);
  const queue = [player];
  inside[player] = true;
  while (queue.length) {
    const cell = queue.pop() as number;
    for (const direction of Object.keys(DELTA) as Direction[]) {
      const next = step({ width, height }, cell, direction);
      if (next === -1) throw new Error("Level is not enclosed by walls");
      if (!walls[next] && !inside[next]) {
        inside[next] = true;
        queue.push(next);
      }
    }
  }
  for (const cell of [...goals, ...crates]) if (!inside[cell]) throw new Error("A crate or pad is outside the walls");

  return { width, height, walls, inside, goals: goals.sort((a, b) => a - b), crates, player, facing: "down", moves: 0, pushes: 0 };
}

/** Walks one cell, pushing a crate if there is exactly one in the way. */
export function move(state: SokobanState, direction: Direction): MoveResult {
  const target = step(state, state.player, direction);
  const turned = state.facing === direction ? state : { ...state, facing: direction };
  if (target === -1 || state.walls[target]) return { state: turned, moved: false, pushed: false, blocked: true };

  const crate = state.crates.indexOf(target);
  if (crate === -1) {
    return {
      state: { ...turned, player: target, moves: state.moves + 1 },
      moved: true,
      pushed: false,
      blocked: false,
      record: { direction, crate: -1, facing: state.facing },
    };
  }

  const beyond = step(state, target, direction);
  if (beyond === -1 || state.walls[beyond] || state.crates.includes(beyond)) {
    return { state: turned, moved: false, pushed: false, blocked: true };
  }
  const crates = state.crates.slice();
  crates[crate] = beyond;
  return {
    state: { ...turned, crates, player: target, moves: state.moves + 1, pushes: state.pushes + 1 },
    moved: true,
    pushed: true,
    blocked: false,
    record: { direction, crate, facing: state.facing },
  };
}

/** Takes back the move described by `record`, which must be the last one made. */
export function undoMove(state: SokobanState, record: MoveRecord): SokobanState {
  const previous = step(state, state.player, OPPOSITE[record.direction]);
  if (previous === -1 || state.walls[previous]) throw new Error("Cannot undo a move that was not made");
  let crates = state.crates;
  if (record.crate !== -1) {
    crates = state.crates.slice();
    // The crate was pushed from where the player now stands.
    crates[record.crate] = state.player;
  }
  return {
    ...state,
    crates,
    player: previous,
    facing: record.facing,
    moves: state.moves - 1,
    pushes: state.pushes - (record.crate === -1 ? 0 : 1),
  };
}

export const isSolved = (state: Pick<SokobanState, "crates" | "goals">) =>
  state.crates.every((crate) => state.goals.includes(crate));

export const cratesOnGoals = (state: Pick<SokobanState, "crates" | "goals">) =>
  state.crates.filter((crate) => state.goals.includes(crate)).length;

type Board = Pick<SokobanState, "width" | "height" | "walls" | "inside" | "goals">;

// Dead squares depend only on the level layout, and every state of a level
// shares the same `walls` array, so they are computed once per level.
const deadCache = new WeakMap<boolean[], boolean[]>();

/**
 * Floor cells a crate can never leave for a pad, even with every other crate
 * gone: corners, and cells along a wall with no pad on it. Found by pulling a
 * crate backwards from every pad; whatever it never reaches is dead.
 */
export function deadSquares(board: Board): boolean[] {
  const cached = deadCache.get(board.walls);
  if (cached) return cached;
  const open = (cell: number) => cell !== -1 && !board.walls[cell] && board.inside[cell];
  const live = new Array<boolean>(board.walls.length).fill(false);
  const queue = board.goals.slice();
  for (const goal of queue) live[goal] = true;
  while (queue.length) {
    const cell = queue.pop() as number;
    for (const direction of DIRECTIONS) {
      // A crate reaches `cell` from `from` when the player stands at `behind`.
      const from = step(board, cell, direction);
      const behind = from === -1 ? -1 : step(board, from, direction);
      if (open(from) && open(behind) && !live[from]) {
        live[from] = true;
        queue.push(from);
      }
    }
  }
  const dead = board.walls.map((wall, cell) => !wall && board.inside[cell] && !live[cell]);
  deadCache.set(board.walls, dead);
  return dead;
}

/**
 * Crates that can never reach a pad again: crates on a dead square, and
 * crates frozen in place off a pad (blocked both ways by walls, dead squares
 * or other frozen crates). Only certain dead ends are reported, never
 * guesses, so the game can safely say the level is lost from here.
 */
export function stuckCrates(state: SokobanState): number[] {
  const dead = deadSquares(state);
  const crates = new Set(state.crates);
  const goals = new Set(state.goals);

  // `fixed` holds crates already assumed immovable further up the chain;
  // they act as walls for the crates next to them.
  const frozen = (cell: number, fixed: ReadonlySet<number>): boolean => {
    const assumed = new Set(fixed).add(cell);
    return blocked(cell, "left", "right", assumed) && blocked(cell, "up", "down", assumed);
  };
  const blocked = (cell: number, a: Direction, b: Direction, fixed: ReadonlySet<number>): boolean => {
    const sides = [step(state, cell, a), step(state, cell, b)];
    if (sides.some((side) => side === -1 || state.walls[side] || fixed.has(side))) return true;
    if (sides.every((side) => dead[side])) return true;
    return sides.some((side) => crates.has(side) && frozen(side, fixed));
  };

  return state.crates.filter((crate) => !goals.has(crate) && (dead[crate] || frozen(crate, new Set())));
}

/** One line of the hint: push this crate (by its starting cell) onto this pad. */
export type PlanStep = { crate: number; goal: number };

/**
 * Turns a full solution into a high-level plan: which crate goes to which
 * pad, in the order the crates are finished. Crates that start on a pad and
 * are never touched are left out.
 */
export function planFromSolution(start: SokobanState, solution: readonly Direction[]): PlanStep[] {
  let state = start;
  const finishedAt = start.crates.map(() => -1);
  solution.forEach((direction, index) => {
    const result = move(state, direction);
    if (!result.moved) throw new Error(`Solution move ${index + 1} is blocked`);
    if (result.record && result.record.crate !== -1) finishedAt[result.record.crate] = index;
    state = result.state;
  });
  if (!isSolved(state)) throw new Error("Solution does not solve the level");
  return start.crates
    .map((cell, id) => ({ id, cell }))
    .filter(({ id }) => finishedAt[id] !== -1)
    .sort((a, b) => finishedAt[a.id] - finishedAt[b.id])
    .map(({ id, cell }) => ({ crate: cell, goal: state.crates[id] }));
}

/** Stars for a solved level: at par or close to it earns three. */
export function rating(moves: number, par: number): 1 | 2 | 3 {
  if (moves <= Math.ceil(par * 1.15)) return 3;
  if (moves <= Math.ceil(par * 1.6)) return 2;
  return 1;
}
