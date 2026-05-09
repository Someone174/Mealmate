import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Flame, Beef, Cookie, Droplet, Clock, ChevronDown } from 'lucide-react';
import {
  totalsForPlan,
  totalsForDay,
  dailyAverage,
  totalPrepMinutes,
  formatMinutes,
} from '@/lib/nutrition';
import { DAYS } from '@/components/mealmate/MealData';

const Stat = ({ icon: Icon, value, label, accent }) => (
  <div className="flex flex-col items-start gap-1 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
    <Icon className={`w-4 h-4 ${accent}`} />
    <span className="text-lg font-bold text-gray-900 dark:text-gray-50 leading-none">{value}</span>
    <span className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</span>
  </div>
);

export default function WeeklyNutrition({ plan, servings = 2 }) {
  const [expanded, setExpanded] = useState(false);

  const data = useMemo(() => {
    const total = totalsForPlan(plan, servings);
    const avg = dailyAverage(plan, servings);
    const prep = totalPrepMinutes(plan);
    const perDay = DAYS.map((d) => ({ day: d, ...totalsForDay(plan?.[d], servings) }));
    const peak = Math.max(1, ...perDay.map((d) => d.calories));
    return { total, avg, prep, perDay, peak };
  }, [plan, servings]);

  if (!plan) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="surface-card rounded-3xl p-5 sm:p-6 shadow-sm border"
      aria-label="Weekly nutrition summary"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-strong flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-emerald-500" />
          This week at a glance
        </h2>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-xs font-medium text-emerald-600 dark:text-emerald-300 hover:underline inline-flex items-center gap-1"
          aria-expanded={expanded}
        >
          {expanded ? 'Hide breakdown' : 'See daily breakdown'}
          <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        <Stat icon={Flame} accent="text-orange-500" value={data.avg.calories.toLocaleString()} label="Avg cal/day" />
        <Stat icon={Beef} accent="text-red-500" value={`${data.avg.protein}g`} label="Avg protein" />
        <Stat icon={Cookie} accent="text-amber-500" value={`${data.avg.carbs}g`} label="Avg carbs" />
        <Stat icon={Droplet} accent="text-violet-500" value={`${data.avg.fat}g`} label="Avg fat" />
        <Stat icon={Clock} accent="text-emerald-500" value={formatMinutes(data.prep)} label="Cook time" />
      </div>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-5 overflow-hidden"
        >
          <div className="space-y-2">
            {data.perDay.map((d) => {
              const pct = Math.round((d.calories / data.peak) * 100);
              return (
                <div key={d.day} className="flex items-center gap-3">
                  <div className="w-20 text-xs text-muted">{d.day.slice(0, 3)}</div>
                  <div className="flex-1 h-3 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                    />
                  </div>
                  <div className="w-24 text-right text-xs text-body tabular-nums">
                    {d.calories.toLocaleString()} cal
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-[11px] text-muted">
            Calories scaled for {servings} {servings === 1 ? 'person' : 'people'}. Skipped meals are excluded.
          </p>
        </motion.div>
      )}
    </motion.section>
  );
}
