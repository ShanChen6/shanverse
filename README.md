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

The adapter maps common property names (`Title`/`Name`, `Slug`, `Type`,
`Published`, `Featured`, and so on) into the application models. Posts and
projects may use the same Notion data source: `getPosts()` filters `Type =
Blog`, while `getProjects()` filters `Type = Project`. Collection methods return
an empty array when Notion has no rows; detail methods return `null` when the
slug is not found, while configuration and API failures throw
`NotionServiceError` with the original error as its cause.

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
