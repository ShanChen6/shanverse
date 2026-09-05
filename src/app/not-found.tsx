import * as React from "react";
import Link from "next/link";
import { AlertCircle, Home, LayoutGrid } from "lucide-react";

import { LandingLayout } from "@/components/layout/LandingLayout";
import { Button } from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";

export default function NotFound() {
  return (
    <LandingLayout>
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center space-y-8 max-w-2xl min-h-[60vh]">
        <Card className="w-full p-8 space-y-6 bg-surface-elevated border-2 border-border shadow-lg">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
            <AlertCircle className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <Badge variant="danger" className="px-3 py-1">
              404 Error
            </Badge>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Page Not Found
            </h1>
            <p className="text-foreground-secondary text-sm sm:text-base leading-relaxed">
              Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển sang
              đường dẫn khác.
            </p>
          </div>

          <CardContent className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-border">
            <Button asChild variant="default" size="lg">
              <Link href={ROUTES.HOME}>
                <Home className="mr-2 h-4 w-4" /> Về Trang chủ
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href={ROUTES.TEST}>
                <LayoutGrid className="mr-2 h-4 w-4" /> Xem Components (/test)
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </LandingLayout>
  );
}
