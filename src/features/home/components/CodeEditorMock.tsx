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

type Field = { key: string; value: React.ReactNode; tone: "string" | "boolean" };

export function CodeEditorMock({ label, className }: { label: string; className?: string }) {
  const profile = HOME_HERO_CODE_PROFILE;
  const fields: Field[] = [
    { key: "name", value: `"${profile.name}"`, tone: "string" },
    { key: "role", value: `"${profile.role}"`, tone: "string" },
    { key: "experience", value: `"${profile.experience}"`, tone: "string" },
    { key: "location", value: `"${profile.location}"`, tone: "string" },
    { key: "focus", value: `"${profile.focus}"`, tone: "string" },
    { key: "coffee", value: String(profile.coffee), tone: "boolean" },
    { key: "available", value: String(profile.available), tone: "boolean" },
  ];
  // Phones show the first fields only, so the card stays short; tablets and up show all of them.
  const SHOWN_ON_PHONE = 3;
  return (
    <figure aria-label={label} className={cn("min-w-0 overflow-hidden rounded-card border border-border bg-surface-elevated shadow-card", className)}>
      <figcaption className="flex items-center gap-2 border-b border-border bg-surface px-4 py-3 text-xs font-medium text-foreground-secondary">
        <Code2 aria-hidden="true" className="size-4 text-primary" /> developer.ts
      </figcaption>
      <pre className="max-w-full overflow-x-auto p-5 font-mono text-xs leading-6 sm:p-6 sm:text-sm sm:leading-7"><code>
        <Token tone="keyword">const</Token>{" "}<Token tone="property">developer</Token>{" "}<Token tone="punctuation">= {"{"}</Token>
        {fields.map((field, index) => (
          <span key={field.key} className={index < SHOWN_ON_PHONE ? undefined : "hidden sm:inline"}>
            {"\n  "}<Token tone="property">{field.key}</Token><Token tone="punctuation">: </Token><Token tone={field.tone}>{field.value}</Token><Token tone="punctuation">,</Token>
          </span>
        ))}
        <span className="sm:hidden">{"\n  "}<Token tone="punctuation">{"// ..."}</Token></span>
        {"\n"}<Token tone="punctuation">{"}"};</Token>
      </code></pre>
    </figure>
  );
}
