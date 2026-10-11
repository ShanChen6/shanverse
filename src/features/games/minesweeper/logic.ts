// Pure Minesweeper rules. No React, no DOM: everything here is unit-tested.
//
// Mines are placed on the first reveal, never on the clicked cell or its
// neighbours, so the first click always opens an area.

export type DifficultyId = "easy" | "medium" | "hard";

export type Difficulty = { id: DifficultyId; rows: number; cols: number; mines: number };

export const DIFFICULTIES: Record<DifficultyId, Difficulty> = {
  easy: { id: "easy", rows: 9, cols: 9, mines: 10 },
  medium: { id: "medium", rows: 16, cols: 16, mines: 40 },
  hard: { id: "hard", rows: 16, cols: 30, mines: 99 },
};

export type CellState = "hidden" | "revealed" | "flagged";

export type Cell = {
  mine: boolean;
  /** Number of mines in the 8 neighbouring cells. */
  adjacent: number;
  state: CellState;
};

export type Status = "ready" | "playing" | "won" | "lost";

export type GameState = {
  rows: number;
  cols: number;
  mines: number;
  cells: Cell[];
  status: Status;
  /** The mine that ended the game. */
  exploded: number | null;
  /** Revealed safe cells, kept so a win check is O(1). */
  revealed: number;
};

/** Returns a number in [0, 1). Injected so tests can be deterministic. */
export type Random = () => number;

export function createGame({ rows, cols, mines }: Pick<Difficulty, "rows" | "cols" | "mines">): GameState {
  if (mines >= rows * cols) throw new Error("Too many mines for the board");
  return {
    rows,
    cols,
    mines,
    cells: Array.from({ length: rows * cols }, () => ({ mine: false, adjacent: 0, state: "hidden" as const })),
    status: "ready",
    exploded: null,
    revealed: 0,
  };
}

export function neighbours(state: Pick<GameState, "rows" | "cols">, index: number): number[] {
  const row = Math.floor(index / state.cols);
  const col = index % state.cols;
  const result: number[] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      const r = row + dr;
      const c = col + dc;
      if (r >= 0 && r < state.rows && c >= 0 && c < state.cols) result.push(r * state.cols + c);
    }
  }
  return result;
}

/** Places mines away from `safeIndex` and its neighbours, then counts. */
export function placeMines(state: GameState, safeIndex: number, random: Random = Math.random): GameState {
  const total = state.rows * state.cols;
  const keepClear = new Set([safeIndex, ...neighbours(state, safeIndex)]);
  // Tiny boards may not have room to keep the whole area clear; then only the clicked cell is protected.
  const forbidden = total - keepClear.size >= state.mines ? keepClear : new Set([safeIndex]);

  const candidates: number[] = [];
  for (let i = 0; i < total; i++) if (!forbidden.has(i)) candidates.push(i);
  // Partial Fisher–Yates: the first `mines` slots end up uniformly random.
  for (let i = 0; i < state.mines; i++) {
    const j = i + Math.floor(random() * (candidates.length - i));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  const cells = state.cells.map((cell) => ({ ...cell, mine: false, adjacent: 0 }));
  for (const index of candidates.slice(0, state.mines)) cells[index].mine = true;
  for (let i = 0; i < total; i++) {
    cells[i].adjacent = neighbours(state, i).reduce((sum, n) => sum + (cells[n].mine ? 1 : 0), 0);
  }
  return { ...state, cells };
}

function finishLost(state: GameState, cells: Cell[], exploded: number): GameState {
  // Show every mine; wrong flags stay flagged so the UI can mark them.
  const shown = cells.map((cell) => (cell.mine && cell.state === "hidden" ? { ...cell, state: "revealed" as const } : cell));
  return { ...state, cells: shown, status: "lost", exploded };
}

function finishIfWon(state: GameState): GameState {
  if (state.revealed !== state.rows * state.cols - state.mines) return state;
  const cells = state.cells.map((cell) => (cell.mine ? { ...cell, state: "flagged" as const } : cell));
  return { ...state, cells, status: "won" };
}

/** Opens one cell. Empty cells (0 neighbours) flood-open their area. */
export function reveal(state: GameState, index: number, random: Random = Math.random): GameState {
  if (state.status === "won" || state.status === "lost") return state;
  if (index < 0 || index >= state.cells.length || state.cells[index].state !== "hidden") return state;

  let current = state;
  if (current.status === "ready") current = { ...placeMines(current, index, random), status: "playing" };

  const cells = current.cells.slice();
  if (cells[index].mine) return finishLost(current, cells, index);

  let revealed = current.revealed;
  const stack = [index];
  while (stack.length) {
    const i = stack.pop() as number;
    const cell = cells[i];
    if (cell.state !== "hidden" || cell.mine) continue;
    cells[i] = { ...cell, state: "revealed" };
    revealed++;
    if (cell.adjacent === 0) for (const n of neighbours(current, i)) if (cells[n].state === "hidden") stack.push(n);
  }
  return finishIfWon({ ...current, cells, revealed });
}

export function toggleFlag(state: GameState, index: number): GameState {
  if (state.status === "won" || state.status === "lost") return state;
  const cell = state.cells[index];
  if (!cell || cell.state === "revealed") return state;
  const cells = state.cells.slice();
  cells[index] = { ...cell, state: cell.state === "flagged" ? "hidden" : "flagged" };
  return { ...state, cells };
}

/**
 * Clicking an opened number whose flags already match it opens the remaining
 * neighbours ("chording"). A wrong flag means a mine gets opened.
 */
export function chord(state: GameState, index: number, random: Random = Math.random): GameState {
  if (state.status !== "playing") return state;
  const cell = state.cells[index];
  if (!cell || cell.state !== "revealed" || cell.adjacent === 0) return state;
  const around = neighbours(state, index);
  const flags = around.filter((n) => state.cells[n].state === "flagged").length;
  if (flags !== cell.adjacent) return state;

  let next = state;
  for (const n of around) {
    if (next.cells[n].state === "hidden") next = reveal(next, n, random);
    if (next.status === "lost") break;
  }
  return next;
}

/** Reveal a hidden cell, or chord an opened number. What a plain click does. */
export function open(state: GameState, index: number, random: Random = Math.random): GameState {
  const cell = state.cells[index];
  if (!cell) return state;
  return cell.state === "revealed" ? chord(state, index, random) : reveal(state, index, random);
}

export const flagsPlaced = (state: GameState) => state.cells.filter((cell) => cell.state === "flagged").length;

/** Mines left to find, as classic counters show it (can go negative). */
export const minesLeft = (state: GameState) => (state.status === "won" ? 0 : state.mines - flagsPlaced(state));
