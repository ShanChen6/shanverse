"use client";

import * as React from "react";
import { LoaderCircle, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/i18n/client";
import { sendContactMessage } from "../actions/send-contact-message";
import { contactPayload, validateContactPayload } from "../schemas/contact.schema";
import {
  CONTACT_TYPES,
  initialContactState,
  type ContactField,
  type ContactFieldErrors,
  type ContactFormState,
} from "../types/contact";
import { ContactStatus } from "./ContactSuccess";

export function ContactForm() {
  const { t } = useI18n();
  const [state, formAction, pending] = React.useActionState(
    async (previous: ContactFormState, data: FormData): Promise<ContactFormState> => {
      try {
        return await sendContactMessage(previous, data);
      } catch {
        return { status: "error", code: "unavailable" };
      }
    },
    initialContactState,
  );
  const [clientErrors, setClientErrors] =
    React.useState<ContactFieldErrors | null>(null);
  const [startedAt, setStartedAt] = React.useState("");
  const formRef = React.useRef<HTMLFormElement>(null);
  const statusRef = React.useRef<HTMLDivElement>(null);
  const submittingRef = React.useRef(false);

  React.useEffect(() => setStartedAt(String(Date.now())), []);
  React.useEffect(() => {
    if (state.status === "idle") return;
    submittingRef.current = false;
    setClientErrors(null);
    statusRef.current?.focus();
    if (state.status === "success") {
      formRef.current?.reset();
      setStartedAt(String(Date.now()));
    }
  }, [state]);

  const invalidFields = clientErrors ??
    (state.status === "error" ? state.fieldErrors : undefined);
  const fieldErrors: Partial<Record<ContactField, string>> = {};
  for (const field of Object.keys(invalidFields ?? {}) as ContactField[]) {
    fieldErrors[field] = t(`contact.fieldErrors.${field}`);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    // Dispatch manually: a function form action resets uncontrolled inputs even
    // when the action resolves with an error state.
    event.preventDefault();
    if (pending || submittingRef.current) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const validation = validateContactPayload(
      contactPayload(data),
    );
    if (!validation.success) {
      setClientErrors(validation.fieldErrors);
      requestAnimationFrame(() => {
        const first = form.querySelector<HTMLElement>(
          "[aria-invalid='true']",
        );
        first?.focus();
      });
      return;
    }
    setClientErrors({});
    submittingRef.current = true;
    React.startTransition(() => formAction(data));
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate aria-busy={pending} className="space-y-5">
      <div ref={statusRef} tabIndex={-1} className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-live="polite">
        <ContactStatus state={state} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t("contact.fieldName")} requiredLabel={t("contact.required")} name="name" error={fieldErrors?.name}>
          <Input id="contact-name" name="name" required inputSize="lg" readOnly={pending} autoComplete="name" maxLength={80} aria-invalid={Boolean(fieldErrors?.name)} aria-describedby={fieldErrors?.name ? "contact-name-error" : undefined} />
        </Field>
        <Field label={t("contact.fieldEmail")} requiredLabel={t("contact.required")} name="email" error={fieldErrors?.email}>
          <Input id="contact-email" name="email" required inputSize="lg" readOnly={pending} type="email" inputMode="email" autoComplete="email" maxLength={254} aria-invalid={Boolean(fieldErrors?.email)} aria-describedby={fieldErrors?.email ? "contact-email-error" : undefined} />
        </Field>
      </div>

      <Field label={t("contact.fieldTopic")} requiredLabel={t("contact.required")} name="topic" error={fieldErrors?.topic}>
        <Input id="contact-topic" name="topic" required inputSize="lg" readOnly={pending} maxLength={120} aria-invalid={Boolean(fieldErrors?.topic)} aria-describedby={fieldErrors?.topic ? "contact-topic-error" : undefined} />
      </Field>

      <Field label={t("contact.fieldContactType")} requiredLabel={t("contact.required")} name="contactType" error={fieldErrors?.contactType}>
        <select id="contact-contactType" name="contactType" required disabled={pending} defaultValue="" aria-invalid={Boolean(fieldErrors?.contactType)} aria-describedby={fieldErrors?.contactType ? "contact-contactType-error" : undefined} className="h-11 w-full rounded-lg border border-border bg-background px-3 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35">
          <option value="" disabled>{t("contact.selectType")}</option>
          {CONTACT_TYPES.map((value) => <option key={value} value={value}>{t(`contact.types.${value}`)}</option>)}
        </select>
      </Field>

      <Field label={t("contact.fieldMessage")} requiredLabel={t("contact.required")} name="message" error={fieldErrors?.message}>
        <Textarea id="contact-message" name="message" required readOnly={pending} rows={8} minLength={20} maxLength={3000} aria-invalid={Boolean(fieldErrors?.message)} aria-describedby={fieldErrors?.message ? "contact-message-error contact-message-help" : "contact-message-help"} className="text-base" />
        <p id="contact-message-help" className="text-xs text-muted">{t("contact.messageHelp")}</p>
      </Field>

      <div className="absolute left-[-10000px] top-auto size-px overflow-hidden" aria-hidden="true">
        <label htmlFor="contact-company">Company</label>
        <input id="contact-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <input type="hidden" name="startedAt" value={startedAt} readOnly />

      <Button type="submit" size="lg" disabled={pending || !startedAt} className="w-full border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:w-auto" aria-disabled={pending || !startedAt}>
        {pending ? <><LoaderCircle aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" /> {t("contact.sending")}</> : <><Send aria-hidden="true" className="size-4" /> {t("contact.submit")}</>}
      </Button>
      <p className="text-xs leading-5 text-muted">{t("contact.privacy")}</p>
    </form>
  );
}

function Field({ label, requiredLabel, name, error, children }: { label: string; requiredLabel: string; name: ContactField; error?: string; children: React.ReactNode }) {
  const id = `contact-${name}`;
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-semibold">{label} <span aria-hidden="true" className="text-danger">*</span><span className="sr-only"> {requiredLabel}</span></label>
      {children}
      {error ? <p id={`${id}-error`} className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}
