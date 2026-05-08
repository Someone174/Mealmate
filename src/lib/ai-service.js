/**
 * MealMate AI Service
 *
 * Single abstraction layer over every LLM provider the app might use.
 * Currently wired to Base44 (deployed via @base44/sdk).
 *
 * ─── Switching to Google AI Studios ─────────────────────────────────────────
 * When the project is moved to Google AI Studios, replace the `_callBase44`
 * implementation with `_callGoogleAI` below and update `invoke` to call it.
 * The rest of the codebase (MealPlannerChat, etc.) requires zero changes.
 *
 * Required env var for Google AI Studios:
 *   VITE_GOOGLE_AI_API_KEY=<your key>          ← see PLEASE_NOTE.md
 *   VITE_GOOGLE_AI_MODEL=gemini-2.0-flash      ← optional, defaults shown
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { base44 } from '@/api/base44Client';
import { appParams } from '@/lib/app-params';

// ── System prompt ─────────────────────────────────────────────────────────────
// A well-structured system prompt improves output quality for both Base44 and
// Gemini. Keep it here so any provider swap gets it automatically.

export const MEAL_PLANNER_SYSTEM_PROMPT = `You are MealMate AI, an expert meal planning assistant.

Your role is to create personalised weekly meal plans that are practical, nutritious, and delicious.

## When creating a meal plan:
- Respect all dietary restrictions and allergies (treat these as hard constraints)
- Consider cuisine preferences and budget when provided
- Aim for variety across the week — avoid repeating the same recipe twice
- Keep prep times realistic for weekday meals (under 45 min unless requested)
- Include a brief, encouraging message summarising the plan

## Output format for meal plans:
Always include a JSON block in this exact format so the app can auto-apply the plan.
Wrap it in triple backticks with the MEALPLAN_JSON tag:

\`\`\`MEALPLAN_JSON
[
  {
    "day": "Monday",
    "breakfast": { "name": "...", "summary": "...", "prepTime": 15, "calories": 350, "protein": 12, "carbs": 45, "fat": 10, "nutritionLabel": "...", "ingredients": [{"item": "...", "amount": "...", "aisle": "Pantry"}], "steps": ["..."], "tags": ["vegetarian"] },
    "lunch": { ... },
    "dinner": { ... }
  },
  ...
]
\`\`\`

## Aisle values for ingredients:
Use exactly one of: Produce, Proteins, Seafood, Dairy, Bakery, Pantry, Frozen, Deli

## Tone:
Friendly, encouraging, and concise. Never preachy about health.`;

// ── Provider implementations ───────────────────────────────────────────────────

const _callBase44 = async ({ messages, userMessage, signal }) => {
  const response = await base44.integrations.Core.InvokeLLM({
    messages,
    prompt: userMessage,
    signal,
  });
  return response?.response || response?.content || response?.text || '';
};

/**
 * Placeholder for the Google AI Studios (Gemini) provider.
 * Uncomment and install `@google/generative-ai` when ready.
 *
 * Install:  npm install @google/generative-ai
 * Import:   import { GoogleGenerativeAI } from '@google/generative-ai';
 */
// const _callGoogleAI = async ({ messages, userMessage, signal }) => {
//   const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
//   const modelName = import.meta.env.VITE_GOOGLE_AI_MODEL || 'gemini-2.0-flash';
//
//   const genAI = new GoogleGenerativeAI(apiKey);
//   const model = genAI.getGenerativeModel({
//     model: modelName,
//     systemInstruction: MEAL_PLANNER_SYSTEM_PROMPT,
//   });
//
//   // Convert the message history to the Gemini chat format
//   const history = messages.slice(0, -1).map(m => ({
//     role: m.role === 'assistant' ? 'model' : 'user',
//     parts: [{ text: m.content }],
//   }));
//
//   const chat = model.startChat({ history });
//   const result = await chat.sendMessage(userMessage, { signal });
//   return result.response.text();
// };

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Returns true when the active provider is configured and ready to use.
 * Components should check this before showing the AI chat UI.
 */
export const isAIConfigured = () => {
  // Google AI check (uncomment when switching):
  // return Boolean(import.meta.env.VITE_GOOGLE_AI_API_KEY);

  return Boolean(appParams.appId && appParams.appBaseUrl);
};

/**
 * Sends a message to the configured AI provider.
 *
 * @param {object} opts
 * @param {Array<{role: string, content: string}>} opts.messages - Full conversation history
 * @param {string} opts.userMessage - The latest user message text
 * @param {AbortSignal} [opts.signal] - AbortSignal for cancellation
 * @returns {Promise<string>} The assistant's reply as a plain string
 */
export const invokeAI = async ({ messages, userMessage, signal }) => {
  if (!isAIConfigured()) {
    throw new Error('AI_NOT_CONFIGURED');
  }

  // Switch this line to `_callGoogleAI` when migrating to Google AI Studios:
  return _callBase44({ messages, userMessage, signal });
};
