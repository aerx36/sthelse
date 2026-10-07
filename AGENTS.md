# Project guide

## Architecture

ELSEWHERE is a minimalist React/TypeScript discovery toy, not a dashboard. It uses Vite for a static frontend and a modern Netlify Function for live Wikipedia requests. There is exactly one reel and one ROLL button. Preserve that interaction when extending the site.

## Key directories

- `src/App.tsx` owns mode selection, the request lifecycle, the randomizer sequence, optional audio, and the about dialog.
- `src/components/DiscoveryCard.tsx` renders source-attributed results and handles missing images.
- `src/components/Icon.tsx` contains the small inline SVG icon vocabulary.
- `src/lib/discoveries.ts` contains types shared with the function and the frontend API client.
- `src/styles.css` contains the design tokens, responsive layout, and CSS motion.
- `netlify/functions/discover.mts` performs Wikipedia searches, filtering, Vietnamese localization, and response normalization.
- `netlify.toml` configures static deployment and serverless function discovery.

## Conventions

Use functional React components, explicit TypeScript types, single quotes, and no semicolons in TypeScript. Use meaningful variable names and avoid adding inline comments. Keep dependencies minimal; the existing application needs no component framework, icon package, animation package, authentication, or database. Use modern `.mts` Netlify handlers returning standard `Response` objects. Do not expose credentials to the browser.

The visual language is muted charcoal, warm white, and pale acid green, with condensed display typography, monospace instrumentation, lots of negative space, and a restrained grain overlay. Body copy is primarily Vietnamese. Keep hover, focus, disabled, loading, error, image-fallback, and reduced-motion states intact. Audio must remain opt-in.

## Non-obvious decisions

Topic definitions are search/category seeds, not a fixed discovery list. Articles must continue to come from live Wikimedia APIs. English candidates use language links to find real Vietnamese articles; the site does not falsely label original English summaries as Vietnamese. Original source URLs must remain visible and valid even when a translated article is displayed. Only HTTPS Wikipedia source URLs and Wikimedia upload image URLs are accepted.

The rolling animation waits for live results, then cycles through their actual titles with increasing delays before revealing the selected article. Fetches and animation waits are abortable. A request timeout allows the user to recover without leaving the interface stuck. The frontend does not prefetch on every mode change, avoiding unnecessary source traffic.

The site does not persist data. Recent discovery IDs in a React ref are transient, session-only state, not a database or a cache of source responses. If saved discoveries or persistent history are added, read the Netlify database skills and use Netlify Database for structured data. Keep persistence behind the API boundary. Do not add Supabase for the current version.

## Development

`npm install` installs dependencies. `netlify dev --port 8889` runs the frontend and the function together. `npm run dev` serves only the frontend. Netlify runs `npm ci --include=dev --no-audit --no-fund && npm run build` and publishes `dist`. Keep `package-lock.json` synchronized with `package.json`; the explicit install step ensures Vite is available even when deployment starts without dependencies or omits development dependencies by default. There is no test suite or formatter configured. During platform-managed editing runs, do not run builds, local servers, or validation commands unless the current instructions explicitly allow them; the platform validates the changes automatically.
