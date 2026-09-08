import * as React from "react";
import Link from "next/link";
import { Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

export function ExploreGalleryCard() {
  return (
    <section className="rounded-3xl bg-surface-elevated border border-border p-8 md:p-12 text-center space-y-6 shadow-sm">
      <div className="mx-auto h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
        <Terminal className="h-6 w-6" />
      </div>
      <div className="max-w-xl mx-auto space-y-2">
        <h3 className="text-2xl font-bold">Khám phá thư viện Component</h3>
        <p className="text-sm text-foreground-secondary">
          Trang kiểm thử chứa đầy đủ các component đã được tùy biến sẵn sàng đưa
          vào ứng dụng.
        </p>
      </div>
      <div>
        <Button asChild size="lg">
          <Link href={ROUTES.TEST}>Đi đến trang Test Components (/test)</Link>
        </Button>
      </div>
    </section>
  );
}
