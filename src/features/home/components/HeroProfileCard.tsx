import * as React from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Badge from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";

const logoSrc = "/logo/logo_shanverse.png";

export function HeroProfileCard() {
  return (
    <div className="lg:col-span-5">
      <Card className="overflow-hidden border-2 border-primary/20 shadow-xl bg-surface-elevated">
        <div className="bg-linear-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 rounded-2xl ring-2 ring-primary ring-offset-2">
              <AvatarImage src={logoSrc} alt="Shanverse Logo" />
              <AvatarFallback className="bg-primary text-white font-bold text-xl">
                SV
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold text-lg text-foreground">
                Shan Kinh Can
              </h3>
              <p className="text-xs text-foreground-secondary">
                Software Engineer & Builder
              </p>
            </div>
          </div>
          <Badge variant="success" className="animate-pulse">
            Online
          </Badge>
        </div>

        <CardContent className="space-y-4 pt-6">
          <p className="text-sm text-foreground-secondary leading-relaxed">
            Building modular, high-performance web applications and design
            systems with Radix UI and Tailwind CSS.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            <Badge variant="outline">React 19</Badge>
            <Badge variant="outline">Next.js 16</Badge>
            <Badge variant="outline">TypeScript</Badge>
            <Badge variant="outline">Tailwind CSS v4</Badge>
          </div>
        </CardContent>

        <CardFooter className="bg-surface/50 justify-between text-xs text-foreground-secondary border-t border-border">
          <span>📍 Shanverse Workspace</span>
          <Link
            href={ROUTES.TEST}
            className="text-primary hover:underline font-medium inline-flex items-center gap-1"
          >
            Component Test Page <ExternalLink className="h-3 w-3" />
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
