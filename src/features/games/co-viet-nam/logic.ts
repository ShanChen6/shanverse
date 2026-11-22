// Rules engine for Cờ Việt Nam, a two-player strategy board game for land, sea
// and air forces. The rules follow the Vietnamese game Cờ Tư Lệnh as played on
// cotulenh.vn, with gaps filled from the author's published rulebook. Code and
// wording here are our own.
//
// Board: 11 files (a-k) by 12 ranks (1-12). Pieces stand on intersections.
// Red starts at the bottom (ranks 1-5) and moves first; Blue starts at the top.
// Files a-b are sea, file c is the coast (both land and sea pieces may stand
// there), and the mouth of the river (d6, e6, d7, e7) is also open to ships.
// The river runs between ranks 6 and 7 and has two bridges, on files f and h.
//
// A square holds a stack: one carrier piece plus the pieces it carries
// (riders). Most of the time a stack is a single piece with no riders.

export const FILES = 11;
export const RANKS = 12;
export const AREA = FILES * RANKS;

export type Color = "r" | "b";
export const RED: Color = "r";
export const BLUE: Color = "b";
export const opponent = (c: Color): Color => (c === RED ? BLUE : RED);

/**
 * Piece types, by the letter used in positions and notation.
 * c commander, h headquarters, i infantry, m militia, e engineer, t tank,
 * a artillery, g anti-air gun, s missile, f air force, n navy.
 */
export type PieceType = "c" | "h" | "i" | "m" | "e" | "t" | "a" | "g" | "s" | "f" | "n";
export const PIECE_TYPES: PieceType[] = ["c", "h", "i", "m", "e", "t", "a", "g", "s", "f", "n"];

export type Piece = { type: PieceType; color: Color; hero: boolean };
export type Stack = { carrier: Piece; riders: Piece[] };

export type Result =
  | { winner: Color; reason: "checkmate" | "headquarters" | "resign" | "timeout" }
  | { winner: null; reason: "stalemate" };

export type Position = {
  board: (Stack | null)[];
  toMove: Color;
  /** Consecutive own turns each side has ended holding a captured enemy HQ square. */
  hqHold: Record<Color, number>;
  /** Starting HQ squares of each side, so a held square still counts after the HQ is gone. */
  hqSquares: Record<Color, number[]>;
  moveNumber: number;
  result: Result | null;
};

/**
 * One turn. `unit` is "stack" to move the whole stack with its carrier's
 * rules, or the index of the rider that leaves the stack on its own.
 *
 * kind:
 * - move: to an empty square.
 * - join: onto a friendly stack, forming one stack.
 * - capture: take the enemy stack and occupy its square.
 * - fire: take the enemy stack without moving (ranged or across terrain).
 * - strike: an aircraft attacks inside enemy air defence; both are lost.
 */
export type MoveKind = "move" | "join" | "capture" | "fire" | "strike";
export type Move = { from: number; to: number; unit: "stack" | number; kind: MoveKind };

// ---------------------------------------------------------------------------
// Squares and terrain

export const sq = (file: number, rank: number) => rank * FILES + file;
export const fileOf = (s: number) => s % FILES;
export const rankOf = (s: number) => Math.floor(s / FILES);

export function squareName(s: number): string {
  return String.fromCharCode(97 + fileOf(s)) + (rankOf(s) + 1);
}

export function parseSquare(name: string): number {
  const m = /^([a-k])(\d{1,2})$/.exec(name.trim().toLowerCase());
  if (!m) return NaN;
  const rank = Number(m[2]);
  if (rank < 1 || rank > RANKS) return NaN;
  return sq(m[1].charCodeAt(0) - 97, rank - 1);
}

const RIVER_MOUTH = new Set(["d6", "e6", "d7", "e7"].map(parseSquare));
/** Files with a bridge over the river. */
export const BRIDGE_FILES = [5, 7];

/** Sea only: files a and b. */
export const isSea = (s: number) => fileOf(s) <= 1;
/** Ships may stand here: sea, coast and the river mouth. */
export const isNavigable = (s: number) => fileOf(s) <= 2 || RIVER_MOUTH.has(s);
/** Land pieces may stand here: everything but the open sea. */
export const isLand = (s: number) => fileOf(s) >= 2;
/** True when a step between two squares crosses the river (between ranks 6 and 7). */
export const crossesRiver = (a: number, b: number) => (rankOf(a) <= 5) !== (rankOf(b) <= 5);
export const isBridge = (s: number) => BRIDGE_FILES.includes(fileOf(s)) && (rankOf(s) === 5 || rankOf(s) === 6);

// ---------------------------------------------------------------------------
// Pieces

type Spec = {
  /** Squares per move along files and ranks. */
  move: number;
  /** Squares per capture along files and ranks. */
  capture: number;
  /** Diagonal reach, 0 when the piece cannot go diagonally (before becoming a hero). */
  diagonal: number;
  /** Ignores pieces in the way when moving (aircraft). */
  flies: boolean;
  /** May capture past pieces in the way, and may fire without moving. */
  ranged: boolean;
  /** Needs a bridge or an engineer to cross the river. */
  heavy: boolean;
};

const SPECS: Record<PieceType, Spec> = {
  c: { move: 11, capture: 1, diagonal: 0, flies: false, ranged: false, heavy: false },
  h: { move: 0, capture: 0, diagonal: 0, flies: false, ranged: false, heavy: false },
  i: { move: 1, capture: 1, diagonal: 0, flies: false, ranged: false, heavy: false },
  m: { move: 1, capture: 1, diagonal: 1, flies: false, ranged: false, heavy: false },
  e: { move: 1, capture: 1, diagonal: 0, flies: false, ranged: false, heavy: false },
  t: { move: 2, capture: 2, diagonal: 0, flies: false, ranged: false, heavy: false },
  a: { move: 3, capture: 3, diagonal: 3, flies: false, ranged: true, heavy: true },
  g: { move: 1, capture: 1, diagonal: 0, flies: false, ranged: false, heavy: true },
  s: { move: 2, capture: 2, diagonal: 1, flies: false, ranged: true, heavy: true },
  f: { move: 4, capture: 4, diagonal: 4, flies: true, ranged: true, heavy: false },
  n: { move: 4, capture: 4, diagonal: 4, flies: false, ranged: true, heavy: false },
};

/** Ships fire at targets on land up to this many squares away. */
const NAVY_SHORE_RANGE = 3;

export const pieceSpec = (type: PieceType) => SPECS[type];

/** Which pieces a carrier can hold. Each inner list is one slot. */
const CARGO: Partial<Record<PieceType, PieceType[][]>> = {
  n: [["f"], ["c", "i", "m", "t"]],
  f: [["t"], ["c", "i", "m"]],
  t: [["c", "i", "m"]],
  e: [["a", "g", "s"]],
  h: [["c"]],
};

/** Order in which pieces are tried as the carrier when two stacks join. */
const CARRIER_ORDER: PieceType[] = ["h", "n", "f", "t", "e"];

function fitsCargo(carrier: PieceType, riders: Piece[]): boolean {
  const slots = CARGO[carrier];
  if (!slots || riders.length > slots.length) return riders.length === 0;
  // Few slots, so try every assignment.
  const used = new Array(slots.length).fill(false);
  const place = (i: number): boolean => {
    if (i === riders.length) return true;
    for (let k = 0; k < slots.length; k++) {
      if (!used[k] && slots[k].includes(riders[i].type)) {
        used[k] = true;
        if (place(i + 1)) return true;
        used[k] = false;
      }
    }
    return false;
  };
  return place(0);
}

/** Forms one stack from these pieces, or null when no piece can carry the rest. */
export function formStack(pieces: Piece[]): Stack | null {
  for (const type of CARRIER_ORDER) {
    const index = pieces.findIndex((p) => p.type === type);
    if (index < 0) continue;
    const riders = pieces.filter((_, i) => i !== index);
    if (fitsCargo(type, riders)) return { carrier: pieces[index], riders };
  }
  return pieces.length === 1 ? { carrier: pieces[0], riders: [] } : null;
}

export const stackPieces = (stack: Stack): Piece[] => [stack.carrier, ...stack.riders];

/** Where a piece may stand on its own. Headquarters never move, so they need no rule. */
export function canStand(type: PieceType, s: number): boolean {
  if (type === "n") return isNavigable(s);
  return isLand(s);
}

// ---------------------------------------------------------------------------
// Positions

/** Starting layout, rank 12 first, in a FEN-like text: letters are pieces (upper case Red), digits count empty squares. */
export const START_LAYOUT =
  "6c4/1n2fh1hf2/3a2s2a1/2n1gt1tg2/2ie2m2ei/11/11/2IE2M2EI/2N1GT1TG2/3A2S2A1/1N2FH1HF2/6C4";

export function newGame(layout = START_LAYOUT): Position {
  const board = parseLayout(layout);
  const hqSquares: Record<Color, number[]> = { r: [], b: [] };
  board.forEach((stack, s) => {
    if (stack?.carrier.type === "h") hqSquares[stack.carrier.color].push(s);
  });
  return { board, toMove: RED, hqHold: { r: 0, b: 0 }, hqSquares, moveNumber: 1, result: null };
}

/**
 * Reads a layout. Rows go from rank 12 down to rank 1. A stack is written in
 * brackets with the carrier first, e.g. "(Ni)". A "+" after a letter marks a hero.
 */
export function parseLayout(layout: string): (Stack | null)[] {
  const rows = layout.trim().split("/");
  if (rows.length !== RANKS) throw new Error(`Layout needs ${RANKS} rows`);
  const board: (Stack | null)[] = new Array(AREA).fill(null);
  rows.forEach((row, i) => {
    const rank = RANKS - 1 - i;
    let file = 0;
    let k = 0;
    const readPiece = (): Piece => {
      const ch = row[k++];
      const type = ch.toLowerCase() as PieceType;
      if (!PIECE_TYPES.includes(type)) throw new Error(`Unknown piece "${ch}"`);
      const piece: Piece = { type, color: ch === ch.toUpperCase() ? RED : BLUE, hero: false };
      if (row[k] === "+") {
        piece.hero = true;
        k++;
      }
      return piece;
    };
    while (k < row.length) {
      const ch = row[k];
      if (/\d/.test(ch)) {
        let n = "";
        while (k < row.length && /\d/.test(row[k])) n += row[k++];
        file += Number(n);
        continue;
      }
      let stack: Stack;
      if (ch === "(") {
        k++;
        const pieces: Piece[] = [];
        while (row[k] !== ")") pieces.push(readPiece());
        k++;
        stack = { carrier: pieces[0], riders: pieces.slice(1) };
      } else {
        stack = { carrier: readPiece(), riders: [] };
      }
      if (file >= FILES) throw new Error(`Row ${i + 1} is too long`);
      board[sq(file, rank)] = stack;
      file++;
    }
    if (file !== FILES) throw new Error(`Row ${i + 1} has ${file} files`);
  });
  return board;
}

export function writeLayout(board: (Stack | null)[]): string {
  const letter = (p: Piece) => (p.color === RED ? p.type.toUpperCase() : p.type) + (p.hero ? "+" : "");
  const rows: string[] = [];
  for (let rank = RANKS - 1; rank >= 0; rank--) {
    let row = "";
    let empty = 0;
    for (let file = 0; file < FILES; file++) {
      const stack = board[sq(file, rank)];
      if (!stack) {
        empty++;
        continue;
      }
      if (empty) row += empty;
      empty = 0;
      row += stack.riders.length ? `(${stackPieces(stack).map(letter).join("")})` : letter(stack.carrier);
    }
    if (empty) row += empty;
    rows.push(row);
  }
  return rows.join("/");
}

const clonePiece = (p: Piece): Piece => ({ ...p });
const cloneStack = (s: Stack): Stack => ({ carrier: clonePiece(s.carrier), riders: s.riders.map(clonePiece) });

export function clonePosition(pos: Position): Position {
  return {
    board: pos.board.map((s) => (s ? cloneStack(s) : null)),
    toMove: pos.toMove,
    hqHold: { ...pos.hqHold },
    hqSquares: { r: [...pos.hqSquares.r], b: [...pos.hqSquares.b] },
    moveNumber: pos.moveNumber,
    result: pos.result,
  };
}

/** Square of a side's commander, whether alone or carried, or -1 once it is gone. */
export function commanderSquare(pos: Position, color: Color): number {
  for (let s = 0; s < AREA; s++) {
    const stack = pos.board[s];
    if (stack && stack.carrier.color === color && stackPieces(stack).some((p) => p.type === "c")) return s;
  }
  return -1;
}

// ---------------------------------------------------------------------------
// Air defence

/** Squares an enemy aircraft may not fly through, made by anti-air guns, missiles and ships of `color`. */
export function airDefence(pos: Position, color: Color): Uint8Array {
  const zone = new Uint8Array(AREA);
  for (let s = 0; s < AREA; s++) {
    const stack = pos.board[s];
    if (!stack || stack.carrier.color !== color) continue;
    for (const p of stackPieces(stack)) {
      if (p.type !== "g" && p.type !== "s" && p.type !== "n") continue;
      const f0 = fileOf(s);
      const r0 = rankOf(s);
      for (let df = -2; df <= 2; df++) {
        for (let dr = -2; dr <= 2; dr++) {
          const f = f0 + df;
          const r = r0 + dr;
          if (f < 0 || f >= FILES || r < 0 || r >= RANKS) continue;
          const inside = p.type === "s" ? Math.abs(df) + Math.abs(dr) <= 2 : Math.max(Math.abs(df), Math.abs(dr)) <= 1;
          if (inside) zone[sq(f, r)] = 1;
        }
      }
    }
  }
  return zone;
}

// ---------------------------------------------------------------------------
// Move generation

const ORTHOGONAL = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const DIAGONAL = [[1, 1], [1, -1], [-1, 1], [-1, -1]];

/** The piece whose rules a unit moves by: the carrier for a whole stack, else the rider. */
export function unitPiece(stack: Stack, unit: Move["unit"]): Piece {
  return unit === "stack" ? stack.carrier : stack.riders[unit];
}

/** The pieces a unit takes with it. */
function unitPieces(stack: Stack, unit: Move["unit"]): Piece[] {
  return unit === "stack" ? stackPieces(stack) : [stack.riders[unit]];
}

function reach(piece: Piece, diagonal: boolean) {
  const spec = SPECS[piece.type];
  const bonus = piece.hero ? 1 : 0;
  if (diagonal) {
    const base = spec.diagonal || (piece.hero ? 1 : 0);
    if (!base) return { move: 0, capture: 0 };
    // A hero gains diagonal moves at its usual reach, plus one.
    const d = spec.diagonal ? spec.diagonal + bonus : Math.min(spec.move, spec.capture) + bonus;
    return { move: Math.min(d, spec.move + bonus), capture: Math.min(d, spec.capture + bonus) };
  }
  return { move: spec.move + bonus, capture: spec.capture + bonus };
}

/**
 * Moves for one unit, ignoring whether they leave its own commander in danger.
 * With `capturesOnly`, only capturing moves are listed (used to find checks).
 */
export function unitMoves(pos: Position, from: number, unit: Move["unit"], capturesOnly = false): Move[] {
  const stack = pos.board[from];
  if (!stack) return [];
  const piece = unitPiece(stack, unit);
  if (!piece || piece.type === "h") return [];
  const spec = SPECS[piece.type];
  const color = piece.color;
  const enemyAir = piece.type === "f" && !piece.hero ? airDefence(pos, opponent(color)) : null;
  const moving = unitPieces(stack, unit);
  const moves: Move[] = [];
  const f0 = fileOf(from);
  const r0 = rankOf(from);

  for (const diagonal of [false, true]) {
    const { move: moveReach, capture: captureReach } = reach(piece, diagonal);
    const longest = Math.max(moveReach, captureReach);
    if (!longest) continue;
    for (const [df, dr] of diagonal ? DIAGONAL : ORTHOGONAL) {
      let pathBlocked = false; // a piece stands between `from` and the square
      let canWalk = true; // the unit could still move further along this line
      let throughDefence = false; // an aircraft has flown into enemy air defence on this line
      for (let k = 1; k <= longest; k++) {
        const f = f0 + df * k;
        const r = r0 + dr * k;
        if (f < 0 || f >= FILES || r < 0 || r >= RANKS) break;
        const to = sq(f, r);
        const target = pos.board[to];
        // Heavy pieces cross the river only straight over a bridge, unless carried.
        const riverOk =
          !spec.heavy || !crossesRiver(from, to) || (df === 0 && BRIDGE_FILES.includes(f));
        // An aircraft that enters air defence can no longer land safely: it
        // may still attack along this line, but loses itself in the attack.
        if (enemyAir && enemyAir[to] === 1) throughDefence = true;
        const inAirDefence = throughDefence;

        if (!target) {
          if (!capturesOnly && canWalk && k <= moveReach && riverOk && !inAirDefence && canStand(piece.type, to)) {
            moves.push({ from, to, unit, kind: "move" });
          }
          // Ground pieces cannot walk over terrain they cannot stand on.
          if (!spec.flies && !canStand(piece.type, to)) canWalk = false;
          continue;
        }

        if (target.carrier.color === color) {
          if (!capturesOnly && canWalk && k <= moveReach && riverOk && !inAirDefence && (spec.flies || !pathBlocked)) {
            const joined = formStack([...stackPieces(target), ...moving]);
            if (joined && (joined.carrier.type === "h" || canStand(joined.carrier.type, to))) {
              moves.push({ from, to, unit, kind: "join" });
            }
          }
        } else if (k <= captureReach && (spec.ranged || !pathBlocked)) {
          const reachTarget = piece.type === "n" && !isNavigable(to) ? NAVY_SHORE_RANGE + (piece.hero ? 1 : 0) : captureReach;
          if (k <= reachTarget) {
            if (inAirDefence) {
              moves.push({ from, to, unit, kind: "strike" });
            } else {
              const canOccupy =
                canStand(piece.type, to) && riverOk && (spec.flies || (!pathBlocked && canWalk));
              if (canOccupy) moves.push({ from, to, unit, kind: "capture" });
              if (spec.ranged || !canOccupy) moves.push({ from, to, unit, kind: "fire" });
            }
          }
        }
        pathBlocked = true;
        if (!spec.flies) canWalk = false;
        if (!spec.ranged && !spec.flies) break;
      }
    }
  }
  return moves;
}

/** Every unit that may act from a square: the whole stack, then each rider. */
function unitsAt(stack: Stack): Move["unit"][] {
  return ["stack", ...stack.riders.map((_, i) => i)];
}

export function pseudoMoves(pos: Position, color: Color, capturesOnly = false): Move[] {
  const moves: Move[] = [];
  for (let s = 0; s < AREA; s++) {
    const stack = pos.board[s];
    if (!stack || stack.carrier.color !== color) continue;
    for (const unit of unitsAt(stack)) moves.push(...unitMoves(pos, s, unit, capturesOnly));
  }
  return moves;
}

/** True when `color` could take the enemy commander's square next turn. */
export function givesCheck(pos: Position, color: Color): boolean {
  const target = commanderSquare(pos, opponent(color));
  if (target < 0) return false;
  return pseudoMoves(pos, color, true).some((m) => m.to === target);
}

export const inCheck = (pos: Position, color: Color) => givesCheck(pos, opponent(color));

/** Two commanders standing alone on one file or rank with nothing between them. */
export function commandersFacing(pos: Position): boolean {
  const a = pos.board[commanderSquare(pos, RED)];
  const b = pos.board[commanderSquare(pos, BLUE)];
  const ra = commanderSquare(pos, RED);
  const rb = commanderSquare(pos, BLUE);
  if (ra < 0 || rb < 0 || a?.carrier.type !== "c" || b?.carrier.type !== "c") return false;
  // A commander carried by another piece (or sheltered in its HQ) does not face.
  if (a.riders.length || b.riders.length) return false;
  let step: number;
  if (fileOf(ra) === fileOf(rb)) step = FILES * Math.sign(rb - ra);
  else if (rankOf(ra) === rankOf(rb)) step = Math.sign(rb - ra);
  else return false;
  for (let s = ra + step; s !== rb; s += step) if (pos.board[s]) return false;
  return true;
}

// ---------------------------------------------------------------------------
// Making moves

/** Applies a move without checking it. Returns the pieces taken off the board. */
export function applyMove(pos: Position, move: Move): Piece[] {
  const stack = pos.board[move.from];
  if (!stack) throw new Error(`No piece on ${squareName(move.from)}`);
  const moving = unitPieces(stack, move.unit);
  // What stays behind on the starting square.
  const rest: Stack | null =
    move.unit === "stack" ? null : { carrier: stack.carrier, riders: stack.riders.filter((_, i) => i !== move.unit) };
  const target = pos.board[move.to];
  const lost: Piece[] = [];

  const landing = (): Stack => (move.unit === "stack" ? stack : { carrier: moving[0], riders: [] });

  switch (move.kind) {
    case "move":
      pos.board[move.from] = rest;
      pos.board[move.to] = landing();
      break;
    case "join": {
      const joined = formStack([...stackPieces(target!), ...moving]);
      if (!joined) throw new Error("These pieces cannot form a stack");
      pos.board[move.from] = rest;
      pos.board[move.to] = joined;
      break;
    }
    case "capture":
      lost.push(...stackPieces(target!));
      pos.board[move.from] = rest;
      pos.board[move.to] = landing();
      break;
    case "fire":
      lost.push(...stackPieces(target!));
      pos.board[move.to] = null;
      break;
    case "strike":
      lost.push(...stackPieces(target!), ...moving);
      pos.board[move.to] = null;
      pos.board[move.from] = rest;
      break;
  }
  return lost;
}

/** Marks heroes for `color`: every piece now threatening the enemy commander, and a lone last defender. */
function updateHeroes(pos: Position, color: Color) {
  const target = commanderSquare(pos, opponent(color));
  if (target >= 0) {
    for (let s = 0; s < AREA; s++) {
      const stack = pos.board[s];
      if (!stack || stack.carrier.color !== color) continue;
      for (const unit of unitsAt(stack)) {
        if (unitMoves(pos, s, unit, true).some((m) => m.to === target)) unitPiece(stack, unit).hero = true;
      }
    }
  }
  for (const side of [RED, BLUE] as Color[]) {
    const fighters: Piece[] = [];
    for (const stack of pos.board) {
      if (stack && stack.carrier.color === side) fighters.push(...stackPieces(stack).filter((p) => p.type !== "c" && p.type !== "h"));
    }
    if (fighters.length === 1) fighters[0].hero = true;
  }
}

/** True when the move is allowed: it follows the piece rules and does not leave the mover's commander open. */
export function isLegal(pos: Position, move: Move): boolean {
  if (pos.result) return false;
  const stack = pos.board[move.from];
  if (!stack || stack.carrier.color !== pos.toMove) return false;
  if (!unitMoves(pos, move.from, move.unit).some((m) => m.to === move.to && m.kind === move.kind)) return false;
  const next = clonePosition(pos);
  applyMove(next, move);
  if (commanderSquare(next, pos.toMove) < 0) return false;
  return !inCheck(next, pos.toMove) && !commandersFacing(next);
}

export function legalMoves(pos: Position): Move[] {
  if (pos.result) return [];
  return pseudoMoves(pos, pos.toMove).filter((m) => isLegal(pos, m));
}

export function legalMovesFrom(pos: Position, from: number): Move[] {
  const stack = pos.board[from];
  if (pos.result || !stack || stack.carrier.color !== pos.toMove) return [];
  return unitsAt(stack).flatMap((unit) => unitMoves(pos, from, unit)).filter((m) => isLegal(pos, m));
}

/** Plays a legal move and returns the new position. Throws on an illegal move. */
export function play(pos: Position, move: Move): Position {
  if (!isLegal(pos, move)) throw new Error(`Illegal move ${moveName(pos, move)}`);
  const next = clonePosition(pos);
  const mover = pos.toMove;
  applyMove(next, move);
  updateHeroes(next, mover);

  // Holding a captured enemy headquarters for three of your own turns wins.
  const enemy = opponent(mover);
  const holding = next.hqSquares[enemy].some((s) => {
    const stack = next.board[s];
    return stack && stack.carrier.color === mover;
  });
  next.hqHold[mover] = holding ? next.hqHold[mover] + 1 : 0;

  next.toMove = enemy;
  next.moveNumber = pos.moveNumber + 1;
  if (next.hqHold[mover] >= 3) {
    next.result = { winner: mover, reason: "headquarters" };
  } else if (legalMoves(next).length === 0) {
    next.result = inCheck(next, enemy) ? { winner: mover, reason: "checkmate" } : { winner: null, reason: "stalemate" };
  }
  return next;
}

/** Ends the game because a player gave up or ran out of time. */
export function endGame(pos: Position, loser: Color, reason: "resign" | "timeout"): Position {
  if (pos.result) return pos;
  return { ...clonePosition(pos), result: { winner: opponent(loser), reason } };
}

// ---------------------------------------------------------------------------
// Notation

const KIND_MARK: Record<MoveKind, string> = { move: "-", join: "&", capture: "x", fire: "*", strike: "!" };

/** Short notation: piece letter, from, a mark for the kind of move, to. E.g. "T c4-c6", "A d3*d8". */
export function moveName(pos: Position, move: Move): string {
  const stack = pos.board[move.from];
  const piece = stack ? unitPiece(stack, move.unit) : null;
  const letter = piece ? piece.type.toUpperCase() : "?";
  return `${letter} ${squareName(move.from)}${KIND_MARK[move.kind]}${squareName(move.to)}`;
}

export function sameMove(a: Move, b: Move) {
  return a.from === b.from && a.to === b.to && a.unit === b.unit && a.kind === b.kind;
}

/** Replays a list of moves from the start; stops at the first illegal one. */
export function replay(moves: Move[], layout = START_LAYOUT): Position {
  let pos = newGame(layout);
  for (const m of moves) {
    if (!isLegal(pos, m)) break;
    pos = play(pos, m);
  }
  return pos;
}
