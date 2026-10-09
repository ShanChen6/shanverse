import * as React from "react";
import { SocialIcon } from "@/components/common/icons/SocialIcon";
import type { ContactConfig } from "../contact-config";

export function SocialLinks({
  socials,
  openLabel,
}: {
  socials: ContactConfig["socials"];
  /** Localized accessible name for each link, e.g. "Open Shan's GitHub". */
  openLabel: (label: string) => string;
}) {
  if (!socials.length) return null;
  return (
    <div className="flex flex-wrap gap-3">
      {socials.map(({ label, href }) => {
        return (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={openLabel(label)}
            className="inline-flex size-11 items-center justify-center rounded-xl border border-border bg-background text-foreground-secondary transition-colors hover:border-primary/50 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary"
          >
            <SocialIcon label={label} className="size-5" />
          </a>
        );
      })}
    </div>
  );
}
