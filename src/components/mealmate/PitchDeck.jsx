import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, X, TrendingUp, Clock, DollarSign, Users, Check, Sparkles, Target, Zap, Shield, Globe, Smartphone, Brain, Heart, Award, BarChart3, PieChart, LineChart, Star } from 'lucide-react';

const slides = [
  {
    id: 1,
    type: 'title',
    content: {
      emoji: '🍽️',
      title: 'MealMate',
      subtitle: 'Intelligent Meal Planning'
    }
  },
  {
    id: 2,
    type: 'stat',
    content: {
      number: '4.5',
      unit: 'hours',
      label: 'Average time wasted weekly on meal planning',
      sublabel: 'per household'
    }
  },
  {
    id: 3,
    type: 'stat',
    content: {
      number: '68%',
      label: 'of families struggle with grocery budgeting',
      sublabel: 'overspending by 20-40% monthly'
    }
  },
  {
    id: 4,
    type: 'stat',
    content: {
      number: '30%',
      label: 'food waste per household yearly',
      sublabel: '$1,800 thrown away'
    }
  },
  {
    id: 5,
    type: 'statement',
    content: {
      text: 'Families are overwhelmed',
      subtext: 'Meal planning is time-consuming, expensive, and wasteful'
    }
  },
  {
    id: 6,
    type: 'market',
    content: {
      title: 'Market Opportunity',
      tam: '$42B',
      sam: '$8.3B',
      som: '$420M',
      growth: '+18% CAGR'
    }
  },
  {
    id: 7,
    type: 'statement',
    content: {
      text: 'Introducing MealMate',
      subtext: 'AI-powered meal planning that saves time and money'
    }
  },
  {
    id: 8,
    type: 'feature',
    content: {
      icon: Brain,
      title: 'Smart Algorithms',
      description: 'AI learns your preferences and dietary needs',
      stats: ['95% match rate', '2M+ combinations', 'Real-time adaptation']
    }
  },
  {
    id: 9,
    type: 'feature',
    content: {
      icon: DollarSign,
      title: 'Budget Control',
      description: 'Set weekly budgets and optimize spending',
      stats: ['30% avg savings', 'Price comparison', 'Smart substitutions']
    }
  },
  {
    id: 10,
    type: 'feature',
    content: {
      icon: Clock,
      title: 'Time Efficiency',
      description: 'Plan entire week in under 5 minutes',
      stats: ['3.5 hrs saved weekly', 'One-tap swaps', 'Auto grocery lists']
    }
  },
  {
    id: 11,
    type: 'demo',
    content: {
      title: 'How It Works',
      steps: [
        { num: '01', text: 'Set preferences', time: '30s' },
        { num: '02', text: 'AI generates plan', time: '10s' },
        { num: '03', text: 'Review & customize', time: '2m' },
        { num: '04', text: 'Get grocery list', time: 'instant' }
      ]
    }
  },
  {
    id: 12,
    type: 'metrics',
    content: {
      title: 'Traction',
      metrics: [
        { value: '12,000+', label: 'Active Users', change: '+240%' },
        { value: '48,000+', label: 'Hours Saved/Week', change: '+310%' },
        { value: '94%', label: 'User Satisfaction', change: '+12%' },
        { value: '$2.1M', label: 'Grocery Savings', change: '+280%' }
      ]
    }
  },
  {
    id: 13,
    type: 'testimonial',
    content: {
      quote: 'MealMate transformed our family dinners. We save 3 hours and 200 QAR every week.',
      author: 'Sarah M.',
      role: 'Mother of 3',
      rating: 5
    }
  },
  {
    id: 14,
    type: 'comparison',
    content: {
      title: 'vs Traditional Planning',
      traditional: [
        { label: 'Time', value: '4.5 hrs/week' },
        { label: 'Cost', value: 'Overspend 30%' },
        { label: 'Waste', value: '30%' },
        { label: 'Variety', value: 'Limited' }
      ],
      mealmate: [
        { label: 'Time', value: '5 minutes' },
        { label: 'Cost', value: 'Save 30%' },
        { label: 'Waste', value: '<5%' },
        { label: 'Variety', value: '500+ recipes' }
      ]
    }
  },
  {
    id: 15,
    type: 'tech',
    content: {
      title: 'Technology Stack',
      items: [
        { name: 'Machine Learning', desc: 'Preference optimization' },
        { name: 'Real-time Pricing', desc: 'Multi-store comparison' },
        { name: 'Nutritional AI', desc: 'Balanced meal planning' },
        { name: 'Cloud Sync', desc: 'Cross-device access' }
      ]
    }
  },
  {
    id: 16,
    type: 'business',
    content: {
      title: 'Business Model',
      models: [
        { tier: 'Free', price: '$0', features: ['Basic meal plans', '50 recipes', '1 user'] },
        { tier: 'Pro', price: '$9.99', features: ['Unlimited plans', '500+ recipes', 'Family sharing', 'Priority support'], highlight: true },
        { tier: 'Enterprise', price: 'Custom', features: ['White-label', 'API access', 'Dedicated support'] }
      ]
    }
  },
  {
    id: 17,
    type: 'competitive',
    content: {
      title: 'Competitive Advantage',
      advantages: [
        'AI-driven personalization',
        'Real-time price comparison',
        'Local market integration',
        'Zero food waste focus'
      ]
    }
  },
  {
    id: 18,
    type: 'roadmap',
    content: {
      title: 'Product Roadmap',
      quarters: [
        { q: 'Q1 2026', items: ['Mobile app launch', 'Smart notifications'] },
        { q: 'Q2 2026', items: ['Recipe sharing', 'Community features'] },
        { q: 'Q3 2026', items: ['Grocery delivery', 'Meal kit integration'] },
        { q: 'Q4 2026', items: ['AI cooking assistant', 'Voice control'] }
      ]
    }
  },
  {
    id: 19,
    type: 'vision',
    content: {
      text: 'Our Vision',
      subtext: 'Make healthy eating accessible, affordable, and effortless for every family'
    }
  },
  {
    id: 20,
    type: 'call',
    content: {
      title: 'Join the Movement',
      stats: ['12K+ users', '48K+ hours saved', '$2.1M saved']
    }
  },
  {
    id: 21,
    type: 'final',
    content: {
      title: 'Ready to Transform Meal Planning?',
      cta: 'Get Started Free'
    }
  }
];


export default function PitchDeck({ onClose }) {
  const [current, setCurrent] = useState(0);
  const slide = slides[current];
  const total = slides.length;

  const next = () => setCurrent(i => Math.min(i + 1, total - 1));
  const prev = () => setCurrent(i => Math.max(i - 1, 0));

  const renderContent = (s) => {
    const c = s.content;
    switch (s.type) {
      case 'title':
        return (
          <div className="text-center">
            <div className="text-6xl mb-4">{c.emoji}</div>
            <h1 className="text-5xl font-black text-white mb-3">{c.title}</h1>
            <p className="text-xl text-white/60">{c.subtitle}</p>
          </div>
        );
      case 'stat':
        return (
          <div className="text-center">
            <div className="text-8xl font-black text-emerald-400 mb-2">{c.number}<span className="text-4xl">{c.unit}</span></div>
            <p className="text-2xl text-white/80 mt-4">{c.label}</p>
            {c.sublabel && <p className="text-white/40 mt-2">{c.sublabel}</p>}
          </div>
        );
      case 'problem':
        return (
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">{c.title}</h2>
            <div className="space-y-3">
              {(c.points || []).map((p, i) => (
                <div key={i} className="flex items-start gap-3 bg-white/5 rounded-xl p-4">
                  <span className="text-2xl">{p.icon}</span>
                  <div>
                    <div className="text-white font-semibold">{p.text}</div>
                    {p.subtext && <div className="text-white/50 text-sm">{p.subtext}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'feature':
        return (
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">{c.title}</h2>
            <div className="grid grid-cols-2 gap-3">
              {(c.features || []).map((f, i) => (
                <div key={i} className="bg-white/5 rounded-xl p-4 flex items-start gap-3">
                  <span className="text-xl">{f.icon}</span>
                  <div>
                    <div className="text-white font-semibold text-sm">{f.name}</div>
                    <div className="text-white/50 text-xs">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'pricing':
        return (
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">{c.title}</h2>
            <div className="grid grid-cols-3 gap-3">
              {(c.models || []).map((m, i) => (
                <div key={i} className={`rounded-xl p-4 ${m.highlight ? 'bg-emerald-500/20 border border-emerald-500/40' : 'bg-white/5'}`}>
                  <div className="text-white font-bold">{m.tier}</div>
                  <div className="text-2xl font-black text-emerald-400">{m.price}</div>
                  <ul className="mt-2 space-y-1">
                    {m.features.map((f, j) => <li key={j} className="text-white/60 text-xs flex items-center gap-1"><Check className="w-3 h-3 text-emerald-400" />{f}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return (
          <div className="text-center">
            {c.title && <h2 className="text-4xl font-bold text-white mb-4">{c.title}</h2>}
            {c.text && <h2 className="text-4xl font-bold text-white mb-4">{c.text}</h2>}
            {c.subtitle && <p className="text-xl text-white/60">{c.subtitle}</p>}
            {c.subtext && <p className="text-xl text-white/60">{c.subtext}</p>}
            {c.cta && (
              <button
                onClick={onClose}
                className="mt-8 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-3 rounded-2xl text-lg"
              >
                {c.cta}
              </button>
            )}
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl">
        {onClose && (
          <button onClick={onClose} className="absolute -top-10 right-0 text-white/50 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
            className="bg-gray-950 border border-white/10 rounded-3xl p-10 min-h-[400px] flex flex-col justify-center"
          >
            {renderContent(slide)}
          </motion.div>
        </AnimatePresence>
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={prev}
            disabled={current === 0}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-white/40 text-sm">{current + 1} / {total}</span>
          <button
            onClick={next}
            disabled={current === total - 1}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
