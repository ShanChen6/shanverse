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
    loadingDiagram: "Loading diagram…",
    mermaidDiagram: "Mermaid diagram",
    taskStatus: "Task status",
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
    loadingDiagram: "Đang tải sơ đồ…",
    mermaidDiagram: "Sơ đồ Mermaid",
    taskStatus: "Trạng thái công việc",
  },
} as const;

export type NotionLocale = keyof typeof notionMessages;
