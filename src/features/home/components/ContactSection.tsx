import * as React from "react";
import { LocalizedLink as Link } from "@/components/i18n/LocalizedLink";
import { ArrowRight, AtSign } from "lucide-react";

import {
  FacebookIcon,
  GithubIcon,
  InstagramIcon,
  LinkedinIcon,
  TikTokIcon,
  YouTubeIcon,
  TwitterIcon,
} from "@/components/common/icons/BrandIcons";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import type { SocialLink } from "@/constants/social";

const socialIcons = {
  GitHub: GithubIcon,
  LinkedIn: LinkedinIcon,
  Facebook: FacebookIcon,
  Instagram: InstagramIcon,
  Twitter: TwitterIcon,
  YouTube: YouTubeIcon,
  TikTok: TikTokIcon,
  Email: AtSign,
};

export function ContactSection({ socialLinks }: { socialLinks: SocialLink[] }) {
  return (
    <section
      aria-labelledby="home-contact-heading"
      className="relative overflow-hidden rounded-3xl border border-primary/20 bg-primary/5 p-6 sm:p-8 lg:p-10"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-24 size-64 rounded-full border border-primary/10"
      />
      <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Let&apos;s build something useful
          </p>
          <h2
            id="home-contact-heading"
            className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
          >
            Bạn có một ý tưởng muốn cùng xây dựng?
          </h2>
          <p className="mt-4 text-pretty leading-7 text-foreground-secondary">
            Mình luôn sẵn sàng trao đổi về Frontend, sản phẩm, cơ hội thực tập
            và những dự án thú vị.
          </p>

          {socialLinks.length ? (
            <nav
              className="mt-6 flex flex-wrap gap-2"
              aria-label="Contact channels"
            >
              {socialLinks.map(({ label, href }) => {
                const Icon = socialIcons[label];
                const external = !href.startsWith("mailto:");
                return (
                  <a
                    key={label}
                    href={href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    aria-label={label}
                    className="inline-flex size-10 items-center justify-center rounded-lg border border-border bg-background text-foreground-secondary hover:border-primary/40 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <Icon aria-hidden="true" className="size-4" />
                  </a>
                );
              })}
            </nav>
          ) : null}
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row lg:flex-col">
          <Button asChild size="lg" className="w-full gap-2 sm:w-auto">
            <Link href={ROUTES.CONTACT}>
              Liên hệ với mình{" "}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full bg-background sm:w-auto"
          >
            <Link href={ROUTES.PROJECTS}>Xem dự án</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
