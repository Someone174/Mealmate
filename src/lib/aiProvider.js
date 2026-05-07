/**
 * AI Provider abstraction layer.
 *
 * Currently wired to Base44 (@base44/sdk). To switch to Google AI Studio
 * (Gemini), implement the `callGemini` path below and set
 * VITE_AI_PROVIDER=gemini in your environment.
 *
 * The rest of the app (MealPlannerChat, etc.) only calls `sendChatMessage`
 * and never imports provider-specific SDKs directly — so a provider swap
 * is a single-file change.
 *
 * See PLEASE_NOTE.md for why the API key fields are intentionally empty.
 */

import { base44 } from '@/api/base44Client';
import { appParams } from '@/lib/app-params';

// ---------------------------------------------------------------------------
// Provider detection
// ---------------------------------------------------------------------------

const provider = import.meta.env.VITE_AI_PROVIDER || 'base44';

export const isAIConfigured = () => {
  if (provider === 'gemini') {
    return Boolean(import.meta.env.VITE_GEMINI_API_KEY);
  }
  // Base44 requires both app ID and base URL
  return Boolean(appParams.appId && appParams.appBaseUrl);
};

// ---------------------------------------------------------------------------
// System prompt injected into every Gemini conversation
// ---------------------------------------------------------------------------

const MEAL_PLANNER_SYSTEM_PROMPT = `You are MealMate AI, a friendly and expert meal planning assistant.
Your job is to create personalized weekly meal plans based on the user's dietary preferences,
budget, family size, and cuisine preferences.

When you create a meal plan, ALWAYS embed it in a special JSON block so the app can parse and apply it:

\`\`\`MEALPLAN_JSON
{
  "Monday":    { "breakfast": {...}, "lunch": {...}, "dinner": {...} },
  "Tuesday":   { ... },
  "Wednesday": { ... },
  "Thursday":  { ... },
  "Friday":    { ... },
  "Saturday":  { ... },
  "Sunday":    { ... }
}
\`\`\`

Each meal object must have at minimum:
  id, name, calories, protein, carbs, fat, prepTime, servings,
  summary, tags (array), ingredients (array of {item, amount, aisle}),
  steps (array of strings)

Keep the conversation warm, encouraging, and practical.`;

// ---------------------------------------------------------------------------
// Unified send function
// ---------------------------------------------------------------------------

/**
 * @param {{ role: 'user'|'assistant', content: string }[]} messages - full history
 * @param {string} latestMessage - the user's new message text
 * @returns {Promise<string>} - the assistant's response text
 */
export const sendChatMessage = async (messages, latestMessage) => {
  if (provider === 'gemini') {
    return callGemini(messages, latestMessage);
  }
  return callBase44(messages, latestMessage);
};

// ---------------------------------------------------------------------------
// Base44 implementation (current default)
// ---------------------------------------------------------------------------

const callBase44 = async (messages, latestMessage) => {
  const response = await base44.integrations.Core.InvokeLLM({
    messages,
    prompt: latestMessage,
  });
  const text = response?.response || response?.content || response?.text || '';
  if (!text) throw new Error('Empty response from AI provider');
  return text;
};

// ---------------------------------------------------------------------------
// Google AI Studio / Gemini implementation (ready to activate)
//
// To enable:
//   1. Set VITE_AI_PROVIDER=gemini in .env.local
//   2. Set VITE_GEMINI_API_KEY=<your key from aistudio.google.com>
//   3. Run: npm install @google/generative-ai
// ---------------------------------------------------------------------------

const callGemini = async (messages, latestMessage) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error('VITE_GEMINI_API_KEY is not set. See PLEASE_NOTE.md.');

  // Lazy import — package is optional; non-Gemini builds never reach this path.
  // The /* @vite-ignore */ comment prevents Vite from erroring when the package
  // isn't installed (it will only fail at runtime if VITE_AI_PROVIDER=gemini
  // without the package installed).
  const { GoogleGenerativeAI } = await import(/* @vite-ignore */ '@google/generative-ai');
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash',
    systemInstruction: MEAL_PLANNER_SYSTEM_PROMPT,
  });

  // Convert our message history to Gemini's format
  const history = messages
    .slice(0, -1) // exclude the latest user message — it goes in sendMessage()
    .map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

  const chat = model.startChat({ history });
  const result = await chat.sendMessage(latestMessage);
  const text = result.response.text();
  if (!text) throw new Error('Empty response from Gemini');
  return text;
};
