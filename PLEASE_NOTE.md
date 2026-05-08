# PLEASE NOTE — API Keys & Google AI Studios

## Why are the API keys blank?

The environment variables in `.env.example` (and `.env.local`) are intentionally
left empty for the following reasons:

### Google AI Studios integration (primary reason)

This project is being prepared for deployment on **Google AI Studios**, which
injects secrets at runtime through its own secure environment management — you
do **not** hardcode API keys in the repository.

When the project is deployed to Google AI Studios:

- `VITE_GOOGLE_AI_API_KEY` will be provided automatically by the platform
- `VITE_GOOGLE_AI_MODEL` defaults to `gemini-2.0-flash` if not set

**Do NOT add a real API key to this file or commit one to the repo.**
Google AI Studios handles key injection securely. Committing keys would expose
them in git history and violate the platform's security model.

---

## How to switch from Base44 to Google AI Studios

The codebase already has the abstraction layer in place at:

```
src/lib/ai-service.js
```

To complete the migration:

1. Install the Google AI SDK:
   ```bash
   npm install @google/generative-ai
   ```

2. In `src/lib/ai-service.js`:
   - Uncomment the `_callGoogleAI` function
   - In `invokeAI`, change `_callBase44(...)` → `_callGoogleAI(...)`
   - In `isAIConfigured`, uncomment the Google AI check

3. Set your model in `.env.local` (local dev only):
   ```
   VITE_GOOGLE_AI_API_KEY=<your key from aistudio.google.com>
   VITE_GOOGLE_AI_MODEL=gemini-2.0-flash
   ```

4. The rest of the codebase — `MealPlannerChat`, `Dashboard`, rate limiting —
   requires **zero changes**. The abstraction handles everything.

---

## Other keys

| Key | Purpose | Status |
|-----|---------|--------|
| `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` | Real auth & persistence | Optional — app works offline without them |
| `VITE_BASE44_APP_ID` + `VITE_BASE44_APP_BASE_URL` | Current AI Planner | Required for AI chat until Google AI migration |
| `PRICE_API_URL` + `PRICE_API_KEY` | Live store prices | Optional — app uses local estimates as fallback |

---

## For local development without any keys

The app works fully in demo mode with no keys set:

- Auth uses localStorage (demo account: `demo` / `demo123`)
- AI Planner shows a configuration notice (expected behaviour)
- Grocery prices use local estimates for Qatari stores

This is by design so contributors can run the project locally without needing
access to any paid services.
