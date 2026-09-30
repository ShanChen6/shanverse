import * as React from "react";
import Image from "next/image";
import { AtSign } from "lucide-react";

import type { SocialLabel } from "@/constants/social";

type SocialIconLabel = SocialLabel | "Email";

type SocialIconAsset = string | { light: string; dark: string };

const socialIconAssets: Partial<Record<SocialLabel, SocialIconAsset>> = {
  GitHub: {
    light: "/social/GitHub.svg",
    dark: "/social/GitHub-White.png",
  },
  Discord: "/social/Discord.svg",
  Reddit: "/social/Reddit.svg",
  LinkedIn: "/social/LinkedIn.svg",
  Twitter: {
    light: "/social/X-Black.svg",
    dark: "/social/X-White.svg",
  },
  Facebook: "/social/Facebook.svg",
  Instagram: {
    light: "/social/Instagram.svg",
    dark: "/social/Instagram%20(2).svg",
  },
  YouTube: {
    light: "/social/YouTube-Light.svg",
    dark: "/social/YouTube.svg",
  },
  TikTok: {
    light: "/social/TikTok-Light.svg",
    dark: "/social/TikTok.svg",
  },
};

export function SocialIcon({
  label,
  className = "size-5",
}: {
  label: SocialIconLabel;
  className?: string;
}) {
  const asset = label === "Email" ? undefined : socialIconAssets[label];

  if (typeof asset === "string") {
    return (
      <Image
        src={asset}
        alt=""
        aria-hidden="true"
        width={24}
        height={24}
        className={`${className} object-contain`}
      />
    );
  }

  if (asset) {
    return (
      <>
        <Image
          src={asset.light}
          alt=""
          aria-hidden="true"
          width={24}
          height={24}
          className={`${className} object-contain dark:hidden`}
        />
        <Image
          src={asset.dark}
          alt=""
          aria-hidden="true"
          width={24}
          height={24}
          className={`${className} hidden object-contain dark:block`}
        />
      </>
    );
  }

  if (label === "Email") {
    return <AtSign aria-hidden="true" className={className} />;
  }
}
