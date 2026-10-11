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

export type MoveResult = {
  state: SokobanState;
  moved: boolean;
  pushed: boolean;
  /** Walked into a wall or a crate that cannot move. */
  blocked: boolean;
};

const DELTA: Record<Direction, [number, number]> = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};

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
    return { state: { ...turned, player: target, moves: state.moves + 1 }, moved: true, pushed: false, blocked: false };
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
  };
}

export const isSolved = (state: Pick<SokobanState, "crates" | "goals">) =>
  state.crates.every((crate) => state.goals.includes(crate));

export const cratesOnGoals = (state: Pick<SokobanState, "crates" | "goals">) =>
  state.crates.filter((crate) => state.goals.includes(crate)).length;

/**
 * Crates that can never move again because they sit in a corner of walls
 * and are not on a pad. Only certain dead ends are reported, never guesses,
 * so the game can safely tell the player to restart.
 */
export function stuckCrates(state: SokobanState): number[] {
  const wall = (cell: number) => cell === -1 || state.walls[cell];
  return state.crates.filter((crate) => {
    if (state.goals.includes(crate)) return false;
    const up = wall(step(state, crate, "up"));
    const down = wall(step(state, crate, "down"));
    const left = wall(step(state, crate, "left"));
    const right = wall(step(state, crate, "right"));
    return (up || down) && (left || right);
  });
}

/** Stars for a solved level: at par or close to it earns three. */
export function rating(moves: number, par: number): 1 | 2 | 3 {
  if (moves <= Math.ceil(par * 1.15)) return 3;
  if (moves <= Math.ceil(par * 1.6)) return 2;
  return 1;
}
