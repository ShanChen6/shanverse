import * as React from "react";
import { Code2, Globe, Link2, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Badge from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function ContactSection() {
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

      <Card className="lg:col-span-7">
        <CardContent className="space-y-4 pt-6">
          <Input placeholder="Your name" />
          <Input type="email" placeholder="Email address" />
          <Textarea placeholder="Tell me about your project" rows={4} />
          <Button className="gap-2">
            <Mail className="h-4 w-4" /> Send Message
          </Button>
        </CardContent>
      </Card>

      <Card className="lg:col-span-5">
        <CardContent className="space-y-4 pt-6">
          <Badge variant="success">Available for projects</Badge>
          <div>
            <p className="text-xs text-muted-foreground">Email me at</p>
            <p className="font-medium">hello@shandev.dev</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Based in</p>
            <p className="font-medium">Ho Chi Minh City, Vietnam</p>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Code2 className="h-5 w-5 text-foreground-secondary" />
            <Link2 className="h-5 w-5 text-foreground-secondary" />
            <Globe className="h-5 w-5 text-foreground-secondary" />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
