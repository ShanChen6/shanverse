// Downloadable Tianwu stickers. The SVG files in public/stickers are generated
// from the components in Tianwu.tsx by `pnpm stickers:tianwu`.

export type TianwuStickerId = "wave" | "determined" | "push" | "ship" | "avatar";

export const TIANWU_STICKERS: ReadonlyArray<{
  id: TianwuStickerId;
  href: string;
  labelKey: "mascot.stickerWave" | "mascot.stickerDetermined" | "mascot.stickerPush" | "mascot.stickerShip" | "mascot.stickerBadge";
}> = [
  { id: "wave", href: "/stickers/tianwu-wave.svg", labelKey: "mascot.stickerWave" },
  { id: "determined", href: "/stickers/tianwu-determined.svg", labelKey: "mascot.stickerDetermined" },
  { id: "push", href: "/stickers/tianwu-push.svg", labelKey: "mascot.stickerPush" },
  { id: "ship", href: "/stickers/tianwu-ship.svg", labelKey: "mascot.stickerShip" },
  { id: "avatar", href: "/stickers/tianwu-avatar.svg", labelKey: "mascot.stickerBadge" },
];
