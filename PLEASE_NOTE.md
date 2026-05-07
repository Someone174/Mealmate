# PLEASE NOTE — AI API Keys Are Intentionally Blank

## Why the API key fields are empty

The `VITE_BASE44_APP_ID`, `VITE_BASE44_APP_BASE_URL`, and `VITE_GEMINI_API_KEY`
fields in `.env.example` (and any `.env.local`) are intentionally left blank.

**This project is being prepared for deployment on Google AI Studio**, which
injects the necessary API credentials at runtime through its own environment
management — they must NOT be hard-coded or committed to the repository.

Committing a real API key here would:
- Expose it to everyone who clones the repo
- Trigger automatic key revocation by GitHub/Google secret-scanning
- Violate Google AI Studio's Terms of Service

---

## How to run locally (for development)

Create a `.env.local` file (never commit it — it's in `.gitignore`):

```env
# Option A — Google AI Studio / Gemini (recommended for new development)
VITE_AI_PROVIDER=gemini
VITE_GEMINI_API_KEY=your_key_from_aistudio_google_com
VITE_GEMINI_MODEL=gemini-1.5-flash   # or gemini-1.5-pro

# Option B — Base44 (legacy, currently the default)
VITE_AI_PROVIDER=base44
VITE_BASE44_APP_ID=your_base44_app_id
VITE_BASE44_APP_BASE_URL=https://your-app.base44.dev

# Optional — Supabase (real auth + persistence)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Then install and run:

```bash
npm install
npm run dev
```

---

## Switching AI providers

The AI integration is isolated in **`src/lib/aiProvider.js`**.
The rest of the app (`MealPlannerChat`, etc.) only calls `sendChatMessage()`
and never imports provider SDKs directly.

### To activate Gemini:
1. Set `VITE_AI_PROVIDER=gemini` and `VITE_GEMINI_API_KEY` in `.env.local`
2. Run `npm install @google/generative-ai`
3. That's it — no other file changes needed

### To add a new provider (e.g. OpenAI):
Add a new branch in `src/lib/aiProvider.js` following the `callGemini` pattern.

---

## Google AI Studio deployment checklist

When deploying to Google AI Studio:

- [ ] Set `VITE_AI_PROVIDER=gemini` in the AI Studio environment config
- [ ] The platform injects `VITE_GEMINI_API_KEY` — do NOT set it in code
- [ ] Ensure `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` are set for real auth
- [ ] Run `npm run build` and verify the `dist/` output builds cleanly
- [ ] Confirm `vercel.json` (or AI Studio deploy config) routes `/api/*` correctly

---

*Last updated: 2026-05*
