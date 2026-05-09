// MealMate user/data service.
//
// Authentication + profile/plan are backed by Supabase when configured
// (VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY). Otherwise the app falls
// back to plain localStorage so local dev keeps working without keys.
//
// Per-user meal-plans / grocery lists / favorites are kept in localStorage
// keyed by the user's id (Supabase auth.user.id, or username in fallback
// mode) to avoid forcing a multi-table schema on day one. Adding cloud
// sync later is non-breaking — same function signatures.

import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const STORAGE_KEYS = {
  USERS: 'mealmate_users',                 // fallback only
  CURRENT_USER: 'mealmate_current_user',   // fallback only
  MEAL_PLANS: 'mealmate_plans',
  FAVORITES: 'mealmate_favorites',
  GROCERY_LISTS: 'mealmate_grocery',
  PLAN_HISTORY: 'mealmate_plan_history',
  CUSTOM_ITEMS: 'mealmate_custom_items',
  RECIPE_NOTES: 'mealmate_recipe_notes',
  RECIPE_RATINGS: 'mealmate_recipe_ratings'
};

// Maximum number of past weekly plans to keep per user.
const PLAN_HISTORY_LIMIT = 5;

// In-memory cache of the active user, populated by AuthContext on session
// changes so the synchronous getters used across the UI keep working.
let _currentUserCache = null;

export const setCurrentUserCache = (user) => {
  _currentUserCache = user;
};

const buildUserFromSupabase = (sbUser) => {
  if (!sbUser) return null;
  const meta = sbUser.user_metadata || {};
  return {
    id: sbUser.id,
    username: meta.username || sbUser.email?.split('@')[0] || 'user',
    email: sbUser.email,
    preferences: {
      dietary: meta.dietary || [],
      cuisines: meta.cuisines || [],
      servings: meta.servings ?? 2,
      weeklyBudget: meta.weeklyBudget ?? 500,
    },
    plan: meta.plan || 'free',
    createdAt: sbUser.created_at,
  };
};

// Storage key — Supabase user.id when authed, username in fallback.
const userKey = (user) => user?.id || user?.username || null;

// ---------------------------------------------------------------------------
// Demo data (fallback mode only)
// ---------------------------------------------------------------------------

export const initializeDemoData = () => {
  if (isSupabaseConfigured) return; // demo only relevant in fallback mode
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    const demoUsers = {
      demo: {
        username: 'demo',
        password: 'demo123',
        preferences: {
          dietary: ['vegetarian', 'quick'],
          servings: 2,
          weeklyBudget: 500,
          cuisines: ['mediterranean', 'asian'],
        },
        createdAt: new Date().toISOString(),
      },
    };
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(demoUsers));
  }
};

export const resetAllData = () => {
  if (!import.meta.env.DEV) return; // dev-only in production
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  initializeDemoData();
};

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export const createUser = async (userData) => {
  if (isSupabaseConfigured) {
    const email = userData.email || `${userData.username}@mealmate.local`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password: userData.password,
      options: {
        data: {
          username: userData.username,
          dietary: userData.preferences?.dietary || [],
          cuisines: userData.preferences?.cuisines || [],
          servings: userData.preferences?.servings ?? 2,
          weeklyBudget: userData.preferences?.weeklyBudget ?? 500,
          plan: 'free',
        },
      },
    });
    if (error) return { success: false, error: error.message };
    if (data?.user) setCurrentUserCache(buildUserFromSupabase(data.user));
    return { success: true };
  }

  // Fallback: localStorage
  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '{}');
  if (users[userData.username]) {
    return { success: false, error: 'Username taken! Try another.' };
  }
  users[userData.username] = { ...userData, createdAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  return { success: true };
};

export const loginUser = async (username, password) => {
  if (isSupabaseConfigured) {
    const email = username.includes('@') ? username : `${username}@mealmate.local`;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: 'Invalid email or password' };
    const user = buildUserFromSupabase(data.user);
    setCurrentUserCache(user);
    return { success: true, user };
  }

  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '{}');
  const user = users[username];
  if (!user || user.password !== password) {
    return { success: false, error: 'Invalid username or password' };
  }
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, username);
  return { success: true, user };
};

export const logoutUser = async () => {
  if (isSupabaseConfigured) {
    setCurrentUserCache(null);
    await supabase.auth.signOut();
    return;
  }
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
};

export const getCurrentUser = () => {
  if (isSupabaseConfigured) return _currentUserCache;
  const username = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (!username) return null;
  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '{}');
  return users[username] ? { username, ...users[username] } : null;
};

export const isLoggedIn = () => {
  if (isSupabaseConfigured) return Boolean(_currentUserCache);
  return Boolean(localStorage.getItem(STORAGE_KEYS.CURRENT_USER));
};

// ---------------------------------------------------------------------------
// Preferences + plan (live in Supabase user_metadata when configured)
// ---------------------------------------------------------------------------

export const updateUserPreferences = async (usernameOrId, preferences) => {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.auth.updateUser({
      data: {
        dietary: preferences.dietary || [],
        cuisines: preferences.cuisines || [],
        servings: preferences.servings ?? 2,
        weeklyBudget: preferences.weeklyBudget ?? 500,
      },
    });
    if (error) return { success: false, error: error.message };
    if (data?.user) setCurrentUserCache(buildUserFromSupabase(data.user));
    return { success: true };
  }

  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '{}');
  if (users[usernameOrId]) {
    users[usernameOrId].preferences = preferences;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return { success: true };
  }
  return { success: false };
};

export const getUserPlan = (usernameOrId) => {
  if (isSupabaseConfigured) return _currentUserCache?.plan || 'free';
  if (!usernameOrId) return 'free';
  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '{}');
  return users[usernameOrId]?.plan || 'free';
};

export const upgradePlan = async (usernameOrId, planId) => {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.auth.updateUser({
      data: { plan: planId, planUpdatedAt: new Date().toISOString() },
    });
    if (error) return { success: false, error: error.message };
    if (data?.user) setCurrentUserCache(buildUserFromSupabase(data.user));
    return { success: true };
  }

  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '{}');
  if (users[usernameOrId]) {
    users[usernameOrId].plan = planId;
    users[usernameOrId].planUpdatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return { success: true };
  }
  return { success: false };
};

// ---------------------------------------------------------------------------
// Meal plans (per-user localStorage; cloud sync arrives in a later phase)
// ---------------------------------------------------------------------------

const resolveKey = (usernameOrUser) => {
  if (typeof usernameOrUser === 'object') return userKey(usernameOrUser);
  if (isSupabaseConfigured) return userKey(_currentUserCache);
  return usernameOrUser;
};

export const saveMealPlan = (usernameOrUser, plan) => {
  const key = resolveKey(usernameOrUser);
  if (!key) return;
  const plans = JSON.parse(localStorage.getItem(STORAGE_KEYS.MEAL_PLANS) || '{}');
  plans[key] = { plan, updatedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEYS.MEAL_PLANS, JSON.stringify(plans));
};

export const getMealPlan = (usernameOrUser) => {
  const key = resolveKey(usernameOrUser);
  if (!key) return null;
  const plans = JSON.parse(localStorage.getItem(STORAGE_KEYS.MEAL_PLANS) || '{}');
  return plans[key]?.plan || null;
};

export const skipMeal = (usernameOrUser, day, mealType) => {
  const key = resolveKey(usernameOrUser);
  if (!key) return null;
  const plans = JSON.parse(localStorage.getItem(STORAGE_KEYS.MEAL_PLANS) || '{}');
  const meal = plans[key]?.plan?.[day]?.[mealType];
  if (meal && !meal.skipped) {
    plans[key].plan[day][mealType] = { ...meal, skipped: true };
    localStorage.setItem(STORAGE_KEYS.MEAL_PLANS, JSON.stringify(plans));
    return plans[key].plan;
  }
  return null;
};

export const unskipMeal = (usernameOrUser, day, mealType) => {
  const key = resolveKey(usernameOrUser);
  if (!key) return null;
  const plans = JSON.parse(localStorage.getItem(STORAGE_KEYS.MEAL_PLANS) || '{}');
  if (plans[key]?.plan?.[day]?.[mealType]) {
    delete plans[key].plan[day][mealType].skipped;
    localStorage.setItem(STORAGE_KEYS.MEAL_PLANS, JSON.stringify(plans));
    return plans[key].plan;
  }
  return null;
};

// ---------------------------------------------------------------------------
// Grocery list
// ---------------------------------------------------------------------------

export const saveGroceryList = (usernameOrUser, list) => {
  const key = resolveKey(usernameOrUser);
  if (!key) return;
  const lists = JSON.parse(localStorage.getItem(STORAGE_KEYS.GROCERY_LISTS) || '{}');
  lists[key] = list;
  localStorage.setItem(STORAGE_KEYS.GROCERY_LISTS, JSON.stringify(lists));
};

export const getGroceryList = (usernameOrUser) => {
  const key = resolveKey(usernameOrUser);
  if (!key) return null;
  const lists = JSON.parse(localStorage.getItem(STORAGE_KEYS.GROCERY_LISTS) || '{}');
  return lists[key] || null;
};

export const toggleGroceryItem = (usernameOrUser, aisle, itemIndex) => {
  const key = resolveKey(usernameOrUser);
  if (!key) return null;
  const lists = JSON.parse(localStorage.getItem(STORAGE_KEYS.GROCERY_LISTS) || '{}');
  const item = lists[key]?.[aisle]?.[itemIndex];
  if (item) {
    item.checked = !item.checked;
    localStorage.setItem(STORAGE_KEYS.GROCERY_LISTS, JSON.stringify(lists));
    return lists[key];
  }
  return null;
};

// ---------------------------------------------------------------------------
// Favorites
// ---------------------------------------------------------------------------

export const addFavorite = (usernameOrUser, recipeId) => {
  const key = resolveKey(usernameOrUser);
  if (!key) return;
  const favorites = JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES) || '{}');
  if (!favorites[key]) favorites[key] = [];
  if (!favorites[key].includes(recipeId)) favorites[key].push(recipeId);
  localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
};

export const removeFavorite = (usernameOrUser, recipeId) => {
  const key = resolveKey(usernameOrUser);
  if (!key) return;
  const favorites = JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES) || '{}');
  if (favorites[key]) {
    favorites[key] = favorites[key].filter((id) => id !== recipeId);
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
  }
};

export const getFavorites = (usernameOrUser) => {
  const key = resolveKey(usernameOrUser);
  if (!key) return [];
  const favorites = JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES) || '{}');
  return favorites[key] || [];
};

export const isFavorite = (usernameOrUser, recipeId) => {
  return getFavorites(usernameOrUser).includes(recipeId);
};

// ---------------------------------------------------------------------------
// Plan history — keeps the last N weekly plans so users can roll back.
// ---------------------------------------------------------------------------

const readJSON = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
};
const writeJSON = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / privacy mode */
  }
};

export const pushPlanHistory = (usernameOrUser, plan, label = 'Weekly plan') => {
  const key = resolveKey(usernameOrUser);
  if (!key || !plan) return;
  const all = readJSON(STORAGE_KEYS.PLAN_HISTORY, {});
  const list = all[key] || [];
  list.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    label,
    savedAt: new Date().toISOString(),
    plan,
  });
  all[key] = list.slice(0, PLAN_HISTORY_LIMIT);
  writeJSON(STORAGE_KEYS.PLAN_HISTORY, all);
};

export const getPlanHistory = (usernameOrUser) => {
  const key = resolveKey(usernameOrUser);
  if (!key) return [];
  const all = readJSON(STORAGE_KEYS.PLAN_HISTORY, {});
  return all[key] || [];
};

export const removeFromPlanHistory = (usernameOrUser, entryId) => {
  const key = resolveKey(usernameOrUser);
  if (!key) return;
  const all = readJSON(STORAGE_KEYS.PLAN_HISTORY, {});
  if (!all[key]) return;
  all[key] = all[key].filter((e) => e.id !== entryId);
  writeJSON(STORAGE_KEYS.PLAN_HISTORY, all);
};

export const clearPlanHistory = (usernameOrUser) => {
  const key = resolveKey(usernameOrUser);
  if (!key) return;
  const all = readJSON(STORAGE_KEYS.PLAN_HISTORY, {});
  delete all[key];
  writeJSON(STORAGE_KEYS.PLAN_HISTORY, all);
};

// ---------------------------------------------------------------------------
// Custom grocery items — items the user adds manually that survive plan
// regenerations. Stored separately from the auto-compiled list.
// ---------------------------------------------------------------------------

export const getCustomItems = (usernameOrUser) => {
  const key = resolveKey(usernameOrUser);
  if (!key) return [];
  const all = readJSON(STORAGE_KEYS.CUSTOM_ITEMS, {});
  return all[key] || [];
};

export const addCustomItem = (usernameOrUser, item) => {
  const key = resolveKey(usernameOrUser);
  if (!key || !item?.item) return [];
  const all = readJSON(STORAGE_KEYS.CUSTOM_ITEMS, {});
  const list = all[key] || [];
  const id = `c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  list.push({
    id,
    item: item.item,
    amount: item.amount || '1',
    aisle: item.aisle || 'Pantry',
    checked: false,
    custom: true,
  });
  all[key] = list;
  writeJSON(STORAGE_KEYS.CUSTOM_ITEMS, all);
  return list;
};

export const updateCustomItem = (usernameOrUser, id, patch) => {
  const key = resolveKey(usernameOrUser);
  if (!key) return [];
  const all = readJSON(STORAGE_KEYS.CUSTOM_ITEMS, {});
  const list = (all[key] || []).map((it) => (it.id === id ? { ...it, ...patch } : it));
  all[key] = list;
  writeJSON(STORAGE_KEYS.CUSTOM_ITEMS, all);
  return list;
};

export const removeCustomItem = (usernameOrUser, id) => {
  const key = resolveKey(usernameOrUser);
  if (!key) return [];
  const all = readJSON(STORAGE_KEYS.CUSTOM_ITEMS, {});
  const list = (all[key] || []).filter((it) => it.id !== id);
  all[key] = list;
  writeJSON(STORAGE_KEYS.CUSTOM_ITEMS, all);
  return list;
};

// ---------------------------------------------------------------------------
// Recipe notes + ratings — per-user, keyed by recipe id.
// ---------------------------------------------------------------------------

export const getRecipeNote = (usernameOrUser, recipeId) => {
  const key = resolveKey(usernameOrUser);
  if (!key || !recipeId) return '';
  const all = readJSON(STORAGE_KEYS.RECIPE_NOTES, {});
  return all[key]?.[recipeId] || '';
};

export const setRecipeNote = (usernameOrUser, recipeId, note) => {
  const key = resolveKey(usernameOrUser);
  if (!key || !recipeId) return;
  const all = readJSON(STORAGE_KEYS.RECIPE_NOTES, {});
  if (!all[key]) all[key] = {};
  if (!note) delete all[key][recipeId];
  else all[key][recipeId] = note;
  writeJSON(STORAGE_KEYS.RECIPE_NOTES, all);
};

export const getRecipeRating = (usernameOrUser, recipeId) => {
  const key = resolveKey(usernameOrUser);
  if (!key || !recipeId) return 0;
  const all = readJSON(STORAGE_KEYS.RECIPE_RATINGS, {});
  return all[key]?.[recipeId] || 0;
};

export const setRecipeRating = (usernameOrUser, recipeId, stars) => {
  const key = resolveKey(usernameOrUser);
  if (!key || !recipeId) return;
  const all = readJSON(STORAGE_KEYS.RECIPE_RATINGS, {});
  if (!all[key]) all[key] = {};
  if (!stars) delete all[key][recipeId];
  else all[key][recipeId] = stars;
  writeJSON(STORAGE_KEYS.RECIPE_RATINGS, all);
};

// ---------------------------------------------------------------------------
// Waitlist (Pricing page)
// ---------------------------------------------------------------------------

export const joinWaitlist = async ({ email, plan }) => {
  if (!email) return { success: false, error: 'Email is required.' };
  if (!isSupabaseConfigured) {
    // Dev fallback: persist locally so the UI flow can be tested.
    const list = JSON.parse(localStorage.getItem('mealmate_waitlist') || '[]');
    if (list.find((e) => e.email === email)) {
      return { success: false, error: 'You’re already on the waitlist.' };
    }
    list.push({ email, plan, createdAt: new Date().toISOString() });
    localStorage.setItem('mealmate_waitlist', JSON.stringify(list));
    return { success: true };
  }

  const { error } = await supabase.from('waitlist').insert({ email, plan });
  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'You’re already on the waitlist.' };
    }
    return { success: false, error: error.message };
  }
  return { success: true };
};
