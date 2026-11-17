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
  "chim-lac": { face: [0.54, 0.47, 0.86] },
  "ma-tranh": { face: [0.6, 0.34, 0.36] },
  "dai-bang": { face: [0.5, 0.4, 0.45] },
  "ong-ba-muoi": { face: [0.71, 0.5, 0.42] },
  "con-kim": { face: [0.36, 0.5, 0.38] },
  "cao-bien": { face: [0.42, 0.19, 0.4] },
  "an-duong-vuong": { face: [0.43, 0.2, 0.4] },
  "ly-thuong-kiet": { face: [0.47, 0.2, 0.36] },
  "bach-ho": { face: [0.71, 0.43, 0.4] },
  "tran-hung-dao": { face: [0.6, 0.18, 0.36] },
  "moc-tinh-non": { face: [0.44, 0.36, 0.52] },
  "ma-cay-gao": { face: [0.52, 0.4, 0.4] },
  "chu-cuoi": { face: [0.52, 0.38, 0.38] },
  "vuon-than": { face: [0.62, 0.3, 0.32] },
  "bach-ke-tinh": { face: [0.62, 0.16, 0.38] },
  "tien-dung": { face: [0.43, 0.21, 0.4] },
  "chu-dong-tu": { face: [0.48, 0.21, 0.36] },
  "chan-tinh": { face: [0.55, 0.36, 0.45] },
  "mau-thuong-ngan": { face: [0.51, 0.17, 0.36] },
  "xuong-cuong": { face: [0.5, 0.42, 0.3] },
  "ma-da": { face: [0.47, 0.25, 0.35] },
  "ca-chep": { face: [0.42, 0.42, 0.42] },
  "mai-an-tiem": { face: [0.49, 0.13, 0.34] },
  "da-trang": { face: [0.53, 0.41, 0.5] },
  "nguu-tinh": { face: [0.67, 0.45, 0.42] },
  "ngu-tinh": { face: [0.7, 0.42, 0.38] },
  "thuy-tinh": { face: [0.53, 0.2, 0.42] },
  "thuong-luong": { face: [0.7, 0.2, 0.35] },
  "lac-long-quan": { face: [0.39, 0.25, 0.36] },
  "mau-thoai": { face: [0.49, 0.19, 0.38] },
  "coc-tia": { face: [0.43, 0.47, 0.45] },
  "ma-troi": { face: [0.46, 0.5, 0.5] },
  "ho-tinh": { face: [0.69, 0.22, 0.36] },
  "ong-tao": { face: [0.5, 0.14, 0.38] },
  "xa-tinh": { face: [0.6, 0.2, 0.35] },
  "ngua-sat": { face: [0.68, 0.19, 0.38] },
  "phuong-hoang": { face: [0.55, 0.16, 0.4] },
  "than-set": { face: [0.44, 0.31, 0.36] },
  "phu-dong": { face: [0.45, 0.22, 0.4] },
  "lieu-hanh": { face: [0.5, 0.17, 0.4] },
  "thach-tinh": { face: [0.52, 0.24, 0.4] },
  "rua-con": { face: [0.54, 0.68, 0.42] },
  "lan": { face: [0.68, 0.25, 0.38] },
  "ong-dia": { face: [0.5, 0.22, 0.4] },
  "tu-dao-hanh": { face: [0.49, 0.14, 0.36] },
  "voi-chin-nga": { face: [0.57, 0.37, 0.45] },
  "mau-dia": { face: [0.48, 0.18, 0.38] },
  "nghe": { face: [0.7, 0.17, 0.38] },
  "son-tinh": { face: [0.48, 0.2, 0.46] },
  "kim-quy": { face: [0.56, 0.22, 0.35] },
};

const DIR = "/games/bach-linh-ky/art";
/** The face, already cropped and sized for a piece. */
export const tokenSrc = (id: string) => `${DIR}/${id}-token.webp`;
/** The whole figure. */
export const figureSrc = (id: string) => `${DIR}/${id}.webp`;
