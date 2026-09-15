import * as React from "react";
import { Sprout } from "lucide-react";

export function AboutStorySection() {
  return (
    <section aria-labelledby="story-heading" className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
      <div><p className="text-xs font-semibold uppercase tracking-widest text-primary">My story</p><h2 id="story-heading" className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Từ hệ thống thông tin đến trải nghiệm web</h2></div>
      <div className="space-y-5 rounded-2xl border border-border bg-surface p-6 leading-8 text-foreground-secondary sm:p-8">
        <Sprout aria-hidden="true" className="size-6 text-primary" />
        <p>Mình bắt đầu từ việc quan tâm đến cách công nghệ hỗ trợ con người giải quyết công việc hằng ngày. Trong quá trình học Hệ thống thông tin quản lý tại Trường Đại học Thương mại, mình dần tập trung vào phát triển giao diện và trải nghiệm người dùng.</p>
        <p>Frontend hấp dẫn mình vì đây là nơi kỹ thuật, sản phẩm và thiết kế gặp nhau. Mỗi dự án giúp mình hiểu sâu hơn về React, Next.js, TypeScript, kiến trúc ứng dụng và cách xây dựng giao diện sử dụng tốt trên nhiều thiết bị.</p>
        <p>Shanverse được tạo ra để lưu lại những điều mình học được, giới thiệu sản phẩm mình đã xây dựng và chia sẻ kiến thức có thể hữu ích với những developer khác.</p>
      </div>
    </section>
  );
}
