import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

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
      "lunch": { ... same shape, id: "ai_l_mon" ... },
      "dinner": { ... same shape, id: "ai_d_mon" ... }
    }
  ]
}
\`\`\`

Use unique ids like "ai_b_mon", "ai_l_tue", "ai_d_wed", etc. (b=breakfast, l=lunch, d=dinner, mon/tue/wed/thu/fri/sat/sun).
Vary cuisines. Be realistic with nutrition. nutritionLabel must be one of: "High Protein", "Light & Fresh", "Comfort Food", "Plant Power", "Balanced Energy", "Fiber Rich", "Omega Rich", "Low Carb".

For general questions, just respond conversationally without the JSON block.`;

function claudeApiPlugin() {
  return {
    name: 'claude-api-middleware',
    configureServer(server) {
      server.middlewares.use('/api/chat', async (req, res, next) => {
        if (req.method !== 'POST') return next();

        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
          try {
            const { messages } = JSON.parse(body);

            // Lazy-import Anthropic so vite.config loads even before npm install
            const { default: Anthropic } = await import('@anthropic-ai/sdk');
            const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            res.setHeader('Access-Control-Allow-Origin', '*');

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
})
