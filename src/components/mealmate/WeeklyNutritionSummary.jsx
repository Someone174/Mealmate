import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Flame, Zap, Activity } from 'lucide-react';
import { DAYS, MEAL_TYPES } from './MealData';

const DAILY_TARGETS = { calories: 2000, protein: 50, carbs: 260, fat: 65 };

function computeNutrition(plan) {
  let totals = { calories: 0, protein: 0, carbs: 0, fat: 0, meals: 0 };
  const byDay = {};

  DAYS.forEach(day => {
    const dayTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    MEAL_TYPES.forEach(type => {
      const meal = plan?.[day]?.[type];
      if (!meal || meal.skipped) return;
      dayTotals.calories += meal.calories || 0;
      dayTotals.protein  += meal.protein  || 0;
      dayTotals.carbs    += meal.carbs    || 0;
      dayTotals.fat      += meal.fat      || 0;
      totals.meals++;
    });
    byDay[day] = dayTotals;
    totals.calories += dayTotals.calories;
    totals.protein  += dayTotals.protein;
    totals.carbs    += dayTotals.carbs;
    totals.fat      += dayTotals.fat;
  });

  const activeDays = DAYS.filter(d => byDay[d]?.calories > 0).length || 1;
  const avg = {
    calories: Math.round(totals.calories / activeDays),
    protein:  Math.round(totals.protein  / activeDays),
    carbs:    Math.round(totals.carbs    / activeDays),
    fat:      Math.round(totals.fat      / activeDays),
  };

  return { totals, avg, byDay, activeDays };
}

const MacroBar = ({ label, value, target, color, unit = 'g' }) => {
  const pct = Math.min(100, Math.round((value / target) * 100));
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 font-medium">{label}</span>
        <span className="text-gray-500 tabular-nums">
          <span className="font-semibold text-gray-800">{value}{unit}</span>
          <span className="text-xs ml-1">/ {target}{unit}</span>
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
      <p className="text-xs text-gray-400 text-right">{pct}% of daily target</p>
    </div>
  );
};

export default function WeeklyNutritionSummary({ plan }) {
  const [expanded, setExpanded] = useState(false);
  const { totals, avg, byDay } = useMemo(() => computeNutrition(plan), [plan]);

  const totalCals = totals.calories;
  if (!totalCals) return null;

  const macroCalories = {
    protein: avg.protein * 4,
    carbs:   avg.carbs   * 4,
    fat:     avg.fat     * 9,
  };
  const macroTotal = macroCalories.protein + macroCalories.carbs + macroCalories.fat || 1;
  const proteinPct = Math.round((macroCalories.protein / macroTotal) * 100);
  const carbsPct   = Math.round((macroCalories.carbs   / macroTotal) * 100);
  const fatPct     = 100 - proteinPct - carbsPct;

  const maxDayCalories = Math.max(...DAYS.map(d => byDay[d]?.calories || 0), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
    >
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-gray-800">Weekly Nutrition</h3>
            <p className="text-xs text-gray-500">
              Avg {avg.calories} kcal/day · {avg.protein}g protein
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Mini macro strip */}
          <div className="hidden sm:flex items-center gap-1 h-4 rounded-full overflow-hidden w-20">
            <div className="h-full bg-red-400 rounded-l-full" style={{ width: `${proteinPct}%` }} />
            <div className="h-full bg-orange-400" style={{ width: `${carbsPct}%` }} />
            <div className="h-full bg-violet-400 rounded-r-full" style={{ width: `${fatPct}%` }} />
          </div>
          {expanded
            ? <ChevronUp className="w-4 h-4 text-gray-400" />
            : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-5 border-t border-gray-100 pt-4">

              {/* Stat chips */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Cal/day', value: avg.calories, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50' },
                  { label: 'Protein', value: `${avg.protein}g`, icon: Zap, color: 'text-red-500', bg: 'bg-red-50' },
                  { label: 'Carbs',   value: `${avg.carbs}g`,   icon: Activity, color: 'text-amber-500', bg: 'bg-amber-50' },
                  { label: 'Fat',     value: `${avg.fat}g`,     icon: Activity, color: 'text-violet-500', bg: 'bg-violet-50' },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                  <div key={label} className={`${bg} rounded-2xl p-3 text-center`}>
                    <Icon className={`w-4 h-4 ${color} mx-auto mb-1`} />
                    <p className="text-base font-bold text-gray-800 leading-none">{value}</p>
                    <p className="text-xs text-gray-500 mt-1">{label}</p>
                  </div>
                ))}
              </div>

              {/* Macro progress bars */}
              <div className="space-y-3">
                <MacroBar label="Calories" value={avg.calories} target={DAILY_TARGETS.calories} color="bg-orange-400" unit=" kcal" />
                <MacroBar label="Protein"  value={avg.protein}  target={DAILY_TARGETS.protein}  color="bg-red-400" />
                <MacroBar label="Carbs"    value={avg.carbs}    target={DAILY_TARGETS.carbs}    color="bg-amber-400" />
                <MacroBar label="Fat"      value={avg.fat}      target={DAILY_TARGETS.fat}      color="bg-violet-400" />
              </div>

              {/* Per-day calorie bars */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Calories by day</p>
                <div className="flex items-end gap-1.5" style={{ height: '56px' }}>
                  {DAYS.map((day, i) => {
                    const cal = byDay[day]?.calories || 0;
                    const barHeight = Math.round((cal / maxDayCalories) * 40);
                    return (
                      <div key={day} className="flex-1 flex flex-col items-center justify-end gap-1">
                        <div
                          className="relative w-full bg-gray-100 rounded-sm overflow-hidden"
                          style={{ height: '40px' }}
                          title={`${day}: ${cal} kcal`}
                        >
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: barHeight }}
                            transition={{ duration: 0.6, ease: 'easeOut', delay: i * 0.05 }}
                            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-emerald-500 to-teal-400 rounded-sm"
                          />
                        </div>
                        <span className="text-[10px] text-gray-400 leading-none">{day.slice(0, 2)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Macro split legend */}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  Protein {proteinPct}%
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-orange-400" />
                  Carbs {carbsPct}%
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-violet-400" />
                  Fat {fatPct}%
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
