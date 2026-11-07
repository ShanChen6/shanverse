# Shanverse – UI/UX Audit & Design Proposal

> Status: **Decisions agreed (see section 7)**. Only the mobile bottom nav is implemented so far; everything else is planned.
> Direction (agreed): keep the current identity (navy / gold / cream, Tianwu mascot), refine and unify.
> Scope (agreed): main pages, Games hub, each game, shared shell & states.
> Method: based on reading the code (`src/app`, `src/features`, `src/components`). No rendered screenshots were reviewed, so visual claims need a quick look in the browser before we lock them.

## 1. Design principles (to align on)

1. **One identity, two moods.** Content pages (blog, projects, about) are calm and editorial. Games are playful. Both share the same tokens, radius, and type scale.
2. **Mobile first.** Six items already fit the bottom nav; every screen is designed at 360 px first, then widened.
3. **Same job, same pattern.** Every game page has the same skeleton (title → play area → controls → how to play), so a player learns it once.
4. **Accessible by default.** Visible focus (already used), `prefers-reduced-motion` respected, contrast checked in both themes, status changes announced with `aria-live`.
5. **Every state is designed.** Loading, empty, error, success, offline, 404 get the same care as the happy path.

## 2. Tokens & foundation (applies to all screens)

| Item | Today | Proposal |
| --- | --- | --- |
| Palette | Navy `#1D3A7D`, deep `#031242`, gold `#D9AF62`, copper `#B96532`, cream `#FAF7F0`; dark mode swaps primary to gold | Keep. Document semantic roles (primary, accent, success, danger, warning) in one table; verify AA contrast for `muted` text on `surface` in both themes |
| Radius | Mixed `rounded-lg / xl / 2xl / 3xl` | Fix a scale: control `lg`, card `2xl`, hero/panel `3xl` |
| Spacing | Page padding `px-4 sm:px-6`, `max-w-6xl` repeated per page | One `PageContainer` component (width, padding, vertical rhythm) |
| Type | `text-3xl→5xl` headings set per page | Fixed scale: H1 / H2 / H3 / body / caption, used via classes, not ad hoc |
| Page header | Games hub has a bordered gradient hero, game pages use a centered gradient title, other pages differ | One `PageHeader` (eyebrow, title, description, optional actions), with a "hero" variant only for Home and Games hub |
| Motion | Hover scale on cards, cursor trail, space hero | Keep, but gate heavy effects (cursor trail, hero scene) behind reduced-motion and low-power devices |

## 3. Shared shell

| Screen / part | Findings | Proposal |
| --- | --- | --- |
| Header (desktop) | Sticky, blurred, logo + 6 links + language + theme. Good. | Keep. Make active link state match the mobile one (gold/navy indicator). |
| Header (mobile) | Non-sticky top bar with logo, language, theme. | Keep (bottom nav is the main navigation). Consider hiding it inside game pages to give the board more height. |
| Bottom nav (mobile) | 6 equal tabs at 10–11 px labels. Dense; tap targets are tight at 360 px. | Keep 5 tabs (Home, Blog, Projects, Games, More) where *More* opens a sheet with About + Contact + language/theme. Labels 11 px minimum, 48 px touch height. **Decided and implemented**: notched 5-tab bar (`MobileBottomNavigation`), *More* opens a sheet with About and Contact. |
| Footer | Brand, explore links, socials. | Add Games and About/Contact to "Explore" (today only Blog and Projects are listed). |
| Breadcrumb | Present on list/detail pages. | Keep; truncate the last crumb on mobile. |
| 404 / error / loading | `not-found`, per-route `error` and `loading` exist for blog/projects only. | Add a branded 404 with Tianwu + search + 3 shortcuts; add `error` and `loading` for games routes; reuse `EmptyState`. |

## 4. Screen-by-screen

### 4.1 Home `/`
**Today:** space-themed hero + profile card → tech ticker → search → featured posts → latest posts → featured projects → games teaser → contact.
**Issues:**
- Two heavy decorative layers (space scene, blur orb) compete with the headline.
- Search sits between the hero and content with no clear reason to appear there.
- Latest posts and featured posts are two similar lists back to back.

**Proposal (top to bottom), decisions applied:**
1. Hero: headline, one-line value, 2 CTAs (Read the blog / See projects), socials. Tone the scene down on mobile.
2. Featured post (one big card) + latest posts (3 compact cards) as a single "Writing" section.
3. Featured projects.
4. Games strip: 3 featured games with preview art.
5. Contact CTA.
6. Move search into the header (command-style, `/` shortcut) so it is available on every page.

### 4.2 Blog list `/blog`
**Today:** server-side search, category/tag filters, pagination (`blog/page.tsx`, 291 lines).
**Proposal:** sticky filter bar (search + category chips, tags in a "More filters" popover); card shows cover, title, 2-line excerpt, category, reading time, views; active filters shown as removable chips with a "Clear all"; empty state with suggestion chips. Pagination keeps scroll position and focus.

### 4.3 Blog post `/blog/[slug]`
**Today:** Notion renderer, table of contents, reading progress, share, related posts, giscus comments, view count.
**Proposal:** single reading column (~68 ch), TOC as a left/right sticky rail on ≥1024 px and a collapsible "On this page" on mobile; progress bar stays; meta row (date, reading time, views, category); end of article: share → author card → related → comments, in that order. Code blocks: language label, copy button (exists), horizontal scroll with visible affordance.

### 4.4 Projects list & detail `/projects`
**Today:** list with filters (163 lines); detail from Notion.
**Proposal:** project cards with cover, one-line outcome, tech chips, links (demo/repo). Detail: hero cover, "Problem → Solution → Result" blocks, tech stack, gallery, links, next/previous project.

### 4.5 About `/about`
**Today:** 9 sections (hero, story, Tianwu story, stats, values, approach, skills, journey, CTA).
**Issues:** long; stats/values/approach overlap in purpose.
**Proposal:** merge to 5 blocks: Intro (photo + story) → Skills → Journey timeline → Values & approach (one section) → CTA. Keep the Tianwu story as a short, illustrated aside.

### 4.6 Contact `/contact`
**Today:** hero, topics, methods, form, success state, social links.
**Proposal:** two columns on desktop (form left, methods + socials right), single column on mobile with the form first. Topic selector becomes chips inside the form. Inline validation, preserved input on error, success state with Tianwu and "send another".

### 4.7 Games hub `/games`
**Today:** bordered hero, category chips (`GamesCatalog`), card grid with 64-unit tall preview, description, up to ~5 badges, full-width Play button, "coming soon" card.
**Issues:**
- 12+ games in a 3-column grid of tall cards means a lot of scrolling.
- Cards carry too many badges (category + extra categories + control types).
- The hero is large before any game is visible.

**Proposal:**
- Slimmer hero (title + one sentence + count); first game row visible above the fold on mobile.
- Card: preview, title, one-line description, max 2 chips (category, controls icon set instead of text badges). Whole card clickable; drop the separate Play button (keep a small arrow/"Play" affordance and a focus ring).
- Add a "Continue playing" row for games with saved progress (data already stored locally) in the last phase, and a "Featured" row.
- Add a sort/filter: category (exists), controls (keyboard / mouse / touch), "quick (<2 min)" vs "long".

### 4.8 Game page shell (all games)
**Today:** `GamePageShell`: breadcrumb → back link → centered gradient title → game → "How to play" box + "saved locally" note.
**Issues:** breadcrumb *and* back link are redundant; the board is pushed below the fold on mobile; each game builds its own toolbar and result UI.
**Proposal – a single anatomy:**

```
[ ← Games ]              [ ? Rules ] [ ⚙ ] [ ⛶ ]    <- compact top bar (replaces breadcrumb + back + big title on mobile)
Title (H1) · short intro (collapsed on mobile)
┌──────────────────────────────┐
│          PLAY AREA           │
└──────────────────────────────┘
[ status: score · time · moves ]   [ Undo ] [ Restart ] [ New game ]
How to play (collapsible, closed after first visit)
Saved-locally note · Related games
```

Shared pieces to extract: `GameToolbar`, `GameStatBar`, `GameResultDialog` (win/lose, best score, share, play again), `GameRulesSheet`, `GameDifficultyPicker`. All announce results via `aria-live="polite"`.

### 4.9 Individual games – what each needs

| Game | Size (lines) | Main UX gap to check | Proposal |
| --- | --- | --- | --- |
| 2048 | 274 | Swipe vs page scroll conflict on touch | `touch-action: none` on board, undo, best score in stat bar |
| Minesweeper | 401 | Flag vs reveal on touch | Visible mode toggle (reveal / flag), long-press hint, difficulty picker |
| Snake | 356 | On-screen controls on mobile | D-pad overlay + swipe, pause on tab blur, speed setting |
| Typing | 265 | Result clarity | Result dialog (WPM, accuracy, best), passage length picker |
| Memory | 196 | Card size on small screens | Adaptive grid, move/time stat bar, win dialog |
| Word Guess | 327 | Keyboard on mobile | On-screen keyboard with key states, colour-blind-safe tile states (icon + colour) |
| Nonogram | 672 | Clue readability, fill vs mark | Mode toggle, zoomable board, clue highlight on row/col |
| Sokoban | 569 | Level selection | Level map with completed state, undo/redo, solver hint button |
| Go | 774 | Board size, engine thinking state | Visible "AI thinking" indicator, strength selector, territory view toggle |
| Red Cliffs | 516 | Piece legend, rules density | Legend as bottom sheet, move hints toggle |
| Bách Linh Ký | 727 + art | Largest scope (summon, collection, maps) | Treat as an app inside the site: its own sub-navigation (Play / Collection / Rules); summon ceremony skippable |
| Cờ Lau | 50 (embed) | External deployment in an iframe | Loading skeleton, fallback link "open in new tab", responsive iframe height |

Acceptance for every game: playable one-handed at 360 px, keyboard operable where it makes sense, result announced, restart never loses saved best, works in light and dark.

## 5. States checklist (per screen)

Loading skeleton · Empty · Error with retry · Offline / failed fetch (Notion, view counts) · Success · Long-text / long-title overflow · RTL not needed · Reduced motion · Both themes · Both languages (vi/en strings can differ in length by ~30%).

## 6. Delivery order (agreed)

| Phase | Content | Size |
| --- | --- | --- |
| 0 | Mobile bottom nav: notched 5 tabs + More sheet | **Done** |
| 1 | Foundation: tokens (radius, spacing, type scale), `PageContainer`, `PageHeader`, branded 404 + `error`/`loading` for games routes, footer links (add Games, About, Contact) | **Done** |
| 2 | Game shell: new anatomy + shared components (`GameToolbar`, `GameStatBar`, `GameResultDialog`, `GameRulesSheet`, `GameDifficultyPicker`); hide site header and bottom nav on game pages at mobile width; migrate 2048, Memory, Snake first (all games now use the shared shell, stat bar, result panel and toolbar where they apply) | **Done (first 3 games)** |
| 3 | Games hub: slimmer hero, whole-card links, compact chips, then remaining games (hub, whole-card links, stat bars and Minesweeper shell done; Go and Bách Linh Ký keep their own setup screens and boards) | **Mostly done** |
| 4 | Global header search (dialog, `/` shortcut); remove search section from Home; Home restructure; Blog list/detail (search dialog + /api/search, Home "Writing" block, lighter hero on phones; Blog list/detail already had removable filter chips and the planned article order, so they are unchanged) | **Done** |
| 5 | Projects, About (9 to 5 sections), Contact (About now 5 blocks + Tianwu aside; Contact: form first, topic chips, inline validation, success state; Projects: compact stats, previous/next links. Problem/Solution/Result blocks need Notion content structure and are not done) | **Done** |
| 6 | "Continue playing" row on Games hub; a11y pass (axe + manual); polish ("Recently played" row built from a last-opened list, not saved game state; axe scan of 11 pages in light/dark at phone and desktop width found only colour-contrast issues, now fixed; manual screen-reader pass not done) | **Done** |

Each phase = one PR into `develop`, with before/after screenshots at 360 / 768 / 1280 px in both themes.

## 7. Decisions

| # | Topic | Decision | Notes for implementation |
| --- | --- | --- | --- |
| 1 | Mobile nav | **5 tabs + More, notched style.** Implemented. | `MobileBottomNavigation` + CSS module; More opens a bottom sheet with About and Contact. |
| 2 | Search | **Global search button in the header; remove the search section from Home.** | Icon button opens a dialog, `/` shortcut, reuse `home-search` / `blog-search` logic. On mobile the header has logo + language + theme already, so the button goes beside them and must keep a 44 px target. Blog keeps its own list search. Do this when the global dialog is ready, not before, so search is never missing. |
| 3 | Games hub cards | **Whole card is the link; drop the full-width Play button.** "Continue playing" row is **later** (phase 6). | Keep a small arrow/"Play" affordance inside the card so keyboard and screen-reader users still get a clear link, plus a visible focus ring on the card. Continue row needs one shared way to read each game's saved progress from local storage, so define that first. |
| 4 | About page | **9 sections cut to 5:** Intro, Skills, Journey, Values + approach (merged), CTA. Tianwu story becomes a short illustrated aside. | Do not delete copy; merge and move it, then review before removing anything. |
| 5 | Game pages on mobile | **Hide site header and bottom nav while playing** (below `md`), replaced by the compact game top bar. | The top bar must always have a clear back-to-Games button. The layout padding that reserves room for the bottom nav must not apply on game routes. Desktop is unchanged. |
| 6 | Phase order | **Phase 1 foundation, then game shell, then Home.** | See section 6. |

## 8. Risks and things to watch

- Hiding the nav on game pages means the game top bar is the only way out; test back navigation and the browser back button on touch devices.
- Whole-card links must not nest interactive elements (no button or link inside the card link).
- A global search dialog must trap focus, close on Escape and return focus to the trigger.
- Cutting About sections changes copy in both `vi` and `en`; keep both locales in step.
- Bottom nav is now 5.25 rem tall (`--mobile-bottom-nav-height`); any new fixed element at the bottom must account for it.

## 9. Projects and Notion

Project ordering, the one-line summary, key-number highlights and the Problem / Solution / Result layout are driven by optional Notion properties and heading names. See `docs/notion-projects.md`.
