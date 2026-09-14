# 🌌 Shanverse

> A personal tech blog and digital space built with Next.js, Tailwind CSS, and Notion.

Shanverse is my personal website where I share knowledge, technical articles, projects, and experiences in software development.

## ✨ Features

- 📝 Technical Blog
- 🚀 Project Showcase
- 📚 Learning Notes
- 🔍 Search Articles
- 🏷️ Categories & Tags
- 🌙 Dark / Light Mode
- 📱 Responsive Design
- ⚡ Fast Performance
- 🔎 SEO Optimized
- 📊 Reading Time
- 🖼️ Optimized Images
- 📡 Content powered by Notion CMS

---

## 🛠️ Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

### CMS

- Notion API

### Deployment

- Vercel

### Development

- pnpm
- ESLint
- Git
- GitHub

---

## 📂 Project Structure

```
src/
│
├── app/
├── components/
├── features/
├── hooks/
├── lib/
├── services/
├── styles/
├── types/
├── utils/
└── constants/
```

---

## 🚀 Getting Started

### Clone repository

```bash
git clone https://github.com/ShanChen6/shanverse.git
```

### Install dependencies

```bash
pnpm install
```

### Start development server

```bash
pnpm dev
```

Open:

```
http://localhost:3000
```

---

## ⚙️ Environment Variables

Create a `.env.local` file.

```env
NOTION_TOKEN=
NOTION_DATABASE_ID=
NOTION_POSTS_DATA_SOURCE_ID=
NOTION_CATEGORIES_DATA_SOURCE_ID=
NOTION_TAGS_DATA_SOURCE_ID=
NOTION_PROJECTS_DATA_SOURCE_ID=
NOTION_AUTHORS_DATA_SOURCE_ID=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`NOTION_TOKEN` must have access to every Notion data source used by the app. The
five collection-specific IDs are recommended when posts, categories, tags,
projects, and authors live in separate databases. If they are omitted, the service resolves
the first data source from `NOTION_DATABASE_ID` as a compatibility fallback.

Notion access is kept inside `src/services/notion.service.ts`. Server-side code
can use the exported `notionService` methods:

```ts
await notionService.getPosts();
await notionService.getPostBySlug("my-post");
await notionService.getFeaturedPosts();
await notionService.getCategories();
await notionService.getTags();
await notionService.getProjects();
await notionService.getProjectBySlug("my-project");
await notionService.getAuthors();
```

To verify the live connection during development, start the app and open
`/notion-preview`. The preview queries all five collections independently and
shows the normalized record count, a sample title, or the API error returned by
Notion. When Notion reports `object_not_found`, open each database in Notion,
choose **Share**, and invite the integration that owns `NOTION_TOKEN`.

The adapter maps common property names (`Title`/`Name`, `Slug`, `Published`,
`Featured`, and so on) into the application models. Posts and projects use
separate Notion data sources configured by `NOTION_POSTS_DATA_SOURCE_ID` and
`NOTION_PROJECTS_DATA_SOURCE_ID`; no `Type` property is required. Collection methods return
an empty array when Notion has no rows; detail methods return `null` when the
slug is not found, while configuration and API failures throw
`NotionServiceError` with the original error as its cause.

### Blog listing (`/blog`)

The blog is a Server Component. `src/features/blog/blog-data.ts` caches the
existing `notionService.getPosts()`, `getCategories()`, and `getTags()` calls
independently for 300 seconds. Filtering happens on the server using `q`,
`category`, `tag`, and `page` query parameters; no public API route is needed.
The Notion service is marked `server-only`, and credentials stay on the server.

Only published posts with a nonblank title and slug are listed. Posts are sorted
by `Published Date`, falling back to Notion's creation timestamp. Each page has
up to six posts in total, split between featured writing and latest articles
without duplicates. Search covers title, excerpt, category, and tags, ignoring
case. Changing a filter or submitting a search resets the page; pagination keeps
the current filters. Category/tag names from published posts supplement the
taxonomy collections when available, including when those collections fail.
Unresolved relation IDs are omitted instead of displayed as tag names.

A Posts query failure shows a friendly retry state, while an empty published
collection and a search with no matches have separate empty states. Failed
requests are handled outside the cache so an initial failure can be retried.
After a successful load, Next.js can serve cached data while refreshing it.

The existing aliases in `src/config/notion.config.ts` remain the source of truth:

| Posts property | Expected Notion type |
| --- | --- |
| Title | Title |
| Slug, Description, Excerpt | Rich text |
| Thumbnail, Cover | Files or URL |
| Category | Relation to Categories, or Select/text |
| Tags | Relation to Tags, or Multi-select/text |
| Author | Relation to Authors, or People/text |
| Published Date | Date (optional; falls back to creation time) |
| Published, Featured | Checkbox |

`PostCard` uses thumbnail, cover, then the existing placeholder; it displays up
to two tags and the author's avatar. Dates use `en-GB` in UTC. Reading time is
rounded up at 200 words/minute, using content when available and otherwise the
excerpt. The supplied Hero stays in Vietnamese; card and filter labels are in
English. The `/blog/[slug]` detail page is still the existing placeholder and is
outside this listing implementation.

#### Kiểm tra trên localhost

1. Điền `.env.local` theo danh sách biến phía trên và cấp quyền integration cho
   các database. Không thêm tiền tố `NEXT_PUBLIC_` vào token Notion.
2. Chạy các lệnh sau từ thư mục dự án:

   ```bash
   pnpm install --frozen-lockfile
   pnpm exec eslint src/app/blog/page.tsx src/features/home/common/PostCard.tsx
   pnpm exec tsc --noEmit
   pnpm build
   pnpm dev
   ```

3. Mở `http://localhost:3000/blog`, rồi thử `?q=nextjs`,
   `?category=Frontend`, `?tag=React`, và `?page=2`. Số kết quả phụ thuộc vào
   dữ liệu đã publish trong Notion; không có bài khớp sẽ hiển thị empty state.
4. Kết hợp các filter, chuyển trang, xóa từng filter hoặc chọn **Clear filters**.
   Kiểm tra bằng phím Tab và thử cả light/dark mode trên mobile, tablet, desktop.
5. Sau khi sửa nội dung Notion, chờ khoảng 5 phút rồi tải lại. Lần tải đầu sau
   thời hạn cache có thể hiển thị dữ liệu cũ trong lúc server cập nhật nền.

---

## 📅 Roadmap

- [x] Initialize project
- [ ] Design System
- [ ] Layout
- [ ] Header
- [ ] Footer
- [ ] Home Page
- [ ] About Page
- [ ] Blog
- [ ] Blog Detail
- [ ] Projects
- [ ] Search
- [ ] Tags
- [ ] Categories
- [ ] Reading Time
- [ ] Syntax Highlight
- [ ] Dark Mode
- [ ] Notion CMS
- [ ] SEO
- [ ] Sitemap
- [ ] RSS Feed
- [ ] Analytics
- [ ] Deploy to Vercel

---

## 📸 Preview

Coming soon...

---

## 🤝 Contributing

This project is mainly built for personal learning and sharing. Contributions, ideas, and feedback are always welcome.

---

## 📄 License

MIT License.

---

## 👨‍💻 Author

**Shandev**

- GitHub: https://github.com/ShanChen6
- Website: Coming Soon
