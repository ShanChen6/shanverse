import * as React from "react";
import Link from "next/link";
import { BookOpen, Calendar, Clock, Tag } from "lucide-react";

import { LandingLayout } from "@/components/layout/LandingLayout";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Badge from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Pagination } from "@/components/layout/pagination";
import { ROUTES } from "@/constants/routes";

const logoSrc = "/logo/logo_shanverse.png";

// Placeholder posts
const samplePosts = [
  {
    id: "post-1",
    slug: "building-token-first-design-system",
    title:
      "Xây dựng Token-First Design System với Next.js 16 và Tailwind CSS v4",
    excerpt:
      "Hướng dẫn cấu trúc bộ UI Kit linh hoạt dựa trên CVA, CSS variables và Radix UI primitives.",
    date: "2026-09-01",
    readTime: "6 phút đọc",
    category: "Engineering",
    featured: true,
  },
  {
    id: "post-2",
    slug: "agentic-coding-workflows",
    title: "Tối ưu hóa quy trình lập trình với AI Agentic Workflows",
    excerpt:
      "Cách khai thác subagents và custom skills để tăng tốc độ phát triển dự án mà vẫn đảm bảo chất lượng code.",
    date: "2026-08-25",
    readTime: "8 phút đọc",
    category: "AI",
    featured: false,
  },
  {
    id: "post-3",
    slug: "react-19-and-nextjs-app-router-best-practices",
    title: "Best Practices cho React 19 Server Components",
    excerpt:
      "Các nguyên tắc quản lý state và phân chia Server/Client components hiệu quả nhất.",
    date: "2026-08-10",
    readTime: "5 phút đọc",
    category: "React",
    featured: false,
  },
];

export default function BlogPage() {
  return (
    <LandingLayout>
      <div className="container mx-auto px-4 py-10 space-y-12 max-w-6xl">
        {/* Header & Breadcrumb */}
        <header className="space-y-4 border-b border-border pb-8">
          <Breadcrumb
            items={[{ label: "Home", href: ROUTES.HOME }, { label: "Blog" }]}
          />
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Engineering Blog & Notes
              </h1>
              <p className="mt-2 text-foreground-secondary max-w-xl">
                Bài viết chuyên sâu về kiến trúc phần mềm, quy trình làm việc
                với AI và phát triển web.
              </p>
            </div>

            <div className="w-full md:w-72">
              <Input placeholder="Tìm kiếm bài viết..." />
            </div>
          </div>
        </header>

        {/* Categories Placeholder */}
        <section
          id="blog-categories"
          className="flex flex-wrap items-center gap-2"
        >
          <Button size="sm" variant="default">
            Tất cả bài viết
          </Button>
          <Button size="sm" variant="outline">
            Engineering
          </Button>
          <Button size="sm" variant="outline">
            AI & Workflow
          </Button>
          <Button size="sm" variant="outline">
            React / Next.js
          </Button>
          <Button size="sm" variant="outline">
            UI / UX
          </Button>
        </section>

        {/* FEATURED POST HERO CARD */}
        {samplePosts
          .filter((p) => p.featured)
          .map((post) => (
            <Card
              key={post.id}
              className="overflow-hidden border-primary/30 shadow-lg"
            >
              <div className="grid gap-6 md:grid-cols-12 items-center p-6 md:p-8">
                <div className="md:col-span-8 space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="success">Bài nổi bật</Badge>
                    <Badge variant="outline">{post.category}</Badge>
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                    <Link
                      href={ROUTES.BLOG_DETAIL(post.slug)}
                      className="hover:text-primary transition-colors"
                    >
                      {post.title}
                    </Link>
                  </h2>
                  <p className="text-foreground-secondary leading-relaxed">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={logoSrc} />
                        <AvatarFallback>SKC</AvatarFallback>
                      </Avatar>
                      <span>Shan Kinh Can</span>
                    </div>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" /> {post.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {post.readTime}
                    </span>
                  </div>
                </div>
                <div className="md:col-span-4 text-center">
                  <Button asChild size="lg" className="w-full">
                    <Link href={ROUTES.BLOG_DETAIL(post.slug)}>
                      Đọc bài viết →
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))}

        {/* POSTS LIST & SIDEBAR GRID */}
        <div className="grid gap-10 lg:grid-cols-12 items-start">
          {/* Main Posts List */}
          <div className="lg:col-span-8 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 border-b border-border pb-2">
              <BookOpen className="h-5 w-5 text-primary" /> Bài viết mới nhất
            </h2>

            <div className="space-y-4">
              {samplePosts.map((post) => (
                <Card
                  key={post.id}
                  className="hover:border-primary/50 transition-colors"
                >
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-[10px]">
                        {post.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {post.date}
                      </span>
                    </div>
                    <CardTitle className="text-lg">
                      <Link
                        href={ROUTES.BLOG_DETAIL(post.slug)}
                        className="hover:text-primary transition-colors"
                      >
                        {post.title}
                      </Link>
                    </CardTitle>
                    <CardDescription>{post.excerpt}</CardDescription>
                  </CardHeader>
                  <CardFooter className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {post.readTime}
                    </span>
                    <Link
                      href={ROUTES.BLOG_DETAIL(post.slug)}
                      className="text-primary hover:underline font-medium"
                    >
                      Đọc tiếp →
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <div className="flex justify-center pt-4">
              <Pagination
                currentPage={1}
                totalPages={4}
                hrefBuilder={(p) => `#page-${p}`}
              />
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Tag className="h-4 w-4 text-primary" /> Chủ đề quan tâm
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Badge variant="outline">#NextJS16</Badge>
                <Badge variant="outline">#TailwindCSS</Badge>
                <Badge variant="outline">#AgenticAI</Badge>
                <Badge variant="outline">#TypeScript</Badge>
                <Badge variant="outline">#DesignSystem</Badge>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-base">
                  Đăng ký nhận bản tin
                </CardTitle>
                <CardDescription>
                  Nhận bài viết mới nhất trực tiếp qua email của bạn.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input placeholder="your.email@example.com" />
                <Button className="w-full" size="sm">
                  Đăng ký ngay
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </LandingLayout>
  );
}
