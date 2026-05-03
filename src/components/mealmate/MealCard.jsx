import React from 'react';
import { Clock, Users, Zap, ArrowRightLeft, XCircle, RotateCcw, Youtube } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function MealCard({ recipe, mealType, day, onSwap, onSkip, onUnskip, compact = false }) {
  if (!recipe) return null;
  
  const isSkipped = recipe?.skipped;
  
  const mealTypeColors = {
    breakfast: 'from-amber-400 to-orange-400',
    lunch: 'from-emerald-400 to-teal-400',
    dinner: 'from-violet-400 to-purple-400'
  };
  
  const mealTypeLabels = {
    breakfast: '🌅 Breakfast',
    lunch: '☀️ Lunch',
    dinner: '🌙 Dinner'
  };
  
  if (compact) {
    return (
      <motion.div
        whileHover={{ scale: isSkipped ? 1 : 1.02 }}
        whileTap={{ scale: isSkipped ? 1 : 0.98 }}
        className={`bg-white rounded-xl p-3 shadow-sm border transition-all cursor-pointer group ${
          isSkipped ? 'border-gray-300 opacity-60' : 'border-gray-100 hover:shadow-md'
        }`}
      >
        <Link to={createPageUrl('Recipes') + `?id=${recipe.id}`} className="block">
          <div className="flex items-center gap-3">
            <div className={`text-3xl p-2 rounded-xl bg-gradient-to-br ${mealTypeColors[mealType]} ${
              isSkipped ? 'grayscale opacity-50' : 'bg-opacity-10'
            }`}>
              {recipe.image}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 font-medium">{mealTypeLabels[mealType]}</p>
              <h4 className={`font-semibold truncate ${
                isSkipped ? 'text-gray-400 line-through' : 'text-gray-800'
              }`}>
                {recipe.name}
              </h4>
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{recipe.prepTime}min</span>
                {isSkipped && <span className="text-orange-600 font-medium">• Skipped</span>}
                {recipe.video_url && !isSkipped && (
                  <a
                    href={recipe.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="flex items-center gap-0.5 text-red-500 hover:text-red-700 font-medium"
                  >
                    <Youtube className="w-3 h-3" />
                    Video
                  </a>
                )}
              </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {isSkipped ? (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onUnskip(day, mealType);
                  }}
                  className="p-2 rounded-lg hover:bg-green-50 text-green-600 transition-colors"
                  title="Restore meal"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              ) : (
                <>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onSkip(day, mealType);
                    }}
                    className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                    title="Skip meal"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onSwap(day, mealType);
                    }}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-emerald-500 transition-colors"
                    title="Swap meal"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: isSkipped ? 0 : -4 }}
      className={`bg-white rounded-2xl overflow-hidden shadow-lg border group ${
        isSkipped ? 'border-gray-300 opacity-70' : 'border-gray-100 shadow-gray-100/50'
      }`}
    >
      <Link to={createPageUrl('Recipes') + `?id=${recipe.id}`}>
        <div className={`h-2 bg-gradient-to-r ${mealTypeColors[mealType]} ${isSkipped ? 'grayscale' : ''}`} />
        
        <div className="p-5 relative">
          {isSkipped && (
            <div className="absolute top-3 right-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
              Skipped
            </div>
          )}
          
          <div className="flex justify-between items-start mb-4">
            <div className={`text-5xl p-3 bg-gray-50 rounded-2xl transition-transform duration-300 ${
              isSkipped ? 'grayscale' : 'group-hover:scale-110'
            }`}>
              {recipe.image}
            </div>
            {!isSkipped && (
              <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${mealTypeColors[mealType]} text-white`}>
                {recipe.nutritionLabel}
              </span>
            )}
          </div>
          
          <h3 className={`font-bold text-lg mb-2 line-clamp-2 transition-colors ${
            isSkipped 
              ? 'text-gray-400 line-through' 
              : 'text-gray-800 group-hover:text-emerald-600'
          }`}>
            {recipe.name}
          </h3>
          
          <p className="text-gray-500 text-sm line-clamp-2 mb-4">
            {recipe.summary}
          </p>
          
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-emerald-500" />
              <span>{recipe.prepTime} min</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-orange-500" />
              <span>{recipe.servings} servings</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-gray-600">{recipe.calories} cal</span>
            </div>
            <div className="flex gap-1">
              <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md text-xs">
                P: {recipe.protein}g
              </span>
              <span className="px-2 py-1 bg-orange-50 text-orange-600 rounded-md text-xs">
                C: {recipe.carbs}g
              </span>
              <span className="px-2 py-1 bg-violet-50 text-violet-600 rounded-md text-xs">
                F: {recipe.fat}g
              </span>
            </div>
          </div>

          {recipe.video_url && (
            <a
              href={recipe.video_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="mt-3 flex items-center gap-2 text-xs text-red-600 hover:text-red-700 font-medium transition-colors"
            >
              <Youtube className="w-4 h-4" />
              {recipe.video_title || 'Watch Recipe Video'}
            </a>
          )}
        </div>
      </Link>
      
      <div className="px-5 pb-5">
        {isSkipped ? (
          <button
            onClick={() => onUnskip(day, mealType)}
            className="w-full py-2.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Restore Meal
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => onSkip(day, mealType)}
              className="flex-1 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Skip
            </button>
            <button
              onClick={() => onSwap(day, mealType)}
              className="flex-1 py-2.5 bg-gray-50 hover:bg-emerald-50 text-gray-600 hover:text-emerald-600 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 group/btn"
            >
              <ArrowRightLeft className="w-4 h-4 group-hover/btn:rotate-180 transition-transform duration-300" />
              Swap
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}