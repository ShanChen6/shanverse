import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Code2,
  ExternalLink,
  Globe,
  Layers,
  Tag,
  User,
} from "lucide-react";

import { LandingLayout } from "@/components/layout/LandingLayout";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Button } from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Callout } from "@/components/common/markdown/callout";
import { CodeBlock } from "@/components/common/markdown/code-block";
import { ROUTES } from "@/constants/routes";

type ProjectDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { slug } = await params;

  return (
    <LandingLayout>
      <div className="container mx-auto px-4 py-10 space-y-12 max-w-5xl">
        {/* Navigation & Header */}
        <header className="space-y-4 border-b border-border pb-8">
          <Breadcrumb
            items={[
              { label: "Home", href: ROUTES.HOME },
              { label: "Projects", href: ROUTES.PROJECTS },
              { label: slug },
            ]}
          />
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href={ROUTES.PROJECTS}>
                  <ArrowLeft className="mr-1 h-4 w-4" /> Tất cả dự án
                </Link>
              </Button>
              <Badge variant="success">Active Project</Badge>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              Project Detail: {slug}
            </h1>

            <p className="text-lg text-foreground-secondary max-w-3xl">
              [Khung chi tiết về kiến trúc dự án, tính năng nổi bật, thách thức
              kỹ thuật và giải pháp triển khai.]
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button asChild variant="default">
                <a href="https://github.com" target="_blank" rel="noreferrer">
                  <Code2 className="mr-2 h-4 w-4" /> View Repository
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href="https://demo.com" target="_blank" rel="noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" /> Live Demo
                </a>
              </Button>
            </div>
          </div>
        </header>

        {/* HERO MEDIA PLACEHOLDER */}
        <section
          id="project-media"
          className="rounded-2xl border border-border bg-surface overflow-hidden p-8 text-center space-y-4 shadow-sm"
        >
          <div className="py-12 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center">
            <Globe className="h-12 w-12 text-primary mb-2" />
            <p className="font-semibold text-base">
              Project Cover & Video Demo Placeholder
            </p>
            <p className="text-xs text-muted-foreground">
              [Chèn hình ảnh screenshot hoặc video demo dự án tại đây]
            </p>
          </div>
        </section>

        {/* MAIN CONTENT & SIDEBAR GRID */}
        <section
          id="project-body"
          className="grid gap-10 md:grid-cols-12 items-start"
        >
          {/* Main Story & Technical Overview */}
          <div className="md:col-span-8 space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">
                1. Tổng quan & Thách thức (Overview)
              </h2>
              <p className="text-foreground-secondary leading-relaxed">
                [Nội dung chi tiết giải thích bối cảnh xây dựng dự án, nhu cầu
                người dùng và bài toán kỹ thuật cần giải quyết.]
              </p>
            </div>

            <Callout variant="info" title="Điểm nổi bật kiến trúc">
              Dự án áp dụng mô hình phân lớp rõ ràng, quản lý state linh hoạt và
              hệ thống UI token-first tối ưu cho hiệu năng.
            </Callout>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold">
                2. Tính năng chính (Key Features)
              </h2>
              <ul className="space-y-2 text-foreground-secondary">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  <span>
                    [Feature 1]: Tối ưu hóa render giao diện và tương tác người
                    dùng mượt mà.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  <span>
                    [Feature 2]: Tích hợp luồng xử lý dữ liệu thời gian thực.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  <span>
                    [Feature 3]: Tương thích hoàn hảo trên các kích thước màn
                    hình.
                  </span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold">
                3. Đoạn mã minh họa (Code Snippet)
              </h2>
              <CodeBlock
                fileName="architecture-setup.ts"
                language="typescript"
                code={`// Config setup placeholder
export const projectConfig = {
  slug: "${slug}",
  version: "1.0.0",
  mode: "production",
};`}
              />
            </div>
          </div>

          {/* Right Sidebar Metadata */}
          <div className="md:col-span-4 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" /> Project Metadata
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs text-foreground-secondary">
                <div className="space-y-1">
                  <span className="font-semibold text-foreground flex items-center gap-1">
                    <User className="h-3.5 w-3.5" /> Vai trò
                  </span>
                  <p>Lead Developer / Architect</p>
                </div>

                <div className="space-y-1">
                  <span className="font-semibold text-foreground flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> Thời gian
                  </span>
                  <p>Q1/2026 — Present</p>
                </div>

                <div className="space-y-1">
                  <span className="font-semibold text-foreground flex items-center gap-1">
                    <Tag className="h-3.5 w-3.5" /> Tech Stack
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <Badge variant="outline">Next.js</Badge>
                    <Badge variant="outline">TypeScript</Badge>
                    <Badge variant="outline">Tailwind</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </LandingLayout>
  );
}
