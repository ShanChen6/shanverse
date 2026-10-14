// Pure Nonogram rules. No React, no DOM: everything here is unit-tested.
//
// A picture is a grid of filled and empty cells, row by row. Its clues list
// the lengths of the runs of filled cells in each row and column.
//
// The line solver deduces, one row or column at a time, which cells must be
// filled or empty given the clue and what is already known, and repeats
// until nothing changes: exactly how a person solves without guessing. A
// picture the line solver finishes has one solution and never needs a guess,
// which is the bar every puzzle in the game has to clear.

export type Picture = { width: number; height: number; /** true = filled, row by row. */ cells: boolean[] };

/** What the player has put in a cell. */
export const EMPTY = 0;
export const FILLED = 1;
export const CROSSED = 2;
export type Mark = typeof EMPTY | typeof FILLED | typeof CROSSED;

/** What the solver knows about a cell. */
const UNKNOWN = -1;
const NO = 0;
const YES = 1;
type Known = typeof UNKNOWN | typeof NO | typeof YES;

/** Reads a picture drawn with `#` (filled) and `.` (empty), one string per row. */
export function parsePicture(rows: readonly string[]): Picture {
  const lines = rows.map((row) => row.trim()).filter(Boolean);
  if (!lines.length) throw new Error("A picture needs at least one row");
  const width = lines[0].length;
  const cells: boolean[] = [];
  lines.forEach((line, y) => {
    if (line.length !== width) throw new Error(`Row ${y + 1} has ${line.length} cells, expected ${width}`);
    for (const ch of line) {
      if (ch !== "#" && ch !== ".") throw new Error(`Unknown character "${ch}" in row ${y + 1}`);
      cells.push(ch === "#");
    }
  });
  return { width, height: lines.length, cells };
}

/** Run lengths of filled cells, e.g. [1,1,0,1,1,1] → [2,3]. An empty line has no runs. */
export function runs(line: readonly boolean[]): number[] {
  const out: number[] = [];
  let run = 0;
  for (const filled of line) {
    if (filled) run++;
    else if (run) {
      out.push(run);
      run = 0;
    }
  }
  if (run) out.push(run);
  return out;
}

export const row = <T,>(cells: readonly T[], width: number, y: number) => cells.slice(y * width, y * width + width);
export const column = <T,>(cells: readonly T[], width: number, height: number, x: number) =>
  Array.from({ length: height }, (_, y) => cells[y * width + x]);

export type Clues = { rows: number[][]; cols: number[][] };

export function cluesOf(picture: Picture): Clues {
  const { width, height, cells } = picture;
  return {
    rows: Array.from({ length: height }, (_, y) => runs(row(cells, width, y))),
    cols: Array.from({ length: width }, (_, x) => runs(column(cells, width, height, x))),
  };
}

export type LineState = "open" | "done" | "over";

/**
 * How a row or column looks against its clue, from the filled cells only:
 * "done" when its runs match the clue exactly (the clue fades), "over" when
 * it has more filled cells than the clue allows or a run longer than any in
 * the clue (the clue turns red), otherwise "open". "done" means the clue is
 * matched, not that every cell is where the picture has it.
 */
export function lineState(clue: readonly number[], filled: readonly boolean[]): LineState {
  const have = runs(filled);
  const total = have.reduce((sum, n) => sum + n, 0);
  const allowed = clue.reduce((sum, n) => sum + n, 0);
  const longest = Math.max(0, ...clue);
  if (total > allowed || have.some((n) => n > longest)) return "over";
  if (have.length === clue.length && have.every((n, i) => n === clue[i])) return "done";
  return "open";
}

export const filledOf = (marks: readonly Mark[]) => marks.map((mark) => mark === FILLED);

/** True when every row and column matches its clue; with a unique solution, that is the picture. */
export function isSolved(clues: Clues, marks: readonly Mark[], width: number, height: number): boolean {
  const filled = filledOf(marks);
  return (
    clues.rows.every((clue, y) => lineState(clue, row(filled, width, y)) === "done") &&
    clues.cols.every((clue, x) => lineState(clue, column(filled, width, height, x)) === "done")
  );
}

/**
 * Everything one clue says about one line, given what is known. Returns the
 * line with every forced cell set, or null if no placement of the runs fits
 * (the known cells contradict the clue).
 *
 * fits(i, j): runs j.. can be placed in cells i.. . Then walk the placements
 * that fit from the start and note, for each cell, whether it can be filled
 * and whether it can be empty.
 */
export function solveLine(clue: readonly number[], line: readonly Known[]): Known[] | null {
  const n = line.length;
  const k = clue.length;
  const memo = new Map<number, boolean>();
  const fits = (i: number, j: number): boolean => {
    if (i >= n) return j === k;
    const key = i * (k + 1) + j;
    const hit = memo.get(key);
    if (hit !== undefined) return hit;
    let ok = false;
    // Cell i empty.
    if (line[i] !== YES && fits(i + 1, j)) ok = true;
    // Run j starts at cell i.
    if (!ok && j < k && blockFits(i, clue[j])) ok = fits(Math.min(i + clue[j] + 1, n), j + 1);
    memo.set(key, ok);
    return ok;
  };
  const blockFits = (i: number, len: number) => {
    if (i + len > n) return false;
    for (let c = i; c < i + len; c++) if (line[c] === NO) return false;
    return i + len === n || line[i + len] !== YES;
  };

  if (!fits(0, 0)) return null;

  const canFill = new Array<boolean>(n).fill(false);
  const canEmpty = new Array<boolean>(n).fill(false);
  const seen = new Set<number>();
  const stack: [number, number][] = [[0, 0]];
  while (stack.length) {
    const [i, j] = stack.pop() as [number, number];
    if (i >= n) continue;
    const key = i * (k + 1) + j;
    if (seen.has(key)) continue;
    seen.add(key);
    if (line[i] !== YES && fits(i + 1, j)) {
      canEmpty[i] = true;
      stack.push([i + 1, j]);
    }
    if (j < k && blockFits(i, clue[j])) {
      const next = Math.min(i + clue[j] + 1, n);
      if (fits(next, j + 1)) {
        for (let c = i; c < i + clue[j]; c++) canFill[c] = true;
        if (i + clue[j] < n) canEmpty[i + clue[j]] = true;
        stack.push([next, j + 1]);
      }
    }
  }

  const out: Known[] = [];
  for (let c = 0; c < n; c++) {
    if (!canFill[c] && !canEmpty[c]) return null;
    out.push(canFill[c] && canEmpty[c] ? UNKNOWN : canFill[c] ? YES : NO);
  }
  return out;
}

export type SolveResult = {
  /** -1 unknown, 0 empty, 1 filled. */
  grid: Known[];
  solved: boolean;
  contradiction: boolean;
};

/** Line solving to a fixed point, from `start` (defaults to all unknown). */
export function solveByLines(clues: Clues, width: number, height: number, start?: readonly Known[]): SolveResult {
  const grid: Known[] = start ? start.slice() : new Array<Known>(width * height).fill(UNKNOWN);
  // Lines to look at: rows 0..h-1, then columns as h..h+w-1.
  const dirty = new Set<number>(Array.from({ length: height + width }, (_, i) => i));
  while (dirty.size) {
    const [lineId] = dirty;
    dirty.delete(lineId);
    const isRow = lineId < height;
    const index = isRow ? lineId : lineId - height;
    const cellsOf = isRow
      ? Array.from({ length: width }, (_, x) => index * width + x)
      : Array.from({ length: height }, (_, y) => y * width + index);
    const solved = solveLine(isRow ? clues.rows[index] : clues.cols[index], cellsOf.map((c) => grid[c]));
    if (!solved) return { grid, solved: false, contradiction: true };
    solved.forEach((value, i) => {
      const cell = cellsOf[i];
      if (value !== UNKNOWN && grid[cell] === UNKNOWN) {
        grid[cell] = value;
        // The crossing line can now learn something.
        dirty.add(isRow ? height + (cell % width) : Math.floor(cell / width));
      }
    });
  }
  return { grid, solved: grid.every((value) => value !== UNKNOWN), contradiction: false };
}

/** True when the line solver alone finishes the picture from nothing: one solution, no guessing. */
export function isLineSolvable(picture: Picture): boolean {
  const result = solveByLines(cluesOf(picture), picture.width, picture.height);
  return result.solved && result.grid.every((value, i) => (value === YES) === picture.cells[i]);
}

export type Hint =
  | { kind: "line"; axis: "row" | "col"; index: number }
  | { kind: "mistake" }
  | { kind: "solved" };

/**
 * A nudge that keeps the solving to the player: a row or column where the
 * marks already on the board let one more cell be deduced. Filled cells and
 * crosses count as known; blank cells as unknown. Lines that give a new
 * filled cell are preferred, then the one giving the most cells.
 *
 * If no line gives anything and the picture is not done, or a line
 * contradicts its clue, some mark is wrong: since the puzzle is line
 * solvable, correct marks always leave a deduction to make. The hint says
 * so without saying which cell.
 */
export function hint(clues: Clues, marks: readonly Mark[], width: number, height: number): Hint {
  if (isSolved(clues, marks, width, height)) return { kind: "solved" };
  const known: Known[] = marks.map((mark) => (mark === FILLED ? YES : mark === CROSSED ? NO : UNKNOWN));
  let best: { axis: "row" | "col"; index: number; filled: number; total: number } | null = null;
  const consider = (axis: "row" | "col", index: number, cells: number[], clue: number[]) => {
    const before = cells.map((c) => known[c]);
    const after = solveLine(clue, before);
    if (!after) return false;
    let filled = 0;
    let total = 0;
    after.forEach((value, i) => {
      if (before[i] === UNKNOWN && value !== UNKNOWN) {
        total++;
        if (value === YES) filled++;
      }
    });
    if (!total) return true;
    const givesFill = filled > 0;
    const better =
      !best ||
      (givesFill && best.filled === 0) ||
      (givesFill === best.filled > 0 && total > best.total);
    if (better) best = { axis, index, filled, total };
    return true;
  };
  for (let y = 0; y < height; y++) {
    if (!consider("row", y, Array.from({ length: width }, (_, x) => y * width + x), clues.rows[y])) return { kind: "mistake" };
  }
  for (let x = 0; x < width; x++) {
    if (!consider("col", x, Array.from({ length: height }, (_, y) => y * width + x), clues.cols[x])) return { kind: "mistake" };
  }
  if (!best) return { kind: "mistake" };
  const { axis, index } = best as { axis: "row" | "col"; index: number };
  return { kind: "line", axis, index };
}

/** Small, fast seeded random numbers (mulberry32), so a seed rebuilds its puzzle. */
export function createRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const SIZES = [5, 10, 15] as const;
export type Size = (typeof SIZES)[number];

/**
 * Share of filled cells in random pictures. Sparser is harder: measured, at
 * 55% about half of random 10×10 and 15×15 pictures are line solvable (the
 * rest are thrown away), and making one still takes a millisecond or two.
 */
const DENSITY: Record<Size, number> = { 5: 0.6, 10: 0.55, 15: 0.55 };

/**
 * A random picture of this size that the line solver finishes, for the
 * endless mode. Cells are filled with a set probability; pictures that
 * need a guess, or have an all-blank row or column, are thrown away and the
 * next one from the same seed is tried, so a seed always gives the same
 * puzzle. `tries` says how many were thrown away, for tuning.
 */
export function randomPicture(size: Size, seed: number): Picture & { tries: number } {
  const random = createRng(seed);
  const density = DENSITY[size];
  for (let tries = 0; ; tries++) {
    const cells = Array.from({ length: size * size }, () => random() < density);
    const picture = { width: size, height: size, cells };
    const clues = cluesOf(picture);
    if (clues.rows.some((clue) => !clue.length) || clues.cols.some((clue) => !clue.length)) continue;
    if (isLineSolvable(picture)) return { ...picture, tries };
  }
}
