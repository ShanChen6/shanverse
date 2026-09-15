import * as React from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { ContactFormState } from "../types/contact";

export function ContactStatus({ state }: { state: ContactFormState }) {
  if (state.status === "idle") return null;
  const success = state.status === "success";
  return (
    <div role={success ? "status" : "alert"} className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${success ? "border-success/30 bg-success/10" : "border-danger/30 bg-danger/5"}`}>
      {success ? <CheckCircle2 aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-success" /> : <AlertCircle aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-danger" />}
      <p>{state.message}</p>
    </div>
  );
}
