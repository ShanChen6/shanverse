"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { useTheme } from "next-themes";
import { CodeBlock } from "@/components/common/markdown/code-block";
import { CopyCodeButton } from "@/components/common/markdown/copy-code-button";
import { notionMessages, type NotionLocale } from "@/features/blog/notion-messages";

let initialized = false;

export function MermaidDiagram({ code, caption, locale = "en" }: { code: string; caption?: string; locale?: NotionLocale }) {
  const { resolvedTheme } = useTheme();
  const reactId = React.useId();
  const diagramId = React.useMemo(() => `mermaid-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`, [reactId]);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [view, setView] = React.useState<"diagram" | "source">("diagram");
  const [loading, setLoading] = React.useState(true);
  const [failed, setFailed] = React.useState(false);
  const labels = notionMessages[locale];

  React.useEffect(() => {
    let active = true;
    const container = containerRef.current;
    if (!container) return;
    setLoading(true); setFailed(false); container.removeAttribute("data-processed"); container.textContent = code;
    void import("mermaid").then(async ({ default: mermaid }) => {
      if (!initialized) {
        mermaid.initialize({ startOnLoad: false, securityLevel: "strict", htmlLabels: false, suppressErrorRendering: true, secure: ["securityLevel", "startOnLoad", "htmlLabels"] });
        initialized = true;
      }
      mermaid.mermaidAPI.updateSiteConfig({ theme: resolvedTheme === "dark" ? "dark" : "default" });
      const valid = await mermaid.parse(code, { suppressErrors: true });
      if (!valid) throw new Error("Invalid Mermaid syntax");
      await mermaid.run({ nodes: [container], suppressErrors: false });
      if (active) setLoading(false);
    }).catch(() => { if (active) { setFailed(true); setLoading(false); } });
    return () => { active = false; };
  }, [code, resolvedTheme]);

  if (failed) return <div className="space-y-3"><div role="alert" className="flex items-center gap-2 rounded-lg border border-warning bg-warning/10 px-4 py-3 text-sm text-foreground"><AlertTriangle aria-hidden="true" className="size-4 text-warning" />{labels.diagramError}</div><CodeBlock code={code} language="mermaid" fileName={caption} copyLabel={labels.copyCode} copiedLabel={labels.copied} /></div>;

  return <figure className="min-w-0 overflow-hidden rounded-2xl border border-border bg-surface-elevated"><figcaption className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-4 py-2.5"><span className="text-xs font-semibold text-foreground">{caption || "Mermaid"}</span><div className="flex items-center gap-2"><div className="flex rounded-lg border border-border p-0.5"><button type="button" onClick={() => setView("diagram")} aria-pressed={view === "diagram"} className="rounded-md px-2.5 py-1 text-xs aria-pressed:bg-primary aria-pressed:text-white">{labels.diagram}</button><button type="button" onClick={() => setView("source")} aria-pressed={view === "source"} className="rounded-md px-2.5 py-1 text-xs aria-pressed:bg-primary aria-pressed:text-white">{labels.source}</button></div><CopyCodeButton code={code} copyLabel={labels.copyCode} copiedLabel={labels.copied} /></div></figcaption>{view === "source" ? <pre className="max-w-full overflow-x-auto bg-background p-4 font-mono text-sm leading-6 text-foreground"><code>{code}</code></pre> : <div className="relative max-w-full overflow-x-auto bg-background p-4">{loading ? <div role="status" className="absolute inset-0 flex min-h-40 items-center justify-center bg-inherit text-sm text-muted">Loading diagram…</div> : null}<div id={diagramId} ref={containerRef} className="mermaid min-h-40 min-w-fit [&_svg]:h-auto [&_svg]:max-w-none" aria-label={caption || "Mermaid diagram"} /></div>}</figure>;
}
