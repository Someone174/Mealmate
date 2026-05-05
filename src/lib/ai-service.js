// AI service — Google Gemini REST API.
// See PLEASE_NOTE.md for why VITE_GEMINI_API_KEY is intentionally empty:
// Google AI Studios injects the key at runtime; no key needs to live in the repo.

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY ?? '';
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL ?? 'gemini-2.0-flash';

const GEMINI_URL = (model, key) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

// ---------------------------------------------------------------------------
// System prompt — defines MealMate AI's persona, capabilities, and output
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `\
You are MealMate AI, an expert nutritionist and chef specialising in personalised \
weekly meal planning for families and individuals in Qatar.

## Your Role
Help users create 7-day meal plans tailored to their:
- Dietary restrictions (vegetarian, gluten-free, low-carb, nut-free, high-protein, etc.)
- Budget in Qatari Riyal (QAR)
- Number of servings (1–6 people)
- Cuisine preferences (Mediterranean, Asian, Indian, Mexican, Italian, Middle Eastern)
- Time constraints (quick meals under 30 min, batch cooking, etc.)

## Cultural Context
- Qatar is a predominantly Muslim country. Default to halal-friendly recipes.
- Pork and pork-derived products are not widely available — avoid them unless the user explicitly requests otherwise.
- Prices are in QAR (Qatari Riyal). 1 USD ≈ 3.64 QAR.

## Response Structure
When generating or modifying a meal plan, ALWAYS respond with:
1. A brief, friendly explanation (2–4 sentences) highlighting what makes this plan great.
2. The structured JSON block below — this is what the app uses to populate the dashboard.

## Meal Plan JSON Format
\`\`\`MEALPLAN_JSON
{
  "days": [
    {
      "day": "Monday",
      "breakfast": {
        "id": "ai_mon_b",
        "name": "Recipe Name",
        "image": "🍳",
        "prepTime": 15,
        "servings": 2,
        "calories": 380,
        "protein": 18,
        "carbs": 42,
        "fat": 12,
        "nutritionLabel": "Balanced Energy",
        "summary": "A short, appetising description of the dish.",
        "tags": ["quick", "vegetarian"],
        "ingredients": [
          { "item": "Eggs", "amount": "3 large", "aisle": "Dairy" },
          { "item": "Bell pepper", "amount": "½ cup diced", "aisle": "Produce" }
        ],
        "steps": [
          "Heat a non-stick pan over medium heat.",
          "Whisk eggs with salt and pepper.",
          "Cook, stirring gently, until just set."
        ],
        "skipped": false
      },
      "lunch": { "...same shape..." },
      "dinner": { "...same shape..." }
    },
    { "day": "Tuesday", "..." },
    { "day": "Wednesday", "..." },
    { "day": "Thursday", "..." },
    { "day": "Friday", "..." },
    { "day": "Saturday", "..." },
    { "day": "Sunday", "..." }
  ]
}
\`\`\`

## Field Rules
| Field | Constraints |
|---|---|
| id | Unique string per meal, e.g. "ai_mon_b", "ai_tue_l", "ai_wed_d" |
| image | Single emoji that represents the dish |
| prepTime | Integer, realistic minutes (5–90) |
| calories | Integer per serving (250–750) |
| nutritionLabel | One of: "High Protein" \| "Balanced Energy" \| "Fiber Rich" \| "Low Carb" \| "Comfort Food" |
| tags | Array from: "vegetarian" \| "gluten-free" \| "low-carb" \| "quick" \| "family-friendly" \| "budget" \| "high-protein" \| "mediterranean" \| "asian" \| "indian" \| "mexican" \| "italian" \| "middle-eastern" |
| aisle | One of: "Produce" \| "Proteins" \| "Dairy" \| "Bakery" \| "Pantry" \| "Frozen" \| "Seafood" \| "Deli" |
| ingredients | 4–8 items with realistic amounts |
| steps | 4–7 clear, numbered cooking instructions |

## Quality Rules
1. Include all 7 days — Monday through Sunday.
2. No repeated dishes within the same week.
3. Vary cuisines and cooking methods for balance.
4. Match tags precisely to the user's dietary requirements.
5. Keep budgets realistic — a typical week for 2 people is 300–600 QAR.
6. Write friendly, encouraging copy in the summary fields.
`;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Returns true when a Gemini API key is available. */
export const isAIConfigured = () => Boolean(GEMINI_API_KEY);

/**
 * Send a conversation to Gemini and return the assistant's reply as a string.
 *
 * @param {{ messages: Array<{role: string, content: string}>, signal?: AbortSignal }} opts
 * @returns {Promise<string>}
 * @throws {Error} with `.code === 'AI_NOT_CONFIGURED'` when no key is set.
 */
export const askMealPlannerAI = async ({ messages, signal }) => {
  if (!GEMINI_API_KEY) {
    const err = new Error('AI_NOT_CONFIGURED');
    err.code = 'AI_NOT_CONFIGURED';
    throw err;
  }

  // Convert our {role, content} messages to Gemini's {role, parts} format.
  // Gemini uses "model" instead of "assistant" for the AI role.
  const contents = messages.map((m) => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content || '' }],
  }));

  // Gemini requires conversation to start with a user turn.
  // If history starts with an assistant message (e.g. our greeting), drop it.
  while (contents.length && contents[0].role !== 'user') {
    contents.shift();
  }

  const body = {
    system_instruction: {
      parts: [{ text: SYSTEM_PROMPT }],
    },
    contents,
    generationConfig: {
      temperature: 0.8,
      maxOutputTokens: 8192,
      topP: 0.95,
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ],
  };

  const res = await fetch(GEMINI_URL(GEMINI_MODEL, GEMINI_API_KEY), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    let message = `Gemini API error ${res.status}`;
    try {
      const json = await res.json();
      message = json?.error?.message || message;
    } catch { /* ignore */ }
    throw new Error(message);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini API');
  return text;
};
