import * as React from "react";
import { AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/cn";
import type { NotionIcon } from "@/types/notion";

type Variant = "warning" | "danger" | "success" | "info" | "neutral";
export function getCalloutVariant(color = "default"): Variant { if (/yellow|orange/.test(color)) return "warning"; if (color.includes("red")) return "danger"; if (color.includes("green")) return "success"; if (/blue|purple|gray/.test(color)) return "info"; return "neutral"; }
const variants: Record<Variant, string> = { warning: "border-warning bg-warning/10", danger: "border-danger bg-danger/10", success: "border-success bg-success/10", info: "border-primary bg-primary/10", neutral: "border-border bg-surface" };
function safeWebUrl(value: string): string | null { try { const parsed = new URL(value); return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.toString() : null; } catch { return null; } }

function Icon({ icon, variant }: { icon: NotionIcon | null; variant: Variant }) {
  if (icon?.type === "emoji") return <span aria-hidden="true" className="text-xl leading-none">{icon.value}</span>;
  const iconUrl = icon && (icon.type === "file" || icon.type === "external") ? safeWebUrl(icon.url) : null;
  if (iconUrl) return <img src={iconUrl} alt="" loading="lazy" decoding="async" className="size-6 object-contain" />;
  return variant === "warning" || variant === "danger" ? <AlertTriangle aria-hidden="true" className="size-5" /> : <Info aria-hidden="true" className="size-5" />;
}

export function NotionCallout({ color, icon, warningLabel, noteLabel, children }: { color?: string; icon: NotionIcon | null; warningLabel: string; noteLabel: string; children: React.ReactNode }) {
  const variant = getCalloutVariant(color); const title = variant === "warning" || variant === "danger" ? warningLabel : noteLabel;
  const iconClass = variant === "warning" ? "bg-warning/15 text-warning" : variant === "danger" ? "bg-danger/15 text-danger" : variant === "success" ? "bg-success/15 text-success" : "bg-primary/10 text-primary";
  return <aside role="note" aria-label={title} className={cn("flex gap-4 rounded-xl border border-l-4 p-5 text-foreground", variants[variant])}><div className={cn("flex size-9 shrink-0 items-center justify-center rounded-full", iconClass)}><Icon icon={icon} variant={variant} /></div><div className="min-w-0"><p className="mb-1 font-semibold">{title}</p><div className="leading-7">{children}</div></div></aside>;
}
