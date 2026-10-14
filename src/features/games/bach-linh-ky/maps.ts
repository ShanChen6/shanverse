// The six battlefields. Each is drawn as its top half only (Tianwu's side,
// rows 0-3); the bottom half (the player's side, rows 4-7) is its mirror, so
// both sides always get the same ground and the board is fair.
//
//   .  plain      ^  mountain      ~  river      m  shrine (miếu)
//   Linh địa, one per element (a monster of that element fights +1 on it):
//   o  ore (Kim)      f  forest (Mộc)     w  marsh (Thủy)
//   l  lava (Hỏa)     d  mound (Thổ)
//   a  sacred temple for the player (side 0). It sits on Tianwu's half and
//      mirrors to Tianwu's own temple on the player's half.
//
// maps.test (in rules.test.ts) checks every map: 8×8, mirrored, room to
// place five pieces on each back two rows, and every open cell reachable.

import type { Element, Text } from "./monsters";

export type Terrain = "plain" | "mountain" | "river" | "shrine" | "temple" | "ore" | "forest" | "marsh" | "lava" | "mound";

/**
 * Linh địa: the ground of each element. A monster of that element fights one
 * level higher while standing on it, and each also has a rule of its own
 * (see rules.ts): ore lengthens shots, forest hides from shots, marsh stops
 * walkers, lava bars all but Fire, a mound cannot be swapped or bound.
 */
export const ELEMENT_TERRAIN: Record<Element, Terrain> = { kim: "ore", moc: "forest", thuy: "marsh", hoa: "lava", tho: "mound" };

export type MapDef = {
  id: string;
  name: Text;
  blurb: Text;
  /** The element whose ground dominates this map, if any. */
  element?: Element;
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
  // --- One battlefield for each element ---
  {
    id: "dong-son",
    element: "kim",
    name: { vi: "Lò đúc Đông Sơn", en: "Đông Sơn Foundry" },
    blurb: { vi: "Mỏ đồng khắp nơi: quân Kim đứng trên mỏ thêm sức, và ai đứng trên mỏ cũng bắn xa thêm một ô.", en: "Copper seams everywhere: Metal fights harder on them, and anyone on ore shoots one cell further." },
    top: [
      "........",
      "..o..o..",
      ".^o..o^a",
      "...oo...",
    ],
  },
  {
    id: "thuong-ngan",
    element: "moc",
    name: { vi: "Rừng Thượng Ngàn", en: "The Upland Forest" },
    blurb: { vi: "Rừng rậm che kín: đứng trong rừng không bị bắn trúng, quân Mộc như về nhà.", en: "Thick woods: nothing can be shot inside them, and Wood is at home." },
    top: [
      "........",
      ".f....f.",
      "ff.a.ff.",
      "..ff..f.",
    ],
  },
  {
    id: "lac-viet",
    element: "thuy",
    name: { vi: "Đầm Lạc Việt", en: "Lạc Việt Marshes" },
    blurb: { vi: "Đầm lầy và sông ngòi: quân đi bộ sa chân là dừng, quân Thủy bơi lội tự do.", en: "Marsh and streams: walkers bog down on entering, Water swims free." },
    top: [
      "........",
      "..w..w..",
      "~w..a.w~",
      "~~w..w~~",
    ],
  },
  {
    id: "lang-chay",
    element: "hoa",
    name: { vi: "Làng Cháy", en: "The Burnt Village" },
    blurb: { vi: "Nơi ngựa sắt Thánh Gióng phun lửa: dung nham chỉ quân Hỏa đặt chân được, quân bay chỉ lướt qua.", en: "Where Gióng's iron horse breathed fire: only Fire can stand on the lava; flyers can only pass over." },
    top: [
      "........",
      ".l....l.",
      "..l.a.l.",
      "ll..ll..",
    ],
  },
  {
    id: "dong-da",
    element: "tho",
    name: { vi: "Gò Đống Đa", en: "The Mounds of Đống Đa" },
    blurb: { vi: "Gò đất nhấp nhô: quân đứng trên gò không bị trói, không bị dời chỗ, quân Thổ vững như núi.", en: "Rolling mounds: no one on a mound can be bound or swapped, and Earth stands like a mountain." },
    top: [
      "........",
      "..d..d..",
      ".d.^^.da",
      "d..dd..d",
    ],
  },
  // --- New layouts ---
  {
    id: "ngu-hanh-tran",
    name: { vi: "Trận Ngũ Hành", en: "The Five Elements Array" },
    blurb: { vi: "Đủ năm loại linh địa: mỗi hành có một chỗ đứng của mình.", en: "All five kinds of sacred ground: every element has a place to stand." },
    top: [
      "........",
      ".o.f.l..",
      "w..a..d.",
      "..^..^..",
    ],
  },
  {
    id: "dao-hoang",
    name: { vi: "Đảo hoang", en: "The Desert Island" },
    blurb: { vi: "Hòn đảo nơi Mai An Tiêm trồng dưa: biển bao quanh hai bờ, lối giữa đảo rộng mở.", en: "Mai An Tiêm's island: sea along both shores, an open path through the middle." },
    top: [
      "........",
      "~~~..~~~",
      "~.a..m.~",
      "~......~",
    ],
  },
  {
    id: "thang-long",
    name: { vi: "Thành Thăng Long", en: "Thăng Long Citadel" },
    blurb: { vi: "Hai lớp tường thành chắn giữa trận, chỉ có hai cổng để qua.", en: "A double wall across the field, with only two gates." },
    top: [
      "........",
      ".^^..^^.",
      "...a....",
      "^^.^^.^^",
    ],
  },
  {
    id: "bach-dang",
    name: { vi: "Sông Bạch Đằng", en: "Bạch Đằng River" },
    blurb: { vi: "Lòng sông cắm đầy cọc gỗ: chỉ quân bay và quân thủy luồn qua dễ dàng.", en: "A river full of hidden stakes: only flyers and swimmers slip through easily." },
    top: [
      "........",
      "........",
      "~^~a~^~~",
      "~~~^~~^~",
    ],
  },
];

export const SIZE = 8;

const CODE: Record<string, Terrain> = {
  ".": "plain",
  "^": "mountain",
  "~": "river",
  m: "shrine",
  a: "temple",
  o: "ore",
  f: "forest",
  w: "marsh",
  l: "lava",
  d: "mound",
};

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
