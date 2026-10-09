export const CONTACT_TYPES = [
  "career",
  "project",
  "technical",
  "feedback",
  "other",
] as const;

export type ContactType = (typeof CONTACT_TYPES)[number];
export type ContactField =
  | "name"
  | "email"
  | "topic"
  | "contactType"
  | "message";

export type ContactMessage = {
  name: string;
  email: string;
  topic: string;
  contactType: ContactType;
  message: string;
};

// Fields that failed validation. The form maps each field to its localized
// message (contact.fieldErrors.<field>), so server and client share no text.
export type ContactFieldErrors = Partial<Record<ContactField, true>>;

export type ContactErrorCode = "invalid" | "unavailable" | "notConfigured";

export type ContactFormState =
  | { status: "idle" }
  | {
      status: "error";
      code: ContactErrorCode;
      fieldErrors?: ContactFieldErrors;
    }
  | { status: "success" };

export const initialContactState: ContactFormState = { status: "idle" };
