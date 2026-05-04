import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowRight, User, Lock, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { loginUser, initializeDemoData } from '@/components/mealmate/LocalStorageService';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function SignIn() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    initializeDemoData();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await loginUser(identifier, password);

    if (result.success) {
      setTimeout(() => {
        navigate(createPageUrl('Dashboard'));
      }, 500);
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setIdentifier('demo');
    setPassword('demo123');
  };

  const showDemoShortcut = !isSupabaseConfigured;
  const fieldLabel = isSupabaseConfigured ? 'Email' : 'Username';
  const fieldPlaceholder = isSupabaseConfigured ? 'you@example.com' : 'Enter your username';

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50 flex items-center justify-center p-4">
      {/* Decorative Elements */}
      <div className="fixed top-20 right-20 w-64 h-64 bg-emerald-200 rounded-full blur-3xl opacity-30 pointer-events-none" />
      <div className="fixed bottom-20 left-20 w-64 h-64 bg-orange-200 rounded-full blur-3xl opacity-30 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        <Link to={createPageUrl('Landing')} className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="text-white text-2xl">🍽️</span>
          </div>
          <span className="font-bold text-2xl text-gray-800">MealMate</span>
        </Link>

        <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200/50 border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Welcome Back!
          </h1>
          <p className="text-gray-500 mb-8 text-center">
            Let's get you back to planning delicious meals
          </p>

          {showDemoShortcut && (
            <>
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="w-full mb-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl flex items-center justify-between hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-800">Try Demo Account</p>
                    <p className="text-sm text-gray-500">demo / demo123</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-emerald-500 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">or login with your account</span>
                </div>
              </div>
            </>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {fieldLabel}
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type={isSupabaseConfigured ? 'email' : 'text'}
                  autoComplete={isSupabaseConfigured ? 'email' : 'username'}
                  placeholder={fieldPlaceholder}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="pl-12 h-14 text-lg rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 h-14 text-lg rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !identifier || !password}
              className="w-full h-14 text-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl shadow-lg shadow-emerald-500/25 mt-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                  />
                  Logging in...
                </>
              ) : (
                <>
                  Login
                  <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            New here?{' '}
            <Link to={createPageUrl('CreateAccount')} className="text-emerald-600 hover:text-emerald-700 font-semibold">
              Create Account
            </Link>
          </p>
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
