// MealMate Local Storage Service - Handles all offline data persistence

const STORAGE_KEYS = {
  USERS: 'mealmate_users',
  CURRENT_USER: 'mealmate_current_user',
  MEAL_PLANS: 'mealmate_plans',
  FAVORITES: 'mealmate_favorites',
  GROCERY_LISTS: 'mealmate_grocery'
};

// Initialize demo data if not exists
export const initializeDemoData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    const demoUsers = {
      'demo': {
        username: 'demo',
        password: 'demo123',
        preferences: {
          dietary: ['vegetarian', 'quick'],
          servings: 2,
          weeklyBudget: 500,
          cuisines: ['mediterranean', 'asian']
        },
        createdAt: new Date().toISOString()
      }
    };
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(demoUsers));
  }
};

// User Management
export const createUser = (userData) => {
  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '{}');
  
  if (users[userData.username]) {
    return { success: false, error: 'Username taken! Try another.' };
  }
  
  users[userData.username] = {
    ...userData,
    createdAt: new Date().toISOString()
  };
  
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  return { success: true };
};

export const loginUser = (username, password) => {
  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '{}');
  const user = users[username];
  
  if (!user || user.password !== password) {
    return { success: false, error: 'Invalid username or password' };
  }
  
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, username);
  return { success: true, user };
};

export const logoutUser = () => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
};

export const getCurrentUser = () => {
  const username = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (!username) return null;
  
  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '{}');
  return users[username] ? { username, ...users[username] } : null;
};

export const updateUserPreferences = (username, preferences) => {
  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '{}');
  if (users[username]) {
    users[username].preferences = preferences;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return { success: true };
  }
  return { success: false };
};

// Meal Plan Management
export const saveMealPlan = (username, plan) => {
  const plans = JSON.parse(localStorage.getItem(STORAGE_KEYS.MEAL_PLANS) || '{}');
  plans[username] = {
    plan,
    updatedAt: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEYS.MEAL_PLANS, JSON.stringify(plans));
};

export const getMealPlan = (username) => {
  const plans = JSON.parse(localStorage.getItem(STORAGE_KEYS.MEAL_PLANS) || '{}');
  return plans[username]?.plan || null;
};

// Skip meal functionality
export const skipMeal = (username, day, mealType) => {
  const plans = JSON.parse(localStorage.getItem(STORAGE_KEYS.MEAL_PLANS) || '{}');
  if (plans[username] && plans[username].plan[day] && plans[username].plan[day][mealType]) {
    if (!plans[username].plan[day][mealType].skipped) {
      plans[username].plan[day][mealType] = {
        ...plans[username].plan[day][mealType],
        skipped: true
      };
      localStorage.setItem(STORAGE_KEYS.MEAL_PLANS, JSON.stringify(plans));
      return plans[username].plan;
    }
  }
  return null;
};

export const unskipMeal = (username, day, mealType) => {
  const plans = JSON.parse(localStorage.getItem(STORAGE_KEYS.MEAL_PLANS) || '{}');
  if (plans[username] && plans[username].plan[day] && plans[username].plan[day][mealType]) {
    delete plans[username].plan[day][mealType].skipped;
    localStorage.setItem(STORAGE_KEYS.MEAL_PLANS, JSON.stringify(plans));
    return plans[username].plan;
  }
  return null;
};

// Grocery List Management
export const saveGroceryList = (username, list) => {
  const lists = JSON.parse(localStorage.getItem(STORAGE_KEYS.GROCERY_LISTS) || '{}');
  lists[username] = list;
  localStorage.setItem(STORAGE_KEYS.GROCERY_LISTS, JSON.stringify(lists));
};

export const getGroceryList = (username) => {
  const lists = JSON.parse(localStorage.getItem(STORAGE_KEYS.GROCERY_LISTS) || '{}');
  return lists[username] || null;
};

export const toggleGroceryItem = (username, aisle, itemIndex) => {
  const lists = JSON.parse(localStorage.getItem(STORAGE_KEYS.GROCERY_LISTS) || '{}');
  if (lists[username] && lists[username][aisle] && lists[username][aisle][itemIndex]) {
    lists[username][aisle][itemIndex].checked = !lists[username][aisle][itemIndex].checked;
    localStorage.setItem(STORAGE_KEYS.GROCERY_LISTS, JSON.stringify(lists));
    return lists[username];
  }
  return null;
};

// Favorites Management
export const addFavorite = (username, recipeId) => {
  const favorites = JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES) || '{}');
  if (!favorites[username]) favorites[username] = [];
  if (!favorites[username].includes(recipeId)) {
    favorites[username].push(recipeId);
  }
  localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
};

export const removeFavorite = (username, recipeId) => {
  const favorites = JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES) || '{}');
  if (favorites[username]) {
    favorites[username] = favorites[username].filter(id => id !== recipeId);
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
  }
};

export const getFavorites = (username) => {
  const favorites = JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES) || '{}');
  return favorites[username] || [];
};

export const isFavorite = (username, recipeId) => {
  const favorites = getFavorites(username);
  return favorites.includes(recipeId);
};

// Subscription Plan Management
export const upgradePlan = (username, planId) => {
  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '{}');
  if (users[username]) {
    users[username].plan = planId;
    users[username].planUpdatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return { success: true };
  }
  return { success: false };
};

export const getUserPlan = (username) => {
  if (!username) return 'free';
  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '{}');
  return users[username]?.plan || 'free';
};

// Reset all demo data
export const resetAllData = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  initializeDemoData();
};

// Check if user is logged in
export const isLoggedIn = () => {
  return !!localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
};