import React from 'react';
import { Activity, Zap, Beef, Wheat, Droplets } from 'lucide-react';
import { motion } from 'framer-motion';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const MEAL_TYPES = ['breakfast','lunch','dinner'];

const stats = [
  { key: 'calories', label: 'Calories', unit: 'kcal/day', bg: 'bg-amber-50', text: 'text-amber-600', Icon: Zap },
  { key: 'protein',  label: 'Protein',  unit: 'g/day',    bg: 'bg-red-50',   text: 'text-red-600',   Icon: Beef },
  { key: 'carbs',    label: 'Carbs',    unit: 'g/day',    bg: 'bg-orange-50',text: 'text-orange-600',Icon: Wheat },
  { key: 'fat',      label: 'Fat',      unit: 'g/day',    bg: 'bg-violet-50',text: 'text-violet-600',Icon: Droplets },
];

export default function NutritionSummary({ plan }) {
  if (!plan) return null;

  const meals = DAYS
    .flatMap(day => MEAL_TYPES.map(type => plan[day]?.[type]))
    .filter(m => m && !m.skipped);

  if (!meals.length) return null;

  const totals = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + (m.calories || 0),
      protein:  acc.protein  + (m.protein  || 0),
      carbs:    acc.carbs    + (m.carbs    || 0),
      fat:      acc.fat      + (m.fat      || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const daily = {
    calories: Math.round(totals.calories / 7),
    protein:  Math.round(totals.protein  / 7),
    carbs:    Math.round(totals.carbs    / 7),
    fat:      Math.round(totals.fat      / 7),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
    >
      <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
        <Activity className="w-6 h-6 text-emerald-500" />
        Weekly Nutrition Overview
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(({ key, label, unit, bg, text, Icon }) => (
          <div key={key} className={`${bg} rounded-2xl p-4`}>
            <div className="flex items-center gap-1.5 mb-2">
              <Icon className={`w-4 h-4 ${text}`} />
              <span className="text-xs font-medium text-gray-500">{label}</span>
            </div>
            <p className={`text-2xl font-bold ${text}`}>
              {daily[key].toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{unit}</p>
            <p className="text-xs text-gray-400">
              {Math.round(totals[key]).toLocaleString()} total
            </p>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-4 text-center">
        Based on {meals.length} planned meals &middot; averages across 7 days
      </p>
    </motion.div>
  );
}
