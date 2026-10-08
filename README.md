# https://sthelse.netlify.app/

A small escape from the algorithm. sthelse is a Vietnamese-first internet discovery toy: choose **WEIRD**, **LEARN**, **EXPLORE**, or **CHAOS**, press the single **ROLL** button, watch the vertical slot reel, and pick one of five facedown cards. The selected card flips into a focused discovery page. The existing condensed typography, muted palette, grain, and single-reel interaction remain intact.

## How it works

Discoveries are retrieved live from the public Wikipedia Action API, not a prewritten article catalog. Broad thematic search queries and Wikipedia categories narrow the possibilities to unusual phenomena, science, history, culture, places, and archives. The serverless function filters disambiguation pages, administrative namespaces, lists, very short articles, and some unrelated results.

Vietnamese Wikipedia is searched first alongside English category searches. English discoveries are matched to Vietnamese articles through Wikipedia language links when a sufficiently detailed translation exists. Otherwise the original English text is displayed with an explicit language notice. Every result links to its original source; translated results also link to the Vietnamese article through **Explore**. Optional images come from Wikimedia, with their licensing information available on the source article.

CHAOS searches all three subject families in a single batch. Search seeds target a 70% accessible, 20% moderately unusual, and 10% obscure mix; this is a sampling preference, not a guarantee about Wikipedia's results. Searches prioritize relevance, then randomize suitable candidates. The reel cycles vertically through actual fetched titles, progressively slows, and lands before dealing exactly five cards. Its compression, roll, slowdown, and landing take approximately 1.65 seconds, plus live-source latency. Waiting uses the same vertical reel instead of a spinner. Failed requests leave ROLL available; requests and animation waits are abortable. Audio remains opt-in and reduced-motion preferences are respected.

The result replaces the homepage interface rather than sitting below it. Three equal image slots appear in one desktop row and stack on mobile. Discovery candidates must have at least three article-associated image files after generic-icon filtering. Images are fetched from the selected article and its real language-linked counterpart, with file-page links, artist credits, and licenses. Generic icons and non-free files are excluded. Missing, unlicensed, or failed images retain clearly labeled placeholders instead of unrelated stock photography. Images load lazily and source failures can be retried.

**OH, I KNOW THAT** reduces future exposure to that discovery and similar categories, then returns to the roll screen. **I DON'T KNOW ABOUT THAT** adds an interest signal and expands the original article introduction, with an Explore link. **SHUFFLE AGAIN** transitions back through the reel and a fresh five-card draw. Personalization uses bounded weights and weighted random sampling, so discovery never becomes a deterministic feed.

The header includes 36 grouped themes with their actual palette swatches and a visible selection indicator. sthelse is the default. Every palette changes background, surfaces, text, borders, accents, button contrast, and glow without changing the layout. Theme preferences and an interest mirror use localStorage; unavailable browser storage does not block discovery.

## Technologies

- React 19, TypeScript, and Vite
- CSS animations, responsive layouts, and inline SVG iconography
- Netlify Functions using the modern Request/Response handler
- Public Wikipedia and Wikimedia APIs; no API keys or authentication
- Netlify Database with Drizzle for anonymous discovery signals

## Run locally

Use Node.js 22 or later. Install dependencies, then run Netlify's local development environment so both Vite and the discovery function are available:

```sh
npm install
netlify dev --port 8889
```

Open `http://localhost:8889`. `npm run dev` starts only the frontend and does not emulate the discovery function. Internet access is required for live discoveries and Google Fonts; local font fallbacks remain available.

## Deployment

Connect the repository to Netlify. `netlify.toml` sets the build command to `npm ci --include=dev --no-audit --no-fund && npm run build`, the publish directory to `dist`, and the functions directory to `netlify/functions`. The committed `package-lock.json` pins dependencies, and the explicit installation step includes Vite and the other development dependencies even when deployment starts without `node_modules`. Netlify Database provisions its connection automatically; the committed migration under `netlify/database/migrations` creates the discovery-signal table. No browser credentials, third-party database service, or AI API keys are required.

## Project layout

- `src/App.tsx`: the single-button interaction and roll sequence
- `src/components/`: icons and the discovery result card
- `src/lib/discoveries.ts`: shared discovery types and the API client
- `src/styles.css`: all interface styling and motion
- `netlify/functions/discover.mts`: Wikimedia retrieval, filtering, and localization
- `netlify/functions/images.mts`: article-associated image retrieval and license metadata
- `netlify/functions/interests.mts`: validated anonymous discovery-memory API
- `db/schema.ts`: structured discovery signals, backed by Netlify Database
- `src/lib/themes.ts`: the 36 complete palettes
- `public/`: the site favicon

The memory API records revealed discovery IDs, categories, tags, exposure counts, and known/unknown choices in Netlify Database. An opaque, randomly generated HttpOnly, SameSite cookie identifies the browser without an account, name, or email. Requests never expose database credentials. Only the latest 250 signals contribute to approximate interest weights. The browser retains a localStorage mirror for immediate and offline feedback, while successful interactions also persist behind the API boundary. A database outage does not prevent rolling or reading; the interface discloses when online synchronization is unavailable. Clearing cookies starts a new anonymous server identity; clearing localStorage resets the device mirror and theme.

Wikipedia availability and coverage vary. Localization is not machine translation, content is not guaranteed to be suitable for all audiences, and heuristic quality filtering cannot guarantee that every result will be interesting.
