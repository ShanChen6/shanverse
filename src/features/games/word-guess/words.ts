// The built-in word list. Each word has a question and five hints, from
// vague to obvious. logic.test.ts checks every entry with validateEntry:
// five hints, unique ids, and no hint or question that gives the answer away.
//
// Later, words from Notion can be added with ids like "notion:<page id>";
// they go through the same validateEntry, and broken ones are skipped.
//
// Content is in Vietnamese for now; the UI is translated, the words are not.

import type { WordEntry } from "./logic";

/** Display names for known topics. A topic missing here shows its id. */
export const TOPICS: Record<string, { vi: string; en: string }> = {
  tech: { vi: "Công nghệ", en: "Tech" },
  life: { vi: "Đời sống", en: "Everyday life" },
};

export const WORDS: WordEntry[] = [
  // Tech
  {
    id: "static:closure",
    topic: "tech",
    question: "Khái niệm JavaScript nào giúp một hàm vẫn dùng được biến của hàm bên ngoài, kể cả khi hàm bên ngoài đã chạy xong?",
    hints: [
      "Đây là một khái niệm của ngôn ngữ, không phải thư viện hay công cụ.",
      "Nó gắn liền với phạm vi biến (scope).",
      "Rất hay gặp trong phỏng vấn frontend, cùng với vòng lặp và setTimeout.",
      "Lỗi \"giá trị cũ\" (stale) trong useEffect của React thường do nó gây ra.",
      "Tên tiếng Anh có 7 chữ cái, bắt đầu bằng chữ C.",
    ],
    answer: "Closure",
    accept: ["bao đóng"],
  },
  {
    id: "static:docker",
    topic: "tech",
    question: "Công cụ nào đóng gói ứng dụng cùng mọi thứ nó cần, để chạy giống hệt nhau trên mọi máy?",
    hints: [
      "Nó sinh ra để chấm dứt câu \"Máy em chạy được mà!\".",
      "Hai khái niệm chính của nó là image và container.",
      "File cấu hình của nó thường không có đuôi mở rộng.",
      "Có một công cụ đi kèm tên là Compose để chạy nhiều dịch vụ cùng lúc.",
      "Logo là một chú cá voi xanh chở các thùng hàng.",
    ],
    answer: "Docker",
    accept: [],
  },
  {
    id: "static:git",
    topic: "tech",
    question: "Hệ thống nào lưu lại lịch sử thay đổi của mã nguồn, để có thể quay về bất kỳ phiên bản nào?",
    hints: [
      "Nó ra đời năm 2005 để quản lý mã nguồn của một hệ điều hành nổi tiếng.",
      "Người tạo ra nó cũng là người tạo ra Linux.",
      "Các lệnh quen thuộc: commit, branch, merge, rebase.",
      "Một trang lưu trữ mã nguồn rất nổi tiếng lấy tên nó rồi thêm chữ \"Hub\".",
      "Tên chỉ có 3 chữ cái.",
    ],
    answer: "Git",
    accept: [],
  },
  {
    id: "static:de-quy",
    topic: "tech",
    question: "Kỹ thuật lập trình nào mà một hàm tự gọi lại chính nó?",
    hints: [
      "Có câu đùa: muốn hiểu nó, trước tiên bạn phải hiểu nó.",
      "Mọi lời giải dùng nó đều cần một điều kiện dừng.",
      "Gọi quá sâu sẽ gây lỗi stack overflow.",
      "Hay được dùng để tính giai thừa hoặc dãy Fibonacci.",
      "Tên tiếng Việt gồm hai chữ, chữ đầu là \"Đệ\".",
    ],
    answer: "Đệ quy",
    accept: ["recursion"],
  },
  {
    id: "static:typescript",
    topic: "tech",
    question: "Ngôn ngữ nào thường được gọi vui là \"JavaScript có thêm kiểu dữ liệu\"?",
    hints: [
      "Nó do Microsoft phát triển.",
      "Trình duyệt không chạy trực tiếp nó, phải biên dịch trước.",
      "File của nó có đuôi mở rộng gồm hai chữ cái, hoặc ba chữ cái khi viết React.",
      "Shanverse cũng được viết bằng nó.",
      "Tên của nó ghép từ chữ \"Type\" và tên ngôn ngữ mà nó mở rộng.",
    ],
    answer: "TypeScript",
    accept: ["ts"],
  },
  {
    id: "static:api",
    topic: "tech",
    question: "Từ viết tắt nào chỉ \"cánh cửa\" để hai phần mềm nói chuyện với nhau?",
    hints: [
      "Nó là viết tắt của ba từ tiếng Anh.",
      "REST và GraphQL là hai kiểu phổ biến của nó.",
      "Frontend thường gọi nó bằng fetch hoặc axios.",
      "Nhiều dịch vụ cấp cho bạn một \"key\" riêng để dùng nó.",
      "Chữ cái ở giữa là P, viết tắt của Programming.",
    ],
    answer: "API",
    accept: ["application programming interface"],
  },
  {
    id: "static:cookie",
    topic: "tech",
    question: "Mẩu dữ liệu nhỏ nào được website lưu lại trong trình duyệt của bạn?",
    hints: [
      "Nhiều website hỏi bạn có \"chấp nhận\" nó không ngay lần đầu ghé thăm.",
      "Nó hay được dùng để giữ trạng thái đăng nhập.",
      "Loại \"của bên thứ ba\" đang dần bị các trình duyệt chặn.",
      "Cờ HttpOnly khiến JavaScript không đọc được nó.",
      "Tên của nó cũng là tên một loại bánh quy.",
    ],
    answer: "Cookie",
    accept: ["cookies"],
  },
  {
    id: "static:stack-overflow",
    topic: "tech",
    question: "Trang hỏi đáp nào mà gần như lập trình viên nào cũng từng chép code từ đó?",
    hints: [
      "Câu hỏi bị đánh dấu \"trùng lặp\" là chuyện thường ngày ở đây.",
      "Nó ra đời năm 2008.",
      "Logo trông như một chồng giấy nằm trong khay.",
      "Tên của nó cũng là tên một lỗi khi hàm gọi lồng nhau quá sâu.",
      "Tên gồm hai từ tiếng Anh, nghĩa là \"ngăn xếp\" và \"tràn\".",
    ],
    answer: "Stack Overflow",
    accept: [],
  },
  {
    id: "static:dark-mode",
    topic: "tech",
    question: "Tính năng giao diện nào được nhiều lập trình viên bật ngay khi cài một ứng dụng mới?",
    hints: [
      "Nó giúp đỡ chói mắt khi làm việc ban đêm.",
      "Trong CSS, có thể nhận ra nó bằng media query prefers-color-scheme.",
      "Shanverse có một nút để bật tắt nó ở thanh trên cùng.",
      "Biểu tượng của nó thường là hình mặt trăng.",
      "Ngược lại với nó là light mode.",
    ],
    answer: "Dark mode",
    accept: ["chế độ tối", "giao diện tối"],
  },
  {
    id: "static:localhost",
    topic: "tech",
    question: "Địa chỉ nào luôn trỏ về chính chiếc máy bạn đang dùng?",
    hints: [
      "Lập trình viên mở nó hàng chục lần mỗi ngày khi chạy dự án.",
      "Thanh địa chỉ sẽ hiện nó khi bạn chạy pnpm dev.",
      "Next.js mặc định chạy ở cổng 3000 của nó.",
      "Địa chỉ IP dạng số của nó bắt đầu bằng 127.",
      "Tên của nó có nghĩa là \"máy chủ cục bộ\".",
    ],
    answer: "localhost",
    accept: ["127.0.0.1"],
  },

  // Everyday life
  {
    id: "static:pho",
    topic: "life",
    question: "Món ăn nào được xem là \"quốc hồn quốc túy\" của ẩm thực Việt Nam, thường ăn nóng vào buổi sáng?",
    hints: [
      "Nước dùng được ninh từ xương trong nhiều giờ.",
      "Có hai kiểu nổi tiếng: miền Bắc và miền Nam, khác nhau ở rau ăn kèm.",
      "Thường ăn kèm quẩy, chanh và ớt.",
      "Sợi bánh làm từ gạo, dẹt và mềm.",
      "Hai loại hay gặp nhất là bò và gà.",
    ],
    answer: "Phở",
    accept: [],
  },
  {
    id: "static:ha-noi",
    topic: "life",
    question: "Thành phố nào nổi tiếng với \"ba mươi sáu phố phường\"?",
    hints: [
      "Đây là một thành phố ở miền Bắc.",
      "Nổi tiếng với bún chả và chả cá Lã Vọng.",
      "Ở trung tâm có Hồ Gươm và Tháp Rùa.",
      "Thành phố tròn 1.000 năm tuổi vào năm 2010.",
      "Là thủ đô của Việt Nam.",
    ],
    answer: "Hà Nội",
    accept: [],
  },
  {
    id: "static:ao-dai",
    topic: "life",
    question: "Trang phục truyền thống nào thường được mặc vào dịp Tết, đám cưới và lễ khai giảng?",
    hints: [
      "Nó có một vạt trước và một vạt sau.",
      "Thường được mặc cùng quần ống rộng.",
      "Là đồng phục của nhiều nữ sinh cấp ba.",
      "Hình ảnh của nó hay xuất hiện trên tem và poster du lịch Việt Nam.",
      "Tên gồm hai chữ, chữ thứ hai nói về độ dài.",
    ],
    answer: "Áo dài",
    accept: [],
  },
  {
    id: "static:tet",
    topic: "life",
    question: "Dịp nào trong năm mà người Việt đi xa đến mấy cũng cố về nhà?",
    hints: [
      "Ngày của nó được tính theo lịch âm.",
      "Trẻ con được nhận lì xì.",
      "Có bánh chưng, dưa hành và mứt.",
      "Nhà nhà trang trí hoa đào ở miền Bắc, hoa mai ở miền Nam.",
      "Tên đầy đủ có thêm hai chữ \"Nguyên Đán\".",
    ],
    answer: "Tết",
    accept: ["tết nguyên đán"],
  },
  {
    id: "static:ca-phe-sua-da",
    topic: "life",
    question: "Thức uống nào là \"nhiên liệu\" buổi sáng của rất nhiều người Việt, nhất là dân văn phòng và lập trình viên?",
    hints: [
      "Nó có cả vị đắng lẫn vị ngọt.",
      "Được pha chậm từng giọt qua một dụng cụ nhỏ bằng nhôm.",
      "Dùng sữa đặc chứ không dùng sữa tươi.",
      "Được uống lạnh, với rất nhiều đá.",
      "Tên gồm bốn chữ, bắt đầu bằng \"Cà phê\".",
    ],
    answer: "Cà phê sữa đá",
    accept: ["cafe sữa đá", "cà phê sữa"],
  },
  {
    id: "static:rua",
    topic: "life",
    question: "Con vật nào nổi tiếng vì chậm chạp nhưng kiên trì, từng thắng thỏ trong một cuộc đua?",
    hints: [
      "Nó mang nhà theo trên lưng.",
      "Một số loài có thể sống hơn 100 năm.",
      "Truyền thuyết Hồ Gươm kể về một con vật như vậy đòi lại gươm thần.",
      "Linh vật Tianwu của Shanverse là một chú như vậy, làm phi hành gia.",
      "Tên có 3 chữ cái, bắt đầu bằng R.",
    ],
    answer: "Rùa",
    accept: ["con rùa", "turtle"],
  },
  {
    id: "static:xe-may",
    topic: "life",
    question: "Phương tiện nào khiến đường phố Việt Nam giờ cao điểm trông như một dòng sông?",
    hints: [
      "Nó có hai bánh.",
      "Gần như nhà nào cũng có ít nhất một chiếc.",
      "Nhiều nơi gọi chung nó bằng tên một hãng xe Nhật Bản.",
      "Ngồi trên nó bắt buộc phải đội mũ bảo hiểm.",
      "Không phải xe đạp, vì nó chạy bằng động cơ.",
    ],
    answer: "Xe máy",
    accept: ["xe gắn máy"],
  },
  {
    id: "static:banh-mi",
    topic: "life",
    question: "Món ăn đường phố nào của Việt Nam đã có mục từ riêng trong từ điển tiếng Anh Oxford?",
    hints: [
      "Ăn sáng, ăn trưa hay ăn vặt đều hợp.",
      "Lớp vỏ ngoài giòn, ruột bên trong mềm.",
      "Nhân phổ biến gồm pa tê, chả, rau thơm và đồ chua.",
      "Nó có gốc gác từ những ổ bánh mang theo từ nước Pháp.",
      "Tên gồm hai chữ, chữ đầu là \"Bánh\".",
    ],
    answer: "Bánh mì",
    accept: [],
  },
  {
    id: "static:trung-thu",
    topic: "life",
    question: "Dịp lễ nào trẻ em được rước đèn và phá cỗ?",
    hints: [
      "Nó diễn ra vào ngày rằm tháng Tám âm lịch.",
      "Đêm đó, trăng được cho là tròn và sáng nhất năm.",
      "Bánh nướng và bánh dẻo là món không thể thiếu.",
      "Gắn với sự tích chú Cuội ngồi gốc cây đa.",
      "Đèn ông sao và đầu lân là hình ảnh quen thuộc của nó.",
    ],
    answer: "Trung thu",
    accept: ["tết trung thu"],
  },
  {
    id: "static:vinh-ha-long",
    topic: "life",
    question: "Danh thắng nào của Việt Nam có gần 2.000 hòn đảo đá vôi?",
    hints: [
      "Nó nằm ở tỉnh Quảng Ninh.",
      "Đã được UNESCO công nhận là Di sản Thiên nhiên Thế giới.",
      "Hang Sửng Sốt và hòn Trống Mái nằm ở đây.",
      "Du khách thường ngắm nó từ trên du thuyền, có khi ngủ lại qua đêm.",
      "Tên có nghĩa là \"nơi rồng hạ xuống\".",
    ],
    answer: "Vịnh Hạ Long",
    accept: ["hạ long"],
  },
];
