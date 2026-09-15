import * as React from "react";
import { AtSign, MapPin } from "lucide-react";
import type { ContactConfig } from "../contact-config";
import { SocialLinks } from "./SocialLinks";

export function ContactMethods({ config }: { config: ContactConfig }) {
  const hasMethods = Boolean(config.email || config.location || config.socials.length);
  return (
    <section aria-labelledby="methods-heading" className="space-y-5">
      <div><p className="text-xs font-semibold uppercase tracking-widest text-primary">Contact channels</p><h2 id="methods-heading" className="mt-2 text-2xl font-semibold">Thông tin liên hệ</h2><p className="mt-2 text-sm leading-6 text-foreground-secondary">Mình sẽ phản hồi sớm nhất khi có thể.</p></div>
      {hasMethods ? <div className="space-y-3">
        {config.email ? <a href={`mailto:${config.email}`} className="flex min-w-0 items-start gap-3 rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><AtSign aria-hidden="true" className="size-5" /></span><span className="min-w-0"><span className="block text-sm font-semibold">Email</span><span className="block break-all text-sm text-foreground-secondary">{config.email}</span></span></a> : null}
        {config.location ? <div className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><MapPin aria-hidden="true" className="size-5" /></span><span><span className="block text-sm font-semibold">Location</span><span className="block text-sm text-foreground-secondary">{config.location}</span></span></div> : null}
        <SocialLinks socials={config.socials} />
      </div> : <p className="rounded-2xl border border-dashed border-border bg-surface p-5 text-sm leading-6 text-foreground-secondary">Các kênh liên hệ trực tiếp chưa được cấu hình.</p>}
    </section>
  );
}
