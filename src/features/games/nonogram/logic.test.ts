import assert from "node:assert/strict";
import test from "node:test";

import {
  CROSSED,
  EMPTY,
  FILLED,
  SIZES,
  cluesOf,
  column,
  createRng,
  hint,
  isLineSolvable,
  isSolved,
  lineState,
  parsePicture,
  randomPicture,
  row,
  runs,
  solveByLines,
  solveLine,
  type Mark,
} from "./logic";
import { PICTURES } from "./pictures";

test("parsePicture reads # and . and rejects ragged or unknown rows", () => {
  const picture = parsePicture(["#.#", ".#.", "###"]);
  assert.equal(picture.width, 3);
  assert.equal(picture.height, 3);
  assert.deepEqual(picture.cells, [true, false, true, false, true, false, true, true, true]);
  assert.throws(() => parsePicture(["##", "#"]), /Row 2/);
  assert.throws(() => parsePicture(["#x"]), /Unknown character/);
});

test("runs and clues", () => {
  assert.deepEqual(runs([true, true, false, true, false, false, true, true, true]), [2, 1, 3]);
  assert.deepEqual(runs([false, false]), []);
  const clues = cluesOf(parsePicture(["##.", "..#", "#.#"]));
  assert.deepEqual(clues.rows, [[2], [1], [1, 1]]);
  assert.deepEqual(clues.cols, [[1, 1], [1], [2]]);
});

test("lineState: done when runs match, over when too many or too long, open otherwise", () => {
  assert.equal(lineState([3, 1], [true, true, true, false, true]), "done");
  assert.equal(lineState([3, 1], [true, true, false, false, false]), "open");
  assert.equal(lineState([3, 1], [true, true, true, true, false]), "over", "a run longer than any clue");
  assert.equal(lineState([1, 1], [true, false, true, false, true]), "over", "more filled cells than the clue");
  assert.equal(lineState([], [false, false]), "done");
  assert.equal(lineState([], [false, true]), "over");
  // Matching the clue in the wrong place still reads as done: the clue is matched.
  assert.equal(lineState([1], [false, false, true]), "done");
});

test("solveLine finds forced cells from overlaps and known cells", () => {
  const U = -1;
  // A run of 4 in 5 cells: the middle 3 are certain.
  assert.deepEqual(solveLine([4], [U, U, U, U, U]), [U, 1, 1, 1, U]);
  // Knowing the first cell is empty pins the run to the end.
  assert.deepEqual(solveLine([4], [0, U, U, U, U]), [0, 1, 1, 1, 1]);
  // An empty clue empties the line.
  assert.deepEqual(solveLine([], [U, U, U]), [0, 0, 0]);
  // Contradictions.
  assert.equal(solveLine([2], [1, 0, 1]), null);
  assert.equal(solveLine([3], [U, U]), null);
});

test("solveLine agrees with checking every possible line", () => {
  const random = createRng(11);
  for (let t = 0; t < 1500; t++) {
    const n = 1 + Math.floor(random() * 8);
    const truth = Array.from({ length: n }, () => random() < 0.5);
    const clue = runs(truth);
    const known = truth.map((v) => (random() < 0.3 ? (v ? 1 : 0) : -1)) as (-1 | 0 | 1)[];
    const fits: boolean[][] = [];
    for (let m = 0; m < 1 << n; m++) {
      const line = Array.from({ length: n }, (_, i) => Boolean(m & (1 << i)));
      if (runs(line).join() !== clue.join()) continue;
      if (line.some((v, i) => known[i] !== -1 && (known[i] === 1) !== v)) continue;
      fits.push(line);
    }
    const expected = Array.from({ length: n }, (_, i) => (fits.every((l) => l[i]) ? 1 : fits.every((l) => !l[i]) ? 0 : -1));
    assert.deepEqual(solveLine(clue, known), expected, `clue ${clue} known ${known}`);
  }
});

test("a picture that needs a guess is not line solvable", () => {
  // Two diagonals fit the same clues: the classic two-solution puzzle.
  assert.equal(isLineSolvable(parsePicture(["#.", ".#"])), false);
  assert.equal(isLineSolvable(parsePicture(["##", "#."])), true);
});

test("every Shanverse picture is line solvable, sized 10×10 or 15×15, with a unique id", () => {
  assert.ok(PICTURES.length >= 10);
  assert.equal(new Set(PICTURES.map((p) => p.id)).size, PICTURES.length);
  for (const entry of PICTURES) {
    const picture = parsePicture(entry.rows);
    assert.ok(
      (picture.width === 10 && picture.height === 10) || (picture.width === 15 && picture.height === 15),
      `${entry.id} is ${picture.width}×${picture.height}`,
    );
    const result = solveByLines(cluesOf(picture), picture.width, picture.height);
    const undecided = result.grid
      .map((value, i) => (value === -1 ? `(${(i % picture.width) + 1},${Math.floor(i / picture.width) + 1})` : ""))
      .filter(Boolean);
    assert.ok(isLineSolvable(picture), `${entry.id} needs a guess; undecided cells (col,row): ${undecided.join(" ")}`);
  }
});

test("random pictures are line solvable, have no blank line, and rebuild from their seed", () => {
  for (const size of SIZES) {
    for (const seed of [1, 2, 3]) {
      const picture = randomPicture(size, seed);
      assert.equal(picture.width, size);
      assert.ok(isLineSolvable(picture), `${size}/${seed}`);
      const clues = cluesOf(picture);
      assert.ok(clues.rows.every((c) => c.length) && clues.cols.every((c) => c.length), `${size}/${seed} has a blank line`);
      assert.deepEqual(randomPicture(size, seed).cells, picture.cells, "same seed, same picture");
    }
  }
});

test("isSolved once every row and column matches", () => {
  const picture = parsePicture(["##", "#."]);
  const clues = cluesOf(picture);
  const marks: Mark[] = [FILLED, FILLED, FILLED, CROSSED];
  assert.equal(isSolved(clues, marks, 2, 2), true);
  assert.equal(isSolved(clues, [FILLED, FILLED, EMPTY, EMPTY], 2, 2), false);
});

// Plays a picture the way the hint suggests: take the hinted line, apply
// what it forces, repeat. With only correct marks the hint must never give
// up, and it must finish the picture.
test("with correct marks, the hint always points at a line with something to deduce", () => {
  for (const entry of PICTURES.slice(0, 4)) {
    const picture = parsePicture(entry.rows);
    const { width, height } = picture;
    const clues = cluesOf(picture);
    const marks: Mark[] = new Array(width * height).fill(EMPTY);
    for (let steps = 0; steps < width + height + 200; steps++) {
      const h = hint(clues, marks, width, height);
      if (h.kind === "solved") break;
      assert.equal(h.kind, "line", `${entry.id}: hint gave up with only correct marks`);
      if (h.kind !== "line") return;
      const cells =
        h.axis === "row"
          ? Array.from({ length: width }, (_, x) => h.index * width + x)
          : Array.from({ length: height }, (_, y) => y * width + h.index);
      const clue = h.axis === "row" ? clues.rows[h.index] : clues.cols[h.index];
      const known = cells.map((c) => (marks[c] === FILLED ? 1 : marks[c] === CROSSED ? 0 : -1)) as (-1 | 0 | 1)[];
      const solved = solveLine(clue, known);
      assert.ok(solved);
      let changed = 0;
      solved.forEach((value, i) => {
        if (known[i] === -1 && value !== -1) {
          marks[cells[i]] = value === 1 ? FILLED : CROSSED;
          changed++;
        }
      });
      assert.ok(changed > 0, `${entry.id}: the hinted line deduced nothing`);
    }
    assert.equal(isSolved(clues, marks, width, height), true, `${entry.id} solved by following hints`);
  }
});

test("a wrong mark makes the hint say there is a mistake, without saying where", () => {
  const picture = parsePicture(PICTURES[0].rows); // heart
  const { width, height } = picture;
  const clues = cluesOf(picture);
  // Fill every cell of the first row: the clue [2, 2] cannot hold that.
  const marks: Mark[] = new Array(width * height).fill(EMPTY);
  for (let x = 0; x < width; x++) marks[x] = FILLED;
  assert.deepEqual(hint(clues, marks, width, height), { kind: "mistake" });
});

test("row and column helpers", () => {
  const cells = [1, 2, 3, 4, 5, 6];
  assert.deepEqual(row(cells, 3, 1), [4, 5, 6]);
  assert.deepEqual(column(cells, 3, 2, 2), [3, 6]);
});
