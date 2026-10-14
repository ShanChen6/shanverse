// The six battlefields. Each is drawn as its top half only (Tianwu's side,
// rows 0-3); the bottom half (the player's side, rows 4-7) is its mirror, so
// both sides always get the same ground and the board is fair.
//
//   .  plain      ^  mountain      ~  river      m  shrine (miếu)
//   a  sacred temple for the player (side 0). It sits on Tianwu's half and
//      mirrors to Tianwu's own temple on the player's half.
//
// maps.test (in rules.test.ts) checks every map: 8×8, mirrored, room to
// place five pieces on each back two rows, and every open cell reachable.

import type { Text } from "./monsters";

export type Terrain = "plain" | "mountain" | "river" | "shrine" | "temple";

export type MapDef = {
  id: string;
  name: Text;
  blurb: Text;
  /** Top half, rows 0-3, Tianwu's side. */
  top: [string, string, string, string];
};

export const MAPS: MapDef[] = [
  {
    id: "tan-vien",
    name: { vi: "Núi Tản Viên", en: "Mount Tản Viên" },
    blurb: { vi: "Núi non trùng điệp, lối đi hẹp. Sơn Tinh như cá gặp nước.", en: "Rows of peaks and narrow passes. The Mountain God is at home." },
    top: [
      "........",
      "..^..^..",
      ".^^a.^^.",
      "...^^..m",
    ],
  },
  {
    id: "song-hong",
    name: { vi: "Sông Hồng", en: "Red River" },
    blurb: { vi: "Dòng sông chia đôi trận địa, chỉ hai bến cạn để lội qua.", en: "A river splits the field, with only two shallow fords." },
    top: [
      "........",
      ".....~..",
      ".a..~~..",
      "~~~~~..~",
    ],
  },
  {
    id: "ho-guom",
    name: { vi: "Hồ Gươm", en: "Sword Lake" },
    blurb: { vi: "Mặt hồ lớn giữa trận, hai miếu cổ canh hai bên bờ.", en: "A broad lake in the middle, two old shrines on its shores." },
    top: [
      "........",
      ".m....m.",
      "..~~~~a.",
      "..~~~~..",
    ],
  },
  {
    id: "da-trach",
    name: { vi: "Đầm Dạ Trạch", en: "Dạ Trạch Marsh" },
    blurb: { vi: "Đầm lầy loang lổ, quân hệ Thủy tung hoành.", en: "Patchy marshland where water creatures roam free." },
    top: [
      "........",
      ".~..~..~",
      "~.a~..~.",
      ".~..~~..",
    ],
  },
  {
    id: "phu-dong",
    name: { vi: "Làng Phù Đổng", en: "Phù Đổng Village" },
    blurb: { vi: "Làng quê nhiều miếu, lũy tre làm vách che.", en: "A village of many shrines, with bamboo hedges for cover." },
    top: [
      "........",
      "m..^^..m",
      "...a....",
      ".^.m..^.",
    ],
  },
  {
    id: "co-loa",
    name: { vi: "Thành Cổ Loa", en: "Cổ Loa Citadel" },
    blurb: { vi: "Thành xoáy ốc, tường thành vòng vèo, cửa ra vào hiếm hoi.", en: "A spiral citadel: winding walls and few gates." },
    top: [
      "........",
      ".^^^.^^.",
      ".^a..m^.",
      "...^^...",
    ],
  },
];

export const SIZE = 8;

const CODE: Record<string, Terrain> = { ".": "plain", "^": "mountain", "~": "river", m: "shrine", a: "temple" };

export type Board = {
  terrain: Terrain[];
  /** For temple cells: which side it evolves (0 the player, 1 Tianwu). */
  templeOwner: (0 | 1 | null)[];
};

/** The full 8×8 board: the drawn top half and its mirror for the bottom half. */
export function buildBoard(map: MapDef): Board {
  const rows = [...map.top, ...[...map.top].reverse()];
  const terrain: Terrain[] = [];
  const templeOwner: (0 | 1 | null)[] = [];
  rows.forEach((row, y) => {
    if (row.length !== SIZE) throw new Error(`${map.id}: row ${y} is ${row.length} wide`);
    for (const ch of row) {
      const kind = CODE[ch];
      if (!kind) throw new Error(`${map.id}: unknown map character "${ch}"`);
      terrain.push(kind);
      // A temple drawn on the top half belongs to the player; its mirror below to Tianwu.
      templeOwner.push(kind === "temple" ? (y < SIZE / 2 ? 0 : 1) : null);
    }
  });
  return { terrain, templeOwner };
}

export const MAP_BY_ID = new Map(MAPS.map((m) => [m.id, m]));
