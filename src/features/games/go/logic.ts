// Rules of Go for the Shanverse mini game: placing stones, captures, simple ko,
// no suicide, passing, and area scoring (Chinese rules). A "capture" mode ends
// the game at the first capture, the classic way to teach beginners.
//
// Positions are plain objects with a typed-array board so the AI can copy and
// replay them quickly. `play` returns a new position; `playInPlace` mutates.

export const EMPTY = 0;
export const BLACK = 1;
export const WHITE = 2;
export const PASS = -1;

export type Color = typeof BLACK | typeof WHITE;
export type Mode = "full" | "capture";
export type BoardSize = 9 | 13 | 19;

export const BOARD_SIZES: BoardSize[] = [9, 13, 19];
/** Points given to White for moving second (area scoring). */
export const KOMI = 7.5;

export type Position = {
  size: number;
  mode: Mode;
  /** EMPTY / BLACK / WHITE per point, row by row from the top-left. */
  board: Int8Array;
  toPlay: Color;
  /** Point that may not be played this turn because of ko, or -1. */
  ko: number;
  /** Consecutive passes. Two passes end a full game. */
  passes: number;
  /** Stones captured by Black (index 1) and by White (index 2). */
  captures: [number, number, number];
  moveNumber: number;
  /** Last move played (a point or PASS), or null at the start. */
  lastMove: number | null;
  /** Capture mode: the first player to capture. 0 while nobody has. */
  winner: 0 | Color;
};

export const opponent = (color: Color): Color => (color === BLACK ? WHITE : BLACK);

// ---------------------------------------------------------------------------
// Board geometry, cached per size

export type Geometry = {
  size: number;
  area: number;
  /** Four neighbours per point, -1 where the edge is. */
  nb: Int32Array;
  /** Four diagonal neighbours per point, -1 off the board. */
  diag: Int32Array;
  /** Number of on-board neighbours (2 in a corner, 3 on an edge, 4 inside). */
  degree: Uint8Array;
};

const geometries = new Map<number, Geometry>();

export function geometry(size: number): Geometry {
  let geo = geometries.get(size);
  if (geo) return geo;
  const area = size * size;
  const nb = new Int32Array(area * 4).fill(-1);
  const diag = new Int32Array(area * 4).fill(-1);
  const degree = new Uint8Array(area);
  for (let p = 0; p < area; p++) {
    const x = p % size;
    const y = (p - x) / size;
    const around: Array<[number, number]> = [[x, y - 1], [x - 1, y], [x + 1, y], [x, y + 1]];
    const corners: Array<[number, number]> = [[x - 1, y - 1], [x + 1, y - 1], [x - 1, y + 1], [x + 1, y + 1]];
    around.forEach(([nx, ny], i) => {
      if (nx >= 0 && ny >= 0 && nx < size && ny < size) {
        nb[p * 4 + i] = ny * size + nx;
        degree[p]++;
      }
    });
    corners.forEach(([nx, ny], i) => {
      if (nx >= 0 && ny >= 0 && nx < size && ny < size) diag[p * 4 + i] = ny * size + nx;
    });
  }
  geo = { size, area, nb, diag, degree };
  geometries.set(size, geo);
  return geo;
}

// Scratch buffers for flood fills, shared by every call (the code is single-threaded).
const MAX_AREA = 19 * 19;
const stack = new Int32Array(MAX_AREA);
const mark = new Int32Array(MAX_AREA);
let stamp = 0;

function nextStamp() {
  stamp++;
  if (stamp > 2_000_000_000) {
    mark.fill(0);
    stamp = 1;
  }
  return stamp;
}

let lastLiberty = -1;

/**
 * Liberties of the group at `start`, ignoring `except`: 0, 1 or 2 (meaning two
 * or more). After a result of 1, `lastLiberty` holds that liberty.
 */
function libertyCount(board: Int8Array, geo: Geometry, start: number, except = -1): 0 | 1 | 2 {
  const color = board[start];
  const s = nextStamp();
  let top = 0;
  let found = -1;
  stack[top++] = start;
  mark[start] = s;
  while (top) {
    const p = stack[--top];
    for (let i = p * 4, end = i + 4; i < end; i++) {
      const q = geo.nb[i];
      if (q < 0 || mark[q] === s) continue;
      const v = board[q];
      if (v === EMPTY) {
        if (q === except) continue;
        if (found === -1) found = q;
        else if (found !== q) return 2;
      } else if (v === color) {
        mark[q] = s;
        stack[top++] = q;
      }
    }
  }
  lastLiberty = found;
  return found === -1 ? 0 : 1;
}

/** The only liberty of the group at `point`, or -1 if it has none or several. */
export function singleLiberty(board: Int8Array, size: number, point: number): number {
  return libertyCount(board, geometry(size), point) === 1 ? lastLiberty : -1;
}

/** Removes the group at `start` and returns how many stones it had. */
function removeGroup(board: Int8Array, geo: Geometry, start: number): number {
  const color = board[start];
  let top = 0;
  let count = 0;
  stack[top++] = start;
  board[start] = EMPTY;
  while (top) {
    const p = stack[--top];
    count++;
    for (let i = p * 4, end = i + 4; i < end; i++) {
      const q = geo.nb[i];
      if (q >= 0 && board[q] === color) {
        board[q] = EMPTY;
        stack[top++] = q;
      }
    }
  }
  return count;
}

/** Every stone of the group containing `start` (empty array for an empty point). */
export function groupAt(board: Int8Array, size: number, start: number): number[] {
  const color = board[start];
  if (color === EMPTY) return [];
  const geo = geometry(size);
  const s = nextStamp();
  const group: number[] = [start];
  mark[start] = s;
  for (let k = 0; k < group.length; k++) {
    const p = group[k];
    for (let i = p * 4, end = i + 4; i < end; i++) {
      const q = geo.nb[i];
      if (q >= 0 && mark[q] !== s && board[q] === color) {
        mark[q] = s;
        group.push(q);
      }
    }
  }
  return group;
}

// ---------------------------------------------------------------------------
// Positions and moves

/** The crosscut in the centre that capture games traditionally start from. */
function crosscut(board: Int8Array, size: number) {
  const c = Math.floor(size / 2) - 1;
  board[c * size + c] = WHITE;
  board[c * size + c + 1] = BLACK;
  board[(c + 1) * size + c] = BLACK;
  board[(c + 1) * size + c + 1] = WHITE;
}

export function newGame(size: number, mode: Mode): Position {
  const board = new Int8Array(size * size);
  if (mode === "capture") crosscut(board, size);
  return { size, mode, board, toPlay: BLACK, ko: -1, passes: 0, captures: [0, 0, 0], moveNumber: 0, lastMove: null, winner: 0 };
}

export function clonePosition(pos: Position): Position {
  return { ...pos, board: pos.board.slice(), captures: [pos.captures[0], pos.captures[1], pos.captures[2]] };
}

/** Whether a game has ended by the rules (not counting resignation). */
export function isOver(pos: Position): boolean {
  return pos.winner !== 0 || pos.passes >= 2;
}

export function isLegal(pos: Position, point: number): boolean {
  if (isOver(pos)) return false;
  if (point === PASS) return true;
  const { board, size } = pos;
  if (point < 0 || point >= size * size || board[point] !== EMPTY || point === pos.ko) return false;
  const geo = geometry(size);
  const me = pos.toPlay;
  // Fast path: an empty neighbour is always a liberty.
  for (let i = point * 4, end = i + 4; i < end; i++) if (geo.nb[i] >= 0 && board[geo.nb[i]] === EMPTY) return true;
  for (let i = point * 4, end = i + 4; i < end; i++) {
    const q = geo.nb[i];
    if (q < 0) continue;
    const v = board[q];
    // Joining a friendly group that keeps another liberty.
    if (v === me && libertyCount(board, geo, q, point) > 0) return true;
    // Capturing an enemy group whose last liberty is this point.
    if (v !== me && libertyCount(board, geo, q, point) === 0) return true;
  }
  return false; // suicide
}

/**
 * Plays a move on `pos` itself. Returns the number of stones captured, or -1
 * (leaving `pos` untouched) when the move is illegal.
 */
export function playInPlace(pos: Position, point: number): number {
  if (!isLegal(pos, point)) return -1;
  const me = pos.toPlay;
  const them = opponent(me);
  pos.moveNumber++;
  pos.lastMove = point;
  pos.toPlay = them;
  if (point === PASS) {
    pos.passes++;
    pos.ko = -1;
    return 0;
  }
  pos.passes = 0;
  const { board } = pos;
  const geo = geometry(pos.size);
  board[point] = me;
  let captured = 0;
  let capturedAt = -1;
  for (let i = point * 4, end = i + 4; i < end; i++) {
    const q = geo.nb[i];
    if (q >= 0 && board[q] === them && libertyCount(board, geo, q) === 0) {
      const n = removeGroup(board, geo, q);
      captured += n;
      capturedAt = q;
    }
  }
  // Ko: a lone stone that captured exactly one stone and now sits in atari.
  pos.ko = -1;
  if (captured === 1) {
    let friends = false;
    for (let i = point * 4, end = i + 4; i < end; i++) if (geo.nb[i] >= 0 && board[geo.nb[i]] === me) friends = true;
    if (!friends && libertyCount(board, geo, point) === 1) pos.ko = capturedAt;
  }
  pos.captures[me] += captured;
  if (pos.mode === "capture" && captured > 0) pos.winner = me;
  return captured;
}

export type MoveResult = { position: Position; legal: boolean; captured: number };

export function play(pos: Position, point: number): MoveResult {
  const next = clonePosition(pos);
  const captured = playInPlace(next, point);
  return captured < 0 ? { position: pos, legal: false, captured: 0 } : { position: next, legal: true, captured };
}

/** Rebuilds a position from a move list. Returns null if any move is illegal. */
export function replay(size: number, mode: Mode, moves: readonly number[]): Position | null {
  const pos = newGame(size, mode);
  for (const move of moves) if (playInPlace(pos, move) < 0) return null;
  return pos;
}

/**
 * A point surrounded by one colour where filling it would only hurt that colour:
 * every neighbour is `color`, and the diagonals do not let the eye be broken.
 */
export function isEyeOf(pos: Position, point: number, color: Color): boolean {
  const { board } = pos;
  if (board[point] !== EMPTY) return false;
  const geo = geometry(pos.size);
  for (let i = point * 4, end = i + 4; i < end; i++) {
    const q = geo.nb[i];
    if (q >= 0 && board[q] !== color) return false;
  }
  let enemies = 0;
  let offBoard = 0;
  for (let i = point * 4, end = i + 4; i < end; i++) {
    const q = geo.diag[i];
    if (q < 0) offBoard++;
    else if (board[q] === opponent(color)) enemies++;
  }
  return offBoard > 0 ? enemies === 0 : enemies <= 1;
}

// ---------------------------------------------------------------------------
// Scoring

export type Score = {
  blackStones: number;
  whiteStones: number;
  blackArea: number;
  whiteArea: number;
  black: number;
  /** White's total including komi. */
  white: number;
  /** Who owns each point at the end: BLACK, WHITE or EMPTY (neutral). */
  owner: Int8Array;
};

/**
 * Area scoring: each side's stones plus the empty regions only it surrounds.
 * Stones listed in `dead` are removed first and count for the other side.
 */
export function scoreArea(board: Int8Array, size: number, dead: Iterable<number> = [], komi = KOMI): Score {
  const geo = geometry(size);
  const b = board.slice();
  for (const p of dead) b[p] = EMPTY;
  const owner = new Int8Array(geo.area);
  let blackStones = 0;
  let whiteStones = 0;
  let blackArea = 0;
  let whiteArea = 0;
  const seen = new Uint8Array(geo.area);
  for (let p = 0; p < geo.area; p++) {
    if (b[p] === BLACK) {
      blackStones++;
      owner[p] = BLACK;
    } else if (b[p] === WHITE) {
      whiteStones++;
      owner[p] = WHITE;
    } else if (!seen[p]) {
      const region: number[] = [p];
      seen[p] = 1;
      let touches = 0;
      for (let k = 0; k < region.length; k++) {
        const r = region[k];
        for (let i = r * 4, end = i + 4; i < end; i++) {
          const q = geo.nb[i];
          if (q < 0) continue;
          if (b[q] === EMPTY) {
            if (!seen[q]) {
              seen[q] = 1;
              region.push(q);
            }
          } else touches |= b[q];
        }
      }
      if (touches === BLACK || touches === WHITE) {
        for (const r of region) owner[r] = touches;
        if (touches === BLACK) blackArea += region.length;
        else whiteArea += region.length;
      }
    }
  }
  return {
    blackStones,
    whiteStones,
    blackArea,
    whiteArea,
    black: blackStones + blackArea,
    white: whiteStones + whiteArea + komi,
    owner,
  };
}

// ---------------------------------------------------------------------------
// Coordinates: columns A–T without I, rows counted from the bottom (e.g. "D4").

const COLUMNS = "ABCDEFGHJKLMNOPQRST";

export function pointName(point: number, size: number): string {
  if (point === PASS) return "pass";
  const x = point % size;
  const y = (point - x) / size;
  return `${COLUMNS[x]}${size - y}`;
}

export function parsePoint(name: string, size: number): number {
  const match = /^([A-HJ-T])(\d{1,2})$/i.exec(name.trim());
  if (!match) return Number.NaN;
  const x = COLUMNS.indexOf(match[1].toUpperCase());
  const y = size - Number(match[2]);
  return x < size && y >= 0 && y < size ? y * size + x : Number.NaN;
}

export const columnLabel = (x: number) => COLUMNS[x];

/** Star points (hoshi) drawn on the board. */
export function starPoints(size: number): number[] {
  const edge = size >= 13 ? 3 : 2;
  const far = size - 1 - edge;
  const mid = (size - 1) / 2;
  const lines = size >= 13 ? [edge, mid, far] : [edge, far];
  const points = lines.flatMap((y) => lines.map((x) => y * size + x));
  if (size < 13) points.push(mid * size + mid);
  return points;
}
