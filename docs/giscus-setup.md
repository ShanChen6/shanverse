# Thiết lập Giscus Comments

Shanverse dùng Giscus để lưu bình luận Blog Detail trong GitHub Discussions. Tính năng mặc định bị tắt và không tự thay đổi repository GitHub.

## 1. Chuẩn bị repository GitHub

1. Mở repository sẽ lưu bình luận.
2. Vào **Settings → General → Features** và bật **Discussions**.
3. Cài [Giscus GitHub App](https://github.com/apps/giscus) cho đúng repository.
4. Trong tab **Discussions**, tạo hoặc chọn một category dành cho bình luận. Category kiểu **Announcements** giúp Giscus quản lý discussion theo cách khuyến nghị.

## 2. Lấy cấu hình

Mở [giscus.app](https://giscus.app), nhập repository theo dạng `owner/repository`, chọn mapping và category. Trang cấu hình sẽ cung cấp:

- Repository: `NEXT_PUBLIC_GISCUS_REPO`
- Repository ID: `NEXT_PUBLIC_GISCUS_REPO_ID`
- Category: `NEXT_PUBLIC_GISCUS_CATEGORY`
- Category ID: `NEXT_PUBLIC_GISCUS_CATEGORY_ID`

Không đoán hoặc tự tạo repo ID/category ID. Các giá trị này phải lấy từ cấu hình Giscus sau khi GitHub App có quyền truy cập repository.

## 3. Cấu hình local

Thêm vào `.env.local`:

```env
NEXT_PUBLIC_GISCUS_ENABLED=true
NEXT_PUBLIC_GISCUS_REPO=owner/repository
NEXT_PUBLIC_GISCUS_REPO_ID=R_xxxxxxxxxx
NEXT_PUBLIC_GISCUS_CATEGORY=Comments
NEXT_PUBLIC_GISCUS_CATEGORY_ID=DIC_xxxxxxxxxx
```

Khởi động lại `pnpm dev` sau khi thay đổi biến môi trường. Đặt `NEXT_PUBLIC_GISCUS_ENABLED=false` để tắt hoàn toàn iframe và script Giscus.

## 4. Cấu hình Vercel

1. Mở project trên Vercel.
2. Vào **Settings → Environment Variables**.
3. Thêm năm biến ở trên cho Production và các môi trường Preview cần kiểm tra.
4. Redeploy để các biến `NEXT_PUBLIC_*` được đưa vào client bundle.

## 5. Kiểm tra

- Mở một URL Blog Detail và cuộn gần phần **Bình luận**.
- Xác nhận iframe chỉ tải khi phần bình luận gần viewport.
- Chuyển light/dark theme và kiểm tra Giscus đổi theme mà trang không reload.
- Mở shell `/vi` và `/en` để kiểm tra ngôn ngữ giao diện Giscus.
- Kiểm tra Home, Blog list, Projects, About và Contact không tải script Giscus.

Giscus đang dùng `mapping="pathname"`. Nếu thay đổi cấu trúc URL Blog Detail sau này, hãy lên kế hoạch migrate Discussions trước để tránh tạo thread mới.
