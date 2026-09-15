export const notionMessages = {
  en: {
    copyCode: "Copy",
    copied: "Copied",
    diagram: "Diagram",
    source: "Source",
    diagramError: "Unable to render diagram",
    imageError: "Unable to load image",
    warning: "Warning",
    note: "Note",
  },
  vi: {
    copyCode: "Sao chép",
    copied: "Đã sao chép",
    diagram: "Sơ đồ",
    source: "Mã nguồn",
    diagramError: "Không thể hiển thị sơ đồ",
    imageError: "Không thể tải hình ảnh",
    warning: "Cảnh báo",
    note: "Ghi chú",
  },
} as const;

export type NotionLocale = keyof typeof notionMessages;
