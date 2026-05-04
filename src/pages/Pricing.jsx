import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles, Zap, Crown, ArrowLeft, X, Mail, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCurrentUser, getUserPlan, joinWaitlist } from '@/components/mealmate/LocalStorageService';
import { createPageUrl } from '@/utils';
import { toast, Toaster } from 'sonner';

const FEATURES = [
  'AI-powered weekly meal planning',
  'Real recipes from 1,000+ database',
  'Smart grocery list generation',
  'Price comparison across stores',
  'Dietary & cuisine preferences',
  'Unlimited meal swaps',
  'Pork-free guarantee',
  'MealMate AI chat assistant',
];

const PLANS = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: '24.99',
    period: '/month',
    description: 'Perfect for trying out MealMate',
    icon: Zap,
    color: 'from-blue-500 to-indigo-500',
    badge: null,
    cta: 'Notify me at launch',
    highlight: false,
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: '108.99',
    period: '/year',
    description: 'Save 63% compared to monthly',
    icon: Sparkles,
    color: 'from-emerald-500 to-teal-500',
    badge: 'Most Popular',
    cta: 'Notify me at launch',
    highlight: true,
    savings: 'Save 190 QAR/yr',
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: '362.99',
    period: 'one-time',
    description: 'Pay once, use forever',
    icon: Crown,
    color: 'from-amber-500 to-orange-500',
    badge: 'Best Value',
    cta: 'Notify me at launch',
    highlight: false,
  },
];

function WaitlistModal({ plan, defaultEmail, onClose }) {
  const [email, setEmail] = useState(defaultEmail || '');
  const [phase, setPhase] = useState('form'); // form | submitting | success
  const [error, setError] = useState('');

  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const Icon = plan.icon;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!valid || phase !== 'form') return;
    setPhase('submitting');
    setError('');

    const result = await joinWaitlist({ email, plan: plan.id });
    if (!result.success) {
      setError(result.error || 'Something went wrong. Try again.');
      setPhase('form');
      return;
    }
    setPhase('success');
    toast.success(`You’re on the ${plan.name} waitlist.`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget && phase !== 'submitting') onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="waitlist-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 24 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className={`bg-gradient-to-r ${plan.color} p-6 text-white`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Icon className="w-5 h-5" />
              <span id="waitlist-title" className="font-bold text-lg">{plan.name} Plan</span>
            </div>
            {phase !== 'submitting' && (
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex items-end gap-1">
            <span className="text-4xl font-extrabold">{plan.price}</span>
            <span className="text-white/80 mb-1">QAR {plan.period}</span>
          </div>
          {plan.savings && <p className="text-white/80 text-sm mt-1">{plan.savings}</p>}
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {phase !== 'success' ? (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <p className="text-sm text-gray-500">
                  Subscriptions aren’t live yet. Drop your email and we’ll let you know
                  the moment the <strong className="text-gray-700">{plan.name}</strong> plan opens up.
                </p>

                <div>
                  <label htmlFor="waitlist-email" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input
                      id="waitlist-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 pl-9 text-sm focus:outline-none focus:border-emerald-400 transition-colors"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={!valid || phase === 'submitting'}
                  className={`w-full h-11 font-semibold rounded-xl bg-gradient-to-r ${plan.color} border-0 text-white hover:opacity-90 disabled:opacity-50 transition-opacity`}
                >
                  {phase === 'submitting' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding you to the list…
                    </>
                  ) : (
                    `Join the ${plan.name} waitlist`
                  )}
                </Button>

                <p className="text-center text-xs text-gray-400">
                  No spam. One email at launch, that’s it.
                </p>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 flex flex-col items-center gap-3 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center"
                >
                  <CheckCircle className="w-9 h-9 text-emerald-500" />
                </motion.div>
                <p className="text-gray-900 font-bold text-lg">You’re on the list!</p>
                <p className="text-gray-500 text-sm">
                  We’ll send <span className="font-medium text-gray-700">{email}</span> a note as soon as
                  the {plan.name} plan goes live.
                </p>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="mt-2 rounded-xl"
                >
                  Done
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Pricing() {
  const currentUser = getCurrentUser();
  const currentPlanId = getUserPlan(currentUser?.id || currentUser?.username);
  const [selectedPlan, setSelectedPlan] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50">
      <Toaster position="top-center" richColors />

      <AnimatePresence>
        {selectedPlan && (
          <WaitlistModal
            plan={selectedPlan}
            defaultEmail={currentUser?.email || ''}
            onClose={() => setSelectedPlan(null)}
          />
        )}
      </AnimatePresence>

      <nav className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <div className="flex items-center gap-3">
          {currentUser ? (
            <span className="text-sm text-gray-500 hidden sm:inline">
              Signed in as <strong className="text-gray-800">{currentUser.username}</strong>
            </span>
          ) : (
            <Link to={createPageUrl('SignIn')} className="text-sm text-emerald-600 font-semibold hover:text-emerald-800">
              Sign in
            </Link>
          )}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-base">🍽️</span>
            </div>
            <span className="font-bold text-gray-800">MealMate</span>
          </div>
        </div>
      </nav>

      <div className="text-center px-6 pt-10 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-emerald-200"
        >
          <Sparkles className="w-4 h-4" />
          Subscriptions launching soon
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight"
        >
          Eat smarter. Spend less.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-500 text-lg max-w-xl mx-auto"
        >
          MealMate is free while we’re in beta. Pick the plan you’d be most likely
          to choose at launch and we’ll save you a spot.
        </motion.p>

        {currentPlanId !== 'free' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="inline-flex items-center gap-2 mt-4 bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-full"
          >
            <CheckCircle className="w-4 h-4" />
            You’re on the <span className="font-bold capitalize ml-1">{currentPlanId}</span> plan
          </motion.div>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-6 items-start">
          {PLANS.map((plan, i) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                className={`relative rounded-3xl border transition-all duration-300
                  ${plan.highlight
                    ? 'border-emerald-300 shadow-2xl shadow-emerald-100 scale-105 bg-white'
                    : 'border-gray-200 shadow-sm bg-white hover:shadow-lg hover:-translate-y-1'
                  }`}
              >
                {plan.badge && (
                  <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r ${plan.color} text-white text-xs font-bold px-4 py-1 rounded-full shadow-md whitespace-nowrap`}>
                    {plan.badge}
                  </div>
                )}

                <div className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center shadow-sm`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-900 text-lg leading-tight">{plan.name}</h2>
                      <p className="text-gray-400 text-xs">{plan.description}</p>
                    </div>
                  </div>

                  <div className="mb-2">
                    <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                    <span className="text-gray-400 font-medium ml-1">QAR</span>
                    <span className="text-gray-400 text-sm ml-1">{plan.period}</span>
                  </div>
                  {plan.savings ? (
                    <p className="text-emerald-600 text-sm font-semibold mb-6">{plan.savings}</p>
                  ) : (
                    <div className="mb-6" />
                  )}

                  <Button
                    onClick={() => setSelectedPlan(plan)}
                    className={`w-full font-semibold rounded-xl h-11 border-0 text-white shadow-sm transition-all bg-gradient-to-r ${plan.color} hover:opacity-90 active:scale-[0.98]`}
                  >
                    {plan.cta}
                  </Button>
                </div>

                <div className="px-8 pb-2">
                  <div className="border-t border-gray-100" />
                </div>

                <div className="px-8 pb-8 pt-4 space-y-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Everything included</p>
                  {FEATURES.map((f) => (
                    <div key={f} className="flex items-center gap-2.5">
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${plan.color} flex items-center justify-center flex-shrink-0`}>
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      </div>
                      <span className="text-gray-600 text-sm">{f}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-gray-400 text-sm mt-10"
        >
          All prices in Qatari Riyal (QAR). No hidden fees. Cancel anytime once subscriptions go live.
        </motion.p>
      </div>
    </div>
  );
}
