// MealMate Recipe Database - 50+ recipes with full details

let _dbLoadPromise = null;
export const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
export const MEAL_TYPES = ['breakfast','lunch','dinner'];

// Fetch /recipes-db.json once and merge into RECIPES in-place.
// All sync functions (getAllRecipes, getRecipeById, etc.) automatically see the data.
// Promise is reset on failure so the next call will retry.
export const loadRecipesDB = () => {
  if (_dbLoadPromise) return _dbLoadPromise;
  _dbLoadPromise = fetch('/recipes-db.json')
    .then(r => r.json())
    .then(db => {
      if (db.breakfast?.length) RECIPES.breakfast = [...RECIPES.breakfast, ...db.breakfast];
      if (db.lunch?.length)     RECIPES.lunch    = [...RECIPES.lunch,    ...db.lunch];
      if (db.dinner?.length)    RECIPES.dinner   = [...RECIPES.dinner,   ...db.dinner];
    })
    .catch(e => {
      console.warn('Could not load recipes-db.json:', e);
      _dbLoadPromise = null; // allow retry on next call
    });
  return _dbLoadPromise;
};

export const RECIPES = {
  breakfast: [
    {
      id: 'b1',
      name: 'Berry Bliss Smoothie Bowl',
      image: '🫐',
      prepTime: 10,
      servings: 1,
      summary: 'A refreshing blend of mixed berries, banana, and Greek yogurt topped with crunchy granola. Perfect for busy mornings when you need sustained energy.',
      nutritionLabel: 'High Protein',
      calories: 310,
      protein: 15,
      carbs: 52,
      fat: 6,
      tags: ['vegetarian', 'quick', 'gluten-free'],
      ingredients: [
        { item: 'Mixed berries (frozen)', amount: '1 cup', aisle: 'Frozen' },
        { item: 'Banana', amount: '1 medium', aisle: 'Produce' },
        { item: 'Greek yogurt', amount: '1/2 cup', aisle: 'Dairy' },
        { item: 'Almond milk', amount: '1/4 cup', aisle: 'Dairy' },
        { item: 'Granola', amount: '1/4 cup', aisle: 'Pantry' },
        { item: 'Honey', amount: '1 tbsp', aisle: 'Pantry' }
      ],
      steps: [
        'Add frozen berries, banana, Greek yogurt, and almond milk to blender',
        'Blend until smooth and thick (about 30 seconds)',
        'Pour into a bowl and top with granola',
        'Drizzle with honey and add extra berries if desired'
      ]
    },
    {
      id: 'b2',
      name: 'Avocado Toast Supreme',
      image: '🥑',
      prepTime: 8,
      servings: 1,
      summary: 'Creamy smashed avocado on crispy whole grain toast, topped with cherry tomatoes and a perfectly poached egg. Brunch vibes any day!',
      nutritionLabel: 'Balanced Energy',
      calories: 360,
      protein: 12,
      carbs: 28,
      fat: 24,
      tags: ['vegetarian', 'quick'],
      ingredients: [
        { item: 'Whole grain bread', amount: '2 slices', aisle: 'Bakery' },
        { item: 'Avocado', amount: '1 ripe', aisle: 'Produce' },
        { item: 'Cherry tomatoes', amount: '6-8', aisle: 'Produce' },
        { item: 'Eggs', amount: '1 large', aisle: 'Dairy' },
        { item: 'Lemon juice', amount: '1 tsp', aisle: 'Produce' },
        { item: 'Red pepper flakes', amount: 'pinch', aisle: 'Pantry' },
        { item: 'Salt & pepper', amount: 'to taste', aisle: 'Pantry' }
      ],
      steps: [
        'Toast bread until golden and crispy',
        'Halve and pit avocado, scoop into bowl with lemon juice, salt, and pepper',
        'Mash with fork to desired consistency',
        'Poach egg in simmering water for 3-4 minutes',
        'Spread avocado on toast, top with halved tomatoes and egg',
        'Season with red pepper flakes and serve immediately'
      ]
    },
    {
      id: 'b3',
      name: 'Overnight Oats Paradise',
      image: '🥣',
      prepTime: 5,
      servings: 1,
      summary: 'Prep tonight, enjoy tomorrow! Creamy oats soaked in almond milk with chia seeds, maple syrup, and your favorite toppings.',
      nutritionLabel: 'Fiber Rich',
      calories: 280,
      protein: 7,
      carbs: 50,
      fat: 8,
      tags: ['vegetarian', 'quick', 'budget'],
      ingredients: [
        { item: 'Rolled oats', amount: '1/2 cup', aisle: 'Pantry' },
        { item: 'Almond milk', amount: '1/2 cup', aisle: 'Dairy' },
        { item: 'Chia seeds', amount: '1 tbsp', aisle: 'Pantry' },
        { item: 'Maple syrup', amount: '1 tbsp', aisle: 'Pantry' },
        { item: 'Vanilla extract', amount: '1/2 tsp', aisle: 'Pantry' },
        { item: 'Fresh berries', amount: '1/4 cup', aisle: 'Produce' }
      ],
      steps: [
        'Combine oats, almond milk, chia seeds, maple syrup, and vanilla in a jar',
        'Stir well to combine all ingredients',
        'Cover and refrigerate overnight (at least 6 hours)',
        'In the morning, stir and add fresh berries on top',
        'Enjoy cold or microwave for 1 minute if you prefer warm'
      ]
    },
    {
      id: 'b4',
      name: 'Veggie Scramble Fiesta',
      image: '🍳',
      prepTime: 15,
      servings: 2,
      summary: 'Fluffy scrambled eggs loaded with colorful bell peppers, onions, and spinach. A protein-packed start to fuel your morning adventures.',
      nutritionLabel: 'High Protein',
      calories: 260,
      protein: 24,
      carbs: 6,
      fat: 16,
      tags: ['vegetarian', 'gluten-free', 'low-carb', 'quick'],
      ingredients: [
        { item: 'Eggs', amount: '4 large', aisle: 'Dairy' },
        { item: 'Bell pepper', amount: '1/2 cup diced', aisle: 'Produce' },
        { item: 'Onion', amount: '1/4 cup diced', aisle: 'Produce' },
        { item: 'Spinach', amount: '1 cup', aisle: 'Produce' },
        { item: 'Butter', amount: '1 tbsp', aisle: 'Dairy' },
        { item: 'Cheddar cheese', amount: '1/4 cup', aisle: 'Dairy' },
        { item: 'Salt & pepper', amount: 'to taste', aisle: 'Pantry' }
      ],
      steps: [
        'Whisk eggs in a bowl with salt and pepper',
        'Melt butter in non-stick pan over medium heat',
        'Sauté peppers and onions until softened (3-4 min)',
        'Add spinach and cook until wilted (1 min)',
        'Pour in eggs and gently stir with spatula',
        'When almost set, sprinkle cheese and fold',
        'Serve immediately while hot and fluffy'
      ]
    },
    {
      id: 'b5',
      name: 'Banana Pancake Stack',
      image: '🥞',
      prepTime: 20,
      servings: 2,
      summary: 'Fluffy homemade pancakes with mashed banana folded into the batter. Topped with fresh fruit and a drizzle of pure maple syrup.',
      nutritionLabel: 'Comfort Food',
      calories: 410,
      protein: 8,
      carbs: 72,
      fat: 11,
      tags: ['vegetarian', 'family-friendly'],
      ingredients: [
        { item: 'All-purpose flour', amount: '1 cup', aisle: 'Pantry' },
        { item: 'Banana', amount: '1 ripe', aisle: 'Produce' },
        { item: 'Milk', amount: '3/4 cup', aisle: 'Dairy' },
        { item: 'Egg', amount: '1 large', aisle: 'Dairy' },
        { item: 'Baking powder', amount: '2 tsp', aisle: 'Pantry' },
        { item: 'Maple syrup', amount: '2 tbsp', aisle: 'Pantry' },
        { item: 'Butter', amount: '2 tbsp', aisle: 'Dairy' }
      ],
      steps: [
        'Mash banana in a large bowl until smooth',
        'Add egg and milk, whisk to combine',
        'Mix in flour and baking powder until just combined (lumps okay!)',
        'Heat buttered griddle or pan over medium heat',
        'Pour 1/4 cup batter per pancake, cook until bubbles form',
        'Flip and cook other side until golden (1-2 min)',
        'Stack and serve with butter and maple syrup'
      ]
    },
    {
      id: 'b6',
      name: 'Mediterranean Breakfast Wrap',
      image: '🌯',
      prepTime: 12,
      servings: 1,
      summary: 'Warm tortilla filled with scrambled eggs, feta cheese, sun-dried tomatoes, and fresh spinach. A taste of the Mediterranean sun!',
      nutritionLabel: 'Balanced Energy',
      calories: 370,
      protein: 16,
      carbs: 32,
      fat: 19,
      tags: ['vegetarian', 'quick', 'mediterranean'],
      ingredients: [
        { item: 'Large flour tortilla', amount: '1', aisle: 'Bakery' },
        { item: 'Eggs', amount: '2 large', aisle: 'Dairy' },
        { item: 'Feta cheese', amount: '2 tbsp crumbled', aisle: 'Dairy' },
        { item: 'Sun-dried tomatoes', amount: '2 tbsp', aisle: 'Pantry' },
        { item: 'Baby spinach', amount: '1/2 cup', aisle: 'Produce' },
        { item: 'Olive oil', amount: '1 tsp', aisle: 'Pantry' }
      ],
      steps: [
        'Warm tortilla in dry pan or microwave for 15 seconds',
        'Scramble eggs in olive oil over medium heat',
        'Layer spinach on warm tortilla',
        'Add scrambled eggs, feta, and sun-dried tomatoes',
        'Fold bottom up, then sides in, and roll tightly',
        'Cut in half diagonally and serve'
      ]
    },
    {
      id: 'b7',
      name: 'Protein Power Parfait',
      image: '🍨',
      prepTime: 5,
      servings: 1,
      summary: 'Layers of creamy Greek yogurt, crunchy granola, and fresh berries. Simple, satisfying, and packed with protein to keep you going.',
      nutritionLabel: 'High Protein',
      calories: 330,
      protein: 20,
      carbs: 46,
      fat: 8,
      tags: ['vegetarian', 'quick', 'gluten-free'],
      ingredients: [
        { item: 'Greek yogurt', amount: '1 cup', aisle: 'Dairy' },
        { item: 'Granola', amount: '1/3 cup', aisle: 'Pantry' },
        { item: 'Mixed berries', amount: '1/2 cup', aisle: 'Produce' },
        { item: 'Honey', amount: '1 tbsp', aisle: 'Pantry' },
        { item: 'Sliced almonds', amount: '1 tbsp', aisle: 'Pantry' }
      ],
      steps: [
        'Add half the yogurt to a glass or bowl',
        'Layer half the granola and berries',
        'Repeat with remaining yogurt, granola, and berries',
        'Drizzle honey on top',
        'Sprinkle with sliced almonds and serve'
      ]
    },
    {
      id: 'b8',
      name: 'Sweet Potato Hash',
      image: '🍠',
      prepTime: 25,
      servings: 2,
      summary: 'Crispy cubed sweet potatoes with onions, peppers, and a fried egg on top. Hearty, wholesome, and absolutely delicious.',
      nutritionLabel: 'Complex Carbs',
      calories: 350,
      protein: 11,
      carbs: 52,
      fat: 14,
      tags: ['vegetarian', 'gluten-free', 'family-friendly'],
      ingredients: [
        { item: 'Sweet potato', amount: '1 large', aisle: 'Produce' },
        { item: 'Bell pepper', amount: '1/2 cup diced', aisle: 'Produce' },
        { item: 'Onion', amount: '1/2 diced', aisle: 'Produce' },
        { item: 'Egg', amount: '2 large', aisle: 'Dairy' },
        { item: 'Olive oil', amount: '1 tbsp', aisle: 'Pantry' }
      ],
      steps: [
        'Dice sweet potato into small cubes',
        'Heat oil in a skillet over medium-high heat',
        'Cook sweet potato and onion 15 min until crispy',
        'Add bell pepper and cook 3 more minutes',
        'Push hash to side and fry eggs to preference',
        'Season and serve hot'
      ]
    }
  ],
  lunch: [],
  dinner: []
};

export const getAllRecipes = () => [
  ...(RECIPES.breakfast || []),
  ...(RECIPES.lunch || []),
  ...(RECIPES.dinner || [])
];

export const getRecipeById = (id) =>
  getAllRecipes().find(r => r.id === id) || null;

// prefs: array of tag strings (e.g. ['vegetarian', 'quick'])
// usedIds: array of recipe IDs already in the current plan (for deduplication)
export const getRandomRecipe = (type, prefs = [], usedIds = []) => {
  let pool = type ? (RECIPES[type] || []) : getAllRecipes();
  if (!pool.length) return null;

  // Prefer recipes not already in the plan
  const fresh = pool.filter(r => !usedIds.includes(r.id));
  if (fresh.length > 0) pool = fresh;

  // Soft-filter by preference tags — fall back to full pool if too restrictive
  if (prefs.length > 0) {
    const prefFiltered = pool.filter(r => r.tags?.some(t => prefs.includes(t)));
    if (prefFiltered.length > 0) pool = prefFiltered;
  }

  return pool[Math.floor(Math.random() * pool.length)];
};

export const normalizeDBRecipe = (r) => {
  if (!r) return null;
  return {
    id: r.id || `db_${Date.now()}`,
    name: r.name || r.title || 'Unknown',
    image: r.image || '',
    prepTime: r.prepTime || r.prep_time || 30,
    servings: r.servings || 2,
    summary: r.summary || r.description || '',
    nutritionLabel: r.nutritionLabel || r.nutrition_label || 'Balanced',
    calories: r.calories || 400,
    protein: r.protein || 20,
    carbs: r.carbs || 40,
    fat: r.fat || 15,
    tags: r.tags || [],
    ingredients: r.ingredients || [],
    steps: r.steps || r.instructions || [],
    source_url: r.source_url || '',
    video_url: r.video_url || '',
    video_title: r.video_title || r.name || '',
    meal_type: r.meal_type || 'dinner',
    skipped: false,
  };
};

export const normalizeWeeklyPlan = (plan) => {
  if (!plan) return null;
  if (Array.isArray(plan)) {
    return Object.fromEntries(plan
      .filter(dayPlan => dayPlan?.day)
      .map(dayPlan => [dayPlan.day, {
        breakfast: dayPlan.breakfast || null,
        lunch: dayPlan.lunch || null,
        dinner: dayPlan.dinner || null,
      }]));
  }
  if (plan.days) return normalizeWeeklyPlan(plan.days);
  return Object.fromEntries(DAYS.map(day => [day, {
    breakfast: plan[day]?.breakfast || null,
    lunch: plan[day]?.lunch || null,
    dinner: plan[day]?.dinner || null,
  }]));
};

export const planToDayArray = (plan) => {
  const normalized = normalizeWeeklyPlan(plan) || {};
  return DAYS.map(day => ({ day, ...(normalized[day] || {}) }));
};

export const generateWeeklyPlan = (dietaryPrefs = [], cuisinePrefs = []) => {
  const prefs = [...dietaryPrefs, ...cuisinePrefs];
  const usedIds = [];
  return Object.fromEntries(DAYS.map(day => {
    const breakfast = getRandomRecipe('breakfast', prefs, usedIds) || getRandomRecipe('breakfast');
    if (breakfast) usedIds.push(breakfast.id);
    const lunch = getRandomRecipe('lunch', prefs, usedIds) || getRandomRecipe('lunch');
    if (lunch) usedIds.push(lunch.id);
    const dinner = getRandomRecipe('dinner', prefs, usedIds) || getRandomRecipe('dinner');
    if (dinner) usedIds.push(dinner.id);
    return [day, { breakfast, lunch, dinner }];
  }));
};

export const generateWeeklyPlanFromDBRecipes = (recipes, preferences = []) => {
  if (!recipes?.length) return generateWeeklyPlan();

  // Soft-filter by preference tags — fall back to all recipes if too few remain
  const filtered = preferences.length > 0
    ? recipes.filter(r => r.tags?.some(t => preferences.includes(t)))
    : recipes;
  const pool = filtered.length >= 3 ? filtered : recipes;

  const byType = {
    breakfast: pool.filter(r => r.meal_type === 'breakfast'),
    lunch: pool.filter(r => r.meal_type === 'lunch'),
    dinner: pool.filter(r => r.meal_type === 'dinner'),
  };

  const usedIds = [];
  const pick = (type) => {
    const typePool = byType[type].length ? byType[type] : pool;
    const fresh = typePool.filter(r => !usedIds.includes(r.id));
    const source = fresh.length > 0 ? fresh : typePool;
    return source[Math.floor(Math.random() * source.length)];
  };

  return Object.fromEntries(DAYS.map(day => {
    const breakfast = pick('breakfast');
    if (breakfast) usedIds.push(breakfast.id);
    const lunch = pick('lunch');
    if (lunch) usedIds.push(lunch.id);
    const dinner = pick('dinner');
    if (dinner) usedIds.push(dinner.id);
    return [day, { breakfast, lunch, dinner }];
  }));
};

// servings parameter is accepted for API consistency; per-ingredient amount
// scaling requires parsing fractional strings and is left for a future pass.
export const compileGroceryList = (weekPlan, _servings) => {
  if (!weekPlan) return {};
  const itemMap = {};
  planToDayArray(weekPlan).forEach(dayPlan => {
    MEAL_TYPES.forEach(t => {
      if (dayPlan[t]?.skipped) return;
      (dayPlan[t]?.ingredients || []).forEach(ing => {
        const key = ing.item?.toLowerCase();
        if (!key) return;
        if (!itemMap[key]) itemMap[key] = { ...ing, checked: false, count: 1 };
        else itemMap[key].count += 1;
      });
    });
  });
  const aisleMap = {};
  Object.values(itemMap).forEach(item => {
    const aisle = item.aisle || 'Pantry';
    if (!aisleMap[aisle]) aisleMap[aisle] = [];
    aisleMap[aisle].push(item);
  });
  return aisleMap;
};
