import * as React from "react";
import Link from "next/link";
import {
  Award,
  Briefcase,
  Download,
  GraduationCap,
  Mail,
  MapPin,
  Sparkles,
  User,
} from "lucide-react";

import { LandingLayout } from "@/components/layout/LandingLayout";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Badge from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";

const logoSrc = "/logo/logo_shanverse.png";

export default function AboutPage() {
  return (
    <LandingLayout>
      <div className="container mx-auto px-4 py-10 space-y-16 max-w-5xl">
        {/* Breadcrumb & Header */}
        <header className="space-y-4 border-b border-border pb-8">
          <Breadcrumb
            items={[
              { label: "Home", href: ROUTES.HOME },
              { label: "About Me" },
            ]}
          />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                About Shan Kinh Can
              </h1>
              <p className="mt-2 text-foreground-secondary max-w-xl">
                Khung cấu trúc thông tin cá nhân, kinh nghiệm làm việc, kỹ năng
                và định hướng phát triển.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button asChild variant="outline">
                <a href="#resume-download" download>
                  <Download className="mr-2 h-4 w-4" /> Download CV
                </a>
              </Button>
              <Button asChild variant="default">
                <Link href={ROUTES.CONTACT}>
                  <Mail className="mr-2 h-4 w-4" /> Contact Me
                </Link>
              </Button>
            </div>
          </div>
        </header>

        {/* SECTION 1: BIO & HERO OVERVIEW */}
        <section
          id="bio-hero"
          className="grid gap-8 md:grid-cols-12 items-start"
        >
          <div className="md:col-span-4 space-y-4">
            <Card className="overflow-hidden">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-3">
                  <Avatar className="h-28 w-28 rounded-2xl ring-4 ring-primary/20">
                    <AvatarImage src={logoSrc} alt="Shan Profile" />
                    <AvatarFallback className="bg-primary text-white text-2xl font-bold">
                      SKC
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-xl">Shan Kinh Can</CardTitle>
                <CardDescription className="flex items-center justify-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-primary" /> Software
                  Engineer
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs text-foreground-secondary border-t border-border pt-4">
                <div className="flex justify-between">
                  <span className="font-medium">Kinh nghiệm:</span>
                  <span>Full-stack Development</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Trạng thái:</span>
                  <Badge variant="success">Available for Hire</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Lĩnh vực:</span>
                  <span>Web Systems & AI</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-8 space-y-6">
            <div className="space-y-3">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <User className="h-5 w-5 text-primary" /> Giới thiệu (Bio
                Outline)
              </h2>
              <p className="text-foreground-secondary leading-relaxed">
                [Khung nội dung tóm tắt bản thân: Lập trình viên đam mê phát
                triển hệ thống web mở rộng, áp dụng các kiến trúc tiên tiến và
                luồng làm việc tự động với AI.]
              </p>
              <p className="text-foreground-secondary leading-relaxed">
                [Mô tả mục tiêu nghề nghiệp, triết lý thiết kế UI/UX token-first
                và phương châm viết mã nguồn sạch.]
              </p>
            </div>

            {/* Quick Stats Grid Placeholder */}
            <div className="grid grid-cols-3 gap-4 pt-2">
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">3+</p>
                <p className="text-xs text-foreground-secondary">
                  Năm kinh nghiệm
                </p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">15+</p>
                <p className="text-xs text-foreground-secondary">
                  Dự án hoàn thành
                </p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">100%</p>
                <p className="text-xs text-foreground-secondary">
                  Mã nguồn chuẩn hoá
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* SECTION 2: WORK EXPERIENCE TIMELINE */}
        <section id="experience" className="space-y-6">
          <div className="border-b border-border pb-2">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" /> Kinh nghiệm làm
              việc (Experience Timeline)
            </h2>
            <p className="text-sm text-foreground-secondary">
              Khung mốc thời gian sự nghiệp
            </p>
          </div>

          <div className="space-y-4 pl-4 border-l-2 border-border">
            {/* Timeline Item 1 */}
            <div className="relative space-y-2 pb-6">
              <div className="absolute -left-[21px] top-1.5 h-3 w-3 rounded-full bg-primary" />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <h3 className="font-semibold text-lg">
                  Senior Full-Stack Engineer — Company A
                </h3>
                <span className="text-xs text-muted-foreground font-mono">
                  2024 — Present
                </span>
              </div>
              <p className="text-sm text-foreground-secondary">
                [Mô tả nhiệm vụ chính, công nghệ sử dụng và kết quả đạt được tại
                công ty A]
              </p>
            </div>

            {/* Timeline Item 2 */}
            <div className="relative space-y-2 pb-6">
              <div className="absolute -left-[21px] top-1.5 h-3 w-3 rounded-full bg-border" />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <h3 className="font-semibold text-lg">
                  Frontend Developer — Company B
                </h3>
                <span className="text-xs text-muted-foreground font-mono">
                  2022 — 2024
                </span>
              </div>
              <p className="text-sm text-foreground-secondary">
                [Mô tả nhiệm vụ chính, tối ưu giao diện UI/UX và phát triển
                component library tại công ty B]
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3: SKILLS & TECH STACK */}
        <section id="skills" className="space-y-6">
          <div className="border-b border-border pb-2">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> Kỹ năng & Công nghệ
              (Tech Stack)
            </h2>
            <p className="text-sm text-foreground-secondary">
              Các công cụ và ngôn ngữ chủ đạo
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Frontend Ecosystem</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Badge variant="outline">React 19</Badge>
                <Badge variant="outline">Next.js 16</Badge>
                <Badge variant="outline">TypeScript</Badge>
                <Badge variant="outline">Tailwind CSS v4</Badge>
                <Badge variant="outline">Radix UI</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Backend & Data</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Badge variant="outline">Node.js</Badge>
                <Badge variant="outline">PostgreSQL</Badge>
                <Badge variant="outline">REST API</Badge>
                <Badge variant="outline">GraphQL</Badge>
                <Badge variant="outline">Notion API</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">DevOps & Tools</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Badge variant="outline">Git / GitHub</Badge>
                <Badge variant="outline">Docker</Badge>
                <Badge variant="outline">Vercel</Badge>
                <Badge variant="outline">VS Code Agents</Badge>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* SECTION 4: EDUCATION & CERTIFICATIONS */}
        <section id="education" className="space-y-6">
          <div className="border-b border-border pb-2">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" /> Học vấn & Chứng
              chỉ (Education)
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-4 flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-base">
                  Cử nhân Software Engineering
                </h3>
                <p className="text-xs text-foreground-secondary">
                  Trường Đại học [Tên Trường] — 2019 - 2023
                </p>
              </div>
            </Card>

            <Card className="p-4 flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-base">
                  AWS / Web Certification
                </h3>
                <p className="text-xs text-foreground-secondary">
                  Chứng chỉ chuyên môn bổ trợ — 2024
                </p>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </LandingLayout>
  );
}
