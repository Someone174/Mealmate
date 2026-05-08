import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Search, Filter, X, Clock, ChefHat,
  ArrowLeft, SlidersHorizontal, Flame, Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllRecipes, loadRecipesDB } from '@/components/mealmate/MealData';
import { getCurrentUser, addFavorite, removeFavorite, getFavorites } from '@/components/mealmate/LocalStorageService';



const dietaryTags = [
  { id: 'vegetarian', label: 'Vegetarian', icon: '🥗' },
  { id: 'gluten-free', label: 'Gluten-Free', icon: '🌾' },
  { id: 'low-carb', label: 'Low Carb', icon: '🥩' },
  { id: 'high-protein', label: 'High Protein', icon: '💪' },
  { id: 'quick', label: 'Quick (<30min)', icon: '⚡' },
  { id: 'budget', label: 'Budget', icon: '💰' },
  { id: 'family-friendly', label: 'Family Friendly', icon: '👨‍👩‍👧‍👦' }
];

const cuisineTypes = [
  { id: 'mediterranean', label: 'Mediterranean', icon: '🫒' },
  { id: 'asian', label: 'Asian', icon: '🥢' },
  { id: 'indian', label: 'Indian', icon: '🍛' },
  { id: 'mexican', label: 'Mexican', icon: '🌮' },
  { id: 'italian', label: 'Italian', icon: '🍝' },
  { id: 'middle-eastern', label: 'Middle Eastern', icon: '🧆' }
];

export default function RecipesBrowse() {
  const [dbReady, setDbReady] = useState(false);
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    loadRecipesDB().then(() => setDbReady(true));
    const u = getCurrentUser();
    setUser(u);
    if (u) setFavorites(getFavorites(u.id || u.username));
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDietary, setSelectedDietary] = useState([]);
  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const [maxPrepTime, setMaxPrepTime] = useState([60]);
  const [maxCalories, setMaxCalories] = useState([800]);
  const [maxCarbs, setMaxCarbs] = useState([100]);
  const [maxFat, setMaxFat] = useState([50]);
  const [minProtein, setMinProtein] = useState([0]);
  const [showFilters, setShowFilters] = useState(false);

  // Re-compute after DB loads (dbReady flip triggers re-render)
  const allRecipes = useMemo(() => getAllRecipes(), [dbReady]);  

  const filteredRecipes = useMemo(() => {
    let results = allRecipes;

    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(recipe => 
        recipe.name.toLowerCase().includes(query) ||
        recipe.summary.toLowerCase().includes(query) ||
        recipe.ingredients.some(ing => ing.item.toLowerCase().includes(query))
      );
    }

    // Dietary tags
    if (selectedDietary.length > 0) {
      results = results.filter(recipe =>
        selectedDietary.every(tag => recipe.tags.includes(tag))
      );
    }

    // Cuisines
    if (selectedCuisines.length > 0) {
      results = results.filter(recipe =>
        selectedCuisines.some(cuisine => recipe.tags.includes(cuisine))
      );
    }

    // Prep time
    results = results.filter(recipe => recipe.prepTime <= maxPrepTime[0]);

    // Calories
    results = results.filter(recipe => recipe.calories <= maxCalories[0]);

    // Carbs
    results = results.filter(recipe => recipe.carbs <= maxCarbs[0]);

    // Fat
    results = results.filter(recipe => recipe.fat <= maxFat[0]);

    // Protein
    results = results.filter(recipe => recipe.protein >= minProtein[0]);

    return results;
  }, [allRecipes, searchQuery, selectedDietary, selectedCuisines, maxPrepTime, maxCalories, maxCarbs, maxFat, minProtein]);

  const toggleDietary = (tag) => {
    setSelectedDietary(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const toggleCuisine = (cuisine) => {
    setSelectedCuisines(prev =>
      prev.includes(cuisine) ? prev.filter(c => c !== cuisine) : [...prev, cuisine]
    );
  };

  const toggleFavorite = (e, recipeId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    const key = user.id || user.username;
    if (favorites.includes(recipeId)) {
      removeFavorite(key, recipeId);
      setFavorites(prev => prev.filter(id => id !== recipeId));
    } else {
      addFavorite(key, recipeId);
      setFavorites(prev => [...prev, recipeId]);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDietary([]);
    setSelectedCuisines([]);
    setMaxPrepTime([60]);
    setMaxCalories([800]);
    setMaxCarbs([100]);
    setMaxFat([50]);
    setMinProtein([0]);
  };

  const activeFilterCount = 
    selectedDietary.length + 
    selectedCuisines.length + 
    (maxPrepTime[0] < 60 ? 1 : 0) +
    (maxCalories[0] < 800 ? 1 : 0) +
    (maxCarbs[0] < 100 ? 1 : 0) +
    (maxFat[0] < 50 ? 1 : 0) +
    (minProtein[0] > 0 ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link to={createPageUrl('Dashboard')} className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </Link>
            
            <div className="flex items-center gap-2">
              <ChefHat className="w-6 h-6 text-emerald-500" />
              <span className="font-bold text-xl text-gray-800">Browse Recipes</span>
            </div>
            
            <div className="w-20" />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search recipes, ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 rounded-xl border-gray-200"
              />
            </div>
            
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="h-12 px-6 rounded-xl border-gray-200 relative"
            >
              <SlidersHorizontal className="w-5 h-5 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 text-white text-xs rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>

          {/* Active Filters Pills */}
          {(selectedDietary.length > 0 || selectedCuisines.length > 0 || activeFilterCount > 0) && (
            <div className="flex flex-wrap gap-2 items-center">
              {selectedDietary.map(tag => {
                const tagData = dietaryTags.find(t => t.id === tag);
                return (
                  <Badge key={tag} className="bg-emerald-100 text-emerald-700 border-emerald-200 pl-2 pr-1 py-1">
                    <span className="mr-1">{tagData?.icon}</span>
                    {tagData?.label}
                    <button onClick={() => toggleDietary(tag)} className="ml-1 hover:bg-emerald-200 rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                );
              })}
              
              {selectedCuisines.map(cuisine => {
                const cuisineData = cuisineTypes.find(c => c.id === cuisine);
                return (
                  <Badge key={cuisine} className="bg-blue-100 text-blue-700 border-blue-200 pl-2 pr-1 py-1">
                    <span className="mr-1">{cuisineData?.icon}</span>
                    {cuisineData?.label}
                    <button onClick={() => toggleCuisine(cuisine)} className="ml-1 hover:bg-blue-200 rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                );
              })}
              
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-500 h-7">
                  Clear all
                </Button>
              )}
            </div>
          )}

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-t border-gray-100 pt-4"
              >
                <div className="space-y-6">
                  {/* Dietary Tags */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      Dietary Preferences
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {dietaryTags.map(tag => (
                        <button
                          key={tag.id}
                          onClick={() => toggleDietary(tag.id)}
                          className={`px-4 py-2 rounded-full border-2 transition-all ${
                            selectedDietary.includes(tag.id)
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                              : 'border-gray-200 hover:border-gray-300 text-gray-600'
                          }`}
                        >
                          <span className="mr-1">{tag.icon}</span>
                          {tag.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cuisines */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Cuisine Types</h3>
                    <div className="flex flex-wrap gap-2">
                      {cuisineTypes.map(cuisine => (
                        <button
                          key={cuisine.id}
                          onClick={() => toggleCuisine(cuisine.id)}
                          className={`px-4 py-2 rounded-full border-2 transition-all ${
                            selectedCuisines.includes(cuisine.id)
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300 text-gray-600'
                          }`}
                        >
                          <span className="mr-1">{cuisine.icon}</span>
                          {cuisine.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sliders */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="font-medium text-gray-700 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Max Prep Time
                        </label>
                        <span className="text-emerald-600 font-semibold">{maxPrepTime[0]} min</span>
                      </div>
                      <Slider
                        value={maxPrepTime}
                        min={5}
                        max={60}
                        step={5}
                        onValueChange={setMaxPrepTime}
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="font-medium text-gray-700 flex items-center gap-2">
                          <Flame className="w-4 h-4" />
                          Max Calories
                        </label>
                        <span className="text-orange-600 font-semibold">{maxCalories[0]} kcal</span>
                      </div>
                      <Slider
                        value={maxCalories}
                        min={100}
                        max={800}
                        step={50}
                        onValueChange={setMaxCalories}
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="font-medium text-gray-700">Min Protein</label>
                        <span className="text-blue-600 font-semibold">{minProtein[0]}g</span>
                      </div>
                      <Slider
                        value={minProtein}
                        min={0}
                        max={50}
                        step={5}
                        onValueChange={setMinProtein}
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="font-medium text-gray-700">Max Carbs</label>
                        <span className="text-purple-600 font-semibold">{maxCarbs[0]}g</span>
                      </div>
                      <Slider
                        value={maxCarbs}
                        min={0}
                        max={100}
                        step={5}
                        onValueChange={setMaxCarbs}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-600">
            Found <span className="font-bold text-emerald-600">{filteredRecipes.length}</span> recipe{filteredRecipes.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Recipe Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredRecipes.map((recipe, idx) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.05 }}
                layout
              >
                <Link to={`${createPageUrl('Recipes')}?id=${recipe.id}`}>
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group">
                    <div className="bg-gradient-to-br from-emerald-100 to-teal-100 h-32 flex items-center justify-center relative overflow-hidden">
                      {recipe.img_src ? (
                        <img
                          src={recipe.img_src}
                          alt={recipe.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling.style.display = 'flex'; }}
                        />
                      ) : null}
                      <span
                        className={`text-6xl group-hover:scale-110 transition-transform ${recipe.img_src ? 'hidden' : ''} items-center justify-center w-full h-full flex`}
                      >
                        {recipe.image || <ChefHat className="w-12 h-12 text-gray-300" />}
                      </span>
                      {user && (
                        <button
                          onClick={(e) => toggleFavorite(e, recipe.id)}
                          className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:scale-110 transition-transform"
                          aria-label={favorites.includes(recipe.id) ? 'Remove from favorites' : 'Save to favorites'}
                        >
                          <Heart
                            className={`w-4 h-4 transition-colors ${favorites.includes(recipe.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                          />
                        </button>
                      )}
                    </div>

                    <div className="p-5">
                      <h3 className="font-bold text-gray-800 mb-2 line-clamp-1">{recipe.name}</h3>
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2">{recipe.summary}</p>

                      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
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
                        {recipe.tags.slice(0, 3).map(tag => (
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
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No recipes found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your filters or search query</p>
            <Button onClick={clearFilters} variant="outline">
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}