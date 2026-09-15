import * as React from "react";
import { productPrinciples } from "../data/about.data";

export function ApproachSection() {
  return (
    <section aria-labelledby="approach-heading" className="space-y-6">
      <div><p className="text-xs font-semibold uppercase tracking-widest text-primary">How I build</p><h2 id="approach-heading" className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Cách mình xây dựng sản phẩm</h2></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {productPrinciples.map(({ title, description, icon: Icon }, index) => <article key={title} className="h-full rounded-2xl border border-border bg-surface p-5"><span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon aria-hidden="true" className="size-5" /></span><p className="mt-5 text-xs font-semibold text-primary">0{index + 1}</p><h3 className="mt-1 font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-foreground-secondary">{description}</p></article>)}
      </div>
    </section>
  );
}
