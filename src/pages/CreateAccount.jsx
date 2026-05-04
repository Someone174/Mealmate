import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowRight, ArrowLeft, Check, User, Lock, Mail, Users, UtensilsCrossed, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { motion, AnimatePresence } from 'framer-motion';
import { createUser, loginUser, initializeDemoData } from '@/components/mealmate/LocalStorageService';
import { isSupabaseConfigured } from '@/lib/supabase';

const dietaryOptions = [
  { id: 'vegetarian', label: 'Vegetarian', icon: '🥗', description: 'Plant-based meals' },
  { id: 'gluten-free', label: 'Gluten-Free', icon: '🌾', description: 'No wheat or gluten' },
  { id: 'nut-free', label: 'Nut-Free', icon: '🥜', description: 'Avoid tree nuts & peanuts' },
  { id: 'low-carb', label: 'Low Carb', icon: '🥩', description: 'Keto-friendly options' },
  { id: 'high-protein', label: 'High Protein', icon: '💪', description: 'Muscle building' },
  { id: 'family-friendly', label: 'Family Friendly', icon: '👨‍👩‍👧‍👦', description: 'Kid-approved meals' },
  { id: 'quick', label: 'Quick Meals', icon: '⚡', description: 'Under 30 minutes' },
  { id: 'budget', label: 'Budget < $100/week', icon: '💰', description: 'Wallet-friendly recipes' }
];

const cuisineOptions = [
  { id: 'mediterranean', label: 'Mediterranean', icon: '🫒' },
  { id: 'asian', label: 'Asian', icon: '🥢' },
  { id: 'indian', label: 'Indian', icon: '🍛' },
  { id: 'mexican', label: 'Mexican', icon: '🌮' },
  { id: 'italian', label: 'Italian', icon: '🍝' },
  { id: 'middle-eastern', label: 'Middle Eastern', icon: '🧆' }
];

export default function CreateAccount() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    preferences: {
      dietary: [],
      servings: 2,
      cuisines: []
    }
  });
  
  React.useEffect(() => {
    initializeDemoData();
  }, []);
  
  const toggleDietary = (id) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        dietary: prev.preferences.dietary.includes(id)
          ? prev.preferences.dietary.filter(d => d !== id)
          : [...prev.preferences.dietary, id]
      }
    }));
  };
  
  const toggleCuisine = (id) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        cuisines: prev.preferences.cuisines.includes(id)
          ? prev.preferences.cuisines.filter(c => c !== id)
          : [...prev.preferences.cuisines, id]
      }
    }));
  };
  
  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    const result = await createUser(formData);
    if (!result.success) {
      setError(result.error);
      setLoading(false);
      return;
    }

    const loginIdentifier = isSupabaseConfigured && formData.email
      ? formData.email
      : formData.username;
    const loginResult = await loginUser(loginIdentifier, formData.password);

    if (loginResult.success) {
      setTimeout(() => {
        navigate(createPageUrl('Dashboard'));
      }, 500);
    } else {
      setError('Account created but login failed. Please try logging in.');
      setLoading(false);
    }
  };

  const canProceed = () => {
    if (step === 1) {
      const usernameOk = formData.username.length >= 3;
      const passwordOk = formData.password.length >= 6;
      const emailOk = !isSupabaseConfigured || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
      return usernameOk && passwordOk && emailOk;
    }
    return true;
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50 flex items-center justify-center p-4">
      {/* Decorative Elements */}
      <div className="fixed top-20 left-20 w-64 h-64 bg-emerald-200 rounded-full blur-3xl opacity-30 pointer-events-none" />
      <div className="fixed bottom-20 right-20 w-64 h-64 bg-orange-200 rounded-full blur-3xl opacity-30 pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg relative"
      >
        {/* Logo */}
        <Link to={createPageUrl('Landing')} className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="text-white text-2xl">🍽️</span>
          </div>
          <span className="font-bold text-2xl text-gray-800">MealMate</span>
        </Link>
        
        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                s === step
                  ? 'w-8 bg-emerald-500'
                  : s < step
                  ? 'w-4 bg-emerald-300'
                  : 'w-4 bg-gray-200'
              }`}
            />
          ))}
        </div>
        
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <AnimatePresence mode="wait">
            {/* Step 1: Account Details */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8"
              >
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Create Your Account
                </h1>
                <p className="text-gray-500 mb-8">
                  Start your journey to stress-free meal planning!
                </p>
                
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Choose a username"
                        value={formData.username}
                        onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                        className="pl-12 h-14 text-lg rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {isSupabaseConfigured && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          type="email"
                          autoComplete="email"
                          placeholder="you@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          className="pl-12 h-14 text-lg rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type="password"
                        autoComplete="new-password"
                        placeholder={isSupabaseConfigured ? 'At least 6 characters' : 'Create a password'}
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        className="pl-12 h-14 text-lg rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-between items-center">
                  <Link to={createPageUrl('SignIn')} className="text-emerald-600 hover:text-emerald-700 font-medium">
                    Already have an account?
                  </Link>
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!canProceed()}
                    className="h-12 px-8 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl disabled:opacity-50"
                  >
                    Continue
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </motion.div>
            )}
            
            {/* Step 2: Dietary Preferences */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8"
              >
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Dietary Preferences
                </h1>
                <p className="text-gray-500 mb-6">
                  Select all that apply (optional but recommended)
                </p>
                
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {dietaryOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => toggleDietary(option.id)}
                      className={`relative flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                        formData.preferences.dietary.includes(option.id)
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {formData.preferences.dietary.includes(option.id) && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <span className="text-2xl">{option.icon}</span>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{option.label}</p>
                        <p className="text-xs text-gray-500">{option.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
                
                <div className="flex justify-between items-center">
                  <Button
                    variant="ghost"
                    onClick={() => setStep(1)}
                    className="text-gray-600"
                  >
                    <ArrowLeft className="mr-2 w-5 h-5" />
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    className="h-12 px-8 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
                  >
                    Continue
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </motion.div>
            )}
            
            {/* Step 3: Family Size & Cuisines */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8"
              >
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Almost Done!
                </h1>
                <p className="text-gray-500 mb-6">
                  A few more details to personalize your experience
                </p>
                
                {/* Servings */}
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5 text-orange-500" />
                    <h3 className="font-semibold text-gray-800">How many people are you cooking for?</h3>
                  </div>
                  <div className="px-2">
                    <div className="flex justify-between text-sm text-gray-500 mb-3">
                      <span>1 person</span>
                      <span className="font-bold text-xl text-orange-500">{formData.preferences.servings} people</span>
                      <span>6 people</span>
                    </div>
                    <Slider
                      value={[formData.preferences.servings]}
                      min={1}
                      max={6}
                      step={1}
                      onValueChange={(value) => setFormData(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, servings: value[0] }
                      }))}
                      className="[&_[role=slider]]:bg-orange-500 [&_[role=slider]]:border-orange-500"
                    />
                  </div>
                </div>
                
                {/* Cuisines */}
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <UtensilsCrossed className="w-5 h-5 text-violet-500" />
                    <h3 className="font-semibold text-gray-800">Favorite cuisines (optional)</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cuisineOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => toggleCuisine(option.id)}
                        className={`flex items-center gap-2 px-5 py-3 rounded-full border-2 transition-all ${
                          formData.preferences.cuisines.includes(option.id)
                            ? 'border-violet-500 bg-violet-50 text-violet-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                      >
                        <span className="text-xl">{option.icon}</span>
                        <span className="font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <Button
                    variant="ghost"
                    onClick={() => setStep(2)}
                    className="text-gray-600"
                  >
                    <ArrowLeft className="mr-2 w-5 h-5" />
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="h-12 px-8 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl shadow-lg shadow-emerald-500/25"
                  >
                    {loading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                        />
                        Creating...
                      </>
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {!isSupabaseConfigured && (
          <p className="text-center text-gray-500 text-sm mt-6">
            🛠️ Local mode — Supabase not configured. Data saved in this browser.
          </p>
        )}
      </motion.div>
    </div>
  );
}