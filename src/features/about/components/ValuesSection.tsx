import * as React from "react";
import { values } from "../data/about.data";

export function ValuesSection() {
  return (
    <section aria-labelledby="values-heading" className="space-y-6">
      <div><p className="text-xs font-semibold uppercase tracking-widest text-primary">Principles</p><h2 id="values-heading" className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Giá trị mình muốn giữ trong công việc</h2></div>
      <div className="grid gap-4 sm:grid-cols-2">
        {values.map(({ title, description, icon: Icon }) => <article key={title} className="flex h-full gap-4 rounded-2xl border border-border bg-surface p-5"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon aria-hidden="true" className="size-5" /></span><div><h3 className="font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-foreground-secondary">{description}</p></div></article>)}
      </div>
    </section>
  );
}
