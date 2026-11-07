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
