import * as React from "react";
import { GraduationCap } from "lucide-react";
import { journey } from "../data/about.data";

export function JourneySection() {
  return (
    <section aria-labelledby="journey-heading" className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
      <div><p className="text-xs font-semibold uppercase tracking-widest text-primary">Journey</p><h2 id="journey-heading" className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Hành trình học tập và xây dựng</h2></div>
      <ol className="ml-2 border-l border-border pl-6 sm:pl-8">
        {journey.map((item) => <li key={item.title} className="relative pb-8 last:pb-0"><span aria-hidden="true" className="absolute -left-[31px] top-1 flex size-3 rounded-full border-2 border-background bg-primary sm:-left-[39px]" /><article className="rounded-2xl border border-border bg-surface p-5"><h3 className="font-semibold">{item.title}</h3>{item.organization ? <p className="mt-1 flex items-center gap-2 text-sm font-medium text-primary"><GraduationCap aria-hidden="true" className="size-4" /> {item.organization}</p> : null}<p className="mt-3 text-sm leading-6 text-foreground-secondary">{item.description}</p></article></li>)}
      </ol>
    </section>
  );
}
