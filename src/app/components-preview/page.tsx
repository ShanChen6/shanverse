import React from "react";
import type { Metadata } from "next";
import ComponentTestPage from "../test/page";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function ComponentsPreviewPage() {
  return <ComponentTestPage />;
}
