import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles, Zap, Crown, ArrowLeft, X, CreditCard, Lock, CheckCircle, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCurrentUser, getUserPlan, upgradePlan } from '@/components/mealmate/LocalStorageService';
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
    priceNum: 24.99,
    period: '/month',
    description: 'Perfect for trying out MealMate',
    icon: Zap,
    color: 'from-blue-500 to-indigo-500',
    badge: null,
    cta: 'Start Monthly',
    highlight: false,
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: '108.99',
    priceNum: 108.99,
    period: '/year',
    description: 'Save 63% compared to monthly',
    icon: Sparkles,
    color: 'from-emerald-500 to-teal-500',
    badge: 'Most Popular',
    cta: 'Start Yearly',
    highlight: true,
    savings: 'Save 190 QAR/yr',
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: '362.99',
    priceNum: 362.99,
    period: 'one-time',
    description: 'Pay once, use forever',
    icon: Crown,
    color: 'from-amber-500 to-orange-500',
    badge: 'Best Value',
    cta: 'Get Lifetime Access',
    highlight: false,
  },
];

const PLAN_RANK = { free: 0, monthly: 1, yearly: 2, lifetime: 3 };

function formatCardNumber(val) {
  return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(val) {
  const digits = val.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

function PaymentModal({ plan, user, onClose, onSuccess }) {
  const [card, setCard] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState(user?.username || '');
  const [phase, setPhase] = useState('form'); // form | processing | success

  const isValid =
    card.replace(/\s/g, '').length === 16 &&
    expiry.length === 5 &&
    cvv.length >= 3 &&
    name.trim().length >= 2;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    setPhase('processing');
    await new Promise(r => setTimeout(r, 1600));
    setPhase('success');
    await new Promise(r => setTimeout(r, 900));
    onSuccess();
  };

  const Icon = plan.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget && phase === 'form') onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 24 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${plan.color} p-6 text-white`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Icon className="w-5 h-5" />
              <span className="font-bold text-lg">{plan.name} Plan</span>
            </div>
            {phase === 'form' && (
              <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition-colors">
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
            {phase === 'form' && (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                  <Lock className="w-3 h-3" />
                  <span>Secure payment — demo mode</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Name on card
                  </label>
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ahmed Al-Rashid"
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Card number
                  </label>
                  <div className="relative">
                    <input
                      value={card}
                      onChange={e => setCard(formatCardNumber(e.target.value))}
                      placeholder="1234 5678 9012 3456"
                      inputMode="numeric"
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 pr-10 text-sm font-mono focus:outline-none focus:border-emerald-400 transition-colors"
                    />
                    <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Expiry
                    </label>
                    <input
                      value={expiry}
                      onChange={e => setExpiry(formatExpiry(e.target.value))}
                      placeholder="MM/YY"
                      inputMode="numeric"
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-emerald-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      CVV
                    </label>
                    <input
                      value={cvv}
                      onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="123"
                      inputMode="numeric"
                      type="password"
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-emerald-400 transition-colors"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={!isValid}
                  className={`w-full h-11 font-semibold rounded-xl bg-gradient-to-r ${plan.color} border-0 text-white hover:opacity-90 disabled:opacity-40 transition-opacity`}
                >
                  Complete Purchase — {plan.price} QAR
                </Button>

                <p className="text-center text-xs text-gray-400">
                  This is a demo. No real charges will be made.
                </p>
              </motion.form>
            )}

            {phase === 'processing' && (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-10 flex flex-col items-center gap-4"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className={`w-14 h-14 rounded-full border-4 border-t-transparent bg-gradient-to-br ${plan.color}`}
                  style={{ borderColor: 'transparent', borderTopColor: 'white' }}
                >
                  <div className={`w-full h-full rounded-full border-4 border-transparent bg-gradient-to-br ${plan.color} opacity-30`} />
                </motion.div>
                <p className="text-gray-600 font-medium">Processing payment…</p>
                <p className="text-gray-400 text-sm">Please wait a moment</p>
              </motion.div>
            )}

            {phase === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-10 flex flex-col items-center gap-3"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center"
                >
                  <CheckCircle className="w-9 h-9 text-emerald-500" />
                </motion.div>
                <p className="text-gray-900 font-bold text-lg">Payment successful!</p>
                <p className="text-gray-500 text-sm text-center">
                  Welcome to the {plan.name} plan. Redirecting you now…
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

function LoginPromptModal({ plan, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 24 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center"
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100">
          <X className="w-4 h-4 text-gray-400" />
        </button>

        <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
          <LogIn className="w-7 h-7 text-white" />
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-2">Sign in to subscribe</h2>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          You need an account to subscribe to the <strong>{plan.name}</strong> plan.
        </p>

        <div className="space-y-3">
          <Link to={createPageUrl('SignIn')} state={{ redirectTo: '/Pricing', planId: plan.id }}>
            <Button className={`w-full font-semibold rounded-xl h-11 bg-gradient-to-r ${plan.color} border-0 text-white hover:opacity-90`}>
              Sign In
            </Button>
          </Link>
          <Link to={createPageUrl('CreateAccount')} state={{ redirectTo: '/Pricing', planId: plan.id }}>
            <Button variant="outline" className="w-full rounded-xl h-11 font-semibold">
              Create Account
            </Button>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Pricing() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const currentPlanId = getUserPlan(currentUser?.username);

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const handleSelectPlan = (plan) => {
    if (!currentUser) {
      setSelectedPlan(plan);
      setShowLoginPrompt(true);
      return;
    }
    if (currentPlanId === plan.id) return; // already on this plan
    setSelectedPlan(plan);
    setShowLoginPrompt(false);
  };

  const handlePaymentSuccess = () => {
    upgradePlan(currentUser.username, selectedPlan.id);
    toast.success(`Welcome to ${selectedPlan.name}! 🎉`, { duration: 4000 });
    navigate(createPageUrl('Dashboard'));
  };

  const getCtaLabel = (plan) => {
    if (currentPlanId === plan.id) return 'Current Plan';
    if (PLAN_RANK[currentPlanId] > PLAN_RANK[plan.id]) return 'Downgrade';
    return plan.cta;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50">
      <Toaster position="top-center" richColors />

      <AnimatePresence>
        {selectedPlan && !showLoginPrompt && (
          <PaymentModal
            plan={selectedPlan}
            user={currentUser}
            onClose={() => setSelectedPlan(null)}
            onSuccess={handlePaymentSuccess}
          />
        )}
        {showLoginPrompt && selectedPlan && (
          <LoginPromptModal
            plan={selectedPlan}
            onClose={() => { setSelectedPlan(null); setShowLoginPrompt(false); }}
          />
        )}
      </AnimatePresence>

      {/* Nav */}
      <nav className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Signed in as <strong className="text-gray-800">{currentUser.username}</strong></span>
              {currentPlanId !== 'free' && (
                <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded-full capitalize">
                  {currentPlanId}
                </span>
              )}
            </div>
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

      {/* Header */}
      <div className="text-center px-6 pt-10 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-emerald-200"
        >
          <Sparkles className="w-4 h-4" />
          Simple, transparent pricing
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
          All plans include every feature. Pick the billing cycle that works best for you.
        </motion.p>

        {currentPlanId !== 'free' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="inline-flex items-center gap-2 mt-4 bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-full"
          >
            <CheckCircle className="w-4 h-4" />
            You're on the <span className="font-bold capitalize ml-1">{currentPlanId}</span> plan
          </motion.div>
        )}
      </div>

      {/* Pricing Cards */}
      <div className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-6 items-start">
          {PLANS.map((plan, i) => {
            const Icon = plan.icon;
            const isCurrent = currentPlanId === plan.id;
            const ctaLabel = getCtaLabel(plan);

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
                  }
                  ${isCurrent ? 'ring-2 ring-emerald-400' : ''}
                `}
              >
                {/* Badges */}
                {isCurrent ? (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-md whitespace-nowrap">
                    ✓ Current Plan
                  </div>
                ) : plan.badge ? (
                  <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r ${plan.color} text-white text-xs font-bold px-4 py-1 rounded-full shadow-md whitespace-nowrap`}>
                    {plan.badge}
                  </div>
                ) : null}

                <div className="p-8">
                  {/* Icon + Name */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center shadow-sm`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-900 text-lg leading-tight">{plan.name}</h2>
                      <p className="text-gray-400 text-xs">{plan.description}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-2">
                    <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                    <span className="text-gray-400 font-medium ml-1">QAR</span>
                    <span className="text-gray-400 text-sm ml-1">{plan.period}</span>
                  </div>
                  {plan.savings && (
                    <p className="text-emerald-600 text-sm font-semibold mb-6">{plan.savings}</p>
                  )}
                  {!plan.savings && <div className="mb-6" />}

                  {/* CTA */}
                  <Button
                    onClick={() => handleSelectPlan(plan)}
                    disabled={isCurrent}
                    className={`w-full font-semibold rounded-xl h-11 border-0 text-white shadow-sm transition-all
                      ${isCurrent
                        ? 'bg-emerald-100 text-emerald-700 cursor-default'
                        : `bg-gradient-to-r ${plan.color} hover:opacity-90 active:scale-[0.98]`
                      }`}
                  >
                    {isCurrent && <CheckCircle className="w-4 h-4 mr-2" />}
                    {ctaLabel}
                  </Button>
                </div>

                {/* Divider */}
                <div className="px-8 pb-2">
                  <div className="border-t border-gray-100" />
                </div>

                {/* Features */}
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

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-gray-400 text-sm mt-10"
        >
          All prices in Qatari Riyal (QAR). No hidden fees. Cancel anytime.
        </motion.p>
      </div>
    </div>
  );
}
