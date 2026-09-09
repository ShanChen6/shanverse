import * as React from "react";
import { cn } from "@/lib/cn";

function Kw({ children }: { children: React.ReactNode }) {
  return <span className="text-purple-400">{children}</span>;
}
function Prop({ children }: { children: React.ReactNode }) {
  return <span className="text-sky-300">{children}</span>;
}
function Str({ children }: { children: React.ReactNode }) {
  return <span className="text-emerald-400">{children}</span>;
}
function Bool({ children }: { children: React.ReactNode }) {
  return <span className="text-orange-400">{children}</span>;
}
function Punct({ children }: { children: React.ReactNode }) {
  return <span className="text-zinc-500">{children}</span>;
}

interface CodeEditorMockProps {
  fileName?: string;
  className?: string;
}

export function CodeEditorMock({
  fileName = "developer.ts",
  className,
}: CodeEditorMockProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl",
        className,
      )}
    >
      <div className="flex items-center gap-3 border-b border-zinc-800 bg-zinc-900 px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-500" />
          <span className="h-3 w-3 rounded-full bg-yellow-500" />
          <span className="h-3 w-3 rounded-full bg-green-500" />
        </div>
        <span className="text-xs text-zinc-400">{fileName}</span>
      </div>

      <pre className="overflow-x-auto p-6 font-mono text-sm leading-relaxed">
        <code>
          <Kw>const</Kw> <Prop>developer</Prop> <Punct>=</Punct>{" "}
          <Punct>{"{"}</Punct>
          {"\n  "}
          <Prop>name</Prop>
          <Punct>:</Punct> <Str>&quot;ShanDev&quot;</Str>
          <Punct>,</Punct>
          {"\n  "}
          <Prop>role</Prop>
          <Punct>:</Punct> <Str>&quot;Fullstack Developer&quot;</Str>
          <Punct>,</Punct>
          {"\n  "}
          <Prop>experience</Prop>
          <Punct>:</Punct> <Str>&quot;3+ years&quot;</Str>
          <Punct>,</Punct>
          {"\n  "}
          <Prop>location</Prop>
          <Punct>:</Punct> <Str>&quot;Ha Noi&quot;</Str>
          <Punct>,</Punct>
          {"\n  "}
          <Prop>focus</Prop>
          <Punct>:</Punct>
          <Str>&quot;[Web Performance, AI, Systems]&quot;</Str>
          <Punct>,</Punct>
          {"\n  "}
          <Prop>coffee</Prop>
          <Punct>:</Punct> <Bool>true</Bool>
          <Punct>,</Punct>
          {"\n  "}
          <Prop>available</Prop>
          <Punct>:</Punct> <Bool>true</Bool>
          <Punct>,</Punct>
          {"\n"}
          <Punct>{"}"}</Punct>
          <Punct>;</Punct>
        </code>
      </pre>
    </div>
  );
}
