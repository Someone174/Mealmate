// Nutrition + cost roll-ups for a weekly plan.
//
// `plan` is the same shape produced by MealData.normalizeWeeklyPlan:
//   { Monday: { breakfast, lunch, dinner }, ... }
// Skipped meals (`recipe.skipped === true`) are excluded.

import { DAYS, MEAL_TYPES } from '@/components/mealmate/MealData';

const ZERO = { calories: 0, protein: 0, carbs: 0, fat: 0 };

export const totalsForRecipe = (recipe, servingsMultiplier = 1) => {
  if (!recipe) return ZERO;
  return {
    calories: Math.round((recipe.calories || 0) * servingsMultiplier),
    protein: Math.round((recipe.protein || 0) * servingsMultiplier),
    carbs: Math.round((recipe.carbs || 0) * servingsMultiplier),
    fat: Math.round((recipe.fat || 0) * servingsMultiplier),
  };
};

const sum = (a, b) => ({
  calories: a.calories + b.calories,
  protein: a.protein + b.protein,
  carbs: a.carbs + b.carbs,
  fat: a.fat + b.fat,
});

export const totalsForDay = (dayPlan, servings = 1) => {
  if (!dayPlan) return ZERO;
  return MEAL_TYPES.reduce((acc, t) => {
    const r = dayPlan[t];
    if (!r || r.skipped) return acc;
    return sum(acc, totalsForRecipe(r, servings / (r.servings || 1)));
  }, ZERO);
};

export const totalsForPlan = (plan, servings = 1) => {
  if (!plan) return ZERO;
  return DAYS.reduce((acc, d) => sum(acc, totalsForDay(plan[d], servings)), ZERO);
};

export const dailyAverage = (plan, servings = 1) => {
  const total = totalsForPlan(plan, servings);
  return {
    calories: Math.round(total.calories / DAYS.length),
    protein: Math.round(total.protein / DAYS.length),
    carbs: Math.round(total.carbs / DAYS.length),
    fat: Math.round(total.fat / DAYS.length),
  };
};

export const totalPrepMinutes = (plan) => {
  if (!plan) return 0;
  return DAYS.reduce((acc, d) => {
    const day = plan[d];
    if (!day) return acc;
    return MEAL_TYPES.reduce((a, t) => {
      const r = day[t];
      if (!r || r.skipped) return a;
      return a + (r.prepTime || 0);
    }, acc);
  }, 0);
};

export const skippedCount = (plan) => {
  if (!plan) return 0;
  return DAYS.reduce((acc, d) => {
    const day = plan[d];
    if (!day) return acc;
    return MEAL_TYPES.reduce((a, t) => (day[t]?.skipped ? a + 1 : a), acc);
  }, 0);
};

// Format helpers
export const formatMinutes = (m) => {
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest ? `${h}h ${rest}m` : `${h}h`;
};
