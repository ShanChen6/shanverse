// Builds KataGo's version-7 network inputs (22 spatial planes, 19 globals) and
// the 192 human-profile metadata features, following KataGo's nninputs.cpp and
// sgfmetadata.cpp for the rules this game uses: area scoring, simple ko, no
// suicide, komi 7.5.

import { BLACK, EMPTY, KOMI, PASS, WHITE, clonePosition, geometry, isLegal, opponent, playInPlace, replay, type Color, type Mode, type Position } from "../logic";

export const NUM_SPATIAL = 22;
export const NUM_GLOBAL = 19;
export const NUM_META = 192;

// ---------------------------------------------------------------------------
// Groups

type Groups = {
  /** Group id per point (-1 for empty). */
  id: Int32Array;
  /** Liberty count per group id. */
  libs: number[];
  /** Stones per group id. */
  stones: number[][];
};

function findGroups(board: Int8Array, size: number): Groups {
  const geo = geometry(size);
  const id = new Int32Array(geo.area).fill(-1);
  const libs: number[] = [];
  const stones: number[][] = [];
  const seenLib = new Int32Array(geo.area).fill(-1);
  for (let p = 0; p < geo.area; p++) {
    if (board[p] === EMPTY || id[p] >= 0) continue;
    const g = stones.length;
    const color = board[p];
    const list = [p];
    id[p] = g;
    let count = 0;
    for (let k = 0; k < list.length; k++) {
      const q = list[k];
      for (let i = q * 4, end = i + 4; i < end; i++) {
        const r = geo.nb[i];
        if (r < 0) continue;
        if (board[r] === EMPTY) {
          if (seenLib[r] !== g) {
            seenLib[r] = g;
            count++;
          }
        } else if (board[r] === color && id[r] < 0) {
          id[r] = g;
          list.push(r);
        }
      }
    }
    stones.push(list);
    libs.push(count);
  }
  return { id, libs, stones };
}

function libertiesOf(pos: Position, point: number): number[] {
  const geo = geometry(pos.size);
  const color = pos.board[point];
  const seen = new Uint8Array(geo.area);
  const out: number[] = [];
  const list = [point];
  seen[point] = 1;
  for (let k = 0; k < list.length; k++) {
    const q = list[k];
    for (let i = q * 4, end = i + 4; i < end; i++) {
      const r = geo.nb[i];
      if (r < 0 || seen[r]) continue;
      if (pos.board[r] === EMPTY) {
        seen[r] = 1;
        out.push(r);
      } else if (pos.board[r] === color) {
        seen[r] = 1;
        list.push(r);
      }
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Ladders (Board::searchIsLadderCaptured), as a plain recursive search.

const LADDER_NODE_BUDGET = 25000;

type LadderSearch = { nodes: number; maxDepth: number; aborted: boolean };

/** Captures by the defender that gain liberties: liberties of adjacent attacker groups in atari. */
function libertyGainingCaptures(pos: Position, point: number): number[] {
  const geo = geometry(pos.size);
  const color = pos.board[point];
  const groups = findGroups(pos.board, pos.size);
  const mine = groups.id[point];
  const out = new Set<number>();
  for (const q of groups.stones[mine]) {
    for (let i = q * 4, end = i + 4; i < end; i++) {
      const r = geo.nb[i];
      if (r >= 0 && pos.board[r] !== EMPTY && pos.board[r] !== color && groups.libs[groups.id[r]] === 1) {
        for (const lib of libertiesOf(pos, r)) out.add(lib);
      }
    }
  }
  return [...out];
}

function ladderCaptured(pos: Position, point: number, defenderToMove: boolean, depth: number, s: LadderSearch): boolean {
  if (s.aborted) return false;
  if (++s.nodes >= LADDER_NODE_BUDGET) {
    s.aborted = true;
    return false;
  }
  if (depth >= s.maxDepth) return true;
  const libs = libertiesOf(pos, point);
  if (!defenderToMove) {
    if (libs.length <= 1) return true;
    if (libs.length >= 3) return false;
    const attacker = opponent(pos.board[point] as Color);
    for (const move of libs) {
      const next = clonePosition(pos);
      next.toPlay = attacker;
      if (playInPlace(next, move) < 0) continue;
      if (next.board[point] === EMPTY) return true; // captured outright
      if (ladderCaptured(next, point, true, depth + 1, s)) return true;
    }
    return false;
  }
  if (libs.length >= 2) return false;
  // A ko left by the attacker counts as an escape: ladders that hinge on ko are not ladders.
  if (pos.ko >= 0) return false;
  const defender = pos.board[point] as Color;
  const moves = [...libertyGainingCaptures(pos, point), ...libs];
  for (const move of moves) {
    const next = clonePosition(pos);
    next.toPlay = defender;
    if (playInPlace(next, move) < 0) continue;
    const after = libertiesOf(next, point).length;
    if (after >= 3) return false;
    if (after <= 1) continue;
    if (!ladderCaptured(next, point, false, depth + 1, s)) return false;
  }
  return true;
}

/** Calls `mark` for each stone in a group with 1 or 2 liberties that is caught in a ladder. */
function iterLadders(pos: Position, mark: (point: number, workingMoves: number[]) => void) {
  const groups = findGroups(pos.board, pos.size);
  const solved = new Map<number, { laddered: boolean; working: number[] }>();
  const area = pos.size * pos.size;
  for (let p = 0; p < area; p++) {
    if (pos.board[p] === EMPTY) continue;
    const g = groups.id[p];
    const libs = groups.libs[g];
    if (libs !== 1 && libs !== 2) continue;
    let result = solved.get(g);
    if (!result) {
      const search: LadderSearch = { nodes: 0, maxDepth: Math.floor((area * 3) / 2), aborted: false };
      const base = clonePosition(pos);
      if (libs === 1) {
        base.ko = -1; // the defender may assume every ko works for them at the root
        result = { laddered: ladderCaptured(base, p, true, 0, search), working: [] };
      } else {
        const working: number[] = [];
        const attacker = opponent(pos.board[p] as Color);
        for (const move of libertiesOf(base, p)) {
          const next = clonePosition(base);
          next.toPlay = attacker;
          if (next.passes > 1) next.passes = 0;
          if (!isLegalFor(next, move)) continue;
          playInPlace(next, move);
          next.ko = -1;
          const s: LadderSearch = { nodes: 0, maxDepth: search.maxDepth, aborted: false };
          if (next.board[p] !== EMPTY && ladderCaptured(next, p, true, 0, s)) working.push(move);
        }
        result = { laddered: working.length > 0, working };
      }
      solved.set(g, result);
      if (result.laddered) mark(p, result.working);
    } else if (result.laddered) {
      mark(p, []);
    }
  }
}

function isLegalFor(pos: Position, move: number): boolean {
  const saved = pos.passes;
  pos.passes = 0;
  const legal = isLegal(pos, move);
  pos.passes = saved;
  return legal;
}

// ---------------------------------------------------------------------------
// Pass-alive area (Board::calculateArea with every option on, suicide illegal)

function areaForPla(board: Int8Array, size: number, pla: Color, result: Int8Array) {
  const geo = geometry(size);
  const area = geo.area;
  const opp = opponent(pla);
  const groups = findGroups(board, size);
  const regionOf = new Int32Array(area).fill(-1);
  type Region = { points: number[]; vital: number[]; internal: number; containsOpp: boolean; bordersDead: boolean };
  const regions: Region[] = [];
  const adjacentToPla = (p: number) => {
    for (let i = p * 4, end = i + 4; i < end; i++) if (geo.nb[i] >= 0 && board[geo.nb[i]] === pla) return true;
    return false;
  };
  const adjacentToGroup = (p: number, g: number) => {
    for (let i = p * 4, end = i + 4; i < end; i++) {
      const q = geo.nb[i];
      if (q >= 0 && board[q] === pla && groups.id[q] === g) return true;
    }
    return false;
  };
  let atLeastOnePla = false;
  for (let p = 0; p < area; p++) {
    if (regionOf[p] !== -1) continue;
    if (board[p] !== EMPTY) {
      if (board[p] === pla) atLeastOnePla = true;
      continue;
    }
    const index = regions.length;
    const vital: number[] = [];
    for (let i = p * 4, end = i + 4; i < end; i++) {
      const q = geo.nb[i];
      if (q >= 0 && board[q] === pla && !vital.includes(groups.id[q])) vital.push(groups.id[q]);
    }
    const region: Region = { points: [], vital, internal: 0, containsOpp: false, bordersDead: false };
    const queue = [p];
    regionOf[p] = index;
    for (let k = 0; k < queue.length; k++) {
      const q = queue[k];
      if (region.vital.length > 0 && board[q] === EMPTY) region.vital = region.vital.filter((g) => adjacentToGroup(q, g));
      if (region.internal < 2 && !adjacentToPla(q)) region.internal++;
      if (board[q] === opp) region.containsOpp = true;
      region.points.push(q);
      for (let i = q * 4, end = i + 4; i < end; i++) {
        const r = geo.nb[i];
        if (r >= 0 && (board[r] === EMPTY || board[r] === opp) && regionOf[r] === -1) {
          regionOf[r] = index;
          queue.push(r);
        }
      }
    }
    regions.push(region);
  }

  const plaGroups = groups.stones.map((_, g) => g).filter((g) => board[groups.stones[g][0]] === pla);
  const vitalCount = new Map<number, number>(plaGroups.map((g) => [g, 0]));
  for (const region of regions) for (const g of region.vital) vitalCount.set(g, (vitalCount.get(g) ?? 0) + 1);
  const killed = new Set<number>();
  for (let changed = true; changed; ) {
    changed = false;
    for (const g of plaGroups) {
      if (killed.has(g) || (vitalCount.get(g) ?? 0) >= 2) continue;
      killed.add(g);
      changed = true;
      for (const q of groups.stones[g]) {
        for (let i = q * 4, end = i + 4; i < end; i++) {
          const r = geo.nb[i];
          if (r < 0) continue;
          const index = regionOf[r];
          if (index >= 0 && !regions[index].bordersDead && (board[r] === EMPTY || board[r] === opp)) {
            regions[index].bordersDead = true;
            for (const v of regions[index].vital) vitalCount.set(v, (vitalCount.get(v) ?? 0) - 1);
          }
        }
      }
    }
  }
  for (const g of plaGroups) if (!killed.has(g)) for (const q of groups.stones[g]) result[q] = pla;
  for (const region of regions) {
    const safe = region.internal <= 1 && !region.bordersDead && atLeastOnePla;
    const bigSafe = !region.containsOpp && !region.bordersDead && atLeastOnePla;
    if (safe || bigSafe) {
      for (const q of region.points) result[q] = pla;
    } else if (!region.containsOpp && atLeastOnePla) {
      for (const q of region.points) if (result[q] === EMPTY) result[q] = pla;
    }
  }
}

export function calculateArea(board: Int8Array, size: number): Int8Array {
  const result = new Int8Array(size * size);
  areaForPla(board, size, BLACK, result);
  areaForPla(board, size, WHITE, result);
  for (let p = 0; p < result.length; p++) if (result[p] === EMPTY) result[p] = board[p];
  return result;
}

// ---------------------------------------------------------------------------
// Inputs

export type Features = { spatial: Float32Array; global: Float32Array };

/**
 * Inputs for the position after `moves`, from the side to move's point of view.
 * The record must be legal (it is replayed).
 */
export function buildFeatures(size: number, mode: Mode, moves: readonly number[]): Features {
  const pos = replay(size, mode, moves);
  if (!pos) throw new Error("illegal move record");
  const P = size * size;
  const spatial = new Float32Array(NUM_SPATIAL * P);
  const global = new Float32Array(NUM_GLOBAL);
  const set = (feature: number, point: number) => {
    spatial[feature * P + point] = 1;
  };
  const pla = pos.toPlay;
  const opp = opponent(pla);
  const groups = findGroups(pos.board, size);

  for (let p = 0; p < P; p++) {
    set(0, p);
    const stone = pos.board[p];
    if (stone === EMPTY) continue;
    set(stone === pla ? 1 : 2, p);
    const libs = groups.libs[groups.id[p]];
    if (libs === 1) set(3, p);
    else if (libs === 2) set(4, p);
    else if (libs === 3) set(5, p);
  }
  if (pos.ko >= 0) set(6, pos.ko);

  // Pass-alive area and territory.
  const area = calculateArea(pos.board, size);
  for (let p = 0; p < P; p++) {
    if (area[p] === pla) set(18, p);
    else if (area[p] === opp) set(19, p);
  }

  // The last five moves, alternating colours back from the opponent's.
  const n = moves.length;
  const history = Math.min(5, n);
  for (let i = 0; i < history; i++) {
    const move = moves[n - 1 - i];
    if (move === PASS) global[i] = 1;
    else set(9 + i, move);
  }

  // Ladders now, one move ago and two moves ago.
  iterLadders(pos, (point, working) => {
    set(14, point);
    if (pos.board[point] === opp && libertiesOf(pos, point).length > 1) for (const w of working) set(17, w);
  });
  const prev = n >= 1 ? replay(size, mode, moves.slice(0, n - 1)) : pos;
  const prevPrev = n >= 2 ? replay(size, mode, moves.slice(0, n - 2)) : prev;
  if (prev) iterLadders(prev, (point) => set(15, point));
  if (prevPrev) iterLadders(prevPrev, (point) => set(16, point));

  // Globals: komi from our side, pass ending the game, and the komi parity wave.
  let selfKomi = pla === WHITE ? KOMI : -KOMI;
  selfKomi = Math.max(-P - 20, Math.min(P + 20, selfKomi));
  global[5] = selfKomi / 20;
  global[14] = n > 0 && moves[n - 1] === PASS ? 1 : 0;
  const evenArea = P % 2 === 0;
  const komiFloor = evenArea ? Math.floor(selfKomi / 2) * 2 : Math.floor((selfKomi - 1) / 2) * 2 + 1;
  const delta = Math.max(0, Math.min(2, selfKomi - komiFloor));
  global[18] = delta < 0.5 ? delta : delta < 1.5 ? 1 - delta : delta - 2;
  return { spatial, global };
}

// ---------------------------------------------------------------------------
// Human profile metadata (SGFMetadata::fillMetadataRow for "rank_<r>" profiles)

/** KGS-style rank to KataGo's inverse rank: 9d = 1 … 1d = 9, 1k = 10 … 20k = 29. */
export function inverseRank(rank: string): number {
  const match = /^(\d+)([dk])$/.exec(rank);
  if (!match) throw new Error(`bad rank ${rank}`);
  const n = Number(match[1]);
  return match[2] === "d" ? 10 - n : 9 + n;
}

function daysSince1970(year: number, month: number, day: number): number {
  return Math.round((Date.UTC(year, month - 1, day) - Date.UTC(1970, 0, 1)) / 86400000);
}

export function buildMetadata(rank: string, boardArea: number): Float32Array {
  const row = new Float32Array(NUM_META);
  const inv = inverseRank(rank);
  row[0] = 1; // player is human
  row[1] = 1; // opponent is human
  for (let i = 0; i < Math.min(inv, 34); i++) {
    row[6 + i] = 1;
    row[6 + 34 + i] = 1;
  }
  row[74] = 0.5; // ratedness unknown
  row[79] = 1; // byo-yomi
  row[82] = 0.4 * (Math.log(1200 + 60) - 6.5);
  row[83] = 0.3 * (Math.log(30 + 1) - 3);
  row[84] = 0.5 * (Math.log(5 + 2) - 1.5);
  row[85] = 0.25 * (Math.log(0 + 2) - 1.5);
  row[86] = 0.5 * Math.log(boardArea / 361);
  const days = daysSince1970(2020, 3, 1);
  let period = 7;
  const factor = 80000 ** (1 / 31);
  for (let i = 0; i < 32; i++) {
    const revolutions = days / period;
    row[87 + i * 2] = Math.cos(revolutions * 2 * Math.PI);
    row[87 + i * 2 + 1] = Math.sin(revolutions * 2 * Math.PI);
    period *= factor;
  }
  row[151 + 2] = 1; // source: KGS
  return row;
}
