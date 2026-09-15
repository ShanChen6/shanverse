import "server-only";

import type { ContactMessage, ContactType } from "../types/contact";

const contactTypeLabels: Record<ContactType, string> = {
  career: "Cơ hội thực tập/việc làm",
  project: "Hợp tác dự án",
  technical: "Trao đổi kỹ thuật",
  feedback: "Góp ý về Shanverse",
  other: "Khác",
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function buildContactEmail(message: ContactMessage) {
  const fields = [
    ["Tên người gửi", message.name],
    ["Email phản hồi", message.email],
    ["Loại liên hệ", contactTypeLabels[message.contactType]],
    ["Chủ đề", message.topic],
    ["Thời gian gửi (UTC)", new Date().toISOString()],
  ];
  // Keep control characters out of the subject header.
  const topic = Array.from(message.topic, (character) => {
    const code = character.charCodeAt(0);
    return code < 32 || code === 127 ? " " : character;
  }).join("").trim().slice(0, 120);

  return {
    subject: `[Shanverse Contact] ${topic}`,
    text: [
      "Tin nhắn mới từ Shanverse",
      ...fields.map(([label, value]) => `${label}: ${value}`),
      "",
      "Nội dung:",
      message.message,
    ].join("\n"),
    html: [
      '<html lang="vi"><body>',
      "<h1>Tin nhắn mới từ Shanverse</h1>",
      ...fields.map(([label, value]) =>
        `<p><strong>${label}:</strong> ${escapeHtml(value)}</p>`,
      ),
      "<h2>Nội dung</h2>",
      `<p>${escapeHtml(message.message).replace(/\r\n|\r|\n/gu, "<br />")}</p>`,
      "</body></html>",
    ].join("\n"),
  };
}
