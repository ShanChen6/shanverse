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

export type ContactFormState =
  | { status: "idle" }
  | {
      status: "error";
      message: string;
      fieldErrors?: Partial<Record<ContactField, string>>;
    }
  | { status: "success"; message: string };

export const initialContactState: ContactFormState = { status: "idle" };
