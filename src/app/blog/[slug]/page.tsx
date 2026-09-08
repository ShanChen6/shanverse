import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Share2 } from "lucide-react";

import { LandingLayout } from "@/components/layout/LandingLayout";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Badge from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Callout } from "@/components/common/markdown/callout";
import { CodeBlock } from "@/components/common/markdown/code-block";
import { Heading } from "@/components/common/markdown/heading";
import {
  Table,
  TableBody,
  TableCell,
  TableElement,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/common/markdown/table";
import { ROUTES } from "@/constants/routes";

const logoSrc = "/logo/logo_shanverse.png";

type BlogDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;

  return (
    <LandingLayout>
      <article className="container mx-auto px-4 py-10 space-y-10 max-w-4xl">
        {/* Navigation & Header */}
        <header className="space-y-4 border-b border-border pb-8">
          <Breadcrumb
            items={[
              { label: "Home", href: ROUTES.HOME },
              { label: "Blog", href: ROUTES.BLOG },
              { label: slug },
            ]}
          />

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href={ROUTES.BLOG}>
                  <ArrowLeft className="mr-1 h-4 w-4" /> Danh sách bài viết
                </Link>
              </Button>
              <Badge variant="outline">Engineering</Badge>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl leading-tight">
              Article Title Placeholder for: {slug}
            </h1>

            <p className="text-lg text-foreground-secondary leading-relaxed">
              [Tóm tắt ngắn gọn nội dung bài viết, giúp người đọc nắm bắt thông
              tin quan trọng trước khi đọc chi tiết.]
            </p>

            {/* Author & Meta Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-border/60">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={logoSrc} alt="Shan" />
                  <AvatarFallback>SKC</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">Shan Kinh Can</p>
                  <p className="text-xs text-muted-foreground">
                    Software Engineer & Author
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> 04/09/2026
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> 6 phút đọc
                </span>
                <Button variant="ghost" size="icon" aria-label="Share article">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* ARTICLE BODY */}
        <section
          id="article-content"
          className="space-y-6 text-foreground leading-relaxed"
        >
          <Heading as={2}>1. Đặt vấn đề & Khởi tạo (Introduction)</Heading>
          <p className="text-foreground-secondary">
            [Khung nội dung giới thiệu bài viết: Phân tích lý do vì sao cần giải
            quyết vấn đề và định hướng kiến trúc mã nguồn.]
          </p>

          <Callout variant="info" title="Lưu ý quan trọng">
            [Khung lưu ý về môi trường thử nghiệm hoặc các ràng buộc về phiên
            bản thư viện.]
          </Callout>

          <Heading as={2}>2. Hướng dẫn chi tiết (Implementation Steps)</Heading>
          <p className="text-foreground-secondary">
            [Mô tả các bước thực hiện từng phần. Bạn có thể sử dụng CodeBlock để
            minh họa mã nguồn.]
          </p>

          <CodeBlock
            fileName="example-code.tsx"
            language="tsx"
            code={`// Sample code snippet placeholder
import { Button } from "@/components/ui/button";

export function ArticleDemo() {
  return <Button>Demo Action</Button>;
}`}
          />

          <Heading as={3}>Bảng so sánh hiệu năng (Comparison Table)</Heading>
          <Table>
            <TableElement>
              <TableHead>
                <TableRow>
                  <TableHeader>Tiêu chí</TableHeader>
                  <TableHeader>Phương pháp cũ</TableHeader>
                  <TableHeader>Phương pháp mới (Token-first)</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell className="font-semibold">
                    Tốc độ phát triển
                  </TableCell>
                  <TableCell>Chậm</TableCell>
                  <TableCell>
                    <Badge variant="success">Rất nhanh</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold">
                    Khả năng tùy biến
                  </TableCell>
                  <TableCell>Phức tạp</TableCell>
                  <TableCell>
                    <Badge variant="success">Linh hoạt</Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </TableElement>
          </Table>
        </section>

        {/* AUTHOR FOOTER & RELATED ARTICLES */}
        <footer className="space-y-8 pt-8 border-t border-border">
          <Card className="bg-surface/50">
            <CardHeader className="flex-row items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarImage src={logoSrc} />
                <AvatarFallback>SKC</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base p-0">
                  Viết bởi Shan Kinh Can
                </CardTitle>
                <p className="text-xs text-foreground-secondary mt-1">
                  Đam mê chia sẻ kiến thức về lập trình web, thiết kế UI/UX và
                  quy trình tối ưu hóa mã nguồn.
                </p>
              </div>
            </CardHeader>
          </Card>

          <div className="flex justify-between items-center pt-2">
            <Button asChild variant="outline">
              <Link href={ROUTES.BLOG}>← Tất cả bài viết</Link>
            </Button>
            <Button asChild variant="default">
              <Link href={ROUTES.CONTACT}>Liên hệ tác giả</Link>
            </Button>
          </div>
        </footer>
      </article>
    </LandingLayout>
  );
}
