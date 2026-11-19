import * as React from "react";

import { CodeEditorMock } from "@/features/home/components/CodeEditorMock";

export function HeroProfileCard({ codeLabel }: { codeLabel: string }) {
  return (
    <div className="hidden w-full min-w-0 md:block md:w-[26rem] lg:w-[30rem]">
      <CodeEditorMock label={codeLabel} />
    </div>
  );
}
