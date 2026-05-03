import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Beef, Wheat, Droplets } from 'lucide-react';
import { DAYS, MEAL_TYPES } from './MealData';

function computeWeeklyNutrition(plan) {
  if (!plan) return null;
  let calories = 0, protein = 0, carbs = 0, fat = 0, count = 0;
  DAYS.forEach(day => {
    MEAL_TYPES.forEach(type => {
      const meal = plan[day]?.[type];
      if (meal && !meal.skipped) {
        calories += meal.calories || 0;
        protein  += meal.protein  || 0;
        carbs    += meal.carbs    || 0;
        fat      += meal.fat      || 0;
        count++;
      }
    });
  });
  if (!count) return null;
  const days = 7;
  return {
    totalCalories: Math.round(calories),
    avgCalories:   Math.round(calories / days),
    avgProtein:    Math.round(protein  / days),
    avgCarbs:      Math.round(carbs    / days),
    avgFat:        Math.round(fat      / days),
    mealCount: count,
  };
}

export default function NutritionSummary({ plan }) {
  const n = computeWeeklyNutrition(plan);
  if (!n) return null;

  const totalMacroG = n.avgProtein + n.avgCarbs + n.avgFat;
  const proteinPct = totalMacroG ? Math.round((n.avgProtein / totalMacroG) * 100) : 0;
  const carbsPct   = totalMacroG ? Math.round((n.avgCarbs   / totalMacroG) * 100) : 0;
  const fatPct     = totalMacroG ? 100 - proteinPct - carbsPct : 0;

  const stats = [
    { icon: Flame,    label: 'Avg Daily Cal', value: `${n.avgCalories}`, unit: 'kcal', color: 'text-orange-500', bg: 'bg-orange-50' },
    { icon: Beef,     label: 'Protein',       value: `${n.avgProtein}`,  unit: 'g/day', color: 'text-red-500',    bg: 'bg-red-50' },
    { icon: Wheat,    label: 'Carbs',         value: `${n.avgCarbs}`,    unit: 'g/day', color: 'text-amber-500',  bg: 'bg-amber-50' },
    { icon: Droplets, label: 'Fat',           value: `${n.avgFat}`,      unit: 'g/day', color: 'text-violet-500', bg: 'bg-violet-50' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-400" />
          Weekly Nutrition Overview
        </h2>
        <span className="text-xs text-gray-400">{n.mealCount} meals planned</span>
      </div>

      {/* Stat pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {stats.map(({ icon: Icon, label, value, unit, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl p-3 flex items-center gap-3`}>
            <Icon className={`w-5 h-5 ${color} flex-shrink-0`} />
            <div className="min-w-0">
              <p className={`text-xl font-bold leading-none ${color}`}>{value}</p>
              <p className="text-xs text-gray-500 mt-0.5 truncate">{unit}</p>
              <p className="text-xs text-gray-400 truncate">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Macro split bar */}
      <div>
        <p className="text-xs text-gray-500 mb-1.5 font-medium">Daily macro split</p>
        <div className="flex rounded-full overflow-hidden h-3 gap-px">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${proteinPct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="bg-red-400 h-full"
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${carbsPct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
            className="bg-amber-400 h-full"
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${fatPct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
            className="bg-violet-400 h-full"
          />
        </div>
        <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />Protein {proteinPct}%</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />Carbs {carbsPct}%</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-400 inline-block" />Fat {fatPct}%</span>
        </div>
      </div>
    </motion.div>
  );
}
