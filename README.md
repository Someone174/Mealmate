# MealMate

Weekly meal planning with smart grocery lists and store price comparison.

## Local setup (5 minutes)

```bash
git clone <this repo>
cd Mealmate
npm install            # ← if you skip this, vite won't be found
npm run dev            # http://localhost:5173
```

That's it for "local mode." The app runs entirely in your browser with
localStorage. A yellow banner at the top reminds you that real accounts
aren't wired yet.

### Common gotchas

- **`'vite' is not recognized as an operable program`** — you didn't run
  `npm install` after pulling, or it failed. Run `npm install` again.
- **Stale install after a big pull** — `rm -rf node_modules
  package-lock.json && npm install` (Windows: delete both manually then run).
- **Wrong Node version** — needs Node 18+. Check with `node -v`.

## Going live (real auth + AI)

Copy the example env and fill it in. **`.env.local` is gitignored**,
so your secrets never leave your machine.

```bash
cp .env.example .env.local
```

Then edit `.env.local`:

```
# Supabase: real auth + persistence
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJI...

# Base44: real AI Planner
VITE_BASE44_APP_ID=cbef...
VITE_BASE44_APP_BASE_URL=https://YOUR-APP.base44.app
VITE_BASE44_FUNCTIONS_VERSION=1
```

Restart `npm run dev`. The yellow banner disappears once Supabase is set.

### Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Project Settings → API → copy the URL and the **anon** key into
   `.env.local`.
3. SQL Editor → run the migration in `supabase/migrations/0001_init.sql`.
   That creates the `waitlist` table. User profile data lives in
   `auth.users.user_metadata` so no other tables are needed yet.
4. Authentication → Providers → enable Email. Turn off "Confirm email"
   while developing if you want signup to be instant.

### Base44 setup

1. Create your app at [base44.com](https://base44.com).
2. App settings → copy the App ID and the App Base URL into `.env.local`.
3. The AI Planner button in the dashboard hits Base44 once these are set.
   Free-tier users get 3 plans/day, monthly 100, yearly/lifetime 200
   (configurable in `src/lib/ai-rate-limit.js`).

## Scripts

| Command           | What it does                                |
| ----------------- | ------------------------------------------- |
| `npm run dev`     | Start the Vite dev server on port 5173      |
| `npm run build`   | Production build into `dist/`               |
| `npm run preview` | Preview the production build locally        |
| `npm run lint`    | ESLint                                      |
| `npm test`        | Run the Vitest unit tests                   |

## Deploying

The repo is set up for Vercel:

- `api/prices.js` → serverless function for grocery price aggregation.
- `vercel.json` → SPA routing + framework detection.
- `.github/workflows/ci.yml` → lint + test + build on every PR.

Set the same `VITE_*` env vars in your Vercel project's settings, then
`git push`. Vercel builds and deploys automatically.

## Project structure

```
src/
  api/                  base44Client (real SDK)
  components/
    mealmate/           domain components (calendar, grocery, AI chat…)
    ui/                 shadcn/ui primitives
    ConfigBanner        shows when Supabase isn't configured
    CookieConsent       bottom-right consent banner
    ErrorBoundary       app-wide friendly error fallback
  lib/
    AuthContext         Supabase session glue
    supabase.js         safe-init Supabase client
    ai-rate-limit.js    per-tier daily caps for the AI Planner
  pages/                Landing, SignIn, CreateAccount, Dashboard,
                        Recipes, RecipesBrowse, Pricing (waitlist),
                        Settings, Privacy, Terms
api/                    Vercel serverless functions
supabase/migrations/    SQL migrations
```

## What's "demo" vs. what's "real"

| Feature           | Status                                         |
| ----------------- | ---------------------------------------------- |
| Auth              | Real (Supabase) or local fallback              |
| User preferences  | Real (Supabase user_metadata) or local         |
| Meal plans        | Local-only for now (per Supabase user.id)      |
| Grocery lists     | Local-only for now                             |
| AI Planner        | Real (Base44) when configured, else friendly toast |
| Grocery prices    | Real per-store APIs if env set, else estimates |
| Subscriptions     | **Waitlist** — no payments yet, on purpose     |
