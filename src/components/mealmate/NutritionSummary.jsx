import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Flame, Zap, Wheat, Droplets } from 'lucide-react';

function MacroBar({ value, max, color }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className={`h-2 rounded-full ${color}`}
      />
    </div>
  );
}

export default function NutritionSummary({ plan, servings = 2 }) {
  const stats = useMemo(() => {
    if (!plan) return null;
    let totalCal = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0, count = 0;
    Object.values(plan).forEach(dayMeals => {
      Object.values(dayMeals).forEach(recipe => {
        if (!recipe || recipe.skipped) return;
        totalCal += (recipe.calories || 0) * servings;
        totalProtein += (recipe.protein || 0) * servings;
        totalCarbs += (recipe.carbs || 0) * servings;
        totalFat += (recipe.fat || 0) * servings;
        count++;
      });
    });
    return {
      totalCal: Math.round(totalCal),
      totalProtein: Math.round(totalProtein),
      totalCarbs: Math.round(totalCarbs),
      totalFat: Math.round(totalFat),
      avgDailyCal: count > 0 ? Math.round(totalCal / 7) : 0,
      count,
    };
  }, [plan, servings]);

  if (!stats || stats.count === 0) return null;

  const macros = [
    { label: 'Protein', value: stats.totalProtein, unit: 'g', color: 'bg-red-400', textColor: 'text-red-600', icon: Zap, max: 800 },
    { label: 'Carbs', value: stats.totalCarbs, unit: 'g', color: 'bg-orange-400', textColor: 'text-orange-600', icon: Wheat, max: 2000 },
    { label: 'Fat', value: stats.totalFat, unit: 'g', color: 'bg-violet-400', textColor: 'text-violet-600', icon: Droplets, max: 600 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
    >
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Flame className="w-6 h-6 text-orange-500" />
          Weekly Nutrition
        </h2>
        <div className="text-right">
          <p className="text-2xl font-bold text-orange-500">{stats.avgDailyCal.toLocaleString()}</p>
          <p className="text-xs text-gray-400">avg cal / day</p>
        </div>
      </div>

      {/* Big calorie total */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-4 mb-5 flex items-center justify-between">
        <div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalCal.toLocaleString()}</p>
          <p className="text-sm text-gray-500">total calories this week</p>
        </div>
        <div className="text-right text-xs text-gray-400">
          <p>{stats.count} meals planned</p>
          <p>for {servings} {servings === 1 ? 'person' : 'people'}</p>
        </div>
      </div>

      {/* Macro breakdown */}
      <div className="space-y-4">
        {macros.map(({ label, value, unit, color, textColor, icon: Icon, max }) => (
          <div key={label}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Icon className={`w-4 h-4 ${textColor}`} />
                <span className="text-sm font-medium text-gray-700">{label}</span>
              </div>
              <span className={`text-sm font-bold ${textColor}`}>{value.toLocaleString()}{unit}</span>
            </div>
            <MacroBar value={value} max={max} color={color} />
          </div>
        ))}
      </div>

      {/* Per-meal average */}
      <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-3 gap-3 text-center">
        {macros.map(({ label, value, unit, textColor }) => (
          <div key={label} className="bg-gray-50 rounded-xl p-2">
            <p className={`text-base font-bold ${textColor}`}>
              {Math.round(value / Math.max(stats.count, 1))}{unit}
            </p>
            <p className="text-xs text-gray-400">{label}/meal</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
