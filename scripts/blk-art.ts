// Prepares painted art for Bách Linh Kỳ. From each source image it writes
// the two small files the game loads:
//
//   public/games/bach-linh-ky/art/<id>-token.webp   the face, for the round piece
//   public/games/bach-linh-ky/art/<id>.webp         the whole figure, for the summon card
//
//   pnpm blk:art path/to/son-tinh.png            # one image
//   pnpm blk:art path/to/folder                  # every image in a folder
//
// A source image is square, has a transparent background, and is named after
// its monster's id (son-tinh.png, thuy-tinh.webp...). The monster must be
// listed in src/features/games/bach-linh-ky/art-images.ts first: its `face`
// there says which part of the image goes on the piece. Source images are
// not kept in the repository; only the two outputs are.

import { existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { basename, extname, join } from "node:path";

import sharp from "sharp";

import { MONSTER_ART } from "../src/features/games/bach-linh-ky/art-images";

const OUT = "public/games/bach-linh-ky/art";
/** A piece is at most about 64 CSS px wide; this covers 2× screens. */
const TOKEN_PX = 144;
/** The summon card shows the figure 224 CSS px tall; this covers 2× screens. */
const FIGURE_PX = 448;
const IMAGE = /\.(png|webp|jpe?g|avif)$/i;

const kb = (path: string) => `${(statSync(path).size / 1024).toFixed(1)} KB`;

async function prepare(file: string) {
  const id = basename(file, extname(file));
  const art = MONSTER_ART[id];
  if (!art) {
    console.warn(`skip ${file}: "${id}" is not listed in art-images.ts`);
    return;
  }
  const { width, height } = await sharp(file).metadata();
  if (!width || !height) throw new Error(`${file}: cannot read its size`);
  if (width !== height) console.warn(`${file}: ${width}×${height} is not square; the face may be off`);

  // The face square, kept inside the image.
  const [x, y, side] = art.face;
  const size = Math.round(Math.min(side * width, width, height));
  const left = Math.round(Math.min(Math.max(x * width - size / 2, 0), width - size));
  const top = Math.round(Math.min(Math.max(y * height - size / 2, 0), height - size));

  const token = join(OUT, `${id}-token.webp`);
  const figure = join(OUT, `${id}.webp`);
  await sharp(file).extract({ left, top, width: size, height: size }).resize(TOKEN_PX, TOKEN_PX).webp({ quality: 78, effort: 6 }).toFile(token);
  await sharp(file).resize(FIGURE_PX, FIGURE_PX, { fit: "inside" }).webp({ quality: 76, effort: 6 }).toFile(figure);
  console.log(`${id}: token ${kb(token)}, figure ${kb(figure)}`);
}

async function main() {
  const inputs = process.argv.slice(2);
  if (!inputs.length) {
    console.error("Usage: pnpm blk:art <image or folder>...");
    process.exit(1);
  }
  mkdirSync(OUT, { recursive: true });
  for (const input of inputs) {
    if (!existsSync(input)) throw new Error(`${input}: not found`);
    const files = statSync(input).isDirectory() ? readdirSync(input).filter((f) => IMAGE.test(f)).sort().map((f) => join(input, f)) : [input];
    for (const file of files) await prepare(file);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
