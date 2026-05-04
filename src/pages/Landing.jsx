import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowRight, Sparkles, ListChecks, Shuffle, Clock, BarChart3, ShoppingBasket, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { isLoggedIn } from '@/components/mealmate/LocalStorageService';

export default function Landing() {
  const features = [
    {
      icon: Sparkles,
      title: 'Tailored to Your Tastes',
      description: 'Smart AI picks meals based on your dietary needs, family size, and favorite cuisines.',
      color: 'from-violet-500 to-purple-500'
    },
    {
      icon: ListChecks,
      title: 'Auto Grocery Lists',
      description: 'Instantly generate organized shopping lists grouped by store aisle. Never forget an ingredient.',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      icon: Shuffle,
      title: 'Swap Any Meal Easily',
      description: "Don't love a recipe? Swap it with one tap and get a new suggestion that fits your plan.",
      color: 'from-orange-500 to-amber-500'
    }
  ];

  const valueProps = [
    { label: 'Plan a week in minutes', icon: Clock },
    { label: 'Aisle-grouped grocery list', icon: ShoppingBasket },
    { label: 'Compare local store prices', icon: BarChart3 },
    { label: 'Your data stays private', icon: Lock }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-emerald-50/30 to-white">

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">🍽️</span>
              </div>
              <span className="font-bold text-xl text-gray-800">MealMate</span>
            </div>
            
            <div className="flex items-center gap-3">
              {isLoggedIn() ? (
                <Link to={createPageUrl('Dashboard')}>
                  <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-6">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to={createPageUrl('SignIn')}>
                    <Button variant="ghost" className="text-gray-600 hover:text-gray-800">
                      Login
                    </Button>
                  </Link>
                  <Link to={createPageUrl('CreateAccount')}>
                    <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-6">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                Smart Meal Planning Made Simple
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6">
                Plan Your{' '}
                <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                  Delicious Week
                </span>{' '}
                in Minutes!
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed mb-8 max-w-lg">
                Smart, personalized meal plans that fit your life – quick recipes, grocery lists, and zero stress. 
                Finally, the answer to "What's for dinner?"
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link to={createPageUrl('CreateAccount')}>
                  <Button className="h-14 px-8 text-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl shadow-xl shadow-emerald-500/25 hover:shadow-2xl hover:shadow-emerald-500/30 transition-all group">
                    Start Planning Now
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to={createPageUrl('SignIn')}>
                  <Button variant="outline" className="h-14 px-8 text-lg rounded-2xl border-2 border-gray-200 hover:border-emerald-500 hover:bg-emerald-50">
                    Try Demo Account
                  </Button>
                </Link>
              </div>
              
              <p className="text-sm text-gray-500 mt-4">
                ✨ No credit card required • 100% free demo
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute -top-8 -left-8 w-64 h-64 bg-emerald-200 rounded-full blur-3xl opacity-40" />
              <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-orange-200 rounded-full blur-3xl opacity-40" />
              
              <div className="relative bg-white rounded-3xl shadow-2xl shadow-gray-200/50 p-8 border border-gray-100">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {['🥗', '🍝', '🥙', '🍜', '🥘', '🍲'].map((emoji, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center text-4xl hover:scale-110 transition-transform cursor-pointer"
                    >
                      {emoji}
                    </motion.div>
                  ))}
                </div>
                
                <div className="space-y-3">
                  <div className="h-3 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full w-full" />
                  <div className="h-3 bg-gray-100 rounded-full w-4/5" />
                  <div className="h-3 bg-gray-100 rounded-full w-3/5" />
                </div>
                
                <div className="mt-6 flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl">
                  <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white">
                    <ListChecks className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Grocery List Ready!</p>
                    <p className="text-sm text-gray-500">24 items • 3 stores</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Value Props Section */}
      <section className="py-16 bg-gradient-to-r from-emerald-500 to-teal-500">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {valueProps.map((prop, i) => (
              <motion.div
                key={prop.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center text-white"
              >
                <prop.icon className="w-8 h-8 mx-auto mb-3 opacity-80" />
                <p className="text-base sm:text-lg font-semibold leading-snug text-white">{prop.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Busy People Love MealMate
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We handle the hard parts so you can enjoy delicious, stress-free meals every day.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-100/50 border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all group"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-[2.5rem] p-12 text-center text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative">
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                Ready to Simplify Mealtime?
              </h2>
              <p className="text-xl text-emerald-100 mb-8 max-w-lg mx-auto">
                Join thousands of happy meal planners and take the stress out of "What's for dinner?"
              </p>
              
              <Link to={createPageUrl('CreateAccount')}>
                <Button className="h-14 px-10 text-lg bg-white text-emerald-600 hover:bg-gray-100 rounded-2xl shadow-xl font-semibold group">
                  Start Your Free Plan
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Upgrade Teaser */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto bg-gradient-to-r from-violet-50 to-purple-50 rounded-3xl p-8 border border-violet-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-violet-600" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-gray-900 mb-2">Upgrade to Pro</h3>
              <p className="text-gray-600 mb-4">
                Coming soon: Real-time sync across devices, 1000+ premium recipes, AI-powered nutrition coaching, and family sharing. Get early access!
              </p>
              <Button variant="outline" className="border-violet-300 text-violet-600 hover:bg-violet-100">
                Join Waitlist
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">🍽️</span>
              </div>
              <span className="font-bold text-xl text-gray-800">MealMate</span>
            </div>

            <p className="text-gray-500 text-sm">
              Built with ❤️ for healthy habits
            </p>

            <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap justify-center">
              <Link to={createPageUrl('SignIn')} className="hover:text-emerald-600">
                Sign in
              </Link>
              <Link to={createPageUrl('CreateAccount')} className="hover:text-emerald-600">
                Create account
              </Link>
              <Link to="/Privacy" className="hover:text-emerald-600">
                Privacy
              </Link>
              <Link to="/Terms" className="hover:text-emerald-600">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}