import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Flame, Beef, Wheat, Droplets, ArrowRight } from 'lucide-react';
import { createPageUrl } from '@/utils';

const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAYS_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function computeNutrition(plan) {
  if (!plan) return null;

  let totalCals = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0, mealCount = 0;

  const dailyData = DAYS_FULL.map((day, idx) => {
    const dayMeals = plan[day] || {};
    let dayCals = 0, dayProtein = 0, dayCarbs = 0, dayFat = 0;
    Object.values(dayMeals).forEach(recipe => {
      if (!recipe || recipe.skipped) return;
      dayCals += recipe.calories || 0;
      dayProtein += recipe.protein || 0;
      dayCarbs += recipe.carbs || 0;
      dayFat += recipe.fat || 0;
      mealCount++;
    });
    totalCals += dayCals;
    totalProtein += dayProtein;
    totalCarbs += dayCarbs;
    totalFat += dayFat;
    return { day: DAYS_SHORT[idx], calories: dayCals, protein: dayProtein, carbs: dayCarbs, fat: dayFat };
  });

  const days = DAYS_FULL.filter(d => {
    const dayMeals = plan[d] || {};
    return Object.values(dayMeals).some(r => r && !r.skipped);
  }).length || 1;

  return {
    dailyData,
    avgCalories: Math.round(totalCals / days),
    avgProtein: Math.round(totalProtein / days),
    avgCarbs: Math.round(totalCarbs / days),
    avgFat: Math.round(totalFat / days),
    totalCalories: totalCals,
    mealCount,
  };
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      <p className="text-emerald-600">{payload[0]?.value || 0} kcal</p>
    </div>
  );
};

export default function NutritionWidget({ plan }) {
  const stats = useMemo(() => computeNutrition(plan), [plan]);

  if (!stats || stats.mealCount === 0) return null;

  const maxCal = Math.max(...stats.dailyData.map(d => d.calories), 1);
  const today = (new Date().getDay() + 6) % 7; // 0 = Monday

  const macroTotal = stats.avgProtein * 4 + stats.avgCarbs * 4 + stats.avgFat * 9 || 1;
  const proteinPct = Math.round((stats.avgProtein * 4 / macroTotal) * 100);
  const carbsPct = Math.round((stats.avgCarbs * 4 / macroTotal) * 100);
  const fatPct = 100 - proteinPct - carbsPct;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
    >
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          Weekly Nutrition
        </h2>
        <Link
          to={createPageUrl('Nutrition')}
          className="flex items-center gap-1 text-xs text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
        >
          Full stats <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Stat chips */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { icon: Flame, label: 'Avg/day', value: `${stats.avgCalories}`, unit: 'kcal', color: 'text-orange-500', bg: 'bg-orange-50' },
          { icon: Beef, label: 'Protein', value: `${stats.avgProtein}`, unit: 'g', color: 'text-red-500', bg: 'bg-red-50' },
          { icon: Wheat, label: 'Carbs', value: `${stats.avgCarbs}`, unit: 'g', color: 'text-amber-500', bg: 'bg-amber-50' },
          { icon: Droplets, label: 'Fat', value: `${stats.avgFat}`, unit: 'g', color: 'text-violet-500', bg: 'bg-violet-50' },
        ].map(({ icon: Icon, label, value, unit, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl p-3 text-center`}>
            <Icon className={`w-4 h-4 ${color} mx-auto mb-1`} />
            <p className="text-lg font-bold text-gray-800 leading-none">{value}<span className="text-xs font-normal text-gray-400 ml-0.5">{unit}</span></p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Recharts bar chart */}
      <div className="h-24 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stats.dailyData} barSize={18} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Bar dataKey="calories" radius={[4, 4, 0, 0]}>
              {stats.dailyData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={index === today ? '#10b981' : entry.calories === maxCal ? '#34d399' : '#d1fae5'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Macro ratio bar */}
      <div>
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
          <span>Macro split</span>
          <span>{proteinPct}% P · {carbsPct}% C · {fatPct}% F</span>
        </div>
        <div className="flex rounded-full overflow-hidden h-2">
          <div className="bg-red-400 transition-all" style={{ width: `${proteinPct}%` }} />
          <div className="bg-amber-400 transition-all" style={{ width: `${carbsPct}%` }} />
          <div className="bg-violet-400 transition-all" style={{ width: `${fatPct}%` }} />
        </div>
        <div className="flex gap-3 mt-2">
          {[['bg-red-400', 'Protein'], ['bg-amber-400', 'Carbs'], ['bg-violet-400', 'Fat']].map(([bg, label]) => (
            <div key={label} className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${bg}`} />
              <span className="text-xs text-gray-500">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
