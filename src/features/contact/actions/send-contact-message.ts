"use server";

import { getContactMailer } from "../adapters/contact-mailer";
import { contactPayload, validateContactPayload } from "../schemas/contact.schema";
import type { ContactFormState } from "../types/contact";

const genericError =
  "Chưa thể gửi tin nhắn lúc này. Vui lòng thử lại sau hoặc liên hệ qua một kênh khác.";

export async function sendContactMessage(
  _previousState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const payload = contactPayload(formData);

  if (payload.company) return { status: "error", message: genericError };

  const startedAt = Number(payload.startedAt);
  if (
    !Number.isFinite(startedAt) ||
    startedAt <= 0 ||
    Date.now() - startedAt < 1_500
  ) {
    return { status: "error", message: genericError };
  }

  const validation = validateContactPayload(payload);
  if (!validation.success) {
    return {
      status: "error",
      message: "Vui lòng kiểm tra lại các trường được đánh dấu.",
      fieldErrors: validation.fieldErrors,
    };
  }

  const mailer = getContactMailer();
  if (!mailer) {
    return {
      status: "error",
      message:
        "Biểu mẫu liên hệ hiện chưa được cấu hình gửi email. Bạn có thể liên hệ qua các kênh bên cạnh.",
    };
  }

  try {
    await mailer.send(validation.data);
    return {
      status: "success",
      message:
        "Cảm ơn bạn đã liên hệ! Tin nhắn đã được gửi thành công. Mình sẽ phản hồi sớm nhất khi có thể.",
    };
  } catch {
    return { status: "error", message: genericError };
  }
}
