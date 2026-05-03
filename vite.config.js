import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// ── System prompt ─────────────────────────────────────────────────────────────
// NOTE: This prompt is currently used via the local Vite dev-server proxy.
// When integrating with Google AI Studios, this prompt will be moved into the
// Google AI Studios system instruction field and this file will be updated to
// call the Google AI Studios endpoint instead.
const SYSTEM_PROMPT = `You are MealMate AI, a friendly and knowledgeable meal planning assistant. You help users create personalized weekly meal plans, suggest recipes, answer cooking questions, and provide nutrition advice.

STRICT DIETARY RULES (always apply, no exceptions):
- NO pork, ham, bacon, prosciutto, chorizo, sausage, lard, pancetta, salami, pepperoni, pork ribs, pulled pork, pork belly, pork chops, carnitas, or any pork-derived products
- NO alcohol as a primary ingredient

When a user asks for a meal plan, create a 7-day plan. After your friendly explanation, output the meal plan data at the END of your message using this exact format:

\`\`\`MEALPLAN_JSON
{
  "days": [
    {
      "day": "Monday",
      "breakfast": {
        "id": "ai_b_mon",
        "name": "Recipe Name",
        "image": "🍳",
        "prepTime": 15,
        "servings": 2,
        "calories": 350,
        "protein": 20,
        "carbs": 45,
        "fat": 10,
        "summary": "Brief description.",
        "nutritionLabel": "High Protein",
        "tags": ["quick", "vegetarian"],
        "ingredients": [{"item": "Eggs", "amount": "3", "aisle": "Dairy"}],
        "steps": ["Step 1", "Step 2"],
        "skipped": false
      },
      "lunch": { "id": "ai_l_mon", "name": "...", "image": "🥗", "prepTime": 20, "servings": 2, "calories": 400, "protein": 18, "carbs": 50, "fat": 12, "summary": "...", "nutritionLabel": "Light & Fresh", "tags": [], "ingredients": [], "steps": [], "skipped": false },
      "dinner": { "id": "ai_d_mon", "name": "...", "image": "🍛", "prepTime": 35, "servings": 2, "calories": 500, "protein": 30, "carbs": 45, "fat": 18, "summary": "...", "nutritionLabel": "Balanced Energy", "tags": [], "ingredients": [], "steps": [], "skipped": false }
    }
  ]
}
\`\`\`

Use unique ids like "ai_b_mon", "ai_l_tue", "ai_d_wed", etc. (b=breakfast, l=lunch, d=dinner, mon/tue/wed/thu/fri/sat/sun).
Vary cuisines. Be realistic with nutrition. nutritionLabel must be one of: "High Protein", "Light & Fresh", "Comfort Food", "Plant Power", "Balanced Energy", "Fiber Rich", "Omega Rich", "Low Carb".

For general questions, just respond conversationally without the JSON block.`;

// ── Claude API middleware ──────────────────────────────────────────────────────
// This plugin adds a /api/chat endpoint to the local dev server.
// It proxies requests to the Anthropic Claude API with streaming SSE.
//
// FUTURE MIGRATION: When deploying to Google AI Studios, replace this
// middleware with a call to the Google AI Studios API. The endpoint URL,
// authentication method, and request/response format will change, but the
// SSE streaming protocol and MEALPLAN_JSON format stay the same.
function claudeApiPlugin() {
  return {
    name: 'claude-api-middleware',
    configureServer(server) {
      server.middlewares.use('/api/chat', async (req, res, next) => {
        // Allow cross-origin requests (needed when Google AI Studios calls this)
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }

        if (req.method !== 'POST') return next();

        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
          try {
            const parsed = JSON.parse(body);
            const messages = parsed.messages;

            if (!Array.isArray(messages) || messages.length === 0) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'messages array is required' }));
              return;
            }

            const apiKey = process.env.ANTHROPIC_API_KEY;
            if (!apiKey) {
              // Return a friendly error that surfaces in the chat UI
              res.setHeader('Content-Type', 'text/event-stream');
              res.setHeader('Cache-Control', 'no-cache');
              res.setHeader('Connection', 'keep-alive');
              res.write(`data: ${JSON.stringify({ text: "⚠️ **API key not configured.** Please set `ANTHROPIC_API_KEY` in your `.env.local` file and restart the dev server.\n\n*Note: The API key is intentionally left empty because MealMate will be integrated with Google AI Studios — the key will be injected at deployment time.*" })}\n\n`);
              res.write('data: [DONE]\n\n');
              res.end();
              return;
            }

            // Lazy-import Anthropic so vite.config loads even before npm install
            const { default: Anthropic } = await import('@anthropic-ai/sdk');
            const anthropic = new Anthropic({ apiKey });

            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            const stream = anthropic.messages.stream({
              model: 'claude-opus-4-7',
              max_tokens: 4096,
              thinking: { type: 'adaptive' },
              system: SYSTEM_PROMPT,
              messages: messages.map(m => ({ role: m.role, content: m.content })),
            });

            for await (const event of stream) {
              if (
                event.type === 'content_block_delta' &&
                event.delta.type === 'text_delta'
              ) {
                res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
              }
            }

            res.write('data: [DONE]\n\n');
            res.end();
          } catch (err) {
            console.error('[/api/chat]', err.message);
            if (!res.headersSent) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message }));
            } else {
              res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
              res.end();
            }
          }
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), claudeApiPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Ensure large JSON assets (recipes-db.json) are served correctly
  assetsInclude: ['**/*.json'],
})
