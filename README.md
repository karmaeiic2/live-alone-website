# Live Alone website

A single-page band website built with Next.js App Router, React, TypeScript,
and Tailwind CSS. The homepage lives in `app/page.tsx`; global styles are in
`app/globals.css`. Creative direction and contribution guidance live in
`PROJECT_BRIEF.md` and `AGENTS.md`.

## Local development

```bash
npm ci
npm run dev
```

Open http://localhost:3000. No environment variables are required locally.

## Production URL and deployment

The final domain has not been supplied. Before deploying, set
`NEXT_PUBLIC_SITE_URL` to the actual public website origin, including `https://`,
in the hosting provider's environment settings **before running the build**.
Use the chosen canonical domain, with no path, query, or fragment.
For a local production build, copy `.env.example` to `.env.local` and fill it in.

`app/site-config.ts` validates this one setting. It supplies the metadata base,
canonical URL, Open Graph URL and social image URLs, MusicGroup website URL,
homepage sitemap entry, and the sitemap reference in robots.txt. These routes
and metadata are generated at build time; changing the domain requires a rebuild.

When the setting is empty, development and builds still work, but
domain-dependent tags (including social image URLs) are omitted, the sitemap
has no entries, and robots.txt has no sitemap reference. This avoids publishing
a guessed domain or localhost. **Set the URL and rebuild before launch.**
The site allows indexing; use your host's access controls for private previews.

Run the checks and production server with:

```bash
npm run lint
npx tsc --noEmit
npm run build
npm start
```

After deployment, verify the homepage's rendered head, `/robots.txt`, and
`/sitemap.xml` on the real domain, and test a shared link with a social preview tool.

## Metadata and supplied artwork

- `app/layout.tsx`: title, description, Open Graph, Twitter large-image card,
  indexing directives, and favicon links.
- `app/page.tsx`: factual MusicGroup JSON-LD; confirmed Instagram is the
  identity link. YouTube and Spotify links remain attached to their releases.
- `/images/socialmedia_preview.png`: supplied social composition, unchanged,
  **1731 × 909**. The same image is used for Open Graph and Twitter.
- `/images/LiveAlone_favicon.png`: supplied favicon, unchanged, **1254 × 1254**.
- `app/apple-icon.png`: **180 × 180** resize of that favicon, with the entire
  composition and transparency preserved. Next.js adds the Apple touch icon tag.

No Twitter handle, booking email, or additional social profile is configured
because none has been supplied. The October 4 show lists “DM for address”;
keep private house-show addresses out of the site and structured data.
