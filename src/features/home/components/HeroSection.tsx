"use client";

import * as React from "react";
import { LocalizedLink as Link } from "@/components/i18n/LocalizedLink";
import { ArrowRight } from "lucide-react";

import {
  FacebookIcon,
  GithubIcon,
  InstagramIcon,
  LinkedinIcon,
  TwitterIcon,
  YouTubeIcon,
  TikTokIcon,
} from "@/components/common/icons/BrandIcons";
import { Button } from "@/components/ui/button";
import type { SocialLink } from "@/constants/social";
import { HOME_HERO } from "../home.data";
import { useTypewriter } from "../hooks/useTypewriter";

const socialIcons = {
  GitHub: GithubIcon,
  LinkedIn: LinkedinIcon,
  Facebook: FacebookIcon,
  Instagram: InstagramIcon,
  Twitter: TwitterIcon,
  YouTube: YouTubeIcon,
  TikTok: TikTokIcon,

};

export function HeroSection({ socialLinks }: { socialLinks: SocialLink[] }) {
  const { text, prefersReducedMotion } = useTypewriter({
    words: HOME_HERO.typewriterItems,
  });
  const longestPhrase = HOME_HERO.typewriterItems.reduce(
    (longest, phrase) => phrase.length > longest.length ? phrase : longest,
    "",
  );
  const visibleSocials = socialLinks.filter((link) => link.label !== "Email");

  return (
    <div className="min-w-0 space-y-6 lg:col-span-7">
      <p className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1.5 text-xs font-medium text-success">
        <span aria-hidden="true" className="size-2 rounded-full bg-success" />
        {HOME_HERO.badge}
      </p>

      <div className="space-y-3">
        <h1 className="max-w-3xl text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          {HOME_HERO.greeting}{" "}
          <span className="text-primary">{HOME_HERO.name}</span>
        </h1>

        <p className="sr-only">And I am {HOME_HERO.typewriterItems.join(", ")}</p>
        <div
          aria-hidden="true"
          className="min-h-9 overflow-hidden text-xl font-semibold text-foreground-secondary sm:min-h-10 sm:text-2xl"
        >
          <span>And I am </span>
          <span className="relative inline-grid max-w-full text-primary">
            <span className="invisible col-start-1 row-start-1 whitespace-nowrap">{longestPhrase}</span>
            <span className="col-start-1 row-start-1 whitespace-nowrap">
              {prefersReducedMotion ? HOME_HERO.typewriterItems[0] : text}
              {!prefersReducedMotion ? <span className="ml-0.5 border-r-2 border-primary" /> : null}
            </span>
          </span>
        </div>
      </div>

      <p className="max-w-2xl text-pretty text-base leading-7 text-foreground-secondary sm:text-lg sm:leading-8">
        {HOME_HERO.description}
      </p>

      <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap sm:items-center">
        <Button asChild size="lg" className="w-full gap-2 sm:w-auto">
          <Link href={HOME_HERO.primaryCta.href}>
            {HOME_HERO.primaryCta.label}
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
          <Link href={HOME_HERO.secondaryCta.href}>{HOME_HERO.secondaryCta.label}</Link>
        </Button>
      </div>

      {visibleSocials.length ? (
        <nav aria-label="Shan's social profiles" className="flex flex-wrap items-center gap-2 pt-1">
          {visibleSocials.map(({ label, href }) => {
            const Icon = socialIcons[label as keyof typeof socialIcons];
            return (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="inline-flex size-10 items-center justify-center rounded-lg text-foreground-secondary hover:bg-surface hover:text-primary focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Icon aria-hidden="true" className="size-5" />
              </a>
            );
          })}
        </nav>
      ) : null}
    </div>
  );
}
