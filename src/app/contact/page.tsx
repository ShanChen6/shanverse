import * as React from "react";
import {
  Code2,
  Globe,
  Mail,
  MapPin,
  MessageSquare,
  Send,
  Share2,
} from "lucide-react";

import { LandingLayout } from "@/components/layout/LandingLayout";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Badge from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Callout } from "@/components/common/markdown/callout";
import { ROUTES } from "@/constants/routes";

export default function ContactPage() {
  return (
    <LandingLayout>
      <div className="container mx-auto px-4 py-10 space-y-12 max-w-5xl">
        {/* Header & Breadcrumb */}
        <header className="space-y-4 border-b border-border pb-8">
          <Breadcrumb
            items={[{ label: "Home", href: ROUTES.HOME }, { label: "Contact" }]}
          />
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Get in Touch
            </h1>
            <p className="mt-2 text-foreground-secondary max-w-xl">
              Bạn có câu hỏi, ý tưởng hợp tác dự án hoặc muốn trao đổi công
              việc? Hãy gửi tin nhắn cho tôi.
            </p>
          </div>
        </header>

        {/* MAIN CONTACT GRID */}
        <div className="grid gap-10 lg:grid-cols-12 items-start">
          {/* Left Column: Contact Information */}
          <div className="lg:col-span-5 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="success">Available</Badge>
                  <span className="text-xs text-muted-foreground">
                    Phản hồi trong 24h
                  </span>
                </div>
                <CardTitle className="text-xl">Thông tin liên hệ</CardTitle>
                <CardDescription>Các kênh liên lạc trực tiếp</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 text-sm text-foreground-secondary">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Email</p>
                    <a
                      href="mailto:contact@shanverse.com"
                      className="hover:text-primary transition-colors"
                    >
                      contact@shanverse.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Địa điểm</p>
                    <p>TP. Hồ Chí Minh, Việt Nam</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Mạng xã hội</p>
                    <div className="flex items-center gap-3 pt-2">
                      <Button asChild size="icon" variant="outline">
                        <a
                          href="https://github.com"
                          target="_blank"
                          rel="noreferrer"
                          aria-label="GitHub"
                        >
                          <Code2 className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button asChild size="icon" variant="outline">
                        <a
                          href="https://linkedin.com"
                          target="_blank"
                          rel="noreferrer"
                          aria-label="LinkedIn"
                        >
                          <Globe className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button asChild size="icon" variant="outline">
                        <a
                          href="https://twitter.com"
                          target="_blank"
                          rel="noreferrer"
                          aria-label="Twitter"
                        >
                          <Share2 className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Callout variant="neutral" title="Lưu ý hợp tác">
              Sẵn sàng trao đổi các cơ hội làm việc Freelance, Full-time hoặc
              các dự án mã nguồn mở.
            </Callout>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">
                  Gửi tin nhắn (Contact Form)
                </CardTitle>
                <CardDescription>
                  Điền thông tin của bạn vào mẫu bên dưới
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="contact-name"
                      className="text-xs font-semibold"
                    >
                      Họ và tên *
                    </label>
                    <Input id="contact-name" placeholder="Nguyễn Văn A" />
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="contact-email"
                      className="text-xs font-semibold"
                    >
                      Email *
                    </label>
                    <Input
                      id="contact-email"
                      type="email"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="contact-subject"
                    className="text-xs font-semibold"
                  >
                    Tiêu đề *
                  </label>
                  <Input
                    id="contact-subject"
                    placeholder="Chủ đề lời nhắn..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="contact-message"
                    className="text-xs font-semibold"
                  >
                    Nội dung tin nhắn *
                  </label>
                  <Textarea
                    id="contact-message"
                    placeholder="Nhập nội dung bạn muốn trao đổi..."
                    rows={5}
                  />
                </div>

                <Button className="w-full sm:w-auto" size="lg">
                  <Send className="mr-2 h-4 w-4" /> Gửi tin nhắn
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </LandingLayout>
  );
}
