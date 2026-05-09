import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, Cell, Legend,
} from 'recharts';
import {
  ArrowLeft, Flame, Beef, Wheat, Droplets,
  ChefHat, Sun, Moon, Coffee, TrendingUp, Info
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { getCurrentUser, getMealPlan } from '@/components/mealmate/LocalStorageService';
import { loadRecipesDB } from '@/components/mealmate/MealData';
import { toast, Toaster } from 'sonner';

const DAYS_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MEAL_COLORS = {
  breakfast: '#f59e0b',
  lunch: '#10b981',
  dinner: '#8b5cf6',
};

function buildStats(plan) {
  if (!plan) return null;

  const daily = DAYS_FULL.map((day, idx) => {
    const meals = plan[day] || {};
    const breakfast = meals.breakfast && !meals.breakfast.skipped ? meals.breakfast : null;
    const lunch     = meals.lunch     && !meals.lunch.skipped     ? meals.lunch     : null;
    const dinner    = meals.dinner    && !meals.dinner.skipped    ? meals.dinner    : null;

    const bfCal = breakfast?.calories || 0;
    const luCal = lunch?.calories || 0;
    const diCal = dinner?.calories || 0;
    const total = bfCal + luCal + diCal;

    return {
      day: DAYS_SHORT[idx],
      fullDay: day,
      breakfast: bfCal,
      lunch: luCal,
      dinner: diCal,
      total,
      protein: (breakfast?.protein || 0) + (lunch?.protein || 0) + (dinner?.protein || 0),
      carbs:   (breakfast?.carbs   || 0) + (lunch?.carbs   || 0) + (dinner?.carbs   || 0),
      fat:     (breakfast?.fat     || 0) + (lunch?.fat     || 0) + (dinner?.fat     || 0),
      meals: [breakfast, lunch, dinner].filter(Boolean),
    };
  });

  const activeDays = daily.filter(d => d.total > 0);
  const count = activeDays.length || 1;

  const avg = (key) => Math.round(activeDays.reduce((s, d) => s + d[key], 0) / count);
  const totalCalories = daily.reduce((s, d) => s + d.total, 0);

  const avgBf   = Math.round(activeDays.reduce((s, d) => s + d.breakfast, 0) / count);
  const avgLu   = Math.round(activeDays.reduce((s, d) => s + d.lunch, 0) / count);
  const avgDi   = Math.round(activeDays.reduce((s, d) => s + d.dinner, 0) / count);
  const avgCals = avg('total');
  const avgProt = avg('protein');
  const avgCarb = avg('carbs');
  const avgFat  = avg('fat');

  const macroTotal = avgProt * 4 + avgCarb * 4 + avgFat * 9 || 1;
  const proteinPct = Math.round((avgProt * 4 / macroTotal) * 100);
  const carbsPct   = Math.round((avgCarb * 4 / macroTotal) * 100);
  const fatPct     = 100 - proteinPct - carbsPct;

  const radarData = [
    { subject: 'Protein', value: proteinPct, fullMark: 100 },
    { subject: 'Carbs', value: carbsPct, fullMark: 100 },
    { subject: 'Fat', value: fatPct, fullMark: 100 },
  ];

  const highestCal = Math.max(...daily.map(d => d.total));
  const lowestCal  = Math.min(...activeDays.map(d => d.total));

  return {
    daily, avgCals, avgProt, avgCarb, avgFat,
    avgBf, avgLu, avgDi,
    proteinPct, carbsPct, fatPct,
    radarData, totalCalories,
    highestCalDay: daily.find(d => d.total === highestCal)?.fullDay,
    lowestCalDay: daily.find(d => d.total === lowestCal)?.fullDay,
  };
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-xl text-sm min-w-[140px]">
      <p className="font-semibold text-gray-700 mb-2">{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} className="flex justify-between gap-4 items-center">
          <span style={{ color: p.fill }} className="capitalize font-medium">{p.dataKey}</span>
          <span className="text-gray-600">{p.value} kcal</span>
        </div>
      ))}
      <div className="border-t border-gray-100 mt-2 pt-2 flex justify-between font-semibold">
        <span className="text-gray-700">Total</span>
        <span className="text-emerald-600">{payload.reduce((s, p) => s + p.value, 0)} kcal</span>
      </div>
    </div>
  );
};

function MacroBar({ label, pct, color, bg, value, unit }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-500">{value}{unit} <span className="text-gray-400">({pct}%)</span></span>
      </div>
      <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${bg}`}
        />
      </div>
    </div>
  );
}

export default function Nutrition() {
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const init = async () => {
      await loadRecipesDB();
      const u = getCurrentUser();
      if (!u) { navigate(createPageUrl('SignIn')); return; }
      setUser(u);
      const p = getMealPlan(u);
      setPlan(p);
    };
    init();
  }, [navigate]);

  const stats = useMemo(() => buildStats(plan), [plan]);

  if (!user || !plan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <ChefHat className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No meal plan data yet.</p>
          <Link to={createPageUrl('Dashboard')}>
            <button className="mt-4 px-6 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-medium">
              Back to Dashboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const today = (new Date().getDay() + 6) % 7;

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" richColors />

      {/* Nav */}
      <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            to={createPageUrl('Dashboard')}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
              <Flame className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-800">Nutrition Stats</span>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Summary banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-56 h-56 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative">
            <p className="text-emerald-100 mb-1 text-sm font-medium">This week's average</p>
            <h1 className="text-5xl font-bold mb-1">{stats.avgCals.toLocaleString()}</h1>
            <p className="text-emerald-100">calories per day</p>

            <div className="grid grid-cols-3 gap-4 mt-6">
              {[
                { label: 'Protein', value: `${stats.avgProt}g`, sub: `${stats.proteinPct}%` },
                { label: 'Carbs',   value: `${stats.avgCarb}g`, sub: `${stats.carbsPct}%`   },
                { label: 'Fat',     value: `${stats.avgFat}g`,  sub: `${stats.fatPct}%`     },
              ].map(({ label, value, sub }) => (
                <div key={label} className="bg-white/20 rounded-2xl p-3 text-center">
                  <p className="text-xl font-bold">{value}</p>
                  <p className="text-xs text-emerald-100">{label} · {sub}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Stacked bar chart – calories by meal type */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
        >
          <h2 className="text-lg font-bold text-gray-800 mb-1">Calories by Day & Meal</h2>
          <p className="text-sm text-gray-500 mb-5">Stacked by breakfast · lunch · dinner</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.daily} barSize={28} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb', radius: 8 }} />
                <Legend
                  wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                  formatter={(v) => <span className="capitalize text-gray-600">{v}</span>}
                />
                <Bar dataKey="breakfast" stackId="a" fill={MEAL_COLORS.breakfast} radius={[0, 0, 0, 0]}>
                  {stats.daily.map((_, i) => (
                    <Cell key={i} fill={i === today ? '#d97706' : MEAL_COLORS.breakfast} />
                  ))}
                </Bar>
                <Bar dataKey="lunch" stackId="a" fill={MEAL_COLORS.lunch}>
                  {stats.daily.map((_, i) => (
                    <Cell key={i} fill={i === today ? '#059669' : MEAL_COLORS.lunch} />
                  ))}
                </Bar>
                <Bar dataKey="dinner" stackId="a" fill={MEAL_COLORS.dinner} radius={[4, 4, 0, 0]}>
                  {stats.daily.map((_, i) => (
                    <Cell key={i} fill={i === today ? '#7c3aed' : MEAL_COLORS.dinner} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Macro breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
          >
            <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Daily Macro Breakdown
            </h2>
            <div className="space-y-4">
              <MacroBar label="Protein" pct={stats.proteinPct} bg="bg-red-400" value={stats.avgProt} unit="g" />
              <MacroBar label="Carbohydrates" pct={stats.carbsPct} bg="bg-amber-400" value={stats.avgCarb} unit="g" />
              <MacroBar label="Fat" pct={stats.fatPct} bg="bg-violet-400" value={stats.avgFat} unit="g" />
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-2xl text-sm text-gray-600 flex gap-2">
              <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <p>
                Calculated from your planned meals. Skipped meals are excluded from the average.
              </p>
            </div>
          </motion.div>

          {/* Meal-type averages */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
          >
            <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-emerald-500" />
              Average by Meal Type
            </h2>
            <div className="space-y-4">
              {[
                { label: 'Breakfast', icon: Coffee, value: stats.avgBf, color: 'text-amber-500', bg: 'bg-amber-50', bar: 'bg-amber-400' },
                { label: 'Lunch',     icon: Sun,    value: stats.avgLu, color: 'text-emerald-500', bg: 'bg-emerald-50', bar: 'bg-emerald-400' },
                { label: 'Dinner',    icon: Moon,   value: stats.avgDi, color: 'text-violet-500', bg: 'bg-violet-50', bar: 'bg-violet-400' },
              ].map(({ label, icon: Icon, value, color, bg, bar }) => {
                const pct = Math.round((value / (stats.avgCals || 1)) * 100);
                return (
                  <div key={label} className={`${bg} rounded-2xl p-4`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${color}`} />
                        <span className="font-medium text-gray-700">{label}</span>
                      </div>
                      <span className={`font-bold ${color}`}>{value} <span className="text-xs font-normal text-gray-400">kcal</span></span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/60 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                        className={`h-full rounded-full ${bar}`}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{pct}% of daily total</p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Daily detail table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
        >
          <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            Day-by-Day Overview
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 text-xs uppercase tracking-wider">
                  <th className="pb-3 text-left font-medium">Day</th>
                  <th className="pb-3 text-right font-medium">Calories</th>
                  <th className="pb-3 text-right font-medium">Protein</th>
                  <th className="pb-3 text-right font-medium">Carbs</th>
                  <th className="pb-3 text-right font-medium">Fat</th>
                  <th className="pb-3 text-right font-medium">Meals</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.daily.map((d, i) => {
                  const isToday = i === today;
                  return (
                    <tr key={d.fullDay} className={`${isToday ? 'bg-emerald-50' : 'hover:bg-gray-50'} transition-colors`}>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${isToday ? 'text-emerald-600' : 'text-gray-700'}`}>
                            {d.fullDay}
                          </span>
                          {isToday && (
                            <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full font-medium">
                              Today
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 text-right font-semibold text-gray-800">
                        {d.total > 0 ? d.total.toLocaleString() : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="py-3 text-right text-red-500">{d.protein > 0 ? `${d.protein}g` : <span className="text-gray-300">—</span>}</td>
                      <td className="py-3 text-right text-amber-500">{d.carbs > 0 ? `${d.carbs}g` : <span className="text-gray-300">—</span>}</td>
                      <td className="py-3 text-right text-violet-500">{d.fat > 0 ? `${d.fat}g` : <span className="text-gray-300">—</span>}</td>
                      <td className="py-3 text-right text-gray-500">{d.meals.length}/3</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-100 bg-gray-50 font-semibold">
                  <td className="py-3 text-gray-700">Weekly avg</td>
                  <td className="py-3 text-right text-emerald-600">{stats.avgCals.toLocaleString()}</td>
                  <td className="py-3 text-right text-red-500">{stats.avgProt}g</td>
                  <td className="py-3 text-right text-amber-500">{stats.avgCarb}g</td>
                  <td className="py-3 text-right text-violet-500">{stats.avgFat}g</td>
                  <td className="py-3 text-right text-gray-500">—</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </motion.div>

        {/* Insight cards */}
        <div className="grid sm:grid-cols-2 gap-4 pb-8">
          {[
            {
              label: 'Highest calorie day',
              value: stats.highestCalDay || '—',
              sub: `${(stats.daily.find(d => d.fullDay === stats.highestCalDay)?.total || 0).toLocaleString()} kcal`,
              icon: '📈',
              bg: 'bg-orange-50',
              border: 'border-orange-100',
            },
            {
              label: 'Lightest day',
              value: stats.lowestCalDay || '—',
              sub: `${(stats.daily.find(d => d.fullDay === stats.lowestCalDay)?.total || 0).toLocaleString()} kcal`,
              icon: '🥗',
              bg: 'bg-emerald-50',
              border: 'border-emerald-100',
            },
          ].map(({ label, value, sub, icon, bg, border }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className={`${bg} border ${border} rounded-3xl p-5 flex items-center gap-4`}
            >
              <span className="text-4xl">{icon}</span>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
                <p className="text-xl font-bold text-gray-800">{value}</p>
                <p className="text-sm text-gray-500">{sub}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
