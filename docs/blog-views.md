# Blog view counts

The Next.js 16 App Router endpoint is `/api/blog/[slug]/views`. Slugs come from
the published Notion post, not the localized pathname. Vietnamese and English
URLs share one counter. There was no previous view-count store to migrate.

## Configuration

1. Create an Upstash Redis database and copy its **REST URL** and **REST token**.
   Use a read/write token because counting needs `SET` and `INCR`.
2. Copy the variable names from `.env.example` into your ignored `.env.local`:

   ```dotenv
   UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
   UPSTASH_REDIS_REST_TOKEN=your-private-rest-token
   ```

3. Restart `pnpm dev`. The Redis client initializes lazily on the server; a
   missing setting makes the views API return `503`, without breaking the post.
4. In Vercel, open **Project Settings → Environment Variables**, add both names,
   select the intended environments, and redeploy. Use separate databases for
   Development/Preview and Production to keep test traffic out of real counts.
   Vercel environment changes apply to new deployments.

Never prefix either credential with `NEXT_PUBLIC_`, add it to `next.config.ts`
`env`, or commit `.env.local`. Only the API response enters the browser.

References: [Upstash SET options](https://upstash.com/docs/redis/sdks/ts/commands/string/set),
[SDK retry behavior](https://upstash.com/docs/redis/sdks/ts/retries), and
[Vercel environment variables](https://vercel.com/docs/environment-variables).

## Behavior

- `GET` only reads and returns `{ views, counted: false }`. It neither creates a
  visitor cookie nor changes the count. A successful `GET` is the same for every
  visitor, so the CDN may serve it for up to 30 seconds (plus 60 seconds stale
  while revalidating); browsers always revalidate.
- `POST` requires a matching `Origin` and rejects cross-origin fetch metadata.
  It validates the published slug before any Redis write. Request bodies and
  client-supplied counts are ignored.
- Both methods are rate limited per client IP (first `x-forwarded-for` entry,
  then `x-real-ip`) to 120 requests per 60-second window, using
  `blog:views-rate:v1:<window>:<ip-hash>` keys that are created with a TTL
  before `INCR`. Over the limit the API returns `429` with `Retry-After`. The
  limit is checked before the published-slug lookup, so abusive traffic never
  reaches Notion; if Redis is unavailable the API returns `503` instead.
- The published-slug check reads a list of live slugs that is cached for 60
  seconds (tag `notion-posts`). The API therefore costs at most one Notion
  query per minute, and a post that is unpublished or deleted stops being
  counted within about a minute.
- The server creates a random visitor ID in an HttpOnly, SameSite=Lax cookie
  (Secure in production). Only its SHA-256 hash appears in Redis keys.
- Counts use `blog:views:v1:<slug>`. A reservation at
  `blog:view-dedupe:v1:<slug>:<visitor-hash>` uses `SET NX EX 86400`.
  Only the request that acquires it calls `INCR`. The 24 hours start at that
  reservation; reloads do not extend the window. The count key has no expiry.
- Successful POST responses return `{ views, counted }`. Every response other
  than a successful `GET`, including all errors, disables browser/CDN caching. Errors return `views: null`,
  `counted: false` and a generic error, never credentials or provider details.
- The client reads the count and posts once when the actual shared article
  content enters the viewport. Desktop/mobile use the same content element.
  The POST result replaces the displayed count; a late GET cannot overwrite it.
  Effect replays and rerenders reuse the same request, while slug changes get a
  new session. Read failures do not turn into a fabricated zero.

## Limits

`SET` and `INCR` are two separate requests, not a transaction. If `SET` succeeds
but `INCR` fails before executing, that visitor's view can be lost for 24 hours.
If Redis executed `INCR` but its response was lost, the stored count may already
have increased even though the API reports an error. The reservation is kept
because deleting it or retrying `INCR` could double count. SDK retries are set
to `{ retries: 0 }`; the installed SDK treats `retry: false` differently.

Dedupe identifies a browser cookie, not a person. Clearing/blocking cookies,
switching browsers, or simultaneous first-ever requests with no shared cookie
can create different visitors. Concurrent requests carrying the same valid
cookie are deduplicated. This is a view metric, not bot/fraud protection.
Concurrent readers may briefly observe a count before another reserved request
finishes its increment.

## Verification

Run the repository tests, lint, TypeScript check and production build:

```sh
pnpm test
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

After deploying, verify against a published post on **each actual domain**
(preview and production/custom domain):

1. Open an article in a fresh browser session. The initial GET must not increment.
   Scroll until content appears; expect one POST and `counted: true`.
2. Reload with the same cookie and scroll again; expect `counted: false` and an
   unchanged count. Check HttpOnly, SameSite=Lax and Secure on HTTPS production.
3. Send two concurrent POSTs with the same fresh visitor cookie; exactly one
   should be counted. Repeat after the dedupe key expires to verify a new window.
4. GET/POST a nonexistent or unpublished slug; expect `404` and no view keys
   (only the rate-limit key). Expect a just-unpublished post to keep returning
   `200` for up to a minute.
   A mismatched/missing Origin on POST should return `403` without a write.
5. Repeat at desktop and mobile sizes, with the mobile TOC open/closed, hash
   navigation into the article, locale changes, and client-side slug navigation.
   Watch the network panel for rerender/Strict Mode duplicates and stale counts.
6. Check the `GET` response headers on Vercel: a second request within 30
   seconds should be a CDN hit (`x-vercel-cache: HIT`). Loop more than 120
   requests from one machine; expect `429` with `Retry-After: 60`.
7. Temporarily use invalid Redis configuration in a non-production environment;
   article content must remain readable and the counter must show an unavailable
   state. Restore credentials afterward.

A local `next build`/`next start` check is not a Vercel production verification.
Deployment cookies, forwarded origins, environment settings and real browser
viewport behavior require the deployment/browser checks above.
