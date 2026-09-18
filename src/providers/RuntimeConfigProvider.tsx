"use client";

import * as React from "react";
import type { SocialLink } from "@/constants/social";

type RuntimeConfig = {
  socialLinks: SocialLink[];
  currentYear: number;
};

const RuntimeConfigContext = React.createContext<RuntimeConfig | null>(null);

export function RuntimeConfigProvider({ value, children }: { value: RuntimeConfig; children: React.ReactNode }) {
  return <RuntimeConfigContext.Provider value={value}>{children}</RuntimeConfigContext.Provider>;
}

export function useRuntimeConfig(): RuntimeConfig {
  const value = React.useContext(RuntimeConfigContext);
  if (!value) throw new Error("useRuntimeConfig must be used inside RuntimeConfigProvider");
  return value;
}
