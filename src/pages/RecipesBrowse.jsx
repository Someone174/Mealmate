import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Search, Filter, X, Clock, ChefHat,
  ArrowLeft, SlidersHorizontal, Flame, Heart, Shuffle, ArrowUpDown,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllRecipes, loadRecipesDB } from '@/components/mealmate/MealData';
import {
  getCurrentUser, addFavorite, removeFavorite, getFavorites,
} from '@/components/mealmate/LocalStorageService';
import { useDebounce } from '@/hooks/useDebounce';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import ThemeToggle from '@/components/ThemeToggle';
import { toast } from 'sonner';

const dietaryTags = [
  { id: 'vegetarian', label: 'Vegetarian', icon: '🥗' },
  { id: 'gluten-free', label: 'Gluten-Free', icon: '🌾' },
  { id: 'low-carb', label: 'Low Carb', icon: '🥩' },
  { id: 'high-protein', label: 'High Protein', icon: '💪' },
  { id: 'quick', label: 'Quick (<30min)', icon: '⚡' },
  { id: 'budget', label: 'Budget', icon: '💰' },
  { id: 'family-friendly', label: 'Family Friendly', icon: '👨‍👩‍👧‍👦' },
];

const cuisineTypes = [
  { id: 'mediterranean', label: 'Mediterranean', icon: '🫒' },
  { id: 'asian', label: 'Asian', icon: '🥢' },
  { id: 'indian', label: 'Indian', icon: '🍛' },
  { id: 'mexican', label: 'Mexican', icon: '🌮' },
  { id: 'italian', label: 'Italian', icon: '🍝' },
  { id: 'middle-eastern', label: 'Middle Eastern', icon: '🧆' },
];

const SORT_OPTIONS = {
  default: { label: 'Recommended', cmp: () => 0 },
  alpha: { label: 'A → Z', cmp: (a, b) => a.name.localeCompare(b.name) },
  prepAsc: { label: 'Quickest first', cmp: (a, b) => (a.prepTime || 0) - (b.prepTime || 0) },
  caloriesAsc: { label: 'Fewest calories', cmp: (a, b) => (a.calories || 0) - (b.calories || 0) },
  proteinDesc: { label: 'Most protein', cmp: (a, b) => (b.protein || 0) - (a.protein || 0) },
};

export default function RecipesBrowse() {
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const [dbReady, setDbReady] = useState(false);
  const [user, setUser] = useState(null);
  const [favSet, setFavSet] = useState(new Set());

  useEffect(() => {
    loadRecipesDB().then(() => setDbReady(true));
    const u = getCurrentUser();
    setUser(u);
    if (u) setFavSet(new Set(getFavorites(u)));
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 150);
  const [selectedDietary, setSelectedDietary] = useState([]);
  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const [maxPrepTime, setMaxPrepTime] = useState([60]);
  const [maxCalories, setMaxCalories] = useState([800]);
  const [maxCarbs, setMaxCarbs] = useState([100]);
  const [maxFat, setMaxFat] = useState([50]);
  const [minProtein, setMinProtein] = useState([0]);
  const [showFilters, setShowFilters] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState('default');

  const allRecipes = useMemo(() => {
    // eslint reads `dbReady` as unused; it's the trigger.
    void dbReady;
    return getAllRecipes();
  }, [dbReady]);

  const filteredRecipes = useMemo(() => {
    let results = allRecipes;
    if (debouncedQuery.trim()) {
      const query = debouncedQuery.toLowerCase();
      results = results.filter((recipe) =>
        recipe.name?.toLowerCase().includes(query) ||
        recipe.summary?.toLowerCase().includes(query) ||
        recipe.ingredients?.some((ing) => ing.item?.toLowerCase().includes(query)),
      );
    }
    if (selectedDietary.length) {
      results = results.filter((recipe) =>
        selectedDietary.every((tag) => recipe.tags?.includes(tag)),
      );
    }
    if (selectedCuisines.length) {
      results = results.filter((recipe) =>
        selectedCuisines.some((c) => recipe.tags?.includes(c)),
      );
    }
    results = results.filter((r) => (r.prepTime || 0) <= maxPrepTime[0]);
    results = results.filter((r) => (r.calories || 0) <= maxCalories[0]);
    results = results.filter((r) => (r.carbs || 0) <= maxCarbs[0]);
    results = results.filter((r) => (r.fat || 0) <= maxFat[0]);
    results = results.filter((r) => (r.protein || 0) >= minProtein[0]);
    if (favoritesOnly) {
      results = results.filter((r) => favSet.has(r.id));
    }
    const sorter = SORT_OPTIONS[sortBy] || SORT_OPTIONS.default;
    return [...results].sort(sorter.cmp);
  }, [
    allRecipes, debouncedQuery, selectedDietary, selectedCuisines,
    maxPrepTime, maxCalories, maxCarbs, maxFat, minProtein,
    favoritesOnly, favSet, sortBy,
  ]);

  const toggleDietary = (tag) =>
    setSelectedDietary((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  const toggleCuisine = (cuisine) =>
    setSelectedCuisines((prev) => (prev.includes(cuisine) ? prev.filter((c) => c !== cuisine) : [...prev, cuisine]));

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDietary([]);
    setSelectedCuisines([]);
    setMaxPrepTime([60]);
    setMaxCalories([800]);
    setMaxCarbs([100]);
    setMaxFat([50]);
    setMinProtein([0]);
    setFavoritesOnly(false);
  };

  const surpriseMe = () => {
    if (!filteredRecipes.length) {
      toast.error('No recipes match your filters.');
      return;
    }
    const pick = filteredRecipes[Math.floor(Math.random() * filteredRecipes.length)];
    navigate(`${createPageUrl('Recipes')}?id=${pick.id}`);
  };

  const toggleFavorite = (e, recipeId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error('Sign in to save favorites.');
      return;
    }
    setFavSet((prev) => {
      const next = new Set(prev);
      if (next.has(recipeId)) {
        next.delete(recipeId);
        removeFavorite(user, recipeId);
      } else {
        next.add(recipeId);
        addFavorite(user, recipeId);
      }
      return next;
    });
  };

  const activeFilterCount =
    selectedDietary.length +
    selectedCuisines.length +
    (maxPrepTime[0] < 60 ? 1 : 0) +
    (maxCalories[0] < 800 ? 1 : 0) +
    (maxCarbs[0] < 100 ? 1 : 0) +
    (maxFat[0] < 50 ? 1 : 0) +
    (minProtein[0] > 0 ? 1 : 0) +
    (favoritesOnly ? 1 : 0);

  // Shortcuts: focus search on '/'
  useKeyboardShortcut('/', () => {
    searchRef.current?.focus();
    searchRef.current?.select?.();
  });
  useKeyboardShortcut('r', surpriseMe);

  return (
    <div className="min-h-screen surface-app">
      <nav className="sticky top-0 z-40 surface-nav backdrop-blur-xl border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link to={createPageUrl('Dashboard')} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </Link>

            <div className="flex items-center gap-2">
              <ChefHat className="w-6 h-6 text-emerald-500" />
              <span className="font-bold text-xl text-strong">Browse Recipes</span>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={surpriseMe}
                className="text-gray-600 dark:text-gray-300 hidden sm:inline-flex"
                title="Surprise me (R)"
              >
                <Shuffle className="w-4 h-4 mr-1" />
                Surprise me
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      <main id="main" className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Search and Filter Bar */}
        <div className="surface-card rounded-2xl shadow-sm border p-4 mb-6 space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                ref={searchRef}
                type="search"
                placeholder="Search recipes, ingredients…  (press /)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <Button
              variant="outline"
              onClick={() => setFavoritesOnly((v) => !v)}
              className={`h-12 px-4 rounded-xl ${favoritesOnly ? 'border-red-300 text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800' : 'border-gray-200 dark:border-gray-700'}`}
            >
              <Heart className={`w-4 h-4 mr-2 ${favoritesOnly ? 'fill-current' : ''}`} />
              Favorites
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-12 px-4 rounded-xl border-gray-200 dark:border-gray-700">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  {SORT_OPTIONS[sortBy].label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {Object.entries(SORT_OPTIONS).map(([k, v]) => (
                  <DropdownMenuItem key={k} onClick={() => setSortBy(k)}>
                    {v.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="h-12 px-4 rounded-xl border-gray-200 dark:border-gray-700 relative"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 text-white text-xs rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>

          {(selectedDietary.length || selectedCuisines.length || activeFilterCount) ? (
            <div className="flex flex-wrap gap-2 items-center">
              {selectedDietary.map((tag) => {
                const tagData = dietaryTags.find((t) => t.id === tag);
                return (
                  <Badge key={tag} className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 pl-2 pr-1 py-1">
                    <span className="mr-1">{tagData?.icon}</span>
                    {tagData?.label}
                    <button onClick={() => toggleDietary(tag)} className="ml-1 hover:bg-emerald-200/60 rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                );
              })}

              {selectedCuisines.map((cuisine) => {
                const cuisineData = cuisineTypes.find((c) => c.id === cuisine);
                return (
                  <Badge key={cuisine} className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800 pl-2 pr-1 py-1">
                    <span className="mr-1">{cuisineData?.icon}</span>
                    {cuisineData?.label}
                    <button onClick={() => toggleCuisine(cuisine)} className="ml-1 hover:bg-blue-200/60 rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                );
              })}

              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted h-7">
                  Clear all
                </Button>
              )}
            </div>
          ) : null}

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-t border-gray-100 dark:border-gray-800 pt-4"
              >
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-strong mb-3 flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      Dietary preferences
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {dietaryTags.map((tag) => (
                        <button
                          key={tag.id}
                          onClick={() => toggleDietary(tag.id)}
                          className={`px-4 py-2 rounded-full border-2 transition-all ${
                            selectedDietary.includes(tag.id)
                              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 text-gray-600 dark:text-gray-300'
                          }`}
                        >
                          <span className="mr-1">{tag.icon}</span>
                          {tag.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-strong mb-3">Cuisine types</h3>
                    <div className="flex flex-wrap gap-2">
                      {cuisineTypes.map((cuisine) => (
                        <button
                          key={cuisine.id}
                          onClick={() => toggleCuisine(cuisine.id)}
                          className={`px-4 py-2 rounded-full border-2 transition-all ${
                            selectedCuisines.includes(cuisine.id)
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 text-gray-600 dark:text-gray-300'
                          }`}
                        >
                          <span className="mr-1">{cuisine.icon}</span>
                          {cuisine.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <SliderRow
                      icon={Clock}
                      label="Max prep time"
                      value={maxPrepTime[0]}
                      unit="min"
                      accent="text-emerald-600"
                      slider={
                        <Slider value={maxPrepTime} min={5} max={60} step={5} onValueChange={setMaxPrepTime} />
                      }
                    />
                    <SliderRow
                      icon={Flame}
                      label="Max calories"
                      value={maxCalories[0]}
                      unit="kcal"
                      accent="text-orange-600"
                      slider={
                        <Slider value={maxCalories} min={100} max={800} step={50} onValueChange={setMaxCalories} />
                      }
                    />
                    <SliderRow
                      icon={Sparkles}
                      label="Min protein"
                      value={minProtein[0]}
                      unit="g"
                      accent="text-blue-600"
                      slider={
                        <Slider value={minProtein} min={0} max={50} step={5} onValueChange={setMinProtein} />
                      }
                    />
                    <SliderRow
                      icon={Sparkles}
                      label="Max carbs"
                      value={maxCarbs[0]}
                      unit="g"
                      accent="text-purple-600"
                      slider={
                        <Slider value={maxCarbs} min={0} max={100} step={5} onValueChange={setMaxCarbs} />
                      }
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <p className="text-body">
            Found <span className="font-bold text-emerald-600 dark:text-emerald-400">{filteredRecipes.length}</span> recipe{filteredRecipes.length !== 1 ? 's' : ''}
          </p>
          {filteredRecipes.length > 0 && (
            <button
              type="button"
              onClick={surpriseMe}
              className="sm:hidden text-xs text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1"
            >
              <Shuffle className="w-3.5 h-3.5" /> Surprise me
            </button>
          )}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredRecipes.map((recipe, idx) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: Math.min(idx, 8) * 0.04 }}
                layout
              >
                <Link to={`${createPageUrl('Recipes')}?id=${recipe.id}`}>
                  <div className="surface-card rounded-2xl shadow-sm border overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all group relative">
                    <button
                      type="button"
                      onClick={(e) => toggleFavorite(e, recipe.id)}
                      className={`absolute top-2.5 right-2.5 z-10 p-2 rounded-full backdrop-blur-md transition-all ${
                        favSet.has(recipe.id)
                          ? 'bg-red-500/90 text-white shadow-lg shadow-red-500/30 scale-100'
                          : 'bg-white/70 dark:bg-gray-900/70 text-gray-400 dark:text-gray-300 hover:text-red-500 hover:scale-110'
                      }`}
                      aria-label={favSet.has(recipe.id) ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Heart className={`w-4 h-4 ${favSet.has(recipe.id) ? 'fill-current' : ''}`} />
                    </button>
                    <div className="bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 h-32 flex items-center justify-center">
                      {recipe.image && recipe.image.startsWith('http') ? (
                        <img src={recipe.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-6xl group-hover:scale-110 transition-transform">{recipe.image || '🍽️'}</span>
                      )}
                    </div>

                    <div className="p-5">
                      <h3 className="font-bold text-strong mb-2 line-clamp-1">{recipe.name}</h3>
                      <p className="text-sm text-muted mb-4 line-clamp-2">{recipe.summary}</p>

                      <div className="flex items-center justify-between text-sm text-body mb-3">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{recipe.prepTime} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Flame className="w-4 h-4 text-orange-500" />
                          <span>{recipe.calories} cal</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {(recipe.tags || []).slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag.replace(/-/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredRecipes.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-strong mb-2">No recipes found</h3>
            <p className="text-muted mb-4">Try adjusting your filters or search query.</p>
            <Button onClick={clearFilters} variant="outline">
              Clear all filters
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

function SliderRow({ icon: Icon, label, value, unit, accent, slider }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="font-medium text-body flex items-center gap-2">
          <Icon className="w-4 h-4" />
          {label}
        </label>
        <span className={`font-semibold ${accent}`}>{value} {unit}</span>
      </div>
      {slider}
    </div>
  );
}
