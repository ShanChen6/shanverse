import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import {
  FacebookIcon,
  GithubIcon,
  InstagramIcon,
  LinkedinIcon,
} from "@/components/common/icons/BrandIcons";

const SOCIAL_LINKS = [
  { label: "GitHub", href: "https://github.com", icon: GithubIcon },
  { label: "LinkedIn", href: "https://linkedin.com", icon: LinkedinIcon },
  { label: "Facebook", href: "https://facebook.com", icon: FacebookIcon },
  { label: "Instagram", href: "https://instagram.com", icon: InstagramIcon },
];

export function HeroSection() {
  return (
    <div className="space-y-6 lg:col-span-7">
      <div className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1.5 text-xs font-medium text-success">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
        </span>
        Available for work
      </div>

      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground">
        Xin chào, tôi là{" "}
        <span className="bg-linear-to-r from-primary to-indigo-400 bg-clip-text text-transparent">
          Software Developer
        </span>
      </h1>

      <p className="text-lg text-foreground-secondary leading-relaxed max-w-2xl">
        Tôi biến những vấn đề phức tạp thành sản phẩm đơn giản, hữu ích. Tôi
        viết về kỹ nghệ phần mềm và những hệ thống đứng sau nó.
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

      <div className="flex items-center gap-4 pt-2">
        {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={label}
            className="text-foreground-secondary transition-colors hover:text-primary"
          >
            <Icon className="h-5 w-5" />
          </a>
        ))}
      </div>
    </div>
  );
}
