import {
  Accessibility,
  Blocks,
  BookOpen,
  Code2,
  Compass,
  RefreshCw,
  Search,
  Share2,
  UserRound,
  type LucideIcon,
} from "lucide-react";

export type SkillGroup = { title: string; skills: string[] };
export type AboutItem = {
  title: string;
  description: string;
  icon: LucideIcon;
};
export type JourneyItem = {
  title: string;
  organization?: string;
  description: string;
};

export const skillGroups: SkillGroup[] = [
  {
    title: "Frontend",
    skills: ["HTML", "CSS", "JavaScript", "TypeScript", "React", "Next.js", "Tailwind CSS", "Responsive Design"],
  },
  {
    title: "Backend & Data",
    skills: ["Node.js", "NestJS", "REST API", "Notion API"],
  },
  {
    title: "Tools",
    skills: ["Git", "GitHub", "VS Code", "Vercel"],
  },
  {
    title: "Focus Areas",
    skills: ["UI/UX", "Accessibility", "Performance", "Design Systems", "Web Security"],
  },
];

export const productPrinciples: AboutItem[] = [
  {
    title: "Hiểu vấn đề",
    description: "Bắt đầu từ nhu cầu của người sử dụng và làm rõ vấn đề trước khi lựa chọn công nghệ.",
    icon: Search,
  },
  {
    title: "Xây dựng có hệ thống",
    description: "Chia giao diện thành component rõ ràng, sử dụng type an toàn và giữ kiến trúc dễ mở rộng.",
    icon: Blocks,
  },
  {
    title: "Chú ý trải nghiệm",
    description: "Quan tâm đến responsive, accessibility, hiệu năng và những chi tiết nhỏ trong tương tác.",
    icon: Accessibility,
  },
  {
    title: "Liên tục cải thiện",
    description: "Kiểm tra, nhận phản hồi, ghi lại bài học và cải tiến sản phẩm qua từng phiên bản.",
    icon: RefreshCw,
  },
];

export const journey: JourneyItem[] = [
  {
    title: "Học Hệ thống thông tin quản lý",
    organization: "Trường Đại học Thương mại",
    description: "Xây dựng nền tảng về hệ thống thông tin, quy trình nghiệp vụ và cách công nghệ hỗ trợ hoạt động của tổ chức.",
  },
  {
    title: "Tập trung vào Frontend Development",
    description: "Học và thực hành HTML, CSS, JavaScript, TypeScript, React và Next.js thông qua các dự án cá nhân.",
  },
  {
    title: "Xây dựng các sản phẩm cá nhân",
    description: "Phát triển giao diện và ứng dụng web để rèn luyện tư duy sản phẩm, UI/UX và kiến trúc code.",
  },
  {
    title: "Phát triển Shanverse",
    description: "Xây dựng blog công nghệ và portfolio sử dụng Next.js, TypeScript, Tailwind CSS và Notion CMS.",
  },
];

export const values: AboutItem[] = [
  {
    title: "Chủ động học hỏi",
    description: "Tìm hiểu điều chưa biết, thử nghiệm trong dự án thật và ghi lại những gì có thể cải thiện.",
    icon: BookOpen,
  },
  {
    title: "Suy nghĩ từ người dùng",
    description: "Đánh giá lựa chọn kỹ thuật qua mức độ rõ ràng, hữu ích và dễ tiếp cận của trải nghiệm.",
    icon: UserRound,
  },
  {
    title: "Code rõ ràng, có trách nhiệm",
    description: "Ưu tiên cấu trúc dễ đọc, type an toàn và các quyết định có thể giải thích được.",
    icon: Code2,
  },
  {
    title: "Chia sẻ điều đã học",
    description: "Biến trải nghiệm trong quá trình xây dựng thành ghi chép có ích cho mình và developer khác.",
    icon: Share2,
  },
];

export const sectionIcon = Compass;
