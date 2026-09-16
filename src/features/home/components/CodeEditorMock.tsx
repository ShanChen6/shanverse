import * as React from "react";
import { Code2 } from "lucide-react";

import { cn } from "@/lib/cn";
import { HOME_HERO_CODE_PROFILE } from "../home.data";

function Token({ tone, children }: { tone: "keyword" | "property" | "string" | "boolean" | "punctuation"; children: React.ReactNode }) {
  const colors = {
    keyword: "text-primary",
    property: "text-foreground",
    string: "text-success",
    boolean: "text-accent",
    punctuation: "text-muted",
  };
  return <span className={colors[tone]}>{children}</span>;
}

export function CodeEditorMock({ className }: { className?: string }) {
  const profile = HOME_HERO_CODE_PROFILE;
  return (
    <figure aria-label="Developer profile shown as TypeScript" className={cn("min-w-0 overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-lg", className)}>
      <figcaption className="flex items-center gap-2 border-b border-border bg-surface px-4 py-3 text-xs font-medium text-foreground-secondary">
        <Code2 aria-hidden="true" className="size-4 text-primary" /> developer.ts
      </figcaption>
      <pre className="max-w-full overflow-x-auto p-5 font-mono text-[12px] leading-6 sm:p-6 sm:text-sm sm:leading-7"><code>
        <Token tone="keyword">const</Token>{" "}<Token tone="property">developer</Token>{" "}<Token tone="punctuation">= {"{"}</Token>
        {"\n  "}<Token tone="property">name</Token><Token tone="punctuation">: </Token><Token tone="string">&quot;{profile.name}&quot;</Token><Token tone="punctuation">,</Token>
        {"\n  "}<Token tone="property">role</Token><Token tone="punctuation">: </Token><Token tone="string">&quot;{profile.role}&quot;</Token><Token tone="punctuation">,</Token>
        {"\n  "}<Token tone="property">experience</Token><Token tone="punctuation">: </Token><Token tone="string">&quot;{profile.experience}&quot;</Token><Token tone="punctuation">,</Token>
        {"\n  "}<Token tone="property">location</Token><Token tone="punctuation">: </Token><Token tone="string">&quot;{profile.location}&quot;</Token><Token tone="punctuation">,</Token>
        {"\n  "}<Token tone="property">focus</Token><Token tone="punctuation">: </Token><Token tone="string">&quot;{profile.focus}&quot;</Token><Token tone="punctuation">,</Token>
        {"\n  "}<Token tone="property">coffee</Token><Token tone="punctuation">: </Token><Token tone="boolean">{String(profile.coffee)}</Token><Token tone="punctuation">,</Token>
        {"\n  "}<Token tone="property">available</Token><Token tone="punctuation">: </Token><Token tone="boolean">{String(profile.available)}</Token><Token tone="punctuation">,</Token>
        {"\n"}<Token tone="punctuation">{"}"};</Token>
      </code></pre>
    </figure>
  );
}
