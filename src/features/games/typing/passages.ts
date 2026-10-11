// Passages for the typing test. Prose follows the page language; code is shared.
// Keep each one short (about 150–300 characters) so a round takes under a minute.

export type TypingMode = "text" | "code";

export type Passage = { id: string; label: string; text: string };

export const TEXT_PASSAGES: Record<"vi" | "en", Passage[]> = {
  vi: [
    {
      id: "vi-ship",
      label: "Ra mắt sản phẩm",
      text: "Một tính năng nhỏ được hoàn thiện chỉn chu luôn tốt hơn mười tính năng dang dở. Hãy viết code sao cho người đọc sau bạn hiểu được ngay, kể cả khi người đó chính là bạn của sáu tháng sau.",
    },
    {
      id: "vi-debug",
      label: "Gỡ lỗi",
      text: "Khi gặp lỗi khó, đừng vội sửa. Hãy đọc kỹ thông báo lỗi, tái hiện vấn đề với ví dụ nhỏ nhất có thể, rồi mới đặt giả thuyết. Phần lớn lỗi được tìm ra nhờ quan sát cẩn thận chứ không phải đoán mò.",
    },
    {
      id: "vi-learn",
      label: "Học công nghệ mới",
      text: "Cách học nhanh nhất là tự xây một dự án nhỏ. Bạn sẽ gặp đúng những vấn đề mà tài liệu không nhắc tới, và mỗi lần vượt qua chúng là một lần hiểu sâu hơn về công cụ mình đang dùng.",
    },
    {
      id: "vi-review",
      label: "Review code",
      text: "Một buổi review code tốt tập trung vào vấn đề chứ không vào con người. Hãy đặt câu hỏi thay vì ra lệnh, giải thích lý do cho mỗi góp ý và đừng quên khen những đoạn code viết hay.",
    },
    {
      id: "vi-perf",
      label: "Hiệu năng",
      text: "Trước khi tối ưu, hãy đo. Một trang web nhanh thường đến từ những việc đơn giản: tải ít JavaScript hơn, nén ảnh đúng cách và chỉ hiển thị những gì người dùng thật sự cần thấy.",
    },
  ],
  en: [
    {
      id: "en-ship",
      label: "Shipping",
      text: "One small feature finished with care beats ten that are half done. Write code that the next reader understands right away, even if that reader is you six months from now.",
    },
    {
      id: "en-debug",
      label: "Debugging",
      text: "When a bug gets tricky, do not rush the fix. Read the error message, reproduce the problem with the smallest example you can, and only then form a theory about what went wrong.",
    },
    {
      id: "en-learn",
      label: "Learning",
      text: "The fastest way to learn a new tool is to build something small with it. You will hit the problems the docs never mention, and every one you solve teaches you how the tool really works.",
    },
    {
      id: "en-review",
      label: "Code review",
      text: "A good code review is about the code, not the person. Ask questions instead of giving orders, explain the reason behind each comment, and point out the parts that are done well too.",
    },
    {
      id: "en-perf",
      label: "Performance",
      text: "Measure before you optimise. A fast page usually comes from simple choices: ship less JavaScript, compress images properly, and only render what people actually need to see.",
    },
  ],
};

export const CODE_PASSAGES: Passage[] = [
  {
    id: "ts-debounce",
    label: "TypeScript · debounce",
    text: `function debounce<T extends unknown[]>(fn: (...args: T) => void, ms: number) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: T) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}`,
  },
  {
    id: "react-hook",
    label: "React · useToggle",
    text: `export function useToggle(initial = false) {
  const [on, setOn] = useState(initial);
  const toggle = useCallback(() => setOn((value) => !value), []);
  return [on, toggle] as const;
}`,
  },
  {
    id: "css-grid",
    label: "CSS · grid",
    text: `.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
  gap: 1.5rem;
}`,
  },
  {
    id: "sql-top",
    label: "SQL · top posts",
    text: `SELECT title, views
FROM posts
WHERE published = true
ORDER BY views DESC
LIMIT 5;`,
  },
  {
    id: "ts-fetch",
    label: "TypeScript · fetch",
    text: `async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(\`Request failed: \${response.status}\`);
  return response.json() as Promise<T>;
}`,
  },
];
