import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ChefHat } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MealCard from './MealCard';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'];

// Map JS getDay() (0=Sun…6=Sat) to our Monday-first index
function todayIndex() {
  const d = new Date().getDay(); // 0=Sun, 1=Mon...6=Sat
  return d === 0 ? 6 : d - 1;   // 0=Mon … 6=Sun
}

export default function WeeklyCalendar({ plan, onSwap, onSkip, onUnskip }) {
  const [selectedDay, setSelectedDay] = useState(todayIndex);
  const currentDay = DAYS[selectedDay];

  const nextDay = () => setSelectedDay((prev) => (prev + 1) % 7);
  const prevDay = () => setSelectedDay((prev) => (prev - 1 + 7) % 7);

  if (!plan) {
    return (
      <div className="text-center py-16">
        <ChefHat className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Loading your plan...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="md:hidden mb-6">
        <div className="flex items-center justify-between bg-white rounded-2xl p-2 shadow-sm border border-gray-100">
          <button onClick={prevDay} className="p-3 rounded-xl hover:bg-gray-100 transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          <div className="text-center">
            <h3 className="font-bold text-lg text-gray-800">{currentDay}</h3>
            <p className="text-sm text-gray-500">Day {selectedDay + 1} of 7</p>
          </div>

          <button onClick={nextDay} className="p-3 rounded-xl hover:bg-gray-100 transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex gap-1 mt-3 overflow-x-auto pb-2 hide-scrollbar">
          {DAYS.map((day, idx) => (
            <button
              key={day}
              onClick={() => setSelectedDay(idx)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                idx === selectedDay
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDay}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4 mt-4"
          >
            {MEAL_TYPES.map((type) => (
              <MealCard
                key={`${currentDay}-${type}`}
                recipe={plan[currentDay]?.[type]}
                mealType={type}
                day={currentDay}
                onSwap={onSwap}
                onSkip={onSkip}
                onUnskip={onUnskip}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="hidden md:block">
        <div className="overflow-x-auto">
          <div className="grid grid-cols-7 gap-4 min-w-[1000px]">
            {DAYS.map((day, dayIdx) => (
              <div key={day} className="space-y-3">
                <div className={`text-center p-3 rounded-xl ${
                  dayIdx === todayIndex()
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  <h3 className="font-semibold">{day}</h3>
                </div>

                {MEAL_TYPES.map((type) => (
                  <MealCard
                    key={`${day}-${type}`}
                    recipe={plan[day]?.[type]}
                    mealType={type}
                    day={day}
                    onSwap={onSwap}
                    onSkip={onSkip}
                    onUnskip={onUnskip}
                    compact
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
