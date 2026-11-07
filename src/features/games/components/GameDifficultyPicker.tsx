"use client";

import * as React from "react";

import { cn } from "@/lib/cn";

export type DifficultyOption<T extends string> = { id: T; label: string; hint?: string };

/** Segmented control to choose a difficulty or size. */
export function GameDifficultyPicker<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: {
  label: string;
  options: DifficultyOption<T>[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
}) {
  return (
    <div role="group" aria-label={label} className={cn("inline-flex rounded-xl border border-border bg-surface p-1", className)}>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          aria-pressed={value === option.id}
          onClick={() => onChange(option.id)}
          className={cn(
            "min-h-9 rounded-lg px-3 py-1.5 text-sm font-semibold text-foreground-secondary transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary",
            value === option.id && "bg-primary text-primary-foreground hover:text-primary-foreground",
          )}
        >
          {option.label}
          {option.hint ? <span className="ml-1.5 text-xs font-medium opacity-75">{option.hint}</span> : null}
        </button>
      ))}
    </div>
  );
}
