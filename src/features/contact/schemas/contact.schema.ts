import {
  CONTACT_TYPES,
  type ContactFieldErrors,
  type ContactMessage,
  type ContactType,
} from "../types/contact";

export type ContactPayload = Record<
  "name" | "email" | "topic" | "contactType" | "message" | "company" | "startedAt",
  string
>;

export type ContactValidation =
  | { success: true; data: ContactMessage }
  | {
      success: false;
      fieldErrors: ContactFieldErrors;
    };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

export function contactPayload(formData: FormData): ContactPayload {
  const value = (name: string) => {
    const entry = formData.get(name);
    return typeof entry === "string" ? entry.trim() : "";
  };

  return {
    name: value("name"),
    email: value("email"),
    topic: value("topic"),
    contactType: value("contactType"),
    message: value("message"),
    company: value("company"),
    startedAt: value("startedAt"),
  };
}

export function validateContactPayload(payload: ContactPayload): ContactValidation {
  const errors: ContactFieldErrors = {};

  if (payload.name.length < 2 || payload.name.length > 80)
    errors.name = true;
  if (
    !payload.email ||
    payload.email.length > 254 ||
    !emailPattern.test(payload.email)
  )
    errors.email = true;
  if (payload.topic.length < 3 || payload.topic.length > 120)
    errors.topic = true;
  if (!CONTACT_TYPES.includes(payload.contactType as ContactType))
    errors.contactType = true;
  if (payload.message.length < 20 || payload.message.length > 3000)
    errors.message = true;

  if (Object.keys(errors).length) return { success: false, fieldErrors: errors };

  return {
    success: true,
    data: {
      name: payload.name,
      email: payload.email,
      topic: payload.topic,
      contactType: payload.contactType as ContactType,
      message: payload.message,
    },
  };
}
