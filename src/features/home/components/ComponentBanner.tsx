import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/common/markdown/callout";
import { ROUTES } from "@/constants/routes";

export function ComponentBanner() {
  return (
    <section id="components-banner">
      <Callout variant="info" title="🎨 Custom Component Library Ready">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mt-2">
          <p className="text-sm text-foreground-secondary max-w-xl">
            Tất cả các UI components (Button, Avatar, Badge, Card, Dialog,
            Drawer, Sheet, Popover, Dropdown, Form Inputs, Tooltip, Markdown,
            ...) đã được dựng mẫu đầy đủ trên trang test riêng biệt.
          </p>
          <Button asChild variant="default" size="md">
            <Link href={ROUTES.TEST}>Mở trang Test Components →</Link>
          </Button>
        </div>
      </Callout>
    </section>
  );
}
