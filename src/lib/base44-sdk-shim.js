const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const dessertTemplates = {
  breakfast: [
    ['Berry Yogurt Mousse Cup', 'Greek yogurt, berries, honey, oats', 260, 'Light & Fresh'],
    ['Vanilla Chia Pudding', 'Chia seeds, milk, vanilla, strawberries', 280, 'Fiber Rich'],
    ['Citrus Ricotta Toast', 'Ricotta, orange, whole grain toast, honey', 300, 'Balanced Energy']
  ],
  lunch: [
    ['Dark Chocolate Date Tart', 'Dates, cocoa, almonds, cream cheese', 620, 'Comfort Food'],
    ['Pistachio Kunafa Parfait', 'Kunafa, pistachios, cream, rose syrup', 680, 'Comfort Food'],
    ['Banana Caramel Bread Pudding', 'Banana, bread, eggs, milk, caramel', 650, 'Comfort Food']
  ],
  dinner: [
    ['Poached Pear Yogurt Bowl', 'Pear, yogurt, cinnamon, walnuts', 310, 'Light & Fresh'],
    ['Lemon Cream Cup', 'Lemon, yogurt, honey, biscuit crumb', 290, 'Light & Fresh'],
    ['Baked Apple Crumble Cup', 'Apple, oats, cinnamon, butter', 330, 'Fiber Rich']
  ]
};

const makeIngredients = (csv) => csv.split(',').map(item => ({
  item: item.trim(),
  amount: '1 portion',
  aisle: /yogurt|milk|cream|ricotta|butter|cheese/i.test(item) ? 'Dairy' : 'Pantry'
}));

const makeDessertPlan = () => Object.fromEntries(DAYS.map((day, dayIndex) => {
  const dayKey = day.slice(0, 3).toLowerCase();
  return [day, Object.fromEntries(['breakfast', 'lunch', 'dinner'].map((mealType) => {
    const [name, ingredients, calories, label] = dessertTemplates[mealType][dayIndex % 3];
    return [mealType, {
      id: `ai_${mealType[0]}_${dayKey}`,
      name,
      image: '',
      prepTime: mealType === 'lunch' ? 35 : 15,
      servings: 2,
      calories,
      protein: mealType === 'lunch' ? 10 : 14,
      carbs: mealType === 'lunch' ? 82 : 42,
      fat: mealType === 'lunch' ? 28 : 9,
      summary: `${label} dessert planned for ${day} ${mealType}.`,
      nutritionLabel: label,
      tags: ['dessert', mealType === 'lunch' ? 'heavy' : 'light'],
      ingredients: makeIngredients(ingredients),
      steps: ['Prepare the base ingredients.', 'Assemble and chill or bake as needed.', 'Serve in portions.'],
      skipped: false
    }];
  }))];
}));

const createFallbackMealPlanResponse = (prompt = '') => {
  const wantsDessert = /dessert|sweet|pudding|cake|tart|chocolate/i.test(prompt);
  const plan = makeDessertPlan();
  const intro = wantsDessert
    ? 'Here is a dessert-focused week with light breakfast and dinner options and heavier lunch desserts.'
    : 'Here is a weekly plan you can apply to your dashboard.';

  return `${intro}\n\n\`\`\`MEALPLAN_JSON\n${JSON.stringify(plan, null, 2)}\n\`\`\``;
};

export function createClient(config = {}) {
  const callFunction = async (name, payload = {}) => {
    const response = await fetch(`/api/base44/functions/${encodeURIComponent(name)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, config })
    });

    if (!response.ok) throw new Error(`Base44 function ${name} failed: ${response.status}`);
    return response.json();
  };

  return {
    auth: {
      me: async () => null,
      logout: () => {},
      redirectToLogin: () => {},
    },
    entities: {
      Recipe: {
        list: async () => [],
        bulkCreate: async () => {},
      },
    },
    functions: {
      invokeFunctionByName: ({ name, params } = {}) => callFunction(name, params),
    },
    integrations: {
      Core: {
        InvokeLLM: async ({ prompt, messages } = {}) => {
          const lastUserMessage = messages?.filter(m => m.role === 'user').at(-1)?.content;
          return { response: createFallbackMealPlanResponse(prompt || lastUserMessage || '') };
        },
      },
    },
  };
}
