import {
  CONTACT_TYPES,
  type ContactField,
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
      fieldErrors: Partial<Record<ContactField, string>>;
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
  const errors: Partial<Record<ContactField, string>> = {};

  if (payload.name.length < 2 || payload.name.length > 80)
    errors.name = "Họ và tên phải có từ 2 đến 80 ký tự.";
  if (
    !payload.email ||
    payload.email.length > 254 ||
    !emailPattern.test(payload.email)
  )
    errors.email = "Vui lòng nhập địa chỉ email hợp lệ.";
  if (payload.topic.length < 3 || payload.topic.length > 120)
    errors.topic = "Chủ đề phải có từ 3 đến 120 ký tự.";
  if (!CONTACT_TYPES.includes(payload.contactType as ContactType))
    errors.contactType = "Vui lòng chọn một loại liên hệ hợp lệ.";
  if (payload.message.length < 20 || payload.message.length > 3000)
    errors.message = "Nội dung phải có từ 20 đến 3000 ký tự.";

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
