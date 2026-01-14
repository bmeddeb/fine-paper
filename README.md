# Tailwind Paper

This folder contains the Tailwind 4.1 + Alpine.js refresh of Paper Dashboard.

## Quick start
- Open `tailwind-paper/examples/dashboard.html` in a browser.
- All example pages live under `tailwind-paper/examples/`.
- Templates live under `tailwind-paper/templates/` for reuse.

## Tailwind CLI tooling
From `tailwind-paper/`:
- `npm install`
- `npm run vendor`
- `npm run build` (or `npm run watch`)

This compiles `src/app.css` (Tailwind directives + custom styles) into `assets/app.css`.

## Notes
- Tailwind is compiled locally via the CLI output in `assets/app.css`.
- Alpine.js is copied locally to `assets/alpine.js` via `npm run vendor` with a CDN fallback.
- Static assets (Nucleo fonts + images) live under `tailwind-paper/assets/`.
