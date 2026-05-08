// MealMate Recipe Database — breakfast, lunch, and dinner fallback recipes.
// The CSV database at /public/recipes-db.json is merged in at runtime via loadRecipesDB().
// Functions here are designed for a smooth future migration to Google AI Studios:
// preferences/filters are first-class params so the AI can slot in without refactoring.

let _dbLoadPromise = null;
export const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
export const MEAL_TYPES = ['breakfast','lunch','dinner'];

// Fetch /recipes-db.json once and merge into RECIPES in-place.
// All sync functions (getAllRecipes, getRecipeById, etc.) see the data afterwards.
export const loadRecipesDB = () => {
  if (_dbLoadPromise) return _dbLoadPromise;
  _dbLoadPromise = fetch('/recipes-db.json')
    .then(r => r.json())
    .then(db => {
      if (db.breakfast?.length) RECIPES.breakfast = [...RECIPES.breakfast, ...db.breakfast];
      if (db.lunch?.length)     RECIPES.lunch    = [...RECIPES.lunch,    ...db.lunch];
      if (db.dinner?.length)    RECIPES.dinner   = [...RECIPES.dinner,   ...db.dinner];
    })
    .catch(e => console.warn('Could not load recipes-db.json:', e));
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
        { item: 'Eggs', amount: '2 large', aisle: 'Dairy' },
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
  lunch: [
    {
      id: 'l1',
      name: 'Mediterranean Quinoa Bowl',
      image: '🥗',
      prepTime: 20,
      servings: 2,
      summary: 'Fluffy quinoa topped with cucumber, cherry tomatoes, Kalamata olives, and feta, drizzled with lemon-herb vinaigrette.',
      nutritionLabel: 'Balanced Energy',
      calories: 420,
      protein: 16,
      carbs: 54,
      fat: 17,
      tags: ['vegetarian', 'gluten-free', 'mediterranean'],
      ingredients: [
        { item: 'Quinoa', amount: '1 cup dry', aisle: 'Pantry' },
        { item: 'Cucumber', amount: '1 medium', aisle: 'Produce' },
        { item: 'Cherry tomatoes', amount: '1 cup', aisle: 'Produce' },
        { item: 'Kalamata olives', amount: '1/4 cup', aisle: 'Pantry' },
        { item: 'Feta cheese', amount: '1/2 cup crumbled', aisle: 'Dairy' },
        { item: 'Lemon juice', amount: '2 tbsp', aisle: 'Produce' },
        { item: 'Olive oil', amount: '2 tbsp', aisle: 'Pantry' },
        { item: 'Fresh parsley', amount: '1/4 cup', aisle: 'Produce' }
      ],
      steps: [
        'Cook quinoa according to package directions, let cool',
        'Dice cucumber and halve cherry tomatoes',
        'Toss quinoa with cucumber, tomatoes, and olives',
        'Whisk lemon juice and olive oil together',
        'Drizzle dressing over bowl and top with feta and parsley'
      ]
    },
    {
      id: 'l2',
      name: 'Grilled Chicken Caesar Wrap',
      image: '🌯',
      prepTime: 15,
      servings: 2,
      summary: 'Tender grilled chicken, crisp romaine lettuce, shaved Parmesan, and creamy Caesar dressing folded into a warm tortilla.',
      nutritionLabel: 'High Protein',
      calories: 480,
      protein: 38,
      carbs: 34,
      fat: 20,
      tags: ['quick'],
      ingredients: [
        { item: 'Chicken breast', amount: '2 pieces', aisle: 'Proteins' },
        { item: 'Large flour tortilla', amount: '2', aisle: 'Bakery' },
        { item: 'Romaine lettuce', amount: '2 cups shredded', aisle: 'Produce' },
        { item: 'Parmesan cheese', amount: '1/4 cup shaved', aisle: 'Dairy' },
        { item: 'Caesar dressing', amount: '3 tbsp', aisle: 'Pantry' },
        { item: 'Olive oil', amount: '1 tbsp', aisle: 'Pantry' },
        { item: 'Salt & pepper', amount: 'to taste', aisle: 'Pantry' }
      ],
      steps: [
        'Season chicken with salt, pepper, and olive oil',
        'Grill or pan-sear 6-7 min per side until cooked through',
        'Slice chicken into strips',
        'Warm tortillas in a dry pan for 30 seconds',
        'Layer lettuce, chicken, Parmesan, and Caesar dressing',
        'Roll tightly and cut in half diagonally'
      ]
    },
    {
      id: 'l3',
      name: 'Spicy Lentil Soup',
      image: '🍲',
      prepTime: 30,
      servings: 4,
      summary: 'Warming red lentil soup with cumin, turmeric, and a squeeze of lemon. Hearty, plant-based, and budget-friendly.',
      nutritionLabel: 'Fiber Rich',
      calories: 290,
      protein: 18,
      carbs: 48,
      fat: 4,
      tags: ['vegetarian', 'vegan', 'gluten-free', 'budget'],
      ingredients: [
        { item: 'Red lentils', amount: '1.5 cups', aisle: 'Pantry' },
        { item: 'Onion', amount: '1 large diced', aisle: 'Produce' },
        { item: 'Garlic', amount: '3 cloves minced', aisle: 'Produce' },
        { item: 'Tomato', amount: '2 large diced', aisle: 'Produce' },
        { item: 'Vegetable broth', amount: '4 cups', aisle: 'Pantry' },
        { item: 'Olive oil', amount: '2 tbsp', aisle: 'Pantry' },
        { item: 'Lemon juice', amount: '2 tbsp', aisle: 'Produce' },
        { item: 'Cumin', amount: '1.5 tsp', aisle: 'Pantry' }
      ],
      steps: [
        'Sauté onion in olive oil over medium heat until golden (5 min)',
        'Add garlic, cumin, and cook 1 more minute',
        'Add tomatoes and cook until softened (3 min)',
        'Add lentils and broth; bring to a boil',
        'Reduce heat and simmer 20 min until lentils are tender',
        'Stir in lemon juice, season and serve'
      ]
    },
    {
      id: 'l4',
      name: 'Asian Sesame Noodle Salad',
      image: '🍜',
      prepTime: 20,
      servings: 2,
      summary: 'Cold soba noodles tossed with shredded cabbage, edamame, and a rich sesame-ginger dressing. Light yet satisfying.',
      nutritionLabel: 'Balanced Energy',
      calories: 390,
      protein: 14,
      carbs: 58,
      fat: 12,
      tags: ['vegetarian', 'asian', 'quick'],
      ingredients: [
        { item: 'Soba noodles', amount: '200g', aisle: 'Pantry' },
        { item: 'Napa cabbage', amount: '2 cups shredded', aisle: 'Produce' },
        { item: 'Edamame', amount: '1 cup shelled', aisle: 'Seafood' },
        { item: 'Green onions', amount: '3 stalks', aisle: 'Produce' },
        { item: 'Sesame oil', amount: '2 tbsp', aisle: 'Pantry' },
        { item: 'Soy sauce', amount: '3 tbsp', aisle: 'Pantry' },
        { item: 'Fresh ginger', amount: '1 tsp grated', aisle: 'Produce' },
        { item: 'Sesame seeds', amount: '1 tbsp', aisle: 'Pantry' }
      ],
      steps: [
        'Cook soba noodles per package; rinse under cold water',
        'Whisk sesame oil, soy sauce, and ginger together',
        'Toss noodles with cabbage, edamame, and dressing',
        'Garnish with green onions and sesame seeds',
        'Chill 10 min before serving for best flavor'
      ]
    },
    {
      id: 'l5',
      name: 'Turkey & Avocado Club Sandwich',
      image: '🥪',
      prepTime: 10,
      servings: 1,
      summary: 'Stacked whole grain toast with roasted turkey, creamy avocado, crispy bacon, tomato, and a smear of Dijon mustard.',
      nutritionLabel: 'High Protein',
      calories: 530,
      protein: 34,
      carbs: 36,
      fat: 26,
      tags: ['quick'],
      ingredients: [
        { item: 'Whole grain bread', amount: '3 slices', aisle: 'Bakery' },
        { item: 'Turkey breast slices', amount: '100g', aisle: 'Proteins' },
        { item: 'Avocado', amount: '1/2 ripe', aisle: 'Produce' },
        { item: 'Bacon', amount: '2 strips cooked', aisle: 'Proteins' },
        { item: 'Tomato', amount: '2 slices', aisle: 'Produce' },
        { item: 'Lettuce', amount: '2 leaves', aisle: 'Produce' },
        { item: 'Dijon mustard', amount: '1 tsp', aisle: 'Pantry' },
        { item: 'Mayo', amount: '1 tbsp', aisle: 'Pantry' }
      ],
      steps: [
        'Toast all three bread slices',
        'Mash avocado with a pinch of salt',
        'Spread mayo on one slice, mustard on another',
        'Layer turkey, lettuce, tomato on bottom slice',
        'Add middle toast, then avocado and bacon',
        'Top with final slice, skewer with toothpick and cut diagonally'
      ]
    },
    {
      id: 'l6',
      name: 'Chickpea & Spinach Stew',
      image: '🫘',
      prepTime: 25,
      servings: 3,
      summary: 'Hearty canned chickpeas simmered with tomatoes, spinach, and warm spices. A nourishing one-pot meal ready in under 30 minutes.',
      nutritionLabel: 'Plant Power',
      calories: 340,
      protein: 15,
      carbs: 46,
      fat: 9,
      tags: ['vegetarian', 'vegan', 'gluten-free', 'budget'],
      ingredients: [
        { item: 'Chickpeas (canned)', amount: '2 cans', aisle: 'Pantry' },
        { item: 'Spinach', amount: '3 cups', aisle: 'Produce' },
        { item: 'Tomato', amount: '2 large diced', aisle: 'Produce' },
        { item: 'Onion', amount: '1 medium diced', aisle: 'Produce' },
        { item: 'Garlic', amount: '3 cloves', aisle: 'Produce' },
        { item: 'Olive oil', amount: '2 tbsp', aisle: 'Pantry' },
        { item: 'Vegetable broth', amount: '1 cup', aisle: 'Pantry' },
        { item: 'Cumin', amount: '1 tsp', aisle: 'Pantry' }
      ],
      steps: [
        'Sauté onion and garlic in oil until softened',
        'Add cumin and stir 30 seconds',
        'Add tomatoes and cook until they break down (5 min)',
        'Add chickpeas and broth; simmer 10 min',
        'Stir in spinach until wilted',
        'Season with salt and pepper; serve with crusty bread'
      ]
    },
    {
      id: 'l7',
      name: 'Caprese Pasta Salad',
      image: '🍝',
      prepTime: 20,
      servings: 2,
      summary: 'Al dente penne tossed with fresh mozzarella, cherry tomatoes, and fragrant basil. A classic Italian combination that never disappoints.',
      nutritionLabel: 'Comfort Food',
      calories: 450,
      protein: 17,
      carbs: 60,
      fat: 16,
      tags: ['vegetarian', 'mediterranean'],
      ingredients: [
        { item: 'Pasta', amount: '200g', aisle: 'Pantry' },
        { item: 'Fresh mozzarella', amount: '125g', aisle: 'Dairy' },
        { item: 'Cherry tomatoes', amount: '1 cup halved', aisle: 'Produce' },
        { item: 'Fresh basil', amount: '1/2 cup', aisle: 'Produce' },
        { item: 'Olive oil', amount: '3 tbsp', aisle: 'Pantry' },
        { item: 'Lemon juice', amount: '1 tbsp', aisle: 'Produce' },
        { item: 'Salt & pepper', amount: 'to taste', aisle: 'Pantry' }
      ],
      steps: [
        'Cook pasta al dente; drain and cool under cold water',
        'Tear mozzarella into bite-sized pieces',
        'Toss pasta with tomatoes, mozzarella, and basil',
        'Dress with olive oil and lemon juice',
        'Season well and serve at room temperature'
      ]
    },
    {
      id: 'l8',
      name: 'Teriyaki Salmon Rice Bowl',
      image: '🍱',
      prepTime: 25,
      servings: 2,
      summary: 'Glazed salmon over steamed jasmine rice with crisp broccoli and a sweet-savory teriyaki drizzle. A weekday crowd-pleaser.',
      nutritionLabel: 'Omega-3 Rich',
      calories: 520,
      protein: 36,
      carbs: 55,
      fat: 18,
      tags: ['gluten-free', 'asian'],
      ingredients: [
        { item: 'Salmon fillets', amount: '2 pieces', aisle: 'Seafood' },
        { item: 'Brown rice', amount: '1 cup dry', aisle: 'Pantry' },
        { item: 'Broccoli florets', amount: '2 cups', aisle: 'Produce' },
        { item: 'Soy sauce', amount: '3 tbsp', aisle: 'Pantry' },
        { item: 'Honey', amount: '2 tbsp', aisle: 'Pantry' },
        { item: 'Sesame oil', amount: '1 tsp', aisle: 'Pantry' },
        { item: 'Garlic', amount: '1 clove minced', aisle: 'Produce' }
      ],
      steps: [
        'Cook rice according to package directions',
        'Whisk soy sauce, honey, sesame oil, and garlic for teriyaki sauce',
        'Marinate salmon in half the sauce for 10 min',
        'Steam broccoli 4 min until tender-crisp',
        'Pan-sear salmon 4 min per side, basting with sauce',
        'Serve salmon and broccoli over rice, drizzle with remaining sauce'
      ]
    }
  ],
  dinner: [
    {
      id: 'd1',
      name: 'One-Pan Herb Roast Chicken',
      image: '🍗',
      prepTime: 45,
      servings: 4,
      summary: 'Golden roasted chicken thighs nestled among root vegetables with garlic, rosemary, and thyme. Classic comfort food at its finest.',
      nutritionLabel: 'High Protein',
      calories: 490,
      protein: 42,
      carbs: 22,
      fat: 26,
      tags: ['gluten-free', 'family-friendly'],
      ingredients: [
        { item: 'Chicken thighs', amount: '4 bone-in', aisle: 'Proteins' },
        { item: 'Sweet potato', amount: '2 medium cubed', aisle: 'Produce' },
        { item: 'Carrots', amount: '3 large sliced', aisle: 'Produce' },
        { item: 'Onion', amount: '1 large wedged', aisle: 'Produce' },
        { item: 'Garlic', amount: '5 cloves', aisle: 'Produce' },
        { item: 'Olive oil', amount: '3 tbsp', aisle: 'Pantry' },
        { item: 'Fresh basil', amount: '1 tbsp chopped', aisle: 'Produce' },
        { item: 'Salt & pepper', amount: 'to taste', aisle: 'Pantry' }
      ],
      steps: [
        'Preheat oven to 220°C (425°F)',
        'Toss vegetables with half the oil, salt, and pepper',
        'Rub chicken with remaining oil and herbs, season well',
        'Arrange vegetables in baking dish, nestle chicken on top',
        'Roast 35-40 min until chicken is golden and cooked through',
        'Rest 5 min before serving'
      ]
    },
    {
      id: 'd2',
      name: 'Creamy Garlic Pasta',
      image: '🍝',
      prepTime: 25,
      servings: 3,
      summary: 'Silky pasta tossed in a rich Parmesan cream sauce with golden garlic and fresh parsley. Ready in under 30 minutes.',
      nutritionLabel: 'Comfort Food',
      calories: 560,
      protein: 19,
      carbs: 68,
      fat: 24,
      tags: ['vegetarian', 'quick'],
      ingredients: [
        { item: 'Pasta', amount: '300g', aisle: 'Pantry' },
        { item: 'Heavy cream', amount: '1 cup', aisle: 'Dairy' },
        { item: 'Parmesan cheese', amount: '1/2 cup grated', aisle: 'Dairy' },
        { item: 'Garlic', amount: '4 cloves minced', aisle: 'Produce' },
        { item: 'Butter', amount: '2 tbsp', aisle: 'Dairy' },
        { item: 'Fresh parsley', amount: '1/4 cup', aisle: 'Produce' },
        { item: 'Salt & pepper', amount: 'to taste', aisle: 'Pantry' }
      ],
      steps: [
        'Cook pasta in salted water until al dente; reserve 1/2 cup pasta water',
        'Melt butter over medium heat and sauté garlic 1-2 min until golden',
        'Pour in cream and simmer 3 min until slightly thickened',
        'Add Parmesan and stir until melted and smooth',
        'Toss pasta in sauce, adding pasta water to loosen as needed',
        'Finish with parsley and serve immediately'
      ]
    },
    {
      id: 'd3',
      name: 'Beef & Vegetable Stir-Fry',
      image: '🥘',
      prepTime: 20,
      servings: 3,
      summary: 'Tender strips of beef with crisp broccoli, snap peas, and carrots in a savory oyster-ginger sauce. Serve over fluffy rice.',
      nutritionLabel: 'High Protein',
      calories: 440,
      protein: 34,
      carbs: 40,
      fat: 14,
      tags: ['asian', 'quick'],
      ingredients: [
        { item: 'Chicken breast', amount: '400g sliced thin', aisle: 'Proteins' },
        { item: 'Broccoli florets', amount: '2 cups', aisle: 'Produce' },
        { item: 'Snap peas', amount: '1 cup', aisle: 'Produce' },
        { item: 'Carrots', amount: '2 sliced', aisle: 'Produce' },
        { item: 'Brown rice', amount: '1.5 cups dry', aisle: 'Pantry' },
        { item: 'Soy sauce', amount: '3 tbsp', aisle: 'Pantry' },
        { item: 'Fresh ginger', amount: '1 tbsp grated', aisle: 'Produce' },
        { item: 'Sesame oil', amount: '2 tsp', aisle: 'Pantry' }
      ],
      steps: [
        'Cook rice per package directions',
        'Whisk soy sauce, ginger, and sesame oil for sauce',
        'Heat wok or large pan until very hot',
        'Stir-fry chicken 4-5 min until cooked; remove',
        'Add vegetables and stir-fry 3-4 min until tender-crisp',
        'Return chicken, add sauce, toss 1 min and serve over rice'
      ]
    },
    {
      id: 'd4',
      name: 'Shakshuka',
      image: '🍳',
      prepTime: 30,
      servings: 2,
      summary: 'Eggs poached in a spiced tomato and pepper sauce. An aromatic North African dish perfect for any meal of the day.',
      nutritionLabel: 'Balanced Energy',
      calories: 310,
      protein: 18,
      carbs: 26,
      fat: 16,
      tags: ['vegetarian', 'gluten-free', 'mediterranean'],
      ingredients: [
        { item: 'Eggs', amount: '4 large', aisle: 'Dairy' },
        { item: 'Tomato', amount: '4 large diced', aisle: 'Produce' },
        { item: 'Bell pepper', amount: '1 large diced', aisle: 'Produce' },
        { item: 'Onion', amount: '1 medium diced', aisle: 'Produce' },
        { item: 'Garlic', amount: '3 cloves', aisle: 'Produce' },
        { item: 'Olive oil', amount: '2 tbsp', aisle: 'Pantry' },
        { item: 'Cumin', amount: '1 tsp', aisle: 'Pantry' },
        { item: 'Feta cheese', amount: '2 tbsp', aisle: 'Dairy' }
      ],
      steps: [
        'Sauté onion and bell pepper in oil until soft (5 min)',
        'Add garlic and cumin; cook 1 min',
        'Add tomatoes with their juices; simmer 10 min until sauce thickens',
        'Make wells in sauce and crack in eggs',
        'Cover and cook 6-8 min until whites are set but yolks are still runny',
        'Crumble feta on top and serve with crusty bread'
      ]
    },
    {
      id: 'd5',
      name: 'Lemon Herb Baked Salmon',
      image: '🐟',
      prepTime: 25,
      servings: 2,
      summary: 'Flaky salmon baked with lemon, dill, and garlic. Served alongside roasted asparagus for an elegant yet effortless dinner.',
      nutritionLabel: 'Omega-3 Rich',
      calories: 430,
      protein: 40,
      carbs: 12,
      fat: 26,
      tags: ['gluten-free', 'quick'],
      ingredients: [
        { item: 'Salmon fillets', amount: '2 large', aisle: 'Seafood' },
        { item: 'Asparagus', amount: '1 bunch trimmed', aisle: 'Produce' },
        { item: 'Lemon', amount: '1 sliced', aisle: 'Produce' },
        { item: 'Garlic', amount: '2 cloves minced', aisle: 'Produce' },
        { item: 'Fresh dill', amount: '2 tbsp', aisle: 'Produce' },
        { item: 'Olive oil', amount: '2 tbsp', aisle: 'Pantry' },
        { item: 'Salt & pepper', amount: 'to taste', aisle: 'Pantry' }
      ],
      steps: [
        'Preheat oven to 200°C (400°F)',
        'Place salmon on a lined baking sheet',
        'Mix garlic, dill, olive oil; spread over salmon',
        'Arrange asparagus alongside and drizzle with oil',
        'Top salmon with lemon slices',
        'Bake 15-18 min until salmon flakes easily'
      ]
    },
    {
      id: 'd6',
      name: 'Black Bean Tacos',
      image: '🌮',
      prepTime: 20,
      servings: 2,
      summary: 'Crispy corn tortillas loaded with spiced black beans, crunchy red cabbage slaw, avocado, and a lime crema. Weeknight magic.',
      nutritionLabel: 'Plant Power',
      calories: 470,
      protein: 17,
      carbs: 64,
      fat: 18,
      tags: ['vegetarian', 'vegan', 'quick'],
      ingredients: [
        { item: 'Black beans', amount: '2 cans', aisle: 'Pantry' },
        { item: 'Corn tortillas', amount: '8 small', aisle: 'Bakery' },
        { item: 'Red cabbage', amount: '1 cup shredded', aisle: 'Produce' },
        { item: 'Avocado', amount: '1 ripe', aisle: 'Produce' },
        { item: 'Lime', amount: '2 limes', aisle: 'Produce' },
        { item: 'Sour cream', amount: '1/4 cup', aisle: 'Dairy' },
        { item: 'Cumin', amount: '1.5 tsp', aisle: 'Pantry' },
        { item: 'Salsa', amount: '1/2 cup', aisle: 'Pantry' }
      ],
      steps: [
        'Drain and rinse beans; season with cumin and salt',
        'Warm beans in a pan 5 min with a splash of water',
        'Mix sour cream with juice of 1 lime for crema',
        'Shred cabbage and toss with remaining lime juice',
        'Warm tortillas over an open flame or in a dry pan',
        'Fill with beans, cabbage, avocado, crema, and salsa'
      ]
    },
    {
      id: 'd7',
      name: 'Pork Tenderloin with Couscous',
      image: '🥩',
      prepTime: 35,
      servings: 3,
      summary: 'Herb-crusted pork tenderloin roasted to juicy perfection, served with fluffy lemon couscous and roasted zucchini.',
      nutritionLabel: 'High Protein',
      calories: 510,
      protein: 44,
      carbs: 44,
      fat: 16,
      tags: ['gluten-free-optional'],
      ingredients: [
        { item: 'Pork tenderloin', amount: '600g', aisle: 'Proteins' },
        { item: 'Couscous', amount: '1.5 cups', aisle: 'Pantry' },
        { item: 'Zucchini', amount: '2 medium sliced', aisle: 'Produce' },
        { item: 'Lemon', amount: '1 juiced', aisle: 'Produce' },
        { item: 'Garlic', amount: '3 cloves minced', aisle: 'Produce' },
        { item: 'Olive oil', amount: '2 tbsp', aisle: 'Pantry' },
        { item: 'Fresh parsley', amount: '3 tbsp', aisle: 'Produce' }
      ],
      steps: [
        'Preheat oven to 200°C (400°F)',
        'Rub pork with garlic, oil, salt, and pepper',
        'Sear pork in an oven-safe pan 2 min per side until browned',
        'Transfer to oven and roast 20 min until internal temp is 63°C (145°F)',
        'Meanwhile, roast zucchini at same temperature for 20 min',
        'Prepare couscous with lemon juice; let rest and fluff with parsley',
        'Slice pork and serve over couscous with zucchini'
      ]
    },
    {
      id: 'd8',
      name: 'Shrimp Fried Rice',
      image: '🍚',
      prepTime: 25,
      servings: 3,
      summary: 'Wok-tossed jasmine rice with plump shrimp, peas, scrambled egg, and a hit of soy sauce. Better than takeout and ready in 25 minutes.',
      nutritionLabel: 'Balanced Energy',
      calories: 460,
      protein: 28,
      carbs: 58,
      fat: 12,
      tags: ['asian', 'quick'],
      ingredients: [
        { item: 'Large shrimp', amount: '300g peeled', aisle: 'Seafood' },
        { item: 'Brown rice', amount: '2 cups cooked', aisle: 'Pantry' },
        { item: 'Eggs', amount: '2 large', aisle: 'Dairy' },
        { item: 'Green onions', amount: '4 stalks', aisle: 'Produce' },
        { item: 'Soy sauce', amount: '3 tbsp', aisle: 'Pantry' },
        { item: 'Sesame oil', amount: '1 tbsp', aisle: 'Pantry' },
        { item: 'Garlic', amount: '2 cloves minced', aisle: 'Produce' },
        { item: 'Fresh ginger', amount: '1 tsp grated', aisle: 'Produce' }
      ],
      steps: [
        'Use day-old rice for best results (spread fresh rice to cool first)',
        'Season shrimp with salt and pepper',
        'Stir-fry shrimp in hot oil 2 min per side; set aside',
        'Scramble eggs in same pan; remove',
        'Add garlic, ginger, and rice; stir-fry 3 min until rice is lightly crispy',
        'Add soy sauce, sesame oil, shrimp, eggs, and green onions; toss and serve'
      ]
    }
  ]
};

export const getAllRecipes = () => [
  ...(RECIPES.breakfast || []),
  ...(RECIPES.lunch || []),
  ...(RECIPES.dinner || [])
];

export const getRecipeById = (id) =>
  getAllRecipes().find(r => r.id === id) || null;

// Returns a random recipe from the given type pool, optionally filtered by
// preferences and avoiding already-used recipe IDs. Falls back across types
// if the filtered pool is empty.
export const getRandomRecipe = (type, preferences = [], usedIds = []) => {
  const normalizedPrefs = preferences.map(p => p.toLowerCase());

  const scoreRecipe = (recipe) => {
    if (!normalizedPrefs.length) return 1;
    const tags = (recipe.tags || []).map(t => t.toLowerCase());
    return normalizedPrefs.some(p => tags.includes(p)) ? 2 : 1;
  };

  const buildPool = (recipes) => {
    const unused = recipes.filter(r => !usedIds.includes(r.id));
    // Prefer unused; fall back to full pool if all used
    return unused.length ? unused : recipes;
  };

  const pickFromPool = (pool) => {
    if (!pool.length) return null;
    // Weighted random: recipes matching preferences get 2× weight
    const weighted = pool.flatMap(r => Array(scoreRecipe(r)).fill(r));
    return weighted[Math.floor(Math.random() * weighted.length)];
  };

  if (type) {
    const typed = buildPool(RECIPES[type] || []);
    const pick = pickFromPool(typed);
    if (pick) return pick;
  }

  // Fallback: any recipe type
  return pickFromPool(buildPool(getAllRecipes()));
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

// Generates a weekly plan from the static recipe pools, respecting preferences.
// All params forwarded so callers don't need to change their signatures when
// switching to an AI-backed generator later.
export const generateWeeklyPlan = (dietaryPrefs = [], cuisinePrefs = [], _budget, _servings) => {
  const preferences = [...dietaryPrefs, ...cuisinePrefs];
  const usedIds = [];

  const pick = (type) => {
    const recipe = getRandomRecipe(type, preferences, usedIds);
    if (recipe) usedIds.push(recipe.id);
    return recipe;
  };

  return Object.fromEntries(DAYS.map(day => [day, {
    breakfast: pick('breakfast'),
    lunch: pick('lunch'),
    dinner: pick('dinner'),
  }]));
};

export const generateWeeklyPlanFromDBRecipes = (recipes, preferences = []) => {
  if (!recipes?.length) return generateWeeklyPlan(preferences);
  const byType = {
    breakfast: recipes.filter(r => r.meal_type === 'breakfast'),
    lunch: recipes.filter(r => r.meal_type === 'lunch'),
    dinner: recipes.filter(r => r.meal_type === 'dinner'),
  };
  const usedIds = [];
  const pick = (type) => {
    const pool = byType[type].length ? byType[type] : recipes;
    const unused = pool.filter(r => !usedIds.includes(r.id));
    const source = unused.length ? unused : pool;
    const recipe = source[Math.floor(Math.random() * source.length)];
    if (recipe) usedIds.push(recipe.id);
    return recipe;
  };
  return Object.fromEntries(DAYS.map(day => [day, {
    breakfast: pick('breakfast'),
    lunch: pick('lunch'),
    dinner: pick('dinner'),
  }]));
};

// Compiles an aisle-keyed grocery list from a weekly plan.
// The servings param is kept for signature compatibility — ingredient text
// amounts come from recipe data; callers that scale quantities should do so
// in the recipe layer before calling this.
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
