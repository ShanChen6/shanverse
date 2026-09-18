"use client";

import Link from "next/link";
import * as React from "react";
import type { ComponentProps } from "react";
import { useI18n } from "@/i18n/client";
import { localizeHref } from "@/i18n/config";

export function LocalizedLink({ href, ...props }: ComponentProps<typeof Link>) {
  const { locale } = useI18n();
  const localizedHref = typeof href === "string" ? localizeHref(href, locale) : href;
  return <Link href={localizedHref} {...props} />;
}
