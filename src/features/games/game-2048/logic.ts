// Pure 2048 rules. No React, no DOM: everything here is unit-tested.
//
// Tiles keep a stable `id` so the UI can animate them sliding between cells.
// When two tiles merge, the surviving tile gets a new id and remembers the
// ids it was made from, so the UI can play a "pop" on the merged result.

export const BOARD_SIZE = 4;
export const WIN_VALUE = 2048;

export type Direction = "up" | "down" | "left" | "right";

export type Tile = {
  id: number;
  value: number;
  row: number;
  col: number;
  /** True only on the turn the tile appeared. */
  isNew?: boolean;
  /** Ids of the two tiles merged into this one, on the turn it was created. */
  mergedFrom?: [number, number];
};

export type GameState = {
  tiles: Tile[];
  score: number;
  /** Next id to hand out; kept in state so saved games resume correctly. */
  nextId: number;
  /** A 2048 tile has been reached at least once. */
  won: boolean;
  /** The player chose to keep going after winning. */
  keepPlaying: boolean;
  over: boolean;
};

export type MoveResult = {
  state: GameState;
  moved: boolean;
  gained: number;
};

/** Returns a number in [0, 1). Injected so tests can be deterministic. */
export type Random = () => number;

const inBounds = (n: number) => n >= 0 && n < BOARD_SIZE;

function emptyCells(tiles: Tile[]): Array<{ row: number; col: number }> {
  const taken = new Set(tiles.map((tile) => tile.row * BOARD_SIZE + tile.col));
  const cells: Array<{ row: number; col: number }> = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (!taken.has(row * BOARD_SIZE + col)) cells.push({ row, col });
    }
  }
  return cells;
}

/** Adds one tile (90% a 2, 10% a 4) on a random empty cell. */
export function addRandomTile(state: GameState, random: Random = Math.random): GameState {
  const cells = emptyCells(state.tiles);
  if (!cells.length) return state;
  const cell = cells[Math.min(cells.length - 1, Math.floor(random() * cells.length))];
  const value = random() < 0.9 ? 2 : 4;
  return {
    ...state,
    tiles: [...state.tiles, { id: state.nextId, value, ...cell, isNew: true }],
    nextId: state.nextId + 1,
  };
}

export function createGame(random: Random = Math.random): GameState {
  const empty: GameState = { tiles: [], score: 0, nextId: 1, won: false, keepPlaying: false, over: false };
  return addRandomTile(addRandomTile(empty, random), random);
}

/** Cells of one line, ordered from the side tiles slide towards. */
function line(direction: Direction, index: number): Array<{ row: number; col: number }> {
  return Array.from({ length: BOARD_SIZE }, (_, step) => {
    switch (direction) {
      case "left":
        return { row: index, col: step };
      case "right":
        return { row: index, col: BOARD_SIZE - 1 - step };
      case "up":
        return { row: step, col: index };
      case "down":
        return { row: BOARD_SIZE - 1 - step, col: index };
    }
  });
}

export function canMove(tiles: Tile[]): boolean {
  if (tiles.length < BOARD_SIZE * BOARD_SIZE) return true;
  const grid = new Map(tiles.map((tile) => [tile.row * BOARD_SIZE + tile.col, tile.value]));
  for (const tile of tiles) {
    for (const [dr, dc] of [[0, 1], [1, 0]] as const) {
      const row = tile.row + dr;
      const col = tile.col + dc;
      if (inBounds(row) && inBounds(col) && grid.get(row * BOARD_SIZE + col) === tile.value) return true;
    }
  }
  return false;
}

/**
 * Slides every tile towards `direction`, merging equal neighbours once per
 * move. Adds a new random tile only when something actually moved.
 */
export function move(state: GameState, direction: Direction, random: Random = Math.random): MoveResult {
  if (state.over) return { state, moved: false, gained: 0 };

  const byCell = new Map(state.tiles.map((tile) => [tile.row * BOARD_SIZE + tile.col, tile]));
  const next: Tile[] = [];
  let nextId = state.nextId;
  let gained = 0;
  let moved = false;

  for (let index = 0; index < BOARD_SIZE; index++) {
    const cells = line(direction, index);
    const current = cells
      .map((cell) => byCell.get(cell.row * BOARD_SIZE + cell.col))
      .filter((tile): tile is Tile => Boolean(tile));

    let target = 0;
    for (let i = 0; i < current.length; i++) {
      const tile = current[i];
      const following = current[i + 1];
      const cell = cells[target];

      if (following && following.value === tile.value) {
        const value = tile.value * 2;
        next.push({ id: nextId++, value, ...cell, mergedFrom: [tile.id, following.id] });
        gained += value;
        moved = true;
        i++;
      } else {
        if (tile.row !== cell.row || tile.col !== cell.col) moved = true;
        next.push({ id: tile.id, value: tile.value, ...cell });
      }
      target++;
    }
  }

  if (!moved) return { state, moved: false, gained: 0 };

  const won = state.won || next.some((tile) => tile.value >= WIN_VALUE);
  const withTile = addRandomTile(
    { ...state, tiles: next, nextId, score: state.score + gained, won },
    random,
  );
  return { state: { ...withTile, over: !canMove(withTile.tiles) }, moved: true, gained };
}

/** The game is paused on the win screen until the player chooses to continue. */
export const showsWinScreen = (state: GameState) => state.won && !state.keepPlaying;

export const highestTile = (state: GameState) =>
  state.tiles.reduce((max, tile) => Math.max(max, tile.value), 0);

/** Validates a game restored from storage; returns null if it looks wrong. */
export function parseSavedGame(value: unknown): GameState | null {
  if (!value || typeof value !== "object") return null;
  const saved = value as Partial<GameState>;
  if (!Array.isArray(saved.tiles) || typeof saved.score !== "number" || typeof saved.nextId !== "number") return null;

  const seen = new Set<number>();
  const tiles: Tile[] = [];
  for (const raw of saved.tiles as unknown[]) {
    const tile = raw as Partial<Tile>;
    const valid =
      typeof tile?.id === "number" &&
      typeof tile.value === "number" &&
      tile.value >= 2 &&
      Number.isInteger(Math.log2(tile.value)) &&
      Number.isInteger(tile.row) &&
      Number.isInteger(tile.col) &&
      inBounds(tile.row as number) &&
      inBounds(tile.col as number);
    if (!valid) return null;
    const cell = (tile.row as number) * BOARD_SIZE + (tile.col as number);
    if (seen.has(cell)) return null;
    seen.add(cell);
    tiles.push({ id: tile.id as number, value: tile.value as number, row: tile.row as number, col: tile.col as number });
  }
  if (!tiles.length) return null;

  const nextId = Math.max(saved.nextId, ...tiles.map((tile) => tile.id + 1));
  return {
    tiles,
    score: Math.max(0, saved.score),
    nextId,
    won: Boolean(saved.won) || tiles.some((tile) => tile.value >= WIN_VALUE),
    keepPlaying: Boolean(saved.keepPlaying),
    over: !canMove(tiles),
  };
}
