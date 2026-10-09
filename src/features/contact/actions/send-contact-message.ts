"use server";

import { getContactMailer } from "../adapters/contact-mailer";
import { contactPayload, validateContactPayload } from "../schemas/contact.schema";
import type { ContactFormState } from "../types/contact";

export async function sendContactMessage(
  _previousState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const payload = contactPayload(formData);

  if (payload.company) return { status: "error", code: "unavailable" };

  const startedAt = Number(payload.startedAt);
  if (
    !Number.isFinite(startedAt) ||
    startedAt <= 0 ||
    Date.now() - startedAt < 1_500
  ) {
    return { status: "error", code: "unavailable" };
  }

  const validation = validateContactPayload(payload);
  if (!validation.success) {
    return { status: "error", code: "invalid", fieldErrors: validation.fieldErrors };
  }

  const mailer = getContactMailer();
  if (!mailer) {
    return { status: "error", code: "notConfigured" };
  }

  try {
    await mailer.send(validation.data);
    return { status: "success" };
  } catch {
    return { status: "error", code: "unavailable" };
  }
}
