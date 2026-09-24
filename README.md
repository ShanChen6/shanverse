# 🌌 Shanverse

> A personal website, tech blog, and portfolio built with Next.js, Tailwind CSS, and Notion.

**Live site:** [shanverse-io.vercel.app](https://shanverse-io.vercel.app/)

Shanverse is my digital space for sharing technical articles, learning notes, projects, and experiences in software development. All content is written in Notion and served through a Next.js app, so publishing a new post never requires touching the code.

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#️-environment-variables)
- [Notion Setup](#-notion-setup)
- [Blog Listing](#-blog-listing-blog)
- [Contact Form](#-contact-form)
- [Blog View Counts](#-blog-view-counts)
- [Scripts & Quality Checks](#-scripts--quality-checks)
- [Deployment](#-deployment)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Author](#-author)

---

## ✨ Features

- 📡 **Notion as a CMS**: posts, categories, tags, projects, and authors are managed in Notion databases
- 📝 **Technical blog** with server-side search, category/tag filters, and pagination
- 🚀 **Project showcase** powered by a dedicated Notion data source
- 📊 **Reading time** estimated at 200 words per minute
- 📬 **Contact form** that delivers messages through Resend
- 👁️ **Blog view counts** backed by Upstash Redis
- 🖼️ **Optimized images** with thumbnail → cover → placeholder fallback
- 🌙 **Light / dark mode** and 📱 **responsive layout**

See the [Roadmap](#-roadmap) for what's still in progress.

---

## 🛠️ Tech Stack

| Area        | Tools                                    |
| ----------- | ---------------------------------------- |
| Frontend    | Next.js, React, TypeScript, Tailwind CSS |
| CMS         | Notion API                               |
| Email       | Resend                                   |
| View counts | Upstash Redis                            |
| Deployment  | Vercel                                   |
| Tooling     | pnpm, ESLint, Git, GitHub                |

---

## 📂 Project Structure

```
src/
├── app/          # Routes and pages (Next.js App Router)
├── components/   # Shared UI components
├── features/     # Feature modules (e.g. blog, home)
├── hooks/        # Custom React hooks
├── lib/          # Library setup and helpers
├── services/     # External service adapters (e.g. notion.service.ts)
├── styles/       # Global styles
├── types/        # TypeScript types
├── utils/        # Utility functions
└── constants/    # App-wide constants

docs/             # Extra documentation (e.g. blog-views.md)
public/           # Static assets
scripts/          # Project scripts
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/)
- [pnpm](https://pnpm.io/)
- A Notion integration with access to your databases (see [Notion Setup](#-notion-setup))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/ShanChen6/shanverse.git
cd shanverse

# 2. Install dependencies
pnpm install

# 3. Create your environment file
cp .env.example .env.local
# then fill in the values (see below)

# 4. Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```env
# Notion
NOTION_TOKEN=
NOTION_DATABASE_ID=
NOTION_POSTS_DATA_SOURCE_ID=
NOTION_CATEGORIES_DATA_SOURCE_ID=
NOTION_TAGS_DATA_SOURCE_ID=
NOTION_PROJECTS_DATA_SOURCE_ID=
NOTION_AUTHORS_DATA_SOURCE_ID=

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Contact page (only configured channels are displayed)
CONTACT_EMAIL=
CONTACT_LOCATION=
CONTACT_GITHUB_URL=
CONTACT_LINKEDIN_URL=
CONTACT_FACEBOOK_URL=

# Contact form delivery (Resend)
RESEND_API_KEY=
CONTACT_FROM_EMAIL="Onboarding <onboarding@resend.dev>"
CONTACT_TO_EMAIL=
```

| Variable                  | Description                                                                                                                            |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `NOTION_TOKEN`            | Notion integration token. Must have access to **every** data source used by the app. Server-only: never prefix it with `NEXT_PUBLIC_`. |
| `NOTION_DATABASE_ID`      | Fallback database. If the collection-specific IDs are omitted, the first data source of this database is used.                         |
| `NOTION_*_DATA_SOURCE_ID` | Recommended when posts, categories, tags, projects, and authors live in separate databases.                                            |
| `NEXT_PUBLIC_SITE_URL`    | Public URL of the site.                                                                                                                |
| `CONTACT_EMAIL`           | Optional public contact address shown on the Contact page.                                                                             |
| `CONTACT_TO_EMAIL`        | Private inbox that receives contact-form messages.                                                                                     |

> ⚠️ Never commit `.env.local`.

For the variables required by blog view counts (Upstash Redis), see [`docs/blog-views.md`](docs/blog-views.md).

---

## 🗂️ Notion Setup

Notion access is encapsulated in `src/services/notion.service.ts` and marked `server-only`, so credentials never reach the browser. Server-side code can use the exported `notionService`:

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

**Behavior**

- Collection methods return an empty array when Notion has no rows.
- Detail methods return `null` when the slug is not found.
- Configuration and API failures throw `NotionServiceError`, with the original error as its `cause`.

**Property mapping** (aliases are defined in `src/config/notion.config.ts`, which remains the source of truth):

| Posts property             | Expected Notion type                         |
| -------------------------- | -------------------------------------------- |
| Title                      | Title                                        |
| Slug, Description, Excerpt | Rich text                                    |
| Thumbnail, Cover           | Files or URL                                 |
| Category                   | Relation to Categories, or Select/text       |
| Tags                       | Relation to Tags, or Multi-select/text       |
| Author                     | Relation to Authors, or People/text          |
| Published Date             | Date (optional; falls back to creation time) |
| Published, Featured        | Checkbox                                     |

Posts and projects use separate data sources, so no `Type` property is required.

**Verify the connection**

Start the app and open `/notion-preview`. It queries all five collections independently and shows the normalized record count, a sample title, or the error returned by Notion.

If Notion reports `object_not_found`, open each database in Notion, choose **Share**, and invite the integration that owns `NOTION_TOKEN`.

---

## 📝 Blog Listing (`/blog`)

The blog listing is a Server Component.

- **Caching**: `src/features/blog/blog-data.ts` caches `getPosts()`, `getCategories()`, and `getTags()` independently for **300 seconds**. Failed requests are handled outside the cache so an initial failure can be retried.
- **Filtering**: done on the server via the `q`, `category`, `tag`, and `page` query parameters. No public API route is needed.
- **Visibility**: only published posts with a non-blank title and slug are listed.
- **Sorting**: by `Published Date`, falling back to Notion's creation timestamp.
- **Pagination**: up to six posts per page, split between featured writing and latest articles without duplicates. Changing a filter or searching resets the page; pagination keeps the current filters.
- **Search**: covers title, excerpt, category, and tags, case-insensitive.
- **Taxonomy**: category/tag names from published posts supplement the taxonomy collections, including when those collections fail. Unresolved relation IDs are omitted rather than shown as tag names.
- **States**: a friendly retry state for query failures, plus separate empty states for "no published posts" and "no search matches".
- **`PostCard`**: uses thumbnail → cover → placeholder, shows up to two tags and the author's avatar. Dates use `en-GB` in UTC.

> The `/blog/[slug]` detail page is still a placeholder.

### Testing locally

1. Fill in `.env.local` and share your Notion databases with the integration.
2. Run:

   ```bash
   pnpm install --frozen-lockfile
   pnpm exec eslint src/app/blog/page.tsx src/features/home/common/PostCard.tsx
   pnpm exec tsc --noEmit
   pnpm build
   pnpm dev
   ```

3. Visit `http://localhost:3000/blog`, then try `?q=nextjs`, `?category=Frontend`, `?tag=React`, and `?page=2`. Results depend on the posts published in your Notion workspace.
4. Combine filters, change pages, and clear filters one by one (or use **Clear filters**). Check keyboard navigation with Tab, and test light/dark mode on mobile, tablet, and desktop.
5. After editing content in Notion, wait about 5 minutes and reload. The first request after the cache expires may still show stale data while the server refreshes in the background.

---

## 📬 Contact Form

The Contact page only displays channels configured through `CONTACT_EMAIL`, `CONTACT_LOCATION`, and the social URL variables. Messages are sent by a server-side [Resend](https://resend.com) adapter that uses the visitor's email as `replyTo` and reports success only when Resend accepts the message and returns an email ID. Delivery stays disabled if any of `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, or `CONTACT_TO_EMAIL` is missing.

### Using a temporary Vercel domain

1. Set `RESEND_API_KEY` in `.env.local` (a Resend key with permission to send emails). Keep it server-only.
2. Set `CONTACT_FROM_EMAIL="Onboarding <onboarding@resend.dev>"` and set `CONTACT_TO_EMAIL` to the **email address registered to your Resend account**. The `resend.dev` sender is for testing and can only deliver to that address. The site can stay on its temporary `*.vercel.app` URL.
3. Restart `pnpm dev`, open `/contact`, submit the form, and check your inbox and the Resend dashboard. A provider failure shows a general error and keeps the form contents. There is no automatic reply to the visitor.
4. On Vercel, add the same three variables under **Project Settings → Environment Variables** for the environments you use, then **redeploy**. Local `.env.local` values are not copied to Vercel automatically.
5. Once you own a domain, verify its DNS records in Resend and change `CONTACT_FROM_EMAIL` to an address on that domain. You can then use any recipient in `CONTACT_TO_EMAIL`; no code changes are needed.

Spam protection is basic (honeypot field and a minimum submit time). For a public production form, add edge or provider-level rate limiting.

References: [Resend test domain restrictions](https://resend.com/docs/knowledge-base/403-error-resend-dev-domain) · [Vercel environment variables](https://vercel.com/docs/environment-variables)

---

## 👁️ Blog View Counts

View counts are stored in Upstash Redis. See [`docs/blog-views.md`](docs/blog-views.md) for local and Vercel configuration, API behavior, deduplication limits, and deployment checks.

---

## 🧰 Scripts & Quality Checks

| Command                    | Purpose                                                 |
| -------------------------- | ------------------------------------------------------- |
| `pnpm dev`                 | Start the development server at `http://localhost:3000` |
| `pnpm build`               | Create a production build                               |
| `pnpm exec eslint <paths>` | Lint specific files                                     |
| `pnpm exec tsc --noEmit`   | Type-check without emitting files                       |

---

## ☁️ Deployment

The project is deployed on [Vercel](https://vercel.com/).

1. Import the repository into Vercel.
2. Add all required environment variables under **Project Settings → Environment Variables**.
3. Deploy (or **redeploy** after changing variables).

---

## 📅 Roadmap

- [x] Initialize project
- [x] Notion CMS
- [x] Blog listing
- [x] Search
- [x] Tags
- [x] Categories
- [x] Reading time
- [ ] Design system
- [ ] Layout, Header, Footer
- [ ] Home page
- [ ] About page
- [ ] Blog detail page
- [ ] Projects
- [ ] Syntax highlighting
- [ ] Dark mode polish
- [ ] SEO
- [ ] Sitemap
- [ ] RSS feed
- [ ] Analytics

---

## 📸 Preview

Coming soon...

---

## 🤝 Contributing

This project is mainly built for personal learning and sharing, but contributions, ideas, and feedback are always welcome. Feel free to [open an issue](https://github.com/ShanChen6/shanverse/issues) or submit a pull request.

---

## 📄 License

Released under the MIT License.

---

## 👨‍💻 Author

**Shandev**

- GitHub: [@ShanChen6](https://github.com/ShanChen6)
- Website: [shanverse-io.vercel.app](https://shanverse-io.vercel.app/)
