# Montessori Group — Production Site

Static site, ready to deploy today. Upload this folder as-is to any static host
(Netlify, Vercel, Cloudflare Pages, S3+CloudFront, or the school's existing hosting —
just drop the folder into the web root).

## Pages
- `index.html` — Montessori Group (parent landing)
- `monte-international.html` — Monté International School
- `montessori-indus.html` — Montessori Indus (residential, incl. #minds)
- `monte-subpage.html` — Monté detail pages (hash-routed: #core-values, #igcse, #library, …)

## Runtime
`support.js` renders the pages client-side; `cursor.js` is the optional custom cursor.
Both must be deployed alongside the HTML files. `assets/` holds the logos (also used as favicons).

## Before / shortly after go-live
1. **Forms** — the enquiry forms are front-end only (button flips to "✓ Enquiry received").
   Point them at a real endpoint (Formspree/Google Form/CRM/email) — search the HTML for
   `onSubmit` handlers.
2. **Remote media** — facility icons, one hero photo and the showcase video are hotlinked
   from https://www.monteis.org. Re-host them under `assets/` and update the URLs.
3. **Placeholders** — striped tiles (gallery, news, founder portrait) await real photography.
4. **Mobile** — layout is desktop-first (~1240–1280px grids). Test on phones; add breakpoints
   as a fast follow.
5. Serve over HTTPS; no server-side code or build step required.
