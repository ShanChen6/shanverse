// Writes the Tianwu sticker files in public/stickers from the mascot components,
// so the downloads always match what the site draws. Run: pnpm stickers:tianwu
import fs from "node:fs";
import path from "node:path";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { Tianwu, TianwuBadge, TianwuShip } from "../src/components/mascot/Tianwu";
import { TIANWU_STICKERS, type TianwuStickerId } from "../src/components/mascot/stickers";

const drawings: Record<TianwuStickerId, React.ReactElement> = {
  wave: <Tianwu pose="wave" />,
  determined: <Tianwu pose="determined" />,
  push: <Tianwu pose="push" />,
  ship: <TianwuShip />,
  avatar: <TianwuBadge />,
};

// A white die-cut outline and soft shadow make the drawings read as stickers.
const STICKER_FILTER =
  '<defs><filter id="sticker" x="-10%" y="-10%" width="120%" height="120%">' +
  '<feMorphology in="SourceAlpha" operator="dilate" radius="5" result="grow"/>' +
  '<feFlood flood-color="#FFFFFF"/><feComposite in2="grow" operator="in" result="outline"/>' +
  '<feDropShadow in="outline" dx="0" dy="3" stdDeviation="3" flood-color="#031242" flood-opacity="0.25" result="shadow"/>' +
  '<feMerge><feMergeNode in="shadow"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>';

const outDir = path.join(process.cwd(), "public", "stickers");
fs.mkdirSync(outDir, { recursive: true });

for (const sticker of TIANWU_STICKERS) {
  const markup = renderToStaticMarkup(drawings[sticker.id]).replace(' aria-hidden="true"', "");
  const viewBox = /viewBox="([^"]+)"/.exec(markup)?.[1] ?? "0 0 200 200";
  const [x, y, w, h] = viewBox.split(" ").map(Number);
  // Pad the canvas so the outline is not clipped, then wrap the art in the filter.
  const pad = sticker.id === "avatar" ? 0 : 12;
  const inner = markup.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "");
  const body = pad ? `${STICKER_FILTER}<g filter="url(#sticker)">${inner}</g>` : inner;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x - pad} ${y - pad} ${w + pad * 2} ${h + pad * 2}" width="${(w + pad * 2) * 2}" height="${(h + pad * 2) * 2}">` +
    `<title>Tianwu · Shanverse</title>${body}</svg>\n`;
  const file = path.join(outDir, path.basename(sticker.href));
  fs.writeFileSync(file, svg);
  console.log("wrote", path.relative(process.cwd(), file));
}
