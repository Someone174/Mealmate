import { describe, expect, it } from 'vitest';
import {
  totalsForRecipe,
  totalsForDay,
  totalsForPlan,
  dailyAverage,
  totalPrepMinutes,
  skippedCount,
  formatMinutes,
} from './nutrition';

const r1 = { calories: 400, protein: 20, carbs: 40, fat: 15, prepTime: 30, servings: 2 };
const r2 = { calories: 300, protein: 10, carbs: 50, fat: 8,  prepTime: 15, servings: 2 };
const r3 = { calories: 500, protein: 30, carbs: 60, fat: 18, prepTime: 45, servings: 2 };

const day = { breakfast: r1, lunch: r2, dinner: r3 };

const week = {
  Monday: day, Tuesday: day, Wednesday: day,
  Thursday: day, Friday: day, Saturday: day, Sunday: day,
};

describe('totalsForRecipe', () => {
  it('returns zeros for null input', () => {
    expect(totalsForRecipe(null)).toEqual({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  });

  it('multiplies values by the servings factor and rounds', () => {
    expect(totalsForRecipe(r1, 1)).toEqual({ calories: 400, protein: 20, carbs: 40, fat: 15 });
    expect(totalsForRecipe(r1, 0.5)).toEqual({ calories: 200, protein: 10, carbs: 20, fat: 8 });
  });
});

describe('totalsForDay', () => {
  it('sums all meal totals for one day at the recipe\'s native serving count', () => {
    // When the user wants 2 servings and the recipe is for 2, multiplier is 1.
    expect(totalsForDay(day, 2)).toEqual({
      calories: 400 + 300 + 500,
      protein: 20 + 10 + 30,
      carbs: 40 + 50 + 60,
      fat: 15 + 8 + 18,
    });
  });

  it('halves macros when the user only needs one of a two-serving recipe', () => {
    // 2-serving recipe scaled down to 1 portion: every macro is halved.
    expect(totalsForDay({ breakfast: r1 }, 1)).toEqual({
      calories: 200, protein: 10, carbs: 20, fat: 8,
    });
  });

  it('skips meals marked as skipped', () => {
    const partial = { breakfast: { ...r1, skipped: true }, lunch: r2 };
    expect(totalsForDay(partial, 2)).toEqual({
      calories: 300, protein: 10, carbs: 50, fat: 8,
    });
  });

  it('returns zero for null input', () => {
    expect(totalsForDay(null)).toEqual({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  });
});

describe('totalsForPlan + dailyAverage', () => {
  it('totals across the whole week', () => {
    const total = totalsForPlan(week, 2);
    expect(total.calories).toBe((400 + 300 + 500) * 7);
  });
  it('averages per day', () => {
    const avg = dailyAverage(week, 2);
    expect(avg.calories).toBe(400 + 300 + 500);
    expect(avg.protein).toBe(20 + 10 + 30);
  });
});

describe('totalPrepMinutes + skippedCount', () => {
  it('sums prep time across all non-skipped meals', () => {
    expect(totalPrepMinutes(week)).toBe((30 + 15 + 45) * 7);
  });

  it('counts skipped meals', () => {
    const w2 = JSON.parse(JSON.stringify(week));
    w2.Monday.breakfast = { ...w2.Monday.breakfast, skipped: true };
    w2.Tuesday.lunch = { ...w2.Tuesday.lunch, skipped: true };
    expect(skippedCount(w2)).toBe(2);
  });
});

describe('formatMinutes', () => {
  it('formats below an hour as minutes', () => {
    expect(formatMinutes(45)).toBe('45 min');
  });
  it('formats round hours', () => {
    expect(formatMinutes(120)).toBe('2h');
  });
  it('formats hours and minutes', () => {
    expect(formatMinutes(95)).toBe('1h 35m');
  });
});
