import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, RotateCcw, Trash2, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getPlanHistory,
  removeFromPlanHistory,
  clearPlanHistory,
} from '@/components/mealmate/LocalStorageService';
import { totalPrepMinutes, formatMinutes } from '@/lib/nutrition';
import { DAYS, MEAL_TYPES } from '@/components/mealmate/MealData';

const formatRelative = (iso) => {
  const then = new Date(iso).getTime();
  const diffSec = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (diffSec < 60) return 'just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} min ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} h ago`;
  return `${Math.floor(diffSec / 86400)} days ago`;
};

const planSummary = (plan) => {
  if (!plan) return { meals: 0, time: 0, sample: '' };
  let meals = 0;
  const samples = [];
  for (const day of DAYS) {
    for (const t of MEAL_TYPES) {
      const r = plan[day]?.[t];
      if (r && !r.skipped) {
        meals++;
        if (samples.length < 2) samples.push(r.name);
      }
    }
  }
  return { meals, time: totalPrepMinutes(plan), sample: samples.join(' • ') };
};

export default function PlanHistory({ user, isOpen, onClose, onRestore }) {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    if (isOpen && user) setEntries(getPlanHistory(user));
  }, [isOpen, user]);

  const handleRestore = (entry) => {
    onRestore(entry.plan);
    onClose();
  };

  const handleRemove = (id) => {
    removeFromPlanHistory(user, id);
    setEntries(getPlanHistory(user));
  };

  const handleClear = () => {
    clearPlanHistory(user);
    setEntries([]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25 }}
            className="relative w-full max-w-lg max-h-[85vh] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Plan history"
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                  <History className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />
                </div>
                <div>
                  <h2 className="font-bold text-strong">Plan history</h2>
                  <p className="text-xs text-muted">Your last {entries.length || 0} weekly plan(s)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Close history"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {entries.length === 0 && (
                <div className="text-center py-10">
                  <Clock className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                  <p className="text-muted text-sm">No saved plans yet.</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Each new plan is automatically archived here so you can restore it later.
                  </p>
                </div>
              )}

              {entries.map((entry) => {
                const s = planSummary(entry.plan);
                return (
                  <div
                    key={entry.id}
                    className="rounded-2xl border border-gray-100 dark:border-gray-800 p-4 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-strong">{entry.label}</p>
                        <p className="text-xs text-muted mt-0.5">
                          {formatRelative(entry.savedAt)} · {s.meals} meals · {formatMinutes(s.time)} cooking
                        </p>
                        {s.sample && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">
                            {s.sample}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRestore(entry)}
                          className="h-8 px-2.5 rounded-lg border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900/30"
                        >
                          <RotateCcw className="w-3.5 h-3.5 mr-1" />
                          Restore
                        </Button>
                        <button
                          type="button"
                          onClick={() => handleRemove(entry.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                          aria-label="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {entries.length > 0 && (
              <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-between">
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-xs text-gray-400 hover:text-red-500"
                >
                  Clear all history
                </button>
                <span className="text-xs text-gray-400">Stored locally on this device.</span>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
