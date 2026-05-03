import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Settings, LogOut,
  Sparkles, TrendingUp, ChefHat, Share2, Check,
  ShoppingCart, MessageCircle, Hand
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import {
  getCurrentUser,
  logoutUser,
  getMealPlan,
  saveMealPlan,
  saveGroceryList,
  toggleGroceryItem,
  updateUserPreferences,
  skipMeal,
  unskipMeal,
  getUserPlan
} from '@/components/mealmate/LocalStorageService';
import { generateWeeklyPlan, compileGroceryList, getRandomRecipe, generateWeeklyPlanFromDBRecipes, loadRecipesDB, getAllRecipes, normalizeWeeklyPlan } from '@/components/mealmate/MealData';
import useRecipeScraper from '@/components/mealmate/RecipeScraper';
import { 
  fetchPricesForGroceryList, 
  calculateTotalByStore, 
  getCheapestStoreForList 
} from '@/components/mealmate/PriceService';
import WeeklyCalendar from '@/components/mealmate/WeeklyCalendar';
import GroceryList from '@/components/mealmate/GroceryList';
import PreferencesModal from '@/components/mealmate/PreferencesModal';
import MealPlannerChat from '@/components/mealmate/MealPlannerChat';
import { toast, Toaster } from 'sonner';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [plan, setPlan] = useState(null);
  const [groceryList, setGroceryList] = useState(null);
  const [pricedGroceryList, setPricedGroceryList] = useState(null);
  const [storeTotals, setStoreTotals] = useState(null);
  const [cheapestStore, setCheapestStore] = useState(null);
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showGrocery, setShowGrocery] = useState(false);
  const [copied, setCopied] = useState(false);
  const [scraperStatus, setScraperStatus] = useState('');
  const [showChat, setShowChat] = useState(false);

  // Mount background recipe scraper (initial load + every 4 min refresh)
  useRecipeScraper({ onStatusUpdate: setScraperStatus });

  useEffect(() => {
    const init = async () => {
      await loadRecipesDB();
      const currentUser = getCurrentUser();
      if (!currentUser) {
        navigate(createPageUrl('SignIn'));
        return;
      }
      setUser(currentUser);

      // Load or generate meal plan; prefer DB recipes if available.
      let existingPlan = getMealPlan(currentUser.username);
      if (existingPlan) existingPlan = normalizeWeeklyPlan(existingPlan);
      if (!existingPlan) {
        const dietaryPrefs = currentUser.preferences?.dietary || [];
        const cuisinePrefs = currentUser.preferences?.cuisines || [];
        const budget = currentUser.preferences?.weeklyBudget || 500;
        const servings = currentUser.preferences?.servings || 2;

        // Use CSV recipes from recipes-db.json
        const dbRaw = getAllRecipes();
        if (dbRaw.length >= 21) {
          existingPlan = generateWeeklyPlanFromDBRecipes(dbRaw, [...dietaryPrefs, ...cuisinePrefs]);
        } else {
          existingPlan = generateWeeklyPlan(dietaryPrefs, cuisinePrefs, budget, servings);
        }
      }
      saveMealPlan(currentUser.username, existingPlan);
      setPlan(existingPlan);

      // Compile grocery list
      const groceries = compileGroceryList(existingPlan, currentUser.preferences?.servings || 2);
      setGroceryList(groceries);
      saveGroceryList(currentUser.username, groceries);

      // Fetch prices
      fetchPrices(groceries);
    };
    init();
  }, [navigate]);
  
  const fetchPrices = async (groceries) => {
    if (!groceries) return;
    setLoadingPrices(true);
    
    try {
      const priced = await fetchPricesForGroceryList(groceries);
      setPricedGroceryList(priced);
      
      const totals = calculateTotalByStore(priced);
      setStoreTotals(totals);
      
      const cheapest = getCheapestStoreForList(totals);
      setCheapestStore(cheapest);
      
      toast.success(`Prices compared! Save ${cheapest.savings.toFixed(2)} QAR at ${cheapest.storeName}!`);
    } catch (error) {
      toast.error('Failed to fetch prices. Please try again.');
    } finally {
      setLoadingPrices(false);
    }
  };
  
  const handleLogout = () => {
    logoutUser();
    navigate(createPageUrl('Landing'));
  };
  
  const handleRegeneratePlan = () => {
    if (!user) return;
    setRefreshing(true);

    const doRegen = async () => {
        const dietaryPrefs = user.preferences?.dietary || [];
      const cuisinePrefs = user.preferences?.cuisines || [];
      const budget = user.preferences?.weeklyBudget || 500;
      const servings = user.preferences?.servings || 2;

      const dbRaw = getAllRecipes();
      let newPlan;
      if (dbRaw.length >= 21) {
        newPlan = generateWeeklyPlanFromDBRecipes(dbRaw, [...dietaryPrefs, ...cuisinePrefs]);
      } else {
        newPlan = generateWeeklyPlan(dietaryPrefs, cuisinePrefs, budget, servings);
      }
      setPlan(newPlan);
      saveMealPlan(user.username, newPlan);

      const groceries = compileGroceryList(newPlan, user.preferences?.servings || 2);
      setGroceryList(groceries);
      saveGroceryList(user.username, groceries);

      setRefreshing(false);
      toast.success('Fresh meal plan generated.');
      
      // Fetch new prices
      fetchPrices(groceries);
    };
    doRegen();
  };
  
  const handleRefreshPrices = () => {
    if (groceryList) {
      fetchPrices(groceryList);
    }
  };
  
  const handleSwapMeal = (day, mealType) => {
    if (!user || !plan) return;

    const dietaryPrefs = user.preferences?.dietary || [];
    const cuisinePrefs = user.preferences?.cuisines || [];
    const allPrefs = [...dietaryPrefs, ...cuisinePrefs];
    const budget = user.preferences?.weeklyBudget || 500;
    const servings = user.preferences?.servings || 2;
    const usedIds = Object.values(plan).flatMap(dayMeals => 
      Object.values(dayMeals).map(r => r.id)
    );

    const newRecipe = getRandomRecipe(mealType, allPrefs, usedIds, budget, servings);
    
    const newPlan = {
      ...plan,
      [day]: {
        ...plan[day],
        [mealType]: newRecipe
      }
    };
    
    setPlan(newPlan);
    saveMealPlan(user.username, newPlan);
    
    const groceries = compileGroceryList(newPlan, user.preferences?.servings || 2);
    setGroceryList(groceries);
    saveGroceryList(user.username, groceries);
    
    toast.success(`Swapped ${mealType}.`);
    
    // Refresh prices after swap
    fetchPrices(groceries);
  };
  
  const handleToggleGroceryItem = (aisle, idx) => {
    if (!user) return;
    const updated = toggleGroceryItem(user.username, aisle, idx);
    if (updated) {
      setGroceryList(updated);
    }
  };
  
  const handleSkipMeal = (day, mealType) => {
    if (!user) return;
    const updatedPlan = skipMeal(user.username, day, mealType);
    if (updatedPlan) {
      setPlan(updatedPlan);
      
      // Update grocery list to exclude skipped meal
      const groceries = compileGroceryList(updatedPlan, user.preferences?.servings || 2);
      setGroceryList(groceries);
      saveGroceryList(user.username, groceries);
      
      toast.success('Meal skipped. Ingredients removed from list.');
      
      // Refresh prices
      fetchPrices(groceries);
    }
  };
  
  const handleUnskipMeal = (day, mealType) => {
    if (!user) return;
    const updatedPlan = unskipMeal(user.username, day, mealType);
    if (updatedPlan) {
      setPlan(updatedPlan);
      
      // Update grocery list to include restored meal
      const groceries = compileGroceryList(updatedPlan, user.preferences?.servings || 2);
      setGroceryList(groceries);
      saveGroceryList(user.username, groceries);
      
      toast.success('Meal restored. Ingredients added back.');
      
      // Refresh prices
      fetchPrices(groceries);
    }
  };
  
  const handleSavePreferences = (newPrefs) => {
    if (!user) return;
    
    updateUserPreferences(user.username, newPrefs);
    setUser(prev => ({ ...prev, preferences: newPrefs }));
    
    // Regenerate plan with new preferences
    const dietaryPrefs = newPrefs.dietary || [];
    const cuisinePrefs = newPrefs.cuisines || [];
    const budget = newPrefs.weeklyBudget || 500;
    const servings = newPrefs.servings || 2;
    const newPlan = generateWeeklyPlan(dietaryPrefs, cuisinePrefs, budget, servings);
    setPlan(newPlan);
    saveMealPlan(user.username, newPlan);
    
    const groceries = compileGroceryList(newPlan, newPrefs.servings || 2);
    setGroceryList(groceries);
    saveGroceryList(user.username, groceries);
    
    toast.success('Preferences updated. New plan ready.');
    
    // Fetch prices for new plan
    fetchPrices(groceries);
  };
  
  const handleShare = async () => {
    const shareText = `Check out my MealMate meal plan.\n\nPlanning healthy meals for ${user?.preferences?.servings || 2} people with preferences: ${user?.preferences?.dietary?.join(', ') || 'All cuisines'}\n\nTry it free at: ${window.location.origin}`;
    
    if (navigator.share) {
      try {
        await navigator.share({ text: shareText });
      } catch (err) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Link copied to clipboard!');
    }
  };
  
  // Calculate planned meals count
  const totalMeals = 21;
  const plannedMeals = plan ? Object.values(plan).flatMap(d => Object.values(d)).length : 0;
  const progress = (plannedMeals / totalMeals) * 100;
  
  // Get preference summary
  const getPrefSummary = () => {
    if (!user?.preferences) return 'your preferences';
    const prefs = [];
    if (user.preferences.dietary?.length) {
      prefs.push(user.preferences.dietary.slice(0, 2).join(', '));
    }
    if (user.preferences.servings) {
      prefs.push(`${user.preferences.servings} servings`);
    }
    return prefs.join(' / ') || 'all cuisines';
  };
  
  if (!user || !plan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" richColors />
      
      {/* Top Navigation */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-800 hidden sm:block">MealMate</span>
              {scraperStatus && (
                <span className="hidden lg:flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  {scraperStatus.slice(0, 40)}{scraperStatus.length > 40 ? '...' : ''}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowGrocery(!showGrocery)}
                className="lg:hidden relative"
              >
                <ShoppingCart className="w-5 h-5" />
                {groceryList && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white text-xs rounded-full flex items-center justify-center">
                    {Object.values(groceryList).flat().length}
                  </span>
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPrefs(true)}
                className="text-gray-600"
              >
                <Settings className="w-5 h-5" />
              </Button>

              <Link to="/Pricing">
                {getUserPlan(user?.username) === 'free' ? (
                  <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 rounded-xl text-xs font-bold px-3 hover:opacity-90">
                    <Sparkles className="w-3 h-3 mr-1" /> Upgrade
                  </Button>
                ) : (
                  <span className="text-xs bg-amber-100 text-amber-700 font-bold px-2.5 py-1 rounded-full capitalize border border-amber-200">
                    {getUserPlan(user?.username)}
                  </span>
                )}
              </Link>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-600"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Welcome Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
              
              <div className="relative">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                      Hey {user.username}!
                      <Hand className="inline-block w-7 h-7 ml-2 align-[-3px]" />
                    </h1>
                    <p className="text-emerald-100">
                      Here's your weekly plan based on{' '}
                      <span className="font-medium text-white">{getPrefSummary()}</span>
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={handleShare}
                      variant="secondary"
                      className="bg-white/20 hover:bg-white/30 text-white border-0"
                    >
                      {copied ? <Check className="w-4 h-4 mr-1" /> : <Share2 className="w-4 h-4 mr-1" />}
                      Share
                    </Button>
                    <Button
                      onClick={() => setShowChat(true)}
                      className="bg-white text-emerald-600 hover:bg-gray-100"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      AI Planner
                    </Button>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="bg-white/20 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      <span className="font-medium">Week Progress</span>
                    </div>
                    <span className="font-bold">{plannedMeals}/{totalMeals} meals</span>
                  </div>
                  <Progress value={progress} className="h-3 bg-white/30" />
                  {progress === 100 && (
                    <p className="text-sm mt-2 flex items-center gap-1">
                      <Sparkles className="w-4 h-4" />
                      Full week planned. You're all set.
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
            
            {/* Weekly Calendar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <ChefHat className="w-6 h-6 text-emerald-500" />
                Your Weekly Menu
              </h2>
              
              <WeeklyCalendar 
                plan={plan} 
                onSwap={handleSwapMeal}
                onSkip={handleSkipMeal}
                onUnskip={handleUnskipMeal}
              />
            </motion.div>
          </div>
          
          {/* Sidebar - Grocery List */}
          <div className={`lg:block ${showGrocery ? 'fixed inset-0 z-50 bg-white p-4 overflow-y-auto lg:relative lg:inset-auto lg:bg-transparent lg:p-0' : 'hidden'}`}>
            {showGrocery && (
              <Button
                variant="ghost"
                className="lg:hidden mb-4"
                onClick={() => setShowGrocery(false)}
              >
                Back to Plan
              </Button>
            )}
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-24"
            >
              <GroceryList 
                groceryList={groceryList} 
                onToggleItem={handleToggleGroceryItem}
                pricedList={pricedGroceryList}
                onRefreshPrices={handleRefreshPrices}
                loadingPrices={loadingPrices}
                storeTotals={storeTotals}
                cheapestStore={cheapestStore}
              />
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Preferences Modal */}
      <PreferencesModal
        isOpen={showPrefs}
        onClose={() => setShowPrefs(false)}
        currentPrefs={user?.preferences}
        onSave={handleSavePreferences}
      />

      {/* AI Meal Planner Chat */}
      <MealPlannerChat
        user={user}
        isOpen={showChat}
        onClose={() => setShowChat(false)}
        onPlanUpdate={(newDaysPlan) => {
          const normalizedPlan = normalizeWeeklyPlan(newDaysPlan);
          setPlan(normalizedPlan);
          saveMealPlan(user.username, normalizedPlan);
          const groceries = compileGroceryList(normalizedPlan, user?.preferences?.servings || 2);
          setGroceryList(groceries);
          saveGroceryList(user.username, groceries);
          fetchPrices(groceries);
          setShowChat(false);
          toast.success('AI meal plan applied to your dashboard.');
        }}
      />
    </div>
  );
}
