import * as React from "react";
import { Code2, Cpu, Layers } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function CorePillars() {
  return (
    <section id="features" className="space-y-8 scroll-mt-24">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h2 className="text-3xl font-bold tracking-tight">
          Core Engineering Focus
        </h2>
        <p className="text-foreground-secondary">
          Những trụ cột chính trong quá trình phát triển Shanverse và các dự án
          cá nhân.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-2">
              <Layers className="h-5 w-5" />
            </div>
            <CardTitle>Token-First Design System</CardTitle>
            <CardDescription>
              Xây dựng hệ thống UI nhất quán với CVA (Class Variance Authority)
              và CSS variable tokens.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-foreground-secondary">
            Dễ dàng tùy biến chủ đề (Light/Dark mode), đảm bảo khả năng truy cập
            (Accessibility) dựa trên Radix UI primitives.
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-2">
              <Cpu className="h-5 w-5" />
            </div>
            <CardTitle>AI-Assisted Workflows</CardTitle>
            <CardDescription>
              Tối ưu hóa quy trình lập trình với Agentic Coding và các công cụ
              AI hiện đại.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-foreground-secondary">
            Tốc độ phát triển nhanh chóng, tự động hóa kiểm thử và duy trì mã
            nguồn sạch sẽ.
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-2">
              <Code2 className="h-5 w-5" />
            </div>
            <CardTitle>Modern Full-Stack Tech</CardTitle>
            <CardDescription>
              Kiến trúc web hiện đại dựa trên Next.js 16 App Router, React 19 và
              TypeScript.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-foreground-secondary">
            Render nhanh, tối ưu SEO, hỗ trợ Server Components và giao diện mượt
            mà.
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
