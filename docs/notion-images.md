# Ảnh từ Notion

Notion trả ảnh upload trực tiếp dưới dạng link S3 có chữ ký, hết hạn sau khoảng 1 giờ. Shanverse không đưa link đó ra HTML, Open Graph hay JSON-LD. Thay vào đó, `src/services/notion.service.ts` đổi mọi ảnh upload sang URL ổn định:

```
/api/notion-media/block/<blockId>?v=<phiên bản>
/api/notion-media/page/<pageId>/<thumbnailImage|coverImage|cover>?v=<phiên bản>
```

Route `src/app/api/notion-media/[...path]/route.ts` lấy link mới từ Notion API (cache 30 phút) rồi trả ảnh về với `Cache-Control: immutable`. `v` được tính từ `last_edited_time` của block hoặc page, nên khi bạn đổi ảnh trong Notion, URL đổi theo và cache cũ không còn được dùng.

Ảnh nhúng bằng link ngoài (Unsplash, Cloudinary...) giữ nguyên URL, không đi qua route này.

## Đặt ảnh dự án trong Notion

| Loại ảnh | Vị trí | Dùng ở đâu |
|---|---|---|
| Thumbnail | Property `Thumbnail` (Files & media hoặc URL) | Thẻ dự án, ảnh chia sẻ dự phòng |
| Ảnh tổng quan | Property `Cover`, nếu trống thì dùng page cover | Ảnh hero trang chi tiết, og:image |
| Ảnh tính năng | Image block trong bài, đặt dưới heading của tính năng | Hiển thị xen trong nội dung, caption thành chú thích và alt |
| Ảnh kỹ thuật | Code block `mermaid`, hoặc image block trong mục "Kiến trúc" | Sơ đồ trong nội dung |

Quy cách gợi ý:

- Thumbnail: 1200×630, nội dung chính nằm giữa để không bị cắt khi thẻ hiển thị 16:9.
- Ảnh tổng quan và ảnh tính năng: cùng một tỉ lệ (16:9 hoặc 16:10), rộng khoảng 1600px, cùng khung và nền để đồng bộ.
- Luôn viết caption cho image block, vì caption được dùng làm `alt`.

## Chuyển sang storage riêng

Khi cần tách hẳn khỏi Notion (R2, S3, Vercel Blob...), sửa `notionMediaUrl` trong `src/lib/notion-media.ts` và bước sync ảnh. Giao diện chỉ nhận chuỗi URL nên không cần sửa component.

Avatar tác giả và icon trang vẫn dùng link trực tiếp từ Notion.
