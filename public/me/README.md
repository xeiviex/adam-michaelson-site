# /me — adding photos and video

Each section is `public/me/<slug>/` (history, family, faith, music, outdoors). Drop files in and push; no HTML edits needed.

- Photos: `public/me/<slug>/photos/<name>.jpg`. `cover.jpg` is the hub card and page banner. Other names are the placeholders on the page (e.g. `kid-1.jpg`, `climbing.jpg`). Until a file exists, that slot shows a labeled placeholder.
- Video: `public/me/<slug>/videos/<name>.mp4`, with an optional `<name>.jpg` poster.
- Size: resize photos to ~2000px wide (under ~500 KB). Cloudflare Pages allows 25 MB per file; for longer videos use YouTube/Stream instead.
- Copy and slots live in `scripts/gen-me.mjs`. Edit it and run `node scripts/gen-me.mjs` to regenerate the pages, or edit the HTML directly.
