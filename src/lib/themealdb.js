const BASE = 'https://www.themealdb.com/api/json/v1/1';

const _cache = new Map();

// Core fetch helper with session-level in-memory cache
const mdbFetch = async (path) => {
  if (_cache.has(path)) return _cache.get(path);
  const res = await fetch(`${BASE}${path}`);
  const data = await res.json();
  _cache.set(path, data);
  return data;
};

// Convert a raw MealDB meal into our app's recipe schema
export const normalizeMealDBRecipe = (meal, mealType = 'dinner') => {
  // Extract ingredients (MealDB stores them as strIngredient1..20)
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const item = meal[`strIngredient${i}`];
    const amount = meal[`strMeasure${i}`];
    if (item && item.trim()) {
      ingredients.push({ item: item.trim(), amount: (amount || '').trim(), aisle: 'Pantry' });
    }
  }

  // Convert instructions to steps array
  const steps = (meal.strInstructions || '')
    .split(/\r?\n/)
    .map(s => s.trim())
    .filter(s => s.length > 10);

  return {
    id: `mdb_${meal.idMeal}`,
    name: meal.strMeal,
    image: '🍽️',
    prepTime: 30,
    servings: 2,
    summary: `${meal.strArea || ''} ${meal.strCategory || ''} dish.`.trim(),
    nutritionLabel: meal.strCategory || 'Balanced',
    calories: 400,
    protein: 20,
    carbs: 40,
    fat: 15,
    tags: [
      meal.strArea?.toLowerCase(),
      meal.strCategory?.toLowerCase(),
    ].filter(Boolean),
    ingredients,
    steps,
    source_url: meal.strSource || '',
    video_url: meal.strYoutube || '',
    video_title: meal.strMeal,
    meal_type: mealType,
    skipped: false,
  };
};

export const TheMealDB = {
  // Search by name — returns array of raw meals
  searchByName: async (name) => {
    const data = await mdbFetch(`/search.php?s=${encodeURIComponent(name)}`);
    return data.meals || [];
  },

  // Get full details by ID
  lookupById: async (id) => {
    const data = await mdbFetch(`/lookup.php?i=${id}`);
    return data.meals ? data.meals[0] : null;
  },

  // Random single meal
  random: async () => {
    const data = await mdbFetch('/random.php');
    return data.meals ? data.meals[0] : null;
  },

  // Filter by category (returns lightweight list — no ingredients)
  filterByCategory: async (category) => {
    const data = await mdbFetch(`/filter.php?c=${encodeURIComponent(category)}`);
    return data.meals || [];
  },

  // Filter by area/cuisine
  filterByArea: async (area) => {
    const data = await mdbFetch(`/filter.php?a=${encodeURIComponent(area)}`);
    return data.meals || [];
  },

  // Filter by main ingredient
  filterByIngredient: async (ingredient) => {
    const data = await mdbFetch(`/filter.php?i=${encodeURIComponent(ingredient)}`);
    return data.meals || [];
  },

  // List all categories
  listCategories: async () => {
    const data = await mdbFetch('/categories.php');
    return data.categories || [];
  },

  // Fetch full details for a lightweight meal (has only idMeal + strMeal)
  getFullDetails: async (lightMeal) => {
    return TheMealDB.lookupById(lightMeal.idMeal);
  },

  // Build a small weekly pool — fetch 4-7 meals per type from TheMealDB
  // Uses a small set of categories so meals stay familiar / non-exotic
  buildWeeklyPool: async (preferences = []) => {
    // Breakfast-style categories from MealDB
    const BREAKFAST_SEARCHES = ['Breakfast', 'egg', 'pancake', 'oatmeal', 'toast'];
    const LUNCH_CATEGORIES = ['Pasta', 'Side', 'Vegetarian', 'Vegan', 'Seafood'];
    const DINNER_CATEGORIES = ['Chicken', 'Beef', 'Lamb', 'Seafood', 'Vegetarian'];

    const fetchPool = async (searches, isCategory = true, limit = 6) => {
      const pool = [];
      for (const term of searches) {
        if (pool.length >= limit) break;
        let meals = [];
        if (isCategory) {
          meals = await TheMealDB.filterByCategory(term).catch(() => []);
        } else {
          meals = await TheMealDB.searchByName(term).catch(() => []);
        }
        // Fetch up to 2 full-detail meals in parallel instead of sequentially
        const candidates = meals.slice(0, 2);
        const details = await Promise.all(
          candidates.map(m => TheMealDB.getFullDetails(m).catch(() => null))
        );
        for (const full of details) {
          if (pool.length >= limit) break;
          if (full) pool.push(full);
        }
      }
      return pool;
    };

    const [breakfastRaw, lunchRaw, dinnerRaw] = await Promise.all([
      fetchPool(BREAKFAST_SEARCHES, false, 5),
      fetchPool(LUNCH_CATEGORIES, true, 6),
      fetchPool(DINNER_CATEGORIES, true, 7),
    ]);

    return {
      breakfast: breakfastRaw.map(m => normalizeMealDBRecipe(m, 'breakfast')),
      lunch: lunchRaw.map(m => normalizeMealDBRecipe(m, 'lunch')),
      dinner: dinnerRaw.map(m => normalizeMealDBRecipe(m, 'dinner')),
    };
  },
};