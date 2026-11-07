"use client";

import * as React from "react";
import { CheckCircle2, LoaderCircle, Send } from "lucide-react";

import { Tianwu } from "@/components/mascot/Tianwu";
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
import { cn } from "@/lib/cn";
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
  const [showSuccess, setShowSuccess] = React.useState(false);

  React.useEffect(() => setStartedAt(String(Date.now())), []);
  React.useEffect(() => {
    if (state.status === "idle") return;
    submittingRef.current = false;
    setClientErrors(null);
    statusRef.current?.focus();
    setShowSuccess(state.status === "success");
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

  // Check one field as soon as the person leaves it (and again while typing, once it shows an error),
  // so mistakes are pointed out before the form is sent.
  function checkField(target: EventTarget) {
    const form = formRef.current;
    const name = (target as HTMLInputElement).name as ContactField | undefined;
    if (!form || !name || !["name", "email", "topic", "contactType", "message"].includes(name)) return;
    const validation = validateContactPayload(contactPayload(new FormData(form)));
    setClientErrors((current) => {
      const next: ContactFieldErrors = { ...(current ?? {}) };
      if (!validation.success && validation.fieldErrors[name]) next[name] = validation.fieldErrors[name];
      else delete next[name];
      return next;
    });
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
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      onBlur={(event) => checkField(event.target)}
      onInput={(event) => { if (fieldErrors[(event.target as HTMLInputElement).name as ContactField]) checkField(event.target); }}
      noValidate
      aria-busy={pending}
      className="space-y-5"
    >
      <div ref={statusRef} tabIndex={-1} className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-live="polite">
        {showSuccess ? (
          <div className="flex flex-col items-center gap-4 rounded-card border border-success/30 bg-success/10 p-6 text-center sm:p-8">
            <div className="tw-sky w-32 rounded-3xl p-4"><Tianwu pose="wave" className="tw-sway h-auto w-full" title={t("mascot.artWaving")} /></div>
            <div role="status" className="space-y-2">
              <p className="flex items-center justify-center gap-2 text-xl font-semibold"><CheckCircle2 aria-hidden="true" className="size-5 text-success" /> {t("contact.successTitle")}</p>
              <p className="text-sm leading-6 text-foreground-secondary">{t("contact.status.success")}</p>
            </div>
            <Button type="button" variant="outline" onClick={() => setShowSuccess(false)}>{t("contact.sendAnother")}</Button>
          </div>
        ) : state.status === "error" ? (
          <ContactStatus state={state} />
        ) : null}
      </div>

      <div hidden={showSuccess} className="space-y-5">

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

      <fieldset aria-describedby={fieldErrors?.contactType ? "contact-contactType-error" : undefined} className="space-y-2">
        <legend className="text-sm font-semibold">{t("contact.fieldContactType")} <span aria-hidden="true" className="text-danger">*</span><span className="sr-only"> {t("contact.required")}</span></legend>
        <div className="flex flex-wrap gap-2">
          {CONTACT_TYPES.map((value) => (
            <label key={value} className="relative">
              <input type="radio" name="contactType" value={value} required disabled={pending} aria-invalid={Boolean(fieldErrors?.contactType)} className="peer sr-only" />
              <span className={cn("inline-flex min-h-11 cursor-pointer items-center rounded-full border bg-background px-4 text-sm font-medium transition-colors hover:border-primary/50 peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background peer-disabled:opacity-60", fieldErrors?.contactType ? "border-danger" : "border-border")}>{t(`contact.types.${value}`)}</span>
            </label>
          ))}
        </div>
        {fieldErrors?.contactType ? <p id="contact-contactType-error" className="text-sm text-danger">{fieldErrors.contactType}</p> : null}
      </fieldset>

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
      </div>
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
