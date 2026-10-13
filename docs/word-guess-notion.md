# Word Guess words from Notion

The Đoán từ game (`/games/word-guess`) plays its built-in words
(`src/features/games/word-guess/words.ts`) plus every published row of the
Notion **Word Guess** database.

## Database

| Property | Type | Notes |
| --- | --- | --- |
| `Answer` | Title | The answer shown when a word ends |
| `Question` | Text | Shown first |
| `Hint 1` … `Hint 5` | Text | From vague to obvious; all five are required |
| `Accept` | Text | Other spellings, comma separated: `k8s, kube` |
| `Topic` | Select | `Công nghệ`, `Đời sống`, or a new option for a new topic |
| `Published` | Checkbox | Only ticked rows reach the site |

Answers are matched without case, Vietnamese tones or punctuation, so there is
no need to list `ha noi` for `Hà Nội` in `Accept`.

## Setup

1. Share the database with the site's integration: open it in Notion, then
   **••• → Connections** and add the integration whose token is `NOTION_TOKEN`.
2. Set `NOTION_WORDS_DATA_SOURCE_ID` locally (`.env.local`) and on Vercel. The
   database ID or its data source ID both work.

Without that variable the game only uses its built-in words. (It must be set:
the service would otherwise fall back to `NOTION_DATABASE_ID`, the blog.)

## Adding a word

1. Add a row, fill in all five hints, pick a topic and tick **Published**.
2. Wait up to five minutes (the cache window), then reload the game.

A row is skipped, with a `[word-guess] skipped Notion word` line in the server
log, when it is missing a hint or the question, or when the question or a hint
contains the answer (or one of its `Accept` spellings) as a whole word.

- A new `Topic` option becomes a new topic chip, labelled with its Notion name.
- A Notion row with the same answer as a built-in word replaces that word, so
  built-in words can be moved to Notion and edited there.
- Unticking **Published** removes the word; players' saved progress drops it
  automatically.
- Answers are sent to the browser with the page, so this is not a place for
  secrets.
