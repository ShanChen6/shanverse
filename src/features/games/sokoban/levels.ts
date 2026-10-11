// Sokoban levels, easiest first. Every level is checked by the solver in
// logic.test.ts, which also asserts `par` (the fewest possible moves).
//   #  wall   @  Tianwu   $  crate   .  landing pad   *  crate on pad   +  Tianwu on pad

export type SokobanLevel = {
  id: string;
  name: { vi: string; en: string };
  /** Fewest moves that solve the level, verified by the solver. */
  par: number;
  map: string[];
};

export const LEVELS: SokobanLevel[] = [
  {
    id: "first-step",
    name: { vi: "Bước đầu tiên", en: "First step" },
    par: 3,
    map: [
      "#######",
      "#@ $ .#",
      "#######",
    ],
  },
  {
    id: "corner",
    name: { vi: "Rẽ góc", en: "Round the corner" },
    par: 12,
    map: [
      "######",
      "#@   #",
      "# $# #",
      "#    #",
      "#. ###",
      "####",
    ],
  },
  {
    id: "two-crates",
    name: { vi: "Hai thùng hàng", en: "Two crates" },
    par: 9,
    map: [
      "#######",
      "#.   .#",
      "# $$  #",
      "#  @  #",
      "#######",
    ],
  },
  {
    id: "crossroads",
    name: { vi: "Ngã tư", en: "Crossroads" },
    par: 7,
    map: [
      "#######",
      "#  .  #",
      "# #$# #",
      "#.$@$.#",
      "# #$# #",
      "#  .  #",
      "#######",
    ],
  },
  {
    id: "narrow-door",
    name: { vi: "Cửa hẹp", en: "Narrow door" },
    par: 13,
    map: [
      " ######",
      "##  . #",
      "#  $$ #",
      "# #.@ #",
      "#  ####",
      "####",
    ],
  },
  {
    id: "cargo-bay",
    name: { vi: "Khoang hàng", en: "Cargo bay" },
    par: 13,
    map: [
      "  ####",
      "###  #",
      "#. $ #",
      "#.$$ ##",
      "#. @  #",
      "#######",
    ],
  },
  {
    id: "warehouse",
    name: { vi: "Nhà kho", en: "Warehouse" },
    par: 19,
    map: [
      "#########",
      "#.  #   #",
      "#.$ $ $.#",
      "## ## ###",
      " #  @ #",
      " ######",
    ],
  },
  {
    id: "maze",
    name: { vi: "Mê cung", en: "Maze" },
    par: 28,
    map: [
      "##########",
      "#   #   @#",
      "# . $ ## #",
      "### #  . #",
      "#   ##$# #",
      "# .    $ #",
      "##########",
    ],
  },
  {
    id: "dock",
    name: { vi: "Bến đỗ", en: "Docking bay" },
    par: 32,
    map: [
      "#########",
      "#.    $@#",
      "##$### ##",
      "#   .   #",
      "# #$# # #",
      "#   .   #",
      "#########",
    ],
  },
  {
    id: "hangar",
    name: { vi: "Nhà chứa tàu", en: "Hangar" },
    par: 38,
    map: [
      "#########",
      "#..$ @# #",
      "#   #   #",
      "###$##$ #",
      "#   .   #",
      "#  ###  #",
      "#########",
    ],
  },
  {
    id: "station",
    name: { vi: "Trạm vũ trụ", en: "Space station" },
    par: 32,
    map: [
      "##########",
      "#    #  @#",
      "# ## #$# #",
      "#  ..  $ #",
      "## #$ ## #",
      "#   .. $ #",
      "# #  #   #",
      "##########",
    ],
  },
  {
    id: "landing-field",
    name: { vi: "Bãi đáp lớn", en: "Landing field" },
    par: 34,
    map: [
      "  #####",
      "###   #",
      "#.@$  #",
      "### $.#",
      "#.##$ #",
      "# # . ##",
      "#$ *$$.#",
      "#   .  #",
      "########",
    ],
  },
];
