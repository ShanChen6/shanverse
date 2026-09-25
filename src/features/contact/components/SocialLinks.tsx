import * as React from "react";
import {
  FacebookIcon,
  GithubIcon,
  InstagramIcon,
  LinkedinIcon,
  TwitterIcon,
  YouTubeIcon,
  TikTokIcon,
} from "@/components/common/icons/BrandIcons";
import type { ContactConfig } from "../contact-config";

const icons = {
  GitHub: GithubIcon,
  LinkedIn: LinkedinIcon,
  Facebook: FacebookIcon,
  Instagram: InstagramIcon,
  Twitter: TwitterIcon,
  YouTube: YouTubeIcon,
  TikTok: TikTokIcon,
};

export function SocialLinks({
  socials,
}: {
  socials: ContactConfig["socials"];
}) {
  if (!socials.length) return null;
  return (
    <div className="flex flex-wrap gap-3">
      {socials.map(({ label, href }) => {
        const Icon = icons[label];
        return (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Mở ${label} của Shan`}
            className="inline-flex size-11 items-center justify-center rounded-xl border border-border bg-background text-foreground-secondary transition-colors hover:border-primary/50 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Icon aria-hidden="true" className="size-5" />
          </a>
        );
      })}
    </div>
  );
}
