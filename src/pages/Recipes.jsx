import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  ArrowLeft, Clock, Users, Zap, Heart, 
  ChefHat, Play, Pause, RotateCcw, Check, Share2,
  Printer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  getCurrentUser, 
  isFavorite, 
  addFavorite, 
  removeFavorite 
} from '@/components/mealmate/LocalStorageService';
import { getRecipeById, loadRecipesDB } from '@/components/mealmate/MealData';
import { toast, Toaster } from 'sonner';

export default function Recipes() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const recipeId = urlParams.get('id');
  
  const [user, setUser] = useState(null);
  const [recipe, setRecipe] = useState(null);
  const [checkedIngredients, setCheckedIngredients] = useState([]);
  const [checkedSteps, setCheckedSteps] = useState([]);
  const [favorite, setFavorite] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerMinutes, setTimerMinutes] = useState(0);
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    const load = async () => {
      const currentUser = getCurrentUser();
      setUser(currentUser);
      await loadRecipesDB();
      if (recipeId) {
        const foundRecipe = getRecipeById(recipeId);
        if (foundRecipe) {
          setRecipe(foundRecipe);
          setTimerMinutes(foundRecipe.prepTime);
          if (currentUser) {
            setFavorite(isFavorite(currentUser.username, recipeId));
          }
        }
      }
    };
    load();
  }, [recipeId]);
  
  // Timer effect
  useEffect(() => {
    let interval;
    if (timerActive && (timerMinutes > 0 || timerSeconds > 0)) {
      interval = setInterval(() => {
        if (timerSeconds > 0) {
          setTimerSeconds(s => s - 1);
        } else if (timerMinutes > 0) {
          setTimerMinutes(m => m - 1);
          setTimerSeconds(59);
        }
      }, 1000);
    } else if (timerActive && timerMinutes === 0 && timerSeconds === 0) {
      setTimerActive(false);
      toast.success('Timer complete! ðŸŽ‰ Your meal should be ready!');
    }
    return () => clearInterval(interval);
  }, [timerActive, timerMinutes, timerSeconds]);
  
  const toggleIngredient = (idx) => {
    setCheckedIngredients(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };
  
  const toggleStep = (idx) => {
    setCheckedSteps(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };
  
  const toggleFavorite = () => {
    if (!user) {
      toast.error('Please login to save favorites!');
      return;
    }
    
    if (favorite) {
      removeFavorite(user.username, recipeId);
      setFavorite(false);
      toast.success('Removed from favorites');
    } else {
      addFavorite(user.username, recipeId);
      setFavorite(true);
      toast.success('Added to favorites! â¤ï¸');
    }
  };
  
  const resetTimer = () => {
    setTimerActive(false);
    setTimerMinutes(recipe?.prepTime || 0);
    setTimerSeconds(0);
  };
  
  const handleShare = async () => {
    const shareText = `Check out this recipe: ${recipe.name} ðŸ½ï¸\n\nPrep time: ${recipe.prepTime} min\nServings: ${recipe.servings}\n\n${recipe.summary}`;
    
    if (navigator.share) {
      try {
        await navigator.share({ text: shareText, title: recipe.name });
      } catch (err) {
        // cancelled
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Recipe details copied!');
    }
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">ðŸ½ï¸</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Recipe not found</h2>
          <p className="text-gray-500 mb-4">Select a recipe from your meal plan</p>
          <Link to={createPageUrl('Dashboard')}>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  const nutritionBadges = [];
  if (recipe.tags.includes('vegetarian')) nutritionBadges.push({ label: 'Vegetarian', color: 'bg-green-100 text-green-700' });
  if (recipe.tags.includes('gluten-free')) nutritionBadges.push({ label: 'Gluten-Free', color: 'bg-amber-100 text-amber-700' });
  if (recipe.tags.includes('quick')) nutritionBadges.push({ label: 'Quick Prep', color: 'bg-blue-100 text-blue-700' });
  if (recipe.tags.includes('low-carb')) nutritionBadges.push({ label: 'Low Carb', color: 'bg-purple-100 text-purple-700' });
  if (recipe.protein > 25) nutritionBadges.push({ label: 'High Protein', color: 'bg-red-100 text-red-700' });
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" richColors />
      
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-100 print:hidden">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl('Dashboard')}>
              <Button variant="ghost" className="text-gray-600">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Plan
              </Button>
            </Link>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrint}
                className="text-gray-600"
              >
                <Printer className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                className="text-gray-600"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Share2 className="w-5 h-5" />}
              </Button>
              <Button
                variant={favorite ? "default" : "ghost"}
                onClick={toggleFavorite}
                className={favorite ? "bg-red-500 hover:bg-red-600 text-white" : "text-gray-600"}
              >
                {favorite ? <Heart className="w-5 h-5 fill-current" /> : <Heart className="w-5 h-5" />}
                <span className="ml-2 hidden sm:inline">{favorite ? 'Saved' : 'Save'}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Recipe Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-32 h-32 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl flex items-center justify-center text-7xl flex-shrink-0 mx-auto md:mx-0">
              {recipe.image}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">{recipe.name}</h1>
              <p className="text-gray-600 text-lg leading-relaxed mb-4">{recipe.summary}</p>
              
              <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-5 h-5 text-emerald-500" />
                  <span>{recipe.prepTime} min</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-5 h-5 text-orange-500" />
                  <span>{recipe.servings} servings</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Zap className="w-5 h-5 text-amber-500" />
                  <span>{recipe.calories} cal</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {nutritionBadges.map((badge, i) => (
                  <Badge key={i} className={`${badge.color} border-0 px-3 py-1`}>
                    {badge.label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          {/* Nutrition Cards */}
          <div className="grid grid-cols-4 gap-3 mt-6 pt-6 border-t border-gray-100">
            <div className="text-center p-3 bg-emerald-50 rounded-2xl">
              <p className="text-2xl font-bold text-emerald-600">{recipe.calories}</p>
              <p className="text-xs text-gray-500">Calories</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-2xl">
              <p className="text-2xl font-bold text-red-600">{recipe.protein}g</p>
              <p className="text-xs text-gray-500">Protein</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-2xl">
              <p className="text-2xl font-bold text-orange-600">{recipe.carbs}g</p>
              <p className="text-xs text-gray-500">Carbs</p>
            </div>
            <div className="text-center p-3 bg-violet-50 rounded-2xl">
              <p className="text-2xl font-bold text-violet-600">{recipe.fat}g</p>
              <p className="text-xs text-gray-500">Fat</p>
            </div>
          </div>
        </motion.div>
        
        <div className="grid md:grid-cols-[1fr_1.5fr] gap-6">
          {/* Ingredients */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-fit"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">ðŸ¥˜</span>
              Ingredients
            </h2>
            
            <div className="space-y-2">
              {recipe.ingredients.map((ing, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    checkedIngredients.includes(idx) ? 'bg-emerald-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <Checkbox
                    checked={checkedIngredients.includes(idx)}
                    onCheckedChange={() => toggleIngredient(idx)}
                    className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                  />
                  <div className={checkedIngredients.includes(idx) ? 'line-through text-gray-400' : ''}>
                    <span className="font-medium">{ing.item}</span>
                    <span className="text-gray-500 ml-2 text-sm">{ing.amount}</span>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <p className="text-sm text-gray-500 mt-4 text-center">
              {checkedIngredients.length}/{recipe.ingredients.length} gathered
            </p>
          </motion.div>
          
          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <ChefHat className="w-6 h-6 text-emerald-500" />
                Instructions
              </h2>
              
              {/* Timer */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-full pl-4 pr-2 py-1">
                <span className="font-mono text-lg font-bold text-gray-800">
                  {String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setTimerActive(!timerActive)}
                  className="h-8 w-8"
                >
                  {timerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={resetTimer}
                  className="h-8 w-8"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              {recipe.steps.map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + idx * 0.05 }}
                  onClick={() => toggleStep(idx)}
                  className={`flex gap-4 p-4 rounded-2xl cursor-pointer transition-all ${
                    checkedSteps.includes(idx) 
                      ? 'bg-emerald-50 border-2 border-emerald-200' 
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold ${
                    checkedSteps.includes(idx) 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-white text-gray-600 shadow'
                  }`}>
                    {checkedSteps.includes(idx) ? <Check className="w-5 h-5" /> : idx + 1}
                  </div>
                  <p className={`pt-1 ${checkedSteps.includes(idx) ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                    {step}
                  </p>
                </motion.div>
              ))}
            </div>
            
            {checkedSteps.length === recipe.steps.length && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 p-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl text-white text-center"
              >
                <span className="text-2xl mr-2">ðŸŽ‰</span>
                <span className="font-semibold">All done! Enjoy your delicious meal!</span>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
      
      <style>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}