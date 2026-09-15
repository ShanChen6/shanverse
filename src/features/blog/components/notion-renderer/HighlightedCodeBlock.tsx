import * as React from "react";
import { codeToTokens, type BundledLanguage } from "shiki";

import { CopyCodeButton } from "@/components/common/markdown/copy-code-button";
import { notionMessages, type NotionLocale } from "@/features/blog/notion-messages";

const LANGUAGE_ALIASES: Record<string, string> = {
  js: "javascript", jsx: "jsx", ts: "typescript", tsx: "tsx",
  shell: "bash", sh: "bash", plaintext: "text", plain_text: "text", "plain text": "text",
  html: "html", css: "css", json: "json", sql: "sql", yaml: "yaml",
  yml: "yaml", md: "markdown", markdown: "markdown", bash: "bash",
  javascript: "javascript", typescript: "typescript", text: "text",
};
const SUPPORTED_LANGUAGES = new Set(Object.values(LANGUAGE_ALIASES));

export function normalizeCodeLanguage(language?: string): string {
  const normalized = language?.trim().toLowerCase() || "text";
  return LANGUAGE_ALIASES[normalized] ?? "text";
}

export async function HighlightedCodeBlock({ code, language, fileName, locale = "en" }: { code: string; language?: string; fileName?: string; locale?: NotionLocale }) {
  const lang = normalizeCodeLanguage(language);
  const safeLanguage = (SUPPORTED_LANGUAGES.has(lang) ? lang : "text") as BundledLanguage | "text";
  const labels = notionMessages[locale];
  const lines = await codeToTokens(code, {
    lang: safeLanguage,
    themes: { light: "github-light", dark: "github-dark" },
  }).then((result) => result.tokens).catch(async () => (
    await codeToTokens(code, {
      lang: "text",
      themes: { light: "github-light", dark: "github-dark" },
    })
  ).tokens);

  return (
    <figure className="min-w-0 overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-sm">
      <figcaption className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-4 py-2.5">
        <div className="min-w-0 text-xs"><span className="font-semibold text-foreground">{fileName || "Code"}</span><span className="ml-2 uppercase text-muted">{language || safeLanguage}</span></div>
        <CopyCodeButton code={code} copyLabel={labels.copyCode} copiedLabel={labels.copied} />
      </figcaption>
      <div className="max-w-full overflow-x-auto bg-background text-sm">
        <pre className="min-w-max p-4 font-mono leading-6"><code>{lines.map((line, lineIndex) => <span key={lineIndex} className="block"><span aria-hidden="true" className="mr-5 inline-block w-6 select-none text-right text-muted/70">{lineIndex + 1}</span>{line.map((token, tokenIndex) => <span key={tokenIndex} className="shiki-token" style={token.htmlStyle as React.CSSProperties}>{token.content}</span>) || " "}</span>)}</code></pre>
      </div>
    </figure>
  );
}
