import * as React from "react";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import type { SocialLink } from "@/constants/social";

import {
  FacebookIcon,
  GithubIcon,
  InstagramIcon,
  LinkedinIcon,
} from "@/components/common/icons/BrandIcons";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Badge from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

const socialIcons = {
  GitHub: GithubIcon,
  LinkedIn: LinkedinIcon,
  Facebook: FacebookIcon,
  Instagram: InstagramIcon,
};

export function ContactSection({ socialLinks }: { socialLinks: SocialLink[] }) {
  return (
    <section className="grid gap-6 lg:grid-cols-12">
      <div className="space-y-2 lg:col-span-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Say Hello
        </p>
        <h2 className="text-2xl font-bold tracking-tight">
          Let&apos;s Work Together
        </h2>
        <p className="text-foreground-secondary">
          Have an idea? Let&apos;s turn it into something people love to use.
        </p>
      </div>

      <Card className="overflow-hidden lg:col-span-12">
        <CardContent className="grid gap-8 p-5 sm:p-6 lg:grid-cols-12 lg:p-8">
          <div className="space-y-4 lg:col-span-7">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium">
                <span>Your name</span>
                <Input placeholder="Your name" />
              </label>
              <label className="space-y-2 text-sm font-medium">
                <span>Email address</span>
                <Input type="email" placeholder="you@example.com" />
              </label>
            </div>
            <label className="block space-y-2 text-sm font-medium">
              <span>Tell me about your project</span>
              <Textarea placeholder="Tell me about your project" rows={5} />
            </label>
            <Button className="gap-2" type="button">
              <Send className="h-4 w-4" /> Send Message
            </Button>
          </div>

          <div className="flex flex-col justify-between gap-6 border-t border-border pt-6 lg:col-span-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <div className="space-y-5">
              <Badge variant="success">Available for projects</Badge>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm font-medium">+84 777 888 999</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium">hello@shandev.dev</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Based in</p>
                    <p className="text-sm font-medium">
                      Ho Chi Minh City, Vietnam
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {socialLinks.some((link) => link.label !== "Email") ? (
              <div className="flex items-center gap-4 text-muted-foreground">
                {socialLinks
                  .filter((link) => link.label !== "Email")
                  .map(({ label, href }) => {
                    const Icon = socialIcons[label as keyof typeof socialIcons];
                    return (
                      <a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        className="hover:text-primary focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <Icon aria-hidden="true" className="h-5 w-5" />
                      </a>
                    );
                  })}
              </div>
            ) : null}
          </div>
        </CardContent>
        <CardFooter className="justify-end border-t border-border text-xs text-muted-foreground">
          © {new Date().getFullYear()} Shan Kinh Can
        </CardFooter>
      </Card>
    </section>
  );
}
