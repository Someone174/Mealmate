// MealMate Recipe Database — hardcoded starter set (expanded in-place by loadRecipesDB)

let _dbLoadPromise = null;

// Fetch /recipes-db.json once and merge into RECIPES in-place.
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
      nutritionLabel: 'Balanced Energy',
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

  lunch: [
    {
      id: 'l1',
      name: 'Mediterranean Chickpea Bowl',
      image: '🥙',
      prepTime: 15,
      servings: 2,
      summary: 'A vibrant bowl of seasoned chickpeas over fluffy quinoa with cucumber, tomatoes, olives, and creamy tahini dressing.',
      nutritionLabel: 'Plant Power',
      calories: 420,
      protein: 18,
      carbs: 58,
      fat: 14,
      tags: ['vegetarian', 'gluten-free', 'mediterranean', 'budget'],
      ingredients: [
        { item: 'Chickpeas (canned)', amount: '1 can (400g)', aisle: 'Pantry' },
        { item: 'Quinoa', amount: '1/2 cup dry', aisle: 'Pantry' },
        { item: 'Cucumber', amount: '1 medium', aisle: 'Produce' },
        { item: 'Cherry tomatoes', amount: '1 cup', aisle: 'Produce' },
        { item: 'Kalamata olives', amount: '1/4 cup', aisle: 'Pantry' },
        { item: 'Feta cheese', amount: '50g crumbled', aisle: 'Dairy' },
        { item: 'Tahini', amount: '2 tbsp', aisle: 'Pantry' },
        { item: 'Lemon juice', amount: '2 tbsp', aisle: 'Produce' },
        { item: 'Olive oil', amount: '1 tbsp', aisle: 'Pantry' }
      ],
      steps: [
        'Cook quinoa according to package directions and let cool slightly',
        'Drain and rinse chickpeas, then toss with olive oil and cumin',
        'Dice cucumber and halve cherry tomatoes',
        'Whisk tahini with lemon juice and 2 tbsp water until smooth',
        'Divide quinoa into bowls, top with chickpeas, veggies, and olives',
        'Drizzle tahini dressing and crumble feta on top'
      ]
    },
    {
      id: 'l2',
      name: 'Chicken Caesar Lettuce Wraps',
      image: '🥬',
      prepTime: 20,
      servings: 2,
      summary: 'Crispy grilled chicken strips in crunchy romaine boats with classic Caesar dressing, shaved parmesan, and whole-grain croutons.',
      nutritionLabel: 'High Protein',
      calories: 380,
      protein: 34,
      carbs: 18,
      fat: 20,
      tags: ['gluten-free', 'quick', 'low-carb'],
      ingredients: [
        { item: 'Chicken breast', amount: '300g', aisle: 'Proteins' },
        { item: 'Romaine lettuce', amount: '1 head', aisle: 'Produce' },
        { item: 'Parmesan cheese', amount: '30g shaved', aisle: 'Dairy' },
        { item: 'Olive oil', amount: '2 tbsp', aisle: 'Pantry' },
        { item: 'Garlic', amount: '2 cloves', aisle: 'Produce' },
        { item: 'Lemon juice', amount: '1 tbsp', aisle: 'Produce' },
        { item: 'Dijon mustard', amount: '1 tsp', aisle: 'Pantry' },
        { item: 'Salt & pepper', amount: 'to taste', aisle: 'Pantry' }
      ],
      steps: [
        'Slice chicken breast into thin strips, season with salt and pepper',
        'Grill or pan-fry chicken in olive oil for 5-6 min until cooked through',
        'Whisk together lemon juice, Dijon, garlic, and olive oil for dressing',
        'Separate romaine leaves into natural "boats"',
        'Fill each leaf with chicken strips, drizzle dressing, add parmesan',
        'Serve immediately while chicken is warm'
      ]
    },
    {
      id: 'l3',
      name: 'Red Lentil & Spinach Soup',
      image: '🍲',
      prepTime: 30,
      servings: 4,
      summary: 'A warming, hearty soup of red lentils simmered with turmeric, cumin, and fresh spinach. Comforting, budget-friendly, and deeply nutritious.',
      nutritionLabel: 'Fiber Rich',
      calories: 310,
      protein: 19,
      carbs: 48,
      fat: 5,
      tags: ['vegetarian', 'gluten-free', 'budget', 'family-friendly'],
      ingredients: [
        { item: 'Red lentils', amount: '1 cup dry', aisle: 'Pantry' },
        { item: 'Spinach', amount: '2 cups', aisle: 'Produce' },
        { item: 'Onion', amount: '1 large diced', aisle: 'Produce' },
        { item: 'Garlic', amount: '3 cloves', aisle: 'Produce' },
        { item: 'Fresh ginger', amount: '1 tsp grated', aisle: 'Produce' },
        { item: 'Vegetable broth', amount: '4 cups', aisle: 'Pantry' },
        { item: 'Coconut milk', amount: '1/2 cup', aisle: 'Pantry' },
        { item: 'Olive oil', amount: '1 tbsp', aisle: 'Pantry' },
        { item: 'Lemon juice', amount: '1 tbsp', aisle: 'Produce' }
      ],
      steps: [
        'Sauté onion in olive oil over medium heat until golden (5 min)',
        'Add garlic and ginger, cook 1 minute until fragrant',
        'Stir in turmeric and cumin, cook 30 seconds',
        'Add lentils and broth, bring to a boil then simmer 20 min until soft',
        'Stir in coconut milk and spinach, cook until wilted',
        'Finish with lemon juice, season and serve with warm bread'
      ]
    },
    {
      id: 'l4',
      name: 'Tuna & Avocado Salad',
      image: '🥗',
      prepTime: 10,
      servings: 2,
      summary: 'A light and satisfying salad of albacore tuna, ripe avocado, cucumber, and mixed greens tossed in a zesty lemon-herb dressing.',
      nutritionLabel: 'Omega Rich',
      calories: 340,
      protein: 26,
      carbs: 12,
      fat: 22,
      tags: ['gluten-free', 'quick', 'low-carb', 'high-protein'],
      ingredients: [
        { item: 'Tuna (canned in water)', amount: '2 cans (160g each)', aisle: 'Pantry' },
        { item: 'Avocado', amount: '1 ripe', aisle: 'Produce' },
        { item: 'Cucumber', amount: '1 medium', aisle: 'Produce' },
        { item: 'Mixed salad greens', amount: '3 cups', aisle: 'Produce' },
        { item: 'Cherry tomatoes', amount: '1/2 cup halved', aisle: 'Produce' },
        { item: 'Red onion', amount: '1/4 thinly sliced', aisle: 'Produce' },
        { item: 'Olive oil', amount: '2 tbsp', aisle: 'Pantry' },
        { item: 'Lemon juice', amount: '2 tbsp', aisle: 'Produce' },
        { item: 'Fresh parsley', amount: '2 tbsp', aisle: 'Produce' }
      ],
      steps: [
        'Drain tuna and flake into a large bowl',
        'Dice avocado and cucumber into bite-sized pieces',
        'Arrange greens in serving bowls',
        'Whisk olive oil, lemon juice, salt, and pepper for dressing',
        'Top greens with tuna, avocado, cucumber, tomatoes, and onion',
        'Drizzle dressing and garnish with fresh parsley'
      ]
    },
    {
      id: 'l5',
      name: 'Quinoa Power Bowl',
      image: '🥦',
      prepTime: 25,
      servings: 2,
      summary: 'Roasted sweet potato and broccoli over protein-rich quinoa with a creamy peanut-lime sauce. Meal prep friendly and incredibly filling.',
      nutritionLabel: 'Balanced Energy',
      calories: 460,
      protein: 16,
      carbs: 62,
      fat: 18,
      tags: ['vegetarian', 'gluten-free', 'budget'],
      ingredients: [
        { item: 'Quinoa', amount: '3/4 cup dry', aisle: 'Pantry' },
        { item: 'Sweet potato', amount: '1 large cubed', aisle: 'Produce' },
        { item: 'Broccoli florets', amount: '2 cups', aisle: 'Produce' },
        { item: 'Chickpeas (canned)', amount: '1 can drained', aisle: 'Pantry' },
        { item: 'Olive oil', amount: '2 tbsp', aisle: 'Pantry' },
        { item: 'Soy sauce', amount: '1 tbsp', aisle: 'Pantry' },
        { item: 'Sesame oil', amount: '1 tsp', aisle: 'Pantry' },
        { item: 'Lemon juice', amount: '1 tbsp', aisle: 'Produce' },
        { item: 'Sesame seeds', amount: '1 tbsp', aisle: 'Pantry' }
      ],
      steps: [
        'Preheat oven to 200°C. Toss sweet potato and broccoli with olive oil, roast 20 min',
        'Cook quinoa in 1.5 cups water until fluffy',
        'Roast chickpeas tossed with soy sauce alongside the veggies (last 10 min)',
        'Whisk sesame oil, soy sauce, and lemon juice into a sauce',
        'Build bowls: quinoa base, topped with roasted veggies and chickpeas',
        'Drizzle sauce and sprinkle sesame seeds to serve'
      ]
    },
    {
      id: 'l6',
      name: 'Caprese Panini',
      image: '🥪',
      prepTime: 12,
      servings: 2,
      summary: 'Pressed ciabatta loaded with fresh mozzarella, vine-ripened tomatoes, fragrant basil, and a balsamic glaze. Italian elegance in every bite.',
      nutritionLabel: 'Balanced Energy',
      calories: 430,
      protein: 20,
      carbs: 46,
      fat: 18,
      tags: ['vegetarian', 'quick', 'italian', 'mediterranean'],
      ingredients: [
        { item: 'Ciabatta bread', amount: '1 loaf (4 slices)', aisle: 'Bakery' },
        { item: 'Fresh mozzarella', amount: '150g sliced', aisle: 'Dairy' },
        { item: 'Tomato', amount: '2 medium sliced', aisle: 'Produce' },
        { item: 'Fresh basil', amount: '1/4 cup leaves', aisle: 'Produce' },
        { item: 'Olive oil', amount: '1 tbsp', aisle: 'Pantry' },
        { item: 'Balsamic glaze', amount: '1 tbsp', aisle: 'Pantry' },
        { item: 'Salt & pepper', amount: 'to taste', aisle: 'Pantry' }
      ],
      steps: [
        'Slice ciabatta and brush lightly with olive oil',
        'Layer mozzarella and tomato on bottom halves',
        'Season with salt, pepper, and tear fresh basil leaves on top',
        'Close sandwich and press in a panini press or skillet with weight',
        'Cook 3-4 min until bread is golden and cheese is melted',
        'Drizzle balsamic glaze, slice and serve hot'
      ]
    },
    {
      id: 'l7',
      name: 'Thai Peanut Noodle Salad',
      image: '🍜',
      prepTime: 20,
      servings: 3,
      summary: 'Chilled rice noodles tossed in a bold peanut-lime sauce with shredded carrots, cucumber, edamame, and fresh herbs.',
      nutritionLabel: 'Balanced Energy',
      calories: 440,
      protein: 15,
      carbs: 62,
      fat: 16,
      tags: ['vegetarian', 'asian', 'budget'],
      ingredients: [
        { item: 'Rice noodles', amount: '200g', aisle: 'Pantry' },
        { item: 'Edamame', amount: '1 cup shelled', aisle: 'Frozen' },
        { item: 'Carrots', amount: '2 medium shredded', aisle: 'Produce' },
        { item: 'Cucumber', amount: '1 medium julienned', aisle: 'Produce' },
        { item: 'Green onions', amount: '3 stalks', aisle: 'Produce' },
        { item: 'Fresh cilantro', amount: '1/4 cup', aisle: 'Produce' },
        { item: 'Soy sauce', amount: '3 tbsp', aisle: 'Pantry' },
        { item: 'Sesame oil', amount: '2 tsp', aisle: 'Pantry' },
        { item: 'Rice vinegar', amount: '2 tbsp', aisle: 'Pantry' },
        { item: 'Sesame seeds', amount: '1 tbsp', aisle: 'Pantry' }
      ],
      steps: [
        'Cook rice noodles per package, rinse under cold water to stop cooking',
        'Thaw edamame and shred carrots and cucumber',
        'Whisk together soy sauce, sesame oil, and rice vinegar into dressing',
        'Toss noodles with vegetables and dressing until well coated',
        'Garnish with sliced green onions, cilantro, and sesame seeds',
        'Serve immediately or refrigerate up to 2 days'
      ]
    }
  ],

  dinner: [
    {
      id: 'd1',
      name: 'Baked Lemon Herb Salmon',
      image: '🐟',
      prepTime: 25,
      servings: 2,
      summary: 'Flaky oven-baked salmon fillets marinated in lemon, garlic, and fresh herbs, served alongside roasted asparagus.',
      nutritionLabel: 'Omega Rich',
      calories: 420,
      protein: 40,
      carbs: 12,
      fat: 24,
      tags: ['gluten-free', 'high-protein', 'low-carb'],
      ingredients: [
        { item: 'Salmon fillets', amount: '2 fillets (180g each)', aisle: 'Seafood' },
        { item: 'Asparagus', amount: '200g trimmed', aisle: 'Produce' },
        { item: 'Lemon', amount: '1 sliced', aisle: 'Produce' },
        { item: 'Garlic', amount: '3 cloves minced', aisle: 'Produce' },
        { item: 'Fresh dill', amount: '2 tbsp', aisle: 'Produce' },
        { item: 'Olive oil', amount: '2 tbsp', aisle: 'Pantry' },
        { item: 'Salt & pepper', amount: 'to taste', aisle: 'Pantry' }
      ],
      steps: [
        'Preheat oven to 200°C. Line a baking tray with foil',
        'Place salmon and asparagus on tray, drizzle with olive oil',
        'Mix garlic and dill, spread over salmon',
        'Lay lemon slices on top, season generously',
        'Bake 15-18 minutes until salmon flakes easily with a fork',
        'Serve immediately with a wedge of lemon'
      ]
    },
    {
      id: 'd2',
      name: 'One-Pan Chicken & Vegetables',
      image: '🍗',
      prepTime: 40,
      servings: 4,
      summary: 'Juicy chicken thighs roasted with colorful Mediterranean vegetables in one pan. Minimal cleanup, maximum flavor.',
      nutritionLabel: 'Balanced Energy',
      calories: 380,
      protein: 32,
      carbs: 22,
      fat: 18,
      tags: ['gluten-free', 'family-friendly'],
      ingredients: [
        { item: 'Chicken thighs', amount: '4 bone-in', aisle: 'Proteins' },
        { item: 'Zucchini', amount: '2 medium sliced', aisle: 'Produce' },
        { item: 'Bell pepper', amount: '2 sliced', aisle: 'Produce' },
        { item: 'Cherry tomatoes', amount: '1 cup', aisle: 'Produce' },
        { item: 'Garlic', amount: '4 cloves whole', aisle: 'Produce' },
        { item: 'Olive oil', amount: '3 tbsp', aisle: 'Pantry' },
        { item: 'Fresh basil', amount: '1/4 cup', aisle: 'Produce' },
        { item: 'Salt & pepper', amount: 'to taste', aisle: 'Pantry' }
      ],
      steps: [
        'Preheat oven to 220°C',
        'Toss all vegetables with olive oil, salt, and pepper in a large roasting pan',
        'Season chicken thighs with salt, pepper, and paprika',
        'Nestle chicken skin-side up among the vegetables',
        'Roast for 35-40 minutes until chicken skin is golden and cooked through',
        'Scatter fresh basil leaves and serve from the pan'
      ]
    },
    {
      id: 'd3',
      name: 'Creamy Vegetable Curry',
      image: '🍛',
      prepTime: 35,
      servings: 4,
      summary: 'A rich, fragrant curry of sweet potato, chickpeas, and spinach in a silky coconut-tomato sauce. Perfect over steamed basmati rice.',
      nutritionLabel: 'Plant Power',
      calories: 390,
      protein: 14,
      carbs: 54,
      fat: 16,
      tags: ['vegetarian', 'gluten-free', 'indian', 'budget', 'family-friendly'],
      ingredients: [
        { item: 'Sweet potato', amount: '2 medium cubed', aisle: 'Produce' },
        { item: 'Chickpeas (canned)', amount: '1 can (400g)', aisle: 'Pantry' },
        { item: 'Spinach', amount: '2 cups', aisle: 'Produce' },
        { item: 'Coconut milk', amount: '1 can (400ml)', aisle: 'Pantry' },
        { item: 'Tomato', amount: '2 diced', aisle: 'Produce' },
        { item: 'Onion', amount: '1 large diced', aisle: 'Produce' },
        { item: 'Garlic', amount: '3 cloves', aisle: 'Produce' },
        { item: 'Fresh ginger', amount: '1 tbsp grated', aisle: 'Produce' },
        { item: 'Olive oil', amount: '2 tbsp', aisle: 'Pantry' },
        { item: 'Brown rice', amount: '1.5 cups dry', aisle: 'Pantry' }
      ],
      steps: [
        'Cook brown rice according to package directions',
        'Sauté onion in oil until golden, add garlic and ginger for 1 min',
        'Stir in curry powder and cook 30 seconds until fragrant',
        'Add sweet potato, tomatoes, and chickpeas, stir to coat in spices',
        'Pour in coconut milk, simmer 20 min until sweet potato is tender',
        'Stir in spinach until wilted, season to taste, serve over rice'
      ]
    },
    {
      id: 'd4',
      name: 'Beef & Broccoli Stir-Fry',
      image: '🥩',
      prepTime: 25,
      servings: 3,
      summary: 'Tender strips of beef and crisp broccoli in a savory ginger-soy glaze. A takeout classic made fresh at home in under 30 minutes.',
      nutritionLabel: 'High Protein',
      calories: 410,
      protein: 38,
      carbs: 28,
      fat: 16,
      tags: ['asian', 'quick', 'high-protein'],
      ingredients: [
        { item: 'Beef sirloin', amount: '400g thinly sliced', aisle: 'Proteins' },
        { item: 'Broccoli florets', amount: '3 cups', aisle: 'Produce' },
        { item: 'Garlic', amount: '3 cloves minced', aisle: 'Produce' },
        { item: 'Fresh ginger', amount: '1 tbsp grated', aisle: 'Produce' },
        { item: 'Soy sauce', amount: '4 tbsp', aisle: 'Pantry' },
        { item: 'Sesame oil', amount: '2 tsp', aisle: 'Pantry' },
        { item: 'Brown rice', amount: '1 cup dry', aisle: 'Pantry' },
        { item: 'Sesame seeds', amount: '1 tsp', aisle: 'Pantry' },
        { item: 'Green onions', amount: '3 stalks', aisle: 'Produce' }
      ],
      steps: [
        'Cook brown rice according to package directions',
        'Marinate beef in 2 tbsp soy sauce for 10 min',
        'Blanch broccoli in boiling water for 2 min, drain and set aside',
        'Heat a wok or large skillet until smoking hot, sear beef 2-3 min',
        'Add garlic, ginger, and broccoli, stir-fry 2 min',
        'Pour in remaining soy sauce and sesame oil, toss well',
        'Serve over rice, garnished with sesame seeds and green onions'
      ]
    },
    {
      id: 'd5',
      name: 'Pasta Primavera',
      image: '🍝',
      prepTime: 30,
      servings: 4,
      summary: 'Al dente pasta tossed with seasonal vegetables in a light garlic-olive oil sauce with fresh parmesan. Simple Italian comfort food at its best.',
      nutritionLabel: 'Balanced Energy',
      calories: 460,
      protein: 16,
      carbs: 72,
      fat: 14,
      tags: ['vegetarian', 'italian', 'budget', 'family-friendly'],
      ingredients: [
        { item: 'Pasta', amount: '400g penne or fusilli', aisle: 'Pantry' },
        { item: 'Zucchini', amount: '1 medium sliced', aisle: 'Produce' },
        { item: 'Bell pepper', amount: '2 sliced', aisle: 'Produce' },
        { item: 'Cherry tomatoes', amount: '1.5 cups halved', aisle: 'Produce' },
        { item: 'Spinach', amount: '2 cups', aisle: 'Produce' },
        { item: 'Garlic', amount: '4 cloves sliced', aisle: 'Produce' },
        { item: 'Olive oil', amount: '4 tbsp', aisle: 'Pantry' },
        { item: 'Parmesan cheese', amount: '60g grated', aisle: 'Dairy' },
        { item: 'Fresh basil', amount: '1/3 cup', aisle: 'Produce' }
      ],
      steps: [
        'Cook pasta in salted boiling water until al dente, reserve 1 cup pasta water',
        'Sauté garlic in olive oil over medium heat until golden (2 min)',
        'Add zucchini and peppers, cook 5 min until slightly tender',
        'Add cherry tomatoes and cook 3 min until they burst',
        'Toss in pasta and spinach with a splash of pasta water',
        'Remove from heat, stir in basil and parmesan, season and serve'
      ]
    },
    {
      id: 'd6',
      name: 'Shrimp Tacos with Mango Slaw',
      image: '🌮',
      prepTime: 25,
      servings: 3,
      summary: 'Smoky seasoned shrimp in warm corn tortillas with a bright mango-cabbage slaw and avocado crema. Fresh and festive.',
      nutritionLabel: 'Light & Fresh',
      calories: 370,
      protein: 28,
      carbs: 38,
      fat: 12,
      tags: ['gluten-free', 'mexican', 'quick'],
      ingredients: [
        { item: 'Large shrimp', amount: '400g peeled', aisle: 'Seafood' },
        { item: 'Corn tortillas', amount: '8-10 small', aisle: 'Bakery' },
        { item: 'Red cabbage', amount: '2 cups shredded', aisle: 'Produce' },
        { item: 'Mango', amount: '1 ripe diced', aisle: 'Produce' },
        { item: 'Avocado', amount: '1 ripe', aisle: 'Produce' },
        { item: 'Lime', amount: '2', aisle: 'Produce' },
        { item: 'Fresh cilantro', amount: '1/4 cup', aisle: 'Produce' },
        { item: 'Olive oil', amount: '1 tbsp', aisle: 'Pantry' },
        { item: 'Sour cream', amount: '3 tbsp', aisle: 'Dairy' }
      ],
      steps: [
        'Toss shrimp with cumin, chili powder, lime zest, salt, and olive oil',
        'Cook shrimp in a hot skillet 2 min per side until pink and curled',
        'Combine shredded cabbage, mango, and chopped cilantro for slaw',
        'Mash avocado with sour cream and lime juice for crema',
        'Warm tortillas in a dry skillet for 30 seconds each side',
        'Build tacos: crema base, shrimp, slaw, extra cilantro and lime'
      ]
    },
    {
      id: 'd7',
      name: 'Chickpea & Sweet Potato Stew',
      image: '🥘',
      prepTime: 35,
      servings: 4,
      summary: 'A soul-warming North African inspired stew of chickpeas, sweet potato, and kale in fragrant spiced tomato broth.',
      nutritionLabel: 'Plant Power',
      calories: 360,
      protein: 15,
      carbs: 56,
      fat: 10,
      tags: ['vegetarian', 'gluten-free', 'budget', 'middle-eastern', 'family-friendly'],
      ingredients: [
        { item: 'Chickpeas (canned)', amount: '2 cans (400g each)', aisle: 'Pantry' },
        { item: 'Sweet potato', amount: '2 medium cubed', aisle: 'Produce' },
        { item: 'Baby spinach', amount: '2 cups', aisle: 'Produce' },
        { item: 'Tomato', amount: '2 large diced', aisle: 'Produce' },
        { item: 'Onion', amount: '1 large diced', aisle: 'Produce' },
        { item: 'Garlic', amount: '3 cloves', aisle: 'Produce' },
        { item: 'Vegetable broth', amount: '2 cups', aisle: 'Pantry' },
        { item: 'Olive oil', amount: '2 tbsp', aisle: 'Pantry' },
        { item: 'Lemon juice', amount: '2 tbsp', aisle: 'Produce' },
        { item: 'Pita bread', amount: '4 pieces', aisle: 'Bakery' }
      ],
      steps: [
        'Sauté onion in olive oil 5 min, add garlic and cook 1 min more',
        'Add cumin, coriander, and smoked paprika, stir 30 seconds',
        'Add sweet potato, tomatoes, chickpeas, and broth',
        'Bring to a boil, then simmer 20 min until sweet potato is tender',
        'Stir in spinach until wilted, squeeze in lemon juice',
        'Season to taste and serve with warm pita bread'
      ]
    }
  ]
};

// ── Helpers ───────────────────────────────────────────────────────────────────

export const getAllRecipes = () => [
  ...(RECIPES.breakfast || []),
  ...(RECIPES.lunch || []),
  ...(RECIPES.dinner || [])
];

export const getRecipeById = (id) =>
  getAllRecipes().find(r => r.id === id) || null;

/** Returns a random recipe of the given type, skipping any IDs in excludeIds. */
export const getRandomRecipe = (type, _prefs = [], excludeIds = []) => {
  const pool = type ? (RECIPES[type] || []) : getAllRecipes();
  const available = excludeIds.length ? pool.filter(r => !excludeIds.includes(r.id)) : pool;
  const source = available.length ? available : pool;
  if (!source.length) return null;
  return source[Math.floor(Math.random() * source.length)];
};

/**
 * Normalise a recipe from the scraped DB or TheMealDB into our standard shape.
 * Also ensures nutritionLabel is always one of the valid values.
 */
const VALID_NUTRITION_LABELS = [
  'High Protein', 'Light & Fresh', 'Comfort Food', 'Plant Power',
  'Balanced Energy', 'Fiber Rich', 'Omega Rich', 'Low Carb'
];

export const normalizeDBRecipe = (r) => {
  if (!r) return null;
  const rawLabel = r.nutritionLabel || r.nutrition_label || '';
  const nutritionLabel = VALID_NUTRITION_LABELS.includes(rawLabel)
    ? rawLabel
    : 'Balanced Energy';
  return {
    id: r.id || `db_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    name: r.name || r.title || 'Unknown Recipe',
    image: r.image || '🍽️',
    prepTime: r.prepTime || r.prep_time || 30,
    servings: r.servings || 2,
    summary: r.summary || r.description || '',
    nutritionLabel,
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

/**
 * Converts any stored or incoming plan shape into the canonical weekly object:
 *   { Monday: { breakfast, lunch, dinner }, Tuesday: { ... }, ... }
 */
export const normalizePlanFormat = (plan) => {
  if (!plan) return null;

  // Already in correct object-keyed-by-day format
  if (!Array.isArray(plan) && typeof plan === 'object' && !plan.days) {
    const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    if (DAYS.some(d => plan[d])) return plan;
  }

  // AI response format: { days: [{ day, breakfast, lunch, dinner }, ...] }
  if (plan.days && Array.isArray(plan.days)) {
    const result = {};
    plan.days.forEach(d => {
      if (d.day) result[d.day] = { breakfast: d.breakfast, lunch: d.lunch, dinner: d.dinner };
    });
    return Object.keys(result).length ? result : null;
  }

  // Old array format: [{ day, breakfast, lunch, dinner }, ...]
  if (Array.isArray(plan)) {
    const result = {};
    plan.forEach(d => {
      if (d.day) result[d.day] = { breakfast: d.breakfast, lunch: d.lunch, dinner: d.dinner };
    });
    return Object.keys(result).length ? result : null;
  }

  return plan;
};

/**
 * Generate a canonical weekly plan object keyed by day name.
 * Uses the in-memory RECIPES store (populated by loadRecipesDB).
 */
export const generateWeeklyPlan = () => {
  const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const usedIds = [];
  const plan = {};
  DAYS.forEach(day => {
    const breakfast = getRandomRecipe('breakfast', [], usedIds);
    if (breakfast) usedIds.push(breakfast.id);
    const lunch = getRandomRecipe('lunch', [], usedIds);
    if (lunch) usedIds.push(lunch.id);
    const dinner = getRandomRecipe('dinner', [], usedIds);
    if (dinner) usedIds.push(dinner.id);
    plan[day] = { breakfast, lunch, dinner };
  });
  return plan;
};

/**
 * Generate a weekly plan from a flat array of scraped DB recipes.
 * Falls back to generateWeeklyPlan() if the array is empty.
 */
export const generateWeeklyPlanFromDBRecipes = (recipes, _preferences = []) => {
  if (!recipes?.length) return generateWeeklyPlan();
  const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const byType = {
    breakfast: recipes.filter(r => r.meal_type === 'breakfast'),
    lunch:     recipes.filter(r => r.meal_type === 'lunch'),
    dinner:    recipes.filter(r => r.meal_type === 'dinner'),
  };
  const usedIds = [];
  const pick = (type) => {
    const pool = byType[type].length ? byType[type] : recipes;
    const available = usedIds.length ? pool.filter(r => !usedIds.includes(r.id)) : pool;
    const source = available.length ? available : pool;
    return source[Math.floor(Math.random() * source.length)];
  };
  const plan = {};
  DAYS.forEach(day => {
    const breakfast = pick('breakfast');
    const lunch = pick('lunch');
    const dinner = pick('dinner');
    if (breakfast) usedIds.push(breakfast.id);
    if (lunch) usedIds.push(lunch.id);
    if (dinner) usedIds.push(dinner.id);
    plan[day] = { breakfast, lunch, dinner };
  });
  return plan;
};

/**
 * Compile a grocery list from a weekly plan.
 * Accepts the canonical { Monday: { breakfast, lunch, dinner }, ... } object.
 * Skips meals that have been marked as skipped.
 * Returns { [aisle]: [{ item, amount, aisle, checked, count }] }
 */
export const compileGroceryList = (weekPlan) => {
  if (!weekPlan) return {};
  const dayMeals = Array.isArray(weekPlan)
    ? weekPlan
    : Object.values(weekPlan);

  const itemMap = {};
  dayMeals.forEach(dayPlan => {
    ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
      const meal = dayPlan[mealType];
      if (!meal || meal.skipped) return;
      (meal.ingredients || []).forEach(ing => {
        const key = ing.item?.toLowerCase()?.trim();
        if (!key) return;
        if (!itemMap[key]) {
          itemMap[key] = { ...ing, checked: false, count: 1 };
        } else {
          itemMap[key].count += 1;
        }
      });
    });
  });

  const AISLE_ORDER = ['Produce', 'Proteins', 'Seafood', 'Dairy', 'Bakery', 'Pantry', 'Frozen', 'Deli'];
  const aisleMap = {};
  Object.values(itemMap).forEach(item => {
    const aisle = item.aisle || 'Pantry';
    if (!aisleMap[aisle]) aisleMap[aisle] = [];
    aisleMap[aisle].push(item);
  });

  // Sort aisles into store-logical order
  const sorted = {};
  AISLE_ORDER.forEach(a => { if (aisleMap[a]) sorted[a] = aisleMap[a]; });
  Object.keys(aisleMap).forEach(a => { if (!sorted[a]) sorted[a] = aisleMap[a]; });
  return sorted;
};
