import * as React from "react";
import { MessageCircleMore } from "lucide-react";

export function ContactHero() {
  return (
    <section aria-labelledby="contact-title" className="relative overflow-hidden rounded-3xl border border-border bg-surface p-6 sm:p-10 lg:p-12">
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 size-80 rounded-full border border-primary/15" />
      <div className="relative max-w-3xl space-y-6">
        <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary"><MessageCircleMore aria-hidden="true" className="size-4" /> Get in touch</p>
        <h1 id="contact-title" className="text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">Cùng trao đổi và xây dựng điều gì đó hữu ích.</h1>
        <p className="max-w-2xl text-pretty text-lg leading-8 text-foreground-secondary">Bạn có một ý tưởng, cơ hội thực tập, dự án thú vị hoặc đơn giản muốn trao đổi về công nghệ? Hãy gửi cho mình một lời nhắn.</p>
      </div>
    </section>
  );
}
