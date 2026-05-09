import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Settings, LogOut, User,
  Sparkles, TrendingUp, ChefHat, Share2, Check,
  ShoppingCart, MessageCircle, Hand, History as HistoryIcon,
  RefreshCw, Search, Keyboard,
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
  getUserPlan,
  pushPlanHistory,
  getCustomItems,
  addCustomItem,
  updateCustomItem,
  removeCustomItem,
} from '@/components/mealmate/LocalStorageService';
import {
  generateWeeklyPlan,
  compileGroceryList,
  getRandomRecipe,
  generateWeeklyPlanFromDBRecipes,
  loadRecipesDB,
  getAllRecipes,
  normalizeWeeklyPlan,
} from '@/components/mealmate/MealData';
import useRecipeScraper from '@/components/mealmate/RecipeScraper';
import {
  fetchPricesForGroceryList,
  calculateTotalByStore,
  getCheapestStoreForList,
} from '@/components/mealmate/PriceService';
import WeeklyCalendar from '@/components/mealmate/WeeklyCalendar';
import GroceryList from '@/components/mealmate/GroceryList';
import PreferencesModal from '@/components/mealmate/PreferencesModal';
import MealPlannerChat from '@/components/mealmate/MealPlannerChat';
import WeeklyNutrition from '@/components/mealmate/WeeklyNutrition';
import PlanHistory from '@/components/mealmate/PlanHistory';
import ThemeToggle from '@/components/ThemeToggle';
import { useShortcutHelp } from '@/lib/ShortcutHelp';
import { useTheme } from '@/lib/ThemeContext';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { toast, Toaster } from 'sonner';

export default function Dashboard() {
  const navigate = useNavigate();
  const { resolved: theme } = useTheme();
  const shortcutHelp = useShortcutHelp();
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
  const [showHistory, setShowHistory] = useState(false);
  const [customItems, setCustomItems] = useState([]);

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
      setCustomItems(getCustomItems(currentUser));

      let existingPlan = getMealPlan(currentUser);
      if (existingPlan) existingPlan = normalizeWeeklyPlan(existingPlan);
      if (!existingPlan) {
        const dietaryPrefs = currentUser.preferences?.dietary || [];
        const cuisinePrefs = currentUser.preferences?.cuisines || [];
        const budget = currentUser.preferences?.weeklyBudget || 500;
        const servings = currentUser.preferences?.servings || 2;

        const dbRaw = getAllRecipes();
        if (dbRaw.length >= 21) {
          existingPlan = generateWeeklyPlanFromDBRecipes(dbRaw, [...dietaryPrefs, ...cuisinePrefs]);
        } else {
          existingPlan = generateWeeklyPlan(dietaryPrefs, cuisinePrefs, budget, servings);
        }
      }
      saveMealPlan(currentUser, existingPlan);
      setPlan(existingPlan);

      const groceries = compileGroceryList(existingPlan, currentUser.preferences?.servings || 2);
      setGroceryList(groceries);
      saveGroceryList(currentUser, groceries);

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
      if (cheapest) {
        toast.success(`Save ${cheapest.savings.toFixed(2)} QAR at ${cheapest.storeName}.`);
      }
    } catch {
      toast.error('Could not fetch prices.');
    } finally {
      setLoadingPrices(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate(createPageUrl('Landing'));
  };

  const handleRegeneratePlan = useCallback(() => {
    if (!user) return;
    setRefreshing(true);
    if (plan) pushPlanHistory(user, plan, 'Auto-saved before regenerate');
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
    saveMealPlan(user, newPlan);
    const groceries = compileGroceryList(newPlan, user.preferences?.servings || 2);
    setGroceryList(groceries);
    saveGroceryList(user, groceries);
    setRefreshing(false);
    toast.success('Fresh meal plan generated.');
    fetchPrices(groceries);
  }, [user, plan]);

  const handleRefreshPrices = () => {
    if (groceryList) fetchPrices(groceryList);
  };

  const handleSwapMeal = (day, mealType) => {
    if (!user || !plan) return;
    const dietaryPrefs = user.preferences?.dietary || [];
    const cuisinePrefs = user.preferences?.cuisines || [];
    const allPrefs = [...dietaryPrefs, ...cuisinePrefs];
    const budget = user.preferences?.weeklyBudget || 500;
    const servings = user.preferences?.servings || 2;
    const usedIds = Object.values(plan).flatMap((dayMeals) =>
      Object.values(dayMeals).map((r) => r.id),
    );
    const newRecipe = getRandomRecipe(mealType, allPrefs, usedIds, budget, servings);
    const newPlan = { ...plan, [day]: { ...plan[day], [mealType]: newRecipe } };
    setPlan(newPlan);
    saveMealPlan(user, newPlan);
    const groceries = compileGroceryList(newPlan, user.preferences?.servings || 2);
    setGroceryList(groceries);
    saveGroceryList(user, groceries);
    toast.success(`Swapped ${mealType}.`);
    fetchPrices(groceries);
  };

  const handleToggleGroceryItem = (aisle, idx) => {
    if (!user) return;
    const updated = toggleGroceryItem(user, aisle, idx);
    if (updated) setGroceryList(updated);
  };

  const handleSkipMeal = (day, mealType) => {
    if (!user) return;
    const updatedPlan = skipMeal(user, day, mealType);
    if (updatedPlan) {
      setPlan(updatedPlan);
      const groceries = compileGroceryList(updatedPlan, user.preferences?.servings || 2);
      setGroceryList(groceries);
      saveGroceryList(user, groceries);
      toast.success('Meal skipped.');
      fetchPrices(groceries);
    }
  };

  const handleUnskipMeal = (day, mealType) => {
    if (!user) return;
    const updatedPlan = unskipMeal(user, day, mealType);
    if (updatedPlan) {
      setPlan(updatedPlan);
      const groceries = compileGroceryList(updatedPlan, user.preferences?.servings || 2);
      setGroceryList(groceries);
      saveGroceryList(user, groceries);
      toast.success('Meal restored.');
      fetchPrices(groceries);
    }
  };

  const handleSavePreferences = async (newPrefs) => {
    if (!user) return;
    await updateUserPreferences(user.id || user.username, newPrefs);
    setUser((prev) => ({ ...prev, preferences: newPrefs }));
    if (plan) pushPlanHistory(user, plan, 'Auto-saved before preference update');
    const dietaryPrefs = newPrefs.dietary || [];
    const cuisinePrefs = newPrefs.cuisines || [];
    const budget = newPrefs.weeklyBudget || 500;
    const servings = newPrefs.servings || 2;
    const newPlan = generateWeeklyPlan(dietaryPrefs, cuisinePrefs, budget, servings);
    setPlan(newPlan);
    saveMealPlan(user, newPlan);
    const groceries = compileGroceryList(newPlan, newPrefs.servings || 2);
    setGroceryList(groceries);
    saveGroceryList(user, groceries);
    toast.success('Preferences saved. New plan ready.');
    fetchPrices(groceries);
  };

  const handleShare = async () => {
    const shareText = `Check out my MealMate meal plan.\n\nPlanning healthy meals for ${user?.preferences?.servings || 2} people.\n\nTry it free at: ${window.location.origin}`;
    if (navigator.share) {
      try {
        await navigator.share({ text: shareText });
      } catch {
        /* cancelled */
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Link copied to clipboard.');
    }
  };

  const handleRestoreFromHistory = (restoredPlan) => {
    if (!user) return;
    if (plan) pushPlanHistory(user, plan, 'Auto-saved before restore');
    const normalized = normalizeWeeklyPlan(restoredPlan);
    setPlan(normalized);
    saveMealPlan(user, normalized);
    const groceries = compileGroceryList(normalized, user.preferences?.servings || 2);
    setGroceryList(groceries);
    saveGroceryList(user, groceries);
    toast.success('Plan restored from history.');
    fetchPrices(groceries);
  };

  // Custom grocery item handlers
  const handleAddCustomItem = (item) => {
    if (!user) return;
    const next = addCustomItem(user, item);
    setCustomItems(next);
  };
  const handleUpdateCustomItem = (id, patch) => {
    if (!user) return;
    const next = updateCustomItem(user, id, patch);
    setCustomItems(next);
  };
  const handleRemoveCustomItem = (id) => {
    if (!user) return;
    const next = removeCustomItem(user, id);
    setCustomItems(next);
    toast.success('Item removed.');
  };

  // Keyboard shortcuts
  useKeyboardShortcut('n', handleRegeneratePlan, { enabled: Boolean(plan) });
  useKeyboardShortcut('l', () => setShowGrocery((v) => !v));
  useKeyboardShortcut('g', () => navigate(createPageUrl('Dashboard')));
  // simple chord: g r → recipes browse; we cheat by listening to `r` for 1s after `g`.
  // Skip the chord and just use a single key for browse:
  useKeyboardShortcut('b', () => navigate(createPageUrl('RecipesBrowse')));
  useKeyboardShortcut('s', () => navigate('/Settings'));

  // Calculate planned meals count
  const totalMeals = 21;
  const plannedMeals = useMemo(
    () =>
      plan
        ? Object.values(plan).flatMap((d) => Object.values(d)).filter((r) => r && !r.skipped).length
        : 0,
    [plan],
  );
  const progress = (plannedMeals / totalMeals) * 100;

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
      <div className="min-h-screen flex items-center justify-center surface-app">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen surface-app">
      <Toaster position="top-center" richColors theme={theme} />

      {/* Top Navigation */}
      <nav className="sticky top-0 z-40 surface-nav backdrop-blur-xl border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-strong hidden sm:block">MealMate</span>
              {scraperStatus && (
                <span className="hidden lg:flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/40 px-2 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  {scraperStatus.slice(0, 40)}{scraperStatus.length > 40 ? '...' : ''}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <Link to={createPageUrl('RecipesBrowse')} aria-label="Browse recipes" title="Browse recipes (B)">
                <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-300 hidden sm:inline-flex">
                  <Search className="w-5 h-5" />
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(true)}
                aria-label="Plan history"
                title="Plan history"
                className="text-gray-600 dark:text-gray-300 hidden sm:inline-flex"
              >
                <HistoryIcon className="w-5 h-5" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => shortcutHelp.show()}
                aria-label="Keyboard shortcuts"
                title="Keyboard shortcuts (?)"
                className="text-gray-600 dark:text-gray-300 hidden sm:inline-flex"
              >
                <Keyboard className="w-5 h-5" />
              </Button>

              <ThemeToggle />

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowGrocery(!showGrocery)}
                aria-label={showGrocery ? 'Hide grocery list' : 'Show grocery list'}
                className="lg:hidden relative text-gray-600 dark:text-gray-300"
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
                aria-label="Edit preferences"
                title="Edit preferences"
                className="text-gray-600 dark:text-gray-300"
              >
                <Settings className="w-5 h-5" />
              </Button>

              <Link to="/Settings" aria-label="Open settings">
                <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-300 hidden sm:inline-flex">
                  <User className="w-5 h-5" />
                </Button>
              </Link>

              <Link to="/Pricing">
                {getUserPlan(user?.id || user?.username) === 'free' ? (
                  <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 rounded-xl text-xs font-bold px-3 hover:opacity-90">
                    <Sparkles className="w-3 h-3 mr-1" /> Upgrade
                  </Button>
                ) : (
                  <span className="text-xs bg-amber-100 text-amber-700 font-bold px-2.5 py-1 rounded-full capitalize border border-amber-200">
                    {getUserPlan(user?.id || user?.username)}
                  </span>
                )}
              </Link>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                aria-label="Sign out"
                title="Sign out"
                className="text-gray-600 dark:text-gray-300"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main id="main" className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
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
                      Here&apos;s your weekly plan based on{' '}
                      <span className="font-medium text-white">{getPrefSummary()}</span>
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={handleRegeneratePlan}
                      disabled={refreshing}
                      variant="secondary"
                      className="bg-white/20 hover:bg-white/30 text-white border-0"
                      title="Regenerate plan (N)"
                    >
                      <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
                      Shuffle
                    </Button>
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
                      Full week planned. You&apos;re all set.
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Weekly Nutrition Summary */}
            <WeeklyNutrition plan={plan} servings={user?.preferences?.servings || 2} />

            {/* Weekly Calendar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="surface-card rounded-3xl p-6 shadow-sm border"
            >
              <h2 className="text-xl font-bold text-strong mb-6 flex items-center gap-2">
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
          <aside
            className={`lg:block ${
              showGrocery
                ? 'fixed inset-0 z-50 surface-app p-4 overflow-y-auto lg:relative lg:inset-auto lg:bg-transparent lg:p-0'
                : 'hidden'
            }`}
          >
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
              className="surface-card rounded-3xl p-6 shadow-sm border sticky top-24"
            >
              <GroceryList
                groceryList={groceryList}
                onToggleItem={handleToggleGroceryItem}
                pricedList={pricedGroceryList}
                onRefreshPrices={handleRefreshPrices}
                loadingPrices={loadingPrices}
                storeTotals={storeTotals}
                cheapestStore={cheapestStore}
                customItems={customItems}
                onAddCustomItem={handleAddCustomItem}
                onUpdateCustomItem={handleUpdateCustomItem}
                onRemoveCustomItem={handleRemoveCustomItem}
              />
            </motion.div>
          </aside>
        </div>
      </main>

      {/* Preferences Modal */}
      <PreferencesModal
        isOpen={showPrefs}
        onClose={() => setShowPrefs(false)}
        currentPrefs={user?.preferences}
        onSave={handleSavePreferences}
      />

      {/* Plan history */}
      <PlanHistory
        user={user}
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        onRestore={handleRestoreFromHistory}
      />

      {/* AI Meal Planner Chat */}
      <MealPlannerChat
        user={user}
        isOpen={showChat}
        onClose={() => setShowChat(false)}
        onPlanUpdate={(newDaysPlan) => {
          if (plan) pushPlanHistory(user, plan, 'Auto-saved before AI plan');
          const normalizedPlan = normalizeWeeklyPlan(newDaysPlan);
          setPlan(normalizedPlan);
          saveMealPlan(user, normalizedPlan);
          const groceries = compileGroceryList(normalizedPlan, user?.preferences?.servings || 2);
          setGroceryList(groceries);
          saveGroceryList(user, groceries);
          fetchPrices(groceries);
          setShowChat(false);
          toast.success('AI meal plan applied to your dashboard.');
        }}
      />
    </div>
  );
}
