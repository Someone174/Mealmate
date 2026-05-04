import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Sun, Clock, ArrowRight } from 'lucide-react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'];

const mealConfig = {
  breakfast: { label: 'Breakfast', emoji: '🌅', gradient: 'from-amber-400 to-orange-400', bg: 'bg-amber-50', text: 'text-amber-700' },
  lunch:     { label: 'Lunch',     emoji: '☀️', gradient: 'from-emerald-400 to-teal-400', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  dinner:    { label: 'Dinner',    emoji: '🌙', gradient: 'from-violet-400 to-purple-400', bg: 'bg-violet-50', text: 'text-violet-700' },
};

export default function TodaysMeals({ plan }) {
  if (!plan) return null;

  const todayName = DAYS[new Date().getDay()];
  const todayMeals = plan[todayName] || {};
  const hasMeals = MEAL_TYPES.some(t => todayMeals[t] && !todayMeals[t].skipped);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
    >
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Sun className="w-6 h-6 text-amber-500" />
          Today — {todayName}
        </h2>
        <span className="text-sm text-gray-400">{new Date().toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}</span>
      </div>

      {!hasMeals ? (
        <div className="text-center py-6 text-gray-400">
          <p className="text-sm">No meals planned for today</p>
        </div>
      ) : (
        <div className="space-y-3">
          {MEAL_TYPES.map(type => {
            const recipe = todayMeals[type];
            if (!recipe) return null;
            const cfg = mealConfig[type];
            const isSkipped = recipe.skipped;

            return (
              <motion.div
                key={type}
                whileHover={{ x: isSkipped ? 0 : 3 }}
                className={`rounded-2xl overflow-hidden ${isSkipped ? 'opacity-50' : ''}`}
              >
                <Link
                  to={isSkipped ? '#' : `${createPageUrl('Recipes')}?id=${recipe.id}`}
                  className={`flex items-center gap-4 p-4 ${cfg.bg} group`}
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center text-2xl flex-shrink-0`}>
                    {recipe.image || cfg.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold uppercase tracking-wide ${cfg.text} mb-0.5`}>{cfg.label}</p>
                    <p className={`font-semibold truncate ${isSkipped ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                      {recipe.name}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {recipe.prepTime} min
                      </span>
                      {recipe.calories && <span>{recipe.calories} cal</span>}
                      {isSkipped && <span className="text-orange-500 font-medium">Skipped</span>}
                    </div>
                  </div>
                  {!isSkipped && (
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 flex-shrink-0 transition-colors" />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
