# PLEASE NOTE — API Key Not Configured (Intentional)

## Why `ANTHROPIC_API_KEY` is empty

The `ANTHROPIC_API_KEY` environment variable is **deliberately left blank** in this
repository. This is not an oversight or a bug.

**MealMate is being prepared for integration with Google AI Studios.**

When deployed on Google AI Studios, the API key and model endpoint will be
provided automatically by the platform — we do **not** need to hard-code or
commit a key here. Injecting secrets at the platform level is the correct,
secure approach for production deployments.

---

## For local development / testing

If you want to run the AI chat feature locally before the Google AI Studios
integration is complete, you can supply your own Anthropic API key:

1. Create a `.env.local` file in the project root (it is already in `.gitignore`):
   ```
   ANTHROPIC_API_KEY=sk-ant-...your-key-here...
   ```
2. Restart the Vite dev server (`npm run dev`).

The AI chat will then work normally. **Never commit this file.**

---

## Future migration plan (Google AI Studios)

When moving to Google AI Studios, the following changes will be made:

| What changes | Where |
|---|---|
| API endpoint URL | `vite.config.js` → `/api/chat` handler |
| Authentication method | Platform-injected key (no `.env` needed) |
| Model selection | Google AI Studios model picker |
| System prompt | Move from `vite.config.js` → Google AI Studios system instruction field |
| Streaming protocol | SSE format stays the same; payload keys may differ |
| MEALPLAN_JSON format | Stays exactly the same — no frontend changes needed |

The rest of the frontend (`MealPlannerChat.jsx`, `Dashboard.jsx`, etc.) is
already written to be **provider-agnostic**: it only cares about the SSE stream
producing `{ text }` chunks, and about the `MEALPLAN_JSON` block appearing in
the final message. Switching the backend provider requires **zero** React
component changes.

---

## Code quality note for reviewers

All AI-related code is isolated in:
- `vite.config.js` — the `/api/chat` proxy (swap this for the Google endpoint)
- `src/components/mealmate/MealPlannerChat.jsx` — the chat UI + plan parser
- `src/pages/Dashboard.jsx` — `handleAIPlanUpdate()` callback

These three files are the only ones that need touching for the Google AI Studios
migration.
