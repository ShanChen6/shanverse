// Painted art for Bách Linh Kỳ monsters. A monster listed here is drawn from
// its image instead of its vector portrait (portraits.tsx); every other
// monster keeps the vector one, so art can be added one monster at a time.
//
// To add a monster:
//   1. Add a line below. `face` is the square part of the source image shown
//      on the round piece: the centre (x, y) and the side of the square, each
//      as a fraction of the image (0 to 1). Aim it at the head and shoulders.
//   2. Run `pnpm blk:art path/to/<monster id>.png` on the source image (square,
//      transparent background). It writes the two small files the game loads
//      into public/games/bach-linh-ky/art/: <id>-token.webp, the face for the
//      piece, and <id>.webp, the whole figure for the summon card.
//
// Prompts for generating the images: docs/bach-linh-ky-art-prompts.md.

export type MonsterArt = {
  /** The part of the source image shown on the round piece: centre x, centre y, side, as fractions of the image. */
  face: [x: number, y: number, side: number];
};

export const MONSTER_ART: Record<string, MonsterArt> = {
  "son-tinh": { face: [0.48, 0.2, 0.46] },
};

const DIR = "/games/bach-linh-ky/art";
/** The face, already cropped and sized for a piece. */
export const tokenSrc = (id: string) => `${DIR}/${id}-token.webp`;
/** The whole figure. */
export const figureSrc = (id: string) => `${DIR}/${id}.webp`;
