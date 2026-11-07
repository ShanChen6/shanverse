# Projects in Notion

Everything below is **optional**. A project without these properties still shows up, exactly as before.

## Properties (database columns)

| Property | Type | What it does |
| --- | --- | --- |
| `Date` (or `Project Date`, `Start Date`, `Completed`) | Date | When the project was made. Used for sorting and shown on the card and the page. Without it the site falls back to the page creation time, which changes meaning when you rewrite old projects. |
| `Order` (or `Sort Order`, `Priority`) | Number | Manual position. Projects with an Order come first, smallest first. The rest follow, newest `Date` first. |
| `Summary` (or `Tagline`) | Text | One short sentence (about 120 characters) shown on cards and in search. `Description` stays for the project page and SEO. |
| `Highlights` (or `Key Results`) | Text | Up to 4 key numbers, **one per line**, written `value | label`. |

Existing properties keep working: `Title`, `Slug`, `Description`, `Thumbnail`, `Cover`, `Tech Stack`, `Tags`, `GitHub`, `Live URL`, `Role`, `Timeline`, `Status`, `Featured`, `Published`.

### Highlights example

```
98 | Lighthouse score
3x | Faster publishing
0 | Lines of code to add a post
```

Rules: both parts are required; the value is at most 14 characters, the label at most 40; at most 4 lines are used; bad lines are skipped.

## Case-study headings (inside the project page)

Write the page with **Heading 2** blocks named like this (Vietnamese or English, accents optional):

| Section | Accepted headings |
| --- | --- |
| Problem | Vấn đề, Problem, Challenge, Thách thức, Bài toán |
| Solution | Giải pháp, Solution, Approach, Cách làm |
| Result | Kết quả, Result(s), Outcome, Impact, Tác động |
| Lessons | Bài học, Lessons learned, Takeaways |

- If **two or more** of these headings are present, each becomes a card with an icon. Result is highlighted.
- Text before the first heading is shown as an introduction.
- Other Heading 2 sections (for example "Tech notes") are shown as normal text.
- With fewer than two matching headings the page is shown as plain Notion content, as before.

Content refreshes about every 5 minutes.

## What the list and page do with this

- **Status** (`Status` property, e.g. "Hoàn thành", "Đang làm") shows as a small chip on each card and as a filter.
- **Filters** (status, technology, tags) share one row; on phones it scrolls sideways. With fewer than 6 projects the stats and the filter bar are hidden (they appear again if a filter is already active in the link).
- **Images**: two or more images placed one after another in a project page are shown as a two-column grid; a single image stays full width. Clicking an image opens a viewer: arrow keys or the side buttons step through every image of the page, the magnifier zooms to full size, and the link icon opens the original file. Escape closes it.
- **Links**: the Demo and Source buttons sit right under the description. On phones they are also pinned above the bottom bar once the top of the page has scrolled away.

## Refresh content right away

By default the site re-reads Notion every 5 minutes. To refresh sooner, set `REVALIDATE_SECRET` (a long random value) in the host's environment variables, then call `/api/revalidate`:

```bash
curl -X POST https://YOUR-SITE/api/revalidate \
  -H "Authorization: Bearer $REVALIDATE_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"scope":"projects"}'
```

| `scope` | What is refreshed |
| --- | --- |
| `projects` | Project list and project pages |
| `posts` | Blog posts, categories and tags |
| `words` | Word Guess words |
| `all` (default) | Everything above |

- **From Notion:** an automation with a "Send webhook" action (POST, header `Authorization: Bearer <secret>`, body `{"scope":"projects"}`) refreshes when a project changes.
- **A link or button:** a GET also works, `https://YOUR-SITE/api/revalidate?scope=projects&secret=<secret>`. The secret then appears in the address and in access logs, so prefer POST where you can and rotate the secret if a link leaks.
- Answers: `200` refreshed, `401` wrong or missing secret, `400` unknown scope, `503` no secret configured on the server.
- Nothing is refreshed without the secret, and the secret is compared in constant time.

## Projects and posts that do not show up

The server logs a warning when the cache refreshes (at most every 5 minutes), once per kind of problem, for **both projects and blog posts**:

- `Published projects hidden because a required property is empty` (or `posts`): a published page has an empty `Title` or `Slug`. The line lists the page id, title and the missing property.
- `Published projects share a slug, so only one can be opened` (or `posts`): two published pages use the same `Slug` (case ignored). Only one is reachable at that address, so give each a unique slug.

Unpublished pages are not logged: hiding them is intended. Pages already hidden for an empty title or slug are not also reported as duplicates.

## Page template

Create one project page with this skeleton and duplicate it for each new project.

Properties: `Title`, `Slug`, `Published` (off until ready), `Featured`, `Status`, `Date`, `Order`, `Summary`, `Description`, `Highlights`, `Tech Stack`, `Tags`, `GitHub`, `Live URL`, `Role`, `Timeline`, `Thumbnail`, `Cover`.

Page body (use **Heading 2** for the section titles):

```
Short introduction: what it is and who it is for.

## Vấn đề
What was hard or missing.

## Giải pháp
What you built and the main decisions.

## Kết quả
Numbers, outcomes, links. Repeat the key figures in the Highlights property.

## Bài học
What you would do differently.
```

Put screenshots one after another to get a two-column gallery.
