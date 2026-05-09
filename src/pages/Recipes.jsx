import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  ArrowLeft, Clock, Users, Zap, Heart,
  ChefHat, Play, Pause, RotateCcw, Check, Share2,
  Printer, Plus, Minus, Star, StickyNote,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
  getCurrentUser,
  isFavorite,
  addFavorite,
  removeFavorite,
  getRecipeNote,
  setRecipeNote as saveRecipeNote,
  getRecipeRating,
  setRecipeRating,
} from '@/components/mealmate/LocalStorageService';
import { getRecipeById, loadRecipesDB } from '@/components/mealmate/MealData';
import { scaleIngredients } from '@/lib/scaleIngredients';
import { totalsForRecipe } from '@/lib/nutrition';
import { useTheme } from '@/lib/ThemeContext';
import { toast, Toaster } from 'sonner';

export default function Recipes() {
  const navigate = useNavigate();
  const { resolved: theme } = useTheme();
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
  const [scale, setScale] = useState(1); // multiplier on recipe.servings
  const [note, setNote] = useState('');
  const [rating, setRating] = useState(0);

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
            setFavorite(isFavorite(currentUser, recipeId));
            setNote(getRecipeNote(currentUser, recipeId));
            setRating(getRecipeRating(currentUser, recipeId));
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
          setTimerSeconds((s) => s - 1);
        } else if (timerMinutes > 0) {
          setTimerMinutes((m) => m - 1);
          setTimerSeconds(59);
        }
      }, 1000);
    } else if (timerActive && timerMinutes === 0 && timerSeconds === 0) {
      setTimerActive(false);
      toast.success('Timer complete. Your meal should be ready.');
      try {
        // Best-effort audible nudge if the user has interacted with the page.
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.frequency.value = 880;
        o.connect(g); g.connect(ctx.destination);
        g.gain.setValueAtTime(0.0001, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.05);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.7);
        o.start(); o.stop(ctx.currentTime + 0.7);
      } catch {
        /* ignore audio failures */
      }
    }
    return () => clearInterval(interval);
  }, [timerActive, timerMinutes, timerSeconds]);

  const toggleIngredient = (idx) =>
    setCheckedIngredients((prev) => (prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]));
  const toggleStep = (idx) =>
    setCheckedSteps((prev) => (prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]));

  const toggleFavorite = () => {
    if (!user) {
      toast.error('Sign in to save favorites.');
      return;
    }
    if (favorite) {
      removeFavorite(user, recipeId);
      setFavorite(false);
      toast.success('Removed from favorites.');
    } else {
      addFavorite(user, recipeId);
      setFavorite(true);
      toast.success('Added to favorites.');
    }
  };

  const handleRating = (stars) => {
    if (!user) return;
    const next = stars === rating ? 0 : stars;
    setRating(next);
    setRecipeRating(user, recipeId, next);
    if (next) toast.success(`Rated ${next}/5.`);
  };

  const onNoteChange = (e) => {
    const v = e.target.value;
    setNote(v);
    if (user) saveRecipeNote(user, recipeId, v);
  };

  const resetTimer = () => {
    setTimerActive(false);
    setTimerMinutes(recipe?.prepTime || 0);
    setTimerSeconds(0);
  };

  const handleShare = async () => {
    const shareText = `Check out this recipe: ${recipe.name}\n\nPrep time: ${recipe.prepTime} min\nServings: ${recipe.servings}\n\n${recipe.summary}`;
    if (navigator.share) {
      try {
        await navigator.share({ text: shareText, title: recipe.name });
      } catch {
        /* cancelled */
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Recipe details copied.');
    }
  };

  const handlePrint = () => window.print();

  // Scaled values
  const baseServings = recipe?.servings || 1;
  const targetServings = Math.max(1, Math.round(baseServings * scale));
  const scaledIngredients = useMemo(
    () => (recipe ? scaleIngredients(recipe.ingredients, scale) : []),
    [recipe, scale],
  );
  const scaledTotals = useMemo(() => totalsForRecipe(recipe, scale), [recipe, scale]);

  const adjustScale = (delta) => {
    const nextServings = Math.max(1, Math.min(20, targetServings + delta));
    setScale(nextServings / baseServings);
  };

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center surface-app">
        <div className="text-center">
          <div className="text-6xl mb-4">🍽️</div>
          <h2 className="text-xl font-bold text-strong mb-2">Recipe not found</h2>
          <p className="text-muted mb-4">Select a recipe from your meal plan or browse all recipes.</p>
          <div className="flex gap-2 justify-center">
            <Link to={createPageUrl('Dashboard')}>
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
                Go to Dashboard
              </Button>
            </Link>
            <Link to={createPageUrl('RecipesBrowse')}>
              <Button variant="outline">Browse recipes</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const nutritionBadges = [];
  if (recipe.tags?.includes('vegetarian')) nutritionBadges.push({ label: 'Vegetarian', color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' });
  if (recipe.tags?.includes('gluten-free')) nutritionBadges.push({ label: 'Gluten-Free', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' });
  if (recipe.tags?.includes('quick')) nutritionBadges.push({ label: 'Quick Prep', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' });
  if (recipe.tags?.includes('low-carb')) nutritionBadges.push({ label: 'Low Carb', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' });
  if (recipe.protein > 25) nutritionBadges.push({ label: 'High Protein', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' });

  return (
    <div className="min-h-screen surface-app">
      <Toaster position="top-center" richColors theme={theme} />

      <div className="sticky top-0 z-40 surface-nav backdrop-blur-xl border-b print:hidden">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => (window.history.length > 1 ? window.history.back() : navigate(createPageUrl('Dashboard')))}
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handlePrint} className="text-gray-600 dark:text-gray-300">
                <Printer className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleShare} className="text-gray-600 dark:text-gray-300">
                {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Share2 className="w-5 h-5" />}
              </Button>
              <Button
                variant={favorite ? 'default' : 'ghost'}
                onClick={toggleFavorite}
                className={favorite ? 'bg-red-500 hover:bg-red-600 text-white' : 'text-gray-600 dark:text-gray-300'}
              >
                <Heart className={`w-5 h-5 ${favorite ? 'fill-current' : ''}`} />
                <span className="ml-2 hidden sm:inline">{favorite ? 'Saved' : 'Save'}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="surface-card rounded-3xl p-8 shadow-sm border mb-6"
        >
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-32 h-32 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 rounded-3xl flex items-center justify-center text-7xl flex-shrink-0 mx-auto md:mx-0 overflow-hidden">
              {recipe.image && recipe.image.startsWith('http') ? (
                <img src={recipe.image} alt="" className="w-full h-full object-cover" />
              ) : (
                <span>{recipe.image || '🍽️'}</span>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-strong mb-3">{recipe.name}</h1>
              <p className="text-body text-lg leading-relaxed mb-4">{recipe.summary}</p>

              <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start mb-4">
                <div className="flex items-center gap-2 text-body">
                  <Clock className="w-5 h-5 text-emerald-500" />
                  <span>{recipe.prepTime} min</span>
                </div>
                <div className="flex items-center gap-2 text-body">
                  <Users className="w-5 h-5 text-orange-500" />
                  <span>{targetServings} servings</span>
                </div>
                <div className="flex items-center gap-2 text-body">
                  <Zap className="w-5 h-5 text-amber-500" />
                  <span>{scaledTotals.calories} cal</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                {nutritionBadges.map((badge, i) => (
                  <Badge key={i} className={`${badge.color} border-0 px-3 py-1`}>
                    {badge.label}
                  </Badge>
                ))}
              </div>

              {/* Star rating */}
              {user && (
                <div className="flex items-center justify-center md:justify-start gap-1.5 print:hidden">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleRating(s)}
                      className="p-1 group"
                      aria-label={`Rate ${s} out of 5`}
                    >
                      <Star
                        className={`w-5 h-5 transition-all group-hover:scale-110 ${
                          s <= rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    </button>
                  ))}
                  {rating > 0 && <span className="text-xs text-muted ml-1">your rating</span>}
                </div>
              )}
            </div>
          </div>

          {/* Servings scaler */}
          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
            <div className="text-sm text-body">
              <span className="font-semibold">Scale recipe</span>{' '}
              <span className="text-muted">— ingredients and macros recompute automatically.</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => adjustScale(-1)}
                disabled={targetServings <= 1}
                aria-label="Reduce servings"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <div className="min-w-[120px] text-center">
                <p className="text-xl font-bold text-strong tabular-nums">{targetServings}</p>
                <p className="text-[11px] uppercase tracking-wide text-muted">servings</p>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => adjustScale(1)}
                disabled={targetServings >= 20}
                aria-label="Increase servings"
              >
                <Plus className="w-4 h-4" />
              </Button>
              {scale !== 1 && (
                <Button variant="ghost" size="sm" onClick={() => setScale(1)} className="text-xs ml-1">
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Nutrition Cards (scaled) */}
          <div className="grid grid-cols-4 gap-3 mt-6">
            <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl">
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-300">{scaledTotals.calories}</p>
              <p className="text-xs text-muted">Calories</p>
            </div>
            <div className="text-center p-3 bg-red-50 dark:bg-red-900/30 rounded-2xl">
              <p className="text-2xl font-bold text-red-600 dark:text-red-300">{scaledTotals.protein}g</p>
              <p className="text-xs text-muted">Protein</p>
            </div>
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/30 rounded-2xl">
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-300">{scaledTotals.carbs}g</p>
              <p className="text-xs text-muted">Carbs</p>
            </div>
            <div className="text-center p-3 bg-violet-50 dark:bg-violet-900/30 rounded-2xl">
              <p className="text-2xl font-bold text-violet-600 dark:text-violet-300">{scaledTotals.fat}g</p>
              <p className="text-xs text-muted">Fat</p>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-[1fr_1.5fr] gap-6">
          {/* Ingredients */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="surface-card rounded-3xl p-6 shadow-sm border h-fit"
          >
            <h2 className="text-xl font-bold text-strong mb-4 flex items-center gap-2">
              <span className="text-2xl">🥘</span>
              Ingredients
            </h2>

            <div className="space-y-2">
              {scaledIngredients.map((ing, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    checkedIngredients.includes(idx) ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/40'
                  }`}
                >
                  <Checkbox
                    checked={checkedIngredients.includes(idx)}
                    onCheckedChange={() => toggleIngredient(idx)}
                    className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                  />
                  <div className={`flex-1 ${checkedIngredients.includes(idx) ? 'line-through text-gray-400 dark:text-gray-500' : 'text-body'}`}>
                    <span className="font-medium">{ing.item}</span>
                    <span className="text-muted ml-2 text-sm">{ing.amount}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            <p className="text-sm text-muted mt-4 text-center">
              {checkedIngredients.length}/{scaledIngredients.length} gathered
            </p>
          </motion.div>

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="surface-card rounded-3xl p-6 shadow-sm border"
          >
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <h2 className="text-xl font-bold text-strong flex items-center gap-2">
                <ChefHat className="w-6 h-6 text-emerald-500" />
                Instructions
              </h2>

              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-full pl-4 pr-2 py-1">
                <span className="font-mono text-lg font-bold text-strong tabular-nums">
                  {String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setTimerActive(!timerActive)}
                  className="h-8 w-8"
                  aria-label={timerActive ? 'Pause timer' : 'Start timer'}
                >
                  {timerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={resetTimer}
                  className="h-8 w-8"
                  aria-label="Reset timer"
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
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800'
                      : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 border-2 border-transparent'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold ${
                      checkedSteps.includes(idx)
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-200 shadow'
                    }`}
                  >
                    {checkedSteps.includes(idx) ? <Check className="w-5 h-5" /> : idx + 1}
                  </div>
                  <p className={`pt-1 ${checkedSteps.includes(idx) ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-body'}`}>
                    {step}
                  </p>
                </motion.div>
              ))}
            </div>

            {checkedSteps.length === recipe.steps.length && recipe.steps.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 p-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl text-white text-center"
              >
                <span className="font-semibold">All done. Enjoy your meal.</span>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Notes */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 surface-card rounded-3xl p-6 shadow-sm border print:hidden"
          >
            <label className="text-strong font-bold flex items-center gap-2 mb-3">
              <StickyNote className="w-5 h-5 text-amber-500" />
              My notes
            </label>
            <textarea
              value={note}
              onChange={onNoteChange}
              placeholder="Worked great with extra garlic. Skipped the chili next time…"
              className="w-full min-h-[80px] resize-y p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-body placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-xs text-muted mt-2">
              Saved automatically on this device.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
