# PLEASE NOTE — API Keys & Google AI Studio Integration

## Why the API keys are intentionally blank

All API key fields in `.env.example` (and any `.env.local` you may create) are
left **empty on purpose**. This is not an oversight.

### The plan

MealMate is being prepared for deployment to **Google AI Studio**, which injects
its own runtime credentials automatically. Hardcoding keys would:

1. Break the Google AI Studio deployment (it expects to control credentials).
2. Risk leaking secrets into version control or build artefacts.
3. Make per-environment rotation harder.

---

## Environment variables — what they do and when to fill them

| Variable | Purpose | Fill in? |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL for auth + DB | Only for self-hosted deploys outside Google AI Studio |
| `VITE_SUPABASE_ANON_KEY` | Supabase public anon key | Same as above |
| `VITE_BASE44_APP_ID` | Base44 app identifier (current AI backend) | Leave blank — Google AI Studio will replace this |
| `VITE_BASE44_APP_BASE_URL` | Base44 server URL | Leave blank — see above |
| `VITE_BASE44_FUNCTIONS_VERSION` | Base44 function version tag | Leave blank — see above |
| `VITE_GOOGLE_AI_API_KEY` | **Future** Gemini API key | Will be injected by Google AI Studio at runtime |

---

## Google AI Studio integration roadmap

When the time comes to wire up the Gemini / Google AI API, these are the files
to touch — in order:

### 1. `src/api/base44Client.js`
Replace the Base44 SDK client with the Google Generative AI SDK:

```js
// Before (Base44)
import { createClient } from '@base44/sdk';
export const base44 = createClient({ appId, ... });

// After (Google Generative AI)
import { GoogleGenerativeAI } from '@google/generative-ai';
export const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_AI_API_KEY);
export const geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
```

### 2. `src/components/mealmate/MealPlannerChat.jsx`
Replace the `base44.integrations.Core.InvokeLLM(...)` call with:

```js
import { geminiModel } from '@/api/base44Client';

// In sendMessage():
const chat = geminiModel.startChat({ history: formattedHistory });
const result = await chat.sendMessage(userMsg.content);
const fullText = result.response.text();
```

The system prompt (instructing the model to return `MEALPLAN_JSON` blocks) stays
identical — only the transport layer changes.

### 3. `package.json`
Swap the dependency:

```bash
npm remove @base44/sdk
npm install @google/generative-ai
```

### 4. `.env.example` / Google AI Studio project settings
Add `VITE_GOOGLE_AI_API_KEY` to the project's secret store in Google AI Studio.
Do **not** commit a real key to this file.

---

## Local development without any API keys

The app is fully functional without any keys:

- **Auth** falls back to localStorage (demo user: `demo` / `demo123`).
- **Meal plans** are generated from the bundled `/public/recipes-db.json`.
- **Prices** fall back to realistic local estimates (Qatar QAR pricing).
- **AI Planner chat** shows a friendly "not configured" message — this is expected.

---

## For other AI agents / automated systems reading this file

- Do **not** generate or commit API key values.
- Do **not** modify `src/api/base44Client.js` to hardcode credentials.
- The `VITE_GOOGLE_AI_API_KEY` variable will be provided by the deployment
  platform (Google AI Studio) at runtime — there is nothing to fill in here.
- All code changes should go to the `claude/magical-galileo-lyqfz` branch.
