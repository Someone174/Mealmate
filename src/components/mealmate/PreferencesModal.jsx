import React, { useState } from 'react';
import { X, Leaf, Timer, DollarSign, Users, UtensilsCrossed, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

const dietaryOptions = [
  { id: 'vegetarian', label: 'Vegetarian', icon: '🥗' },
  { id: 'gluten-free', label: 'Gluten-Free', icon: '🌾' },
  { id: 'nut-free', label: 'Nut-Free', icon: '🥜' },
  { id: 'low-carb', label: 'Low Carb', icon: '🥩' },
  { id: 'family-friendly', label: 'Family Friendly', icon: '👨‍👩‍👧‍👦' },
  { id: 'quick', label: 'Quick Meals (<30min)', icon: '⚡' },
  { id: 'budget', label: 'Budget Friendly', icon: '💰' }
];

const cuisineOptions = [
  { id: 'mediterranean', label: 'Mediterranean', icon: '🫒' },
  { id: 'asian', label: 'Asian', icon: '🥢' },
  { id: 'indian', label: 'Indian', icon: '🍛' },
  { id: 'mexican', label: 'Mexican', icon: '🌮' },
  { id: 'italian', label: 'Italian', icon: '🍝' },
  { id: 'middle-eastern', label: 'Middle Eastern', icon: '🧆' }
];

export default function PreferencesModal({ isOpen, onClose, currentPrefs, onSave }) {
  const [prefs, setPrefs] = useState(currentPrefs || {
    dietary: [],
    servings: 2,
    cuisines: [],
    weeklyBudget: 500
  });
  
  const toggleDietary = (id) => {
    setPrefs(prev => ({
      ...prev,
      dietary: prev.dietary.includes(id)
        ? prev.dietary.filter(d => d !== id)
        : [...prev.dietary, id]
    }));
  };
  
  const toggleCuisine = (id) => {
    setPrefs(prev => ({
      ...prev,
      cuisines: prev.cuisines.includes(id)
        ? prev.cuisines.filter(c => c !== id)
        : [...prev.cuisines, id]
    }));
  };
  
  const handleSave = () => {
    onSave(prefs);
    onClose();
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
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25 }}
            className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white z-10 p-6 pb-4 border-b border-gray-100">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
              
              <h2 className="text-2xl font-bold text-gray-800">
                Your Preferences
              </h2>
              <p className="text-gray-500 mt-1">Customize your meal plans</p>
            </div>
            
            <div className="p-6 space-y-8">
              {/* Dietary Preferences */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Leaf className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-semibold text-gray-800">Dietary Preferences</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {dietaryOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => toggleDietary(option.id)}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                        prefs.dietary.includes(option.id)
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      <span className="text-xl">{option.icon}</span>
                      <span className="text-sm font-medium flex-1 text-left">{option.label}</span>
                      {prefs.dietary.includes(option.id) && (
                        <Check className="w-4 h-4 text-emerald-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Servings */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-orange-500" />
                  <h3 className="font-semibold text-gray-800">Servings</h3>
                </div>
                <div className="px-2">
                  <div className="flex justify-between text-sm text-gray-500 mb-3">
                    <span>1 person</span>
                    <span className="font-semibold text-lg text-orange-500">{prefs.servings} people</span>
                    <span>6 people</span>
                  </div>
                  <Slider
                    value={[prefs.servings]}
                    min={1}
                    max={6}
                    step={1}
                    onValueChange={(value) => setPrefs(prev => ({ ...prev, servings: value[0] }))}
                    className="[&_[role=slider]]:bg-orange-500 [&_[role=slider]]:border-orange-500"
                  />
                </div>
              </div>
              
              {/* Cuisine Preferences */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <UtensilsCrossed className="w-5 h-5 text-violet-500" />
                  <h3 className="font-semibold text-gray-800">Favorite Cuisines</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {cuisineOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => toggleCuisine(option.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all ${
                        prefs.cuisines.includes(option.id)
                          ? 'border-violet-500 bg-violet-50 text-violet-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      <span>{option.icon}</span>
                      <span className="text-sm font-medium">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Weekly Budget */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-semibold text-gray-800">Weekly Budget</h3>
                </div>
                <div className="px-2">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-gray-500">Target spending</span>
                    <span className="text-2xl font-bold text-emerald-600">{prefs.weeklyBudget} QAR</span>
                  </div>
                  <Slider
                    value={[prefs.weeklyBudget]}
                    min={100}
                    max={2000}
                    step={50}
                    onValueChange={(value) => setPrefs(prev => ({ ...prev, weeklyBudget: value[0] }))}
                    className="[&_[role=slider]]:bg-emerald-500 [&_[role=slider]]:border-emerald-500"
                  />
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>100 QAR</span>
                    <span>2000 QAR</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-3 text-center font-medium">
                    {prefs.weeklyBudget < 300 ? '💰 Ultra Budget Mode' : 
                     prefs.weeklyBudget < 600 ? '🥗 Budget-Friendly' :
                     prefs.weeklyBudget < 1000 ? '✨ Balanced' :
                     prefs.weeklyBudget < 1500 ? '🍽️ Premium Selection' : '👨‍🍳 Gourmet'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="sticky bottom-0 bg-white p-6 pt-4 border-t border-gray-100">
              <Button
                onClick={handleSave}
                className="w-full py-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl text-lg font-semibold shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl hover:shadow-emerald-500/30"
              >
                Save & Refresh Plan
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}