"use client";

import * as React from "react";
import { useTypewriter } from "../hooks/useTypewriter";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import type { SocialLink } from "@/constants/social";
import {
  FacebookIcon,
  GithubIcon,
  InstagramIcon,
  LinkedinIcon,
} from "@/components/common/icons/BrandIcons";

const socialIcons = {
  GitHub: GithubIcon,
  LinkedIn: LinkedinIcon,
  Facebook: FacebookIcon,
  Instagram: InstagramIcon,
};

const WORDS_TO_TYPE = [
  "a Software Developer",
  "a Full-stack Engineer",
  "a Tech Creator",
];

export function HeroSection({ socialLinks }: { socialLinks: SocialLink[] }) {
  const typedText = useTypewriter({
    words: WORDS_TO_TYPE,
    typingSpeed: 100,
    deletingSpeed: 50,
    delayDuration: 1500,
  });

  return (
    <div className="space-y-6 lg:col-span-7">
      <div className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1.5 text-xs font-medium text-success">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
        </span>
        Available for work
      </div>

      <div className="space-y-2">
        <h1 className="text-display tracking-tight text-foreground">
          Hi! I&apos;m{" "}
          <span className="bg-linear-to-r from-primary to-indigo-400 bg-clip-text text-transparent">
            ShanDev
          </span>
        </h1>

        <div className="text-display tracking-tight text-foreground-secondary min-h-24 sm:min-h-12 md:min-h-14 flex items-center">
          <p className="leading-tight">
            And I am <br />
            <span className="text-primary border-r-2 border-primary animate-pulse pr-1 inline-block">
              {typedText}
            </span>
          </p>
        </div>
      </div>

      <p className="text-lg text-foreground-secondary leading-relaxed max-w-2xl">
        I&apos;m a software engineer building full-stack products and writing
        about frontend architecture, backend systems, and practical AI
        workflows. I care about interfaces that stay readable as products grow.
      </p>

      <div className="flex flex-wrap items-center gap-4 pt-2">
        <Button asChild size="lg" className="gap-2">
          <Link href={ROUTES.ABOUT}>
            About Me <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href={ROUTES.CONTACT}>Contact</Link>
        </Button>
      </div>

      {socialLinks.some((link) => link.label !== "Email") ? (
        <div className="flex items-center gap-4 pt-2">
          {socialLinks.filter((link) => link.label !== "Email").map(({ label, href }) => {
            const Icon = socialIcons[label as keyof typeof socialIcons];
            return (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="text-foreground-secondary transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Icon aria-hidden="true" className="h-5 w-5" />
              </a>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
