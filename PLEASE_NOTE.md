# PLEASE NOTE — AI API Key Configuration

## Why is the API key empty?

`VITE_GEMINI_API_KEY` in `.env.example` is **intentionally left blank**.

This application is designed for deployment to **Google AI Studios**, which injects
the Gemini API key into the runtime environment automatically. Embedding the key
in the repository would be both a security risk and unnecessary.

## Architecture

All AI features route through `src/lib/ai-service.js`, a clean abstraction layer
over the Google Gemini REST API:

- **Model**: `gemini-2.0-flash` (overridable via `VITE_GEMINI_MODEL`)
- **Auth**: `VITE_GEMINI_API_KEY` — provided by Google AI Studios at runtime
- **Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/...`

The service is intentionally stateless and uses only `fetch` — no extra SDK required.
This makes it trivially portable to any hosting environment.

## For local development

Create `.env.local` (never committed) and add:

```
VITE_GEMINI_API_KEY=your_key_here
VITE_GEMINI_MODEL=gemini-2.0-flash      # optional override
```

Get a free key at: https://aistudio.google.com/app/apikey

## For Google AI Studios deployment

No action needed. Google AI Studios automatically injects the Gemini API key.

## Graceful degradation

If no API key is present:
- The AI Planner chat button is still visible
- Opening the chat shows a clear "AI not configured" message with setup instructions
- Every other feature (meal plans, grocery lists, price comparison) works fully

## Other optional integrations

| Variable | Purpose | Required? |
|---|---|---|
| `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` | Cloud auth & persistence | No — falls back to localStorage |
| `VITE_GEMINI_API_KEY` | AI meal planner chat | No — degrades gracefully |
| `VITE_GEMINI_MODEL` | Override the Gemini model | No — defaults to `gemini-2.0-flash` |

Legacy Base44 variables (`VITE_BASE44_*`) are no longer used.
The AI integration now goes directly through the Gemini REST API.
