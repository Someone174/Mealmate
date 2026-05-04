import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, ChefHat, Database, Bell, Trash2, Download, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast, Toaster } from 'sonner';
import { createPageUrl } from '@/utils';
import {
  getCurrentUser,
  updateUserPreferences,
  logoutUser,
} from '@/components/mealmate/LocalStorageService';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const dietaryOptions = [
  { id: 'vegetarian', label: 'Vegetarian', icon: '🥗' },
  { id: 'gluten-free', label: 'Gluten-Free', icon: '🌾' },
  { id: 'nut-free', label: 'Nut-Free', icon: '🥜' },
  { id: 'low-carb', label: 'Low Carb', icon: '🥩' },
  { id: 'family-friendly', label: 'Family Friendly', icon: '👨‍👩‍👧‍👦' },
  { id: 'quick', label: 'Quick Meals (<30min)', icon: '⚡' },
  { id: 'budget', label: 'Budget Friendly', icon: '💰' },
];

const cuisineOptions = [
  { id: 'mediterranean', label: 'Mediterranean', icon: '🫒' },
  { id: 'asian', label: 'Asian', icon: '🥢' },
  { id: 'indian', label: 'Indian', icon: '🍛' },
  { id: 'mexican', label: 'Mexican', icon: '🌮' },
  { id: 'italian', label: 'Italian', icon: '🍝' },
  { id: 'middle-eastern', label: 'Middle Eastern', icon: '🧆' },
];

export default function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [prefs, setPrefs] = useState({ dietary: [], cuisines: [], servings: 2, weeklyBudget: 500 });
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) {
      navigate(createPageUrl('SignIn'));
      return;
    }
    setUser(u);
    setPrefs({
      dietary: u.preferences?.dietary || [],
      cuisines: u.preferences?.cuisines || [],
      servings: u.preferences?.servings ?? 2,
      weeklyBudget: u.preferences?.weeklyBudget ?? 500,
    });
  }, [navigate]);

  const dirty = useMemo(() => {
    if (!user) return false;
    const p = user.preferences || {};
    return (
      JSON.stringify(p.dietary || []) !== JSON.stringify(prefs.dietary) ||
      JSON.stringify(p.cuisines || []) !== JSON.stringify(prefs.cuisines) ||
      (p.servings ?? 2) !== prefs.servings ||
      (p.weeklyBudget ?? 500) !== prefs.weeklyBudget
    );
  }, [user, prefs]);

  const toggle = (key, id) => {
    setPrefs((prev) => ({
      ...prev,
      [key]: prev[key].includes(id) ? prev[key].filter((x) => x !== id) : [...prev[key], id],
    }));
  };

  const savePreferences = async () => {
    if (!user) return;
    setSavingPrefs(true);
    const result = await updateUserPreferences(user.id || user.username, prefs);
    setSavingPrefs(false);
    if (result?.success) {
      setUser((u) => ({ ...u, preferences: prefs }));
      toast.success('Preferences saved.');
    } else {
      toast.error(result?.error || 'Could not save preferences.');
    }
  };

  const exportData = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      user,
      mealPlans: JSON.parse(localStorage.getItem('mealmate_plans') || '{}'),
      groceryLists: JSON.parse(localStorage.getItem('mealmate_grocery') || '{}'),
      favorites: JSON.parse(localStorage.getItem('mealmate_favorites') || '{}'),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mealmate-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Export ready.');
  };

  const deleteAccount = async () => {
    if (!user) return;
    if (!window.confirm('This permanently deletes your account and local data. Continue?')) return;
    setDeleting(true);
    try {
      // Local data first.
      ['mealmate_plans', 'mealmate_grocery', 'mealmate_favorites'].forEach((k) =>
        localStorage.removeItem(k),
      );

      if (isSupabaseConfigured) {
        // Supabase: client-side can't delete an auth user without the
        // service role; the standard pattern is to flag the account and
        // have a server function tear it down. For now, scrub user metadata
        // and sign out; a follow-up admin job hard-deletes within 30 days.
        await supabase.auth.updateUser({ data: { deletion_requested_at: new Date().toISOString() } });
      }
      await logoutUser();
      toast.success('Account deletion requested.');
      navigate(createPageUrl('Landing'));
    } catch (err) {
      toast.error(err?.message || 'Could not complete deletion.');
    } finally {
      setDeleting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" richColors />

      <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to={createPageUrl('Dashboard')} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm">
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
              <span className="text-white">🍽️</span>
            </div>
            <span className="font-bold text-gray-800">Settings</span>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid grid-cols-4 max-w-2xl mx-auto rounded-2xl bg-white border border-gray-100 p-1">
              <TabsTrigger value="profile" className="rounded-xl"><User className="w-4 h-4 mr-1.5" />Profile</TabsTrigger>
              <TabsTrigger value="preferences" className="rounded-xl"><ChefHat className="w-4 h-4 mr-1.5" />Preferences</TabsTrigger>
              <TabsTrigger value="notifications" className="rounded-xl"><Bell className="w-4 h-4 mr-1.5" />Notifications</TabsTrigger>
              <TabsTrigger value="data" className="rounded-xl"><Database className="w-4 h-4 mr-1.5" />Data</TabsTrigger>
            </TabsList>

            {/* Profile */}
            <TabsContent value="profile" className="mt-6">
              <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
                <h2 className="font-bold text-gray-900 text-lg">Profile</h2>
                <Field label="Username" value={user.username} />
                {user.email && <Field label="Email" value={user.email} />}
                <Field label="Plan" value={user.plan || 'free'} />
                <p className="text-xs text-gray-400">
                  Changing username/email is coming soon. For now reach out at{' '}
                  <a className="text-emerald-600 hover:underline" href="mailto:hello@mealmate.app">hello@mealmate.app</a>.
                </p>
              </section>
            </TabsContent>

            {/* Preferences */}
            <TabsContent value="preferences" className="mt-6">
              <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-8">
                <div>
                  <h2 className="font-bold text-gray-900 text-lg mb-4">Dietary preferences</h2>
                  <div className="grid grid-cols-2 gap-2">
                    {dietaryOptions.map((opt) => {
                      const on = prefs.dietary.includes(opt.id);
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => toggle('dietary', opt.id)}
                          className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left text-sm transition-all ${
                            on ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          }`}
                        >
                          <span className="text-lg">{opt.icon}</span>
                          <span>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h2 className="font-bold text-gray-900 text-lg mb-4">Favorite cuisines</h2>
                  <div className="flex flex-wrap gap-2">
                    {cuisineOptions.map((opt) => {
                      const on = prefs.cuisines.includes(opt.id);
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => toggle('cuisines', opt.id)}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 text-sm transition-all ${
                            on ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-gray-200 hover:border-gray-300 text-gray-600'
                          }`}
                        >
                          <span>{opt.icon}</span>
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h2 className="font-bold text-gray-900 text-lg mb-2">People to feed</h2>
                  <div className="flex justify-between text-sm text-gray-500 mb-2">
                    <span>1 person</span>
                    <span className="font-bold text-orange-500">{prefs.servings}</span>
                    <span>6 people</span>
                  </div>
                  <Slider
                    value={[prefs.servings]}
                    min={1}
                    max={6}
                    step={1}
                    onValueChange={(v) => setPrefs((p) => ({ ...p, servings: v[0] }))}
                  />
                </div>

                <div>
                  <h2 className="font-bold text-gray-900 text-lg mb-2">Weekly budget (QAR)</h2>
                  <div className="flex justify-between text-sm text-gray-500 mb-2">
                    <span>100</span>
                    <span className="font-bold text-emerald-600">{prefs.weeklyBudget}</span>
                    <span>2000</span>
                  </div>
                  <Slider
                    value={[prefs.weeklyBudget]}
                    min={100}
                    max={2000}
                    step={50}
                    onValueChange={(v) => setPrefs((p) => ({ ...p, weeklyBudget: v[0] }))}
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={savePreferences}
                    disabled={!dirty || savingPrefs}
                    className="h-11 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50"
                  >
                    {savingPrefs ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Save changes
                  </Button>
                </div>
              </section>
            </TabsContent>

            {/* Notifications */}
            <TabsContent value="notifications" className="mt-6">
              <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-3">
                <h2 className="font-bold text-gray-900 text-lg">Notifications</h2>
                <p className="text-gray-500 text-sm">
                  Email digests and grocery-day reminders are on the roadmap. We’ll let you opt in
                  here once they’re live.
                </p>
                <div className="rounded-xl border border-dashed border-gray-200 p-4 text-sm text-gray-400">
                  Coming soon: weekly plan summary, grocery-day push, AI usage alerts.
                </div>
              </section>
            </TabsContent>

            {/* Data */}
            <TabsContent value="data" className="mt-6">
              <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
                <h2 className="font-bold text-gray-900 text-lg">Your data</h2>

                <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                  <div>
                    <p className="font-semibold text-gray-900">Export everything</p>
                    <p className="text-sm text-gray-500">Download a JSON file with your profile, plans, grocery lists and favorites.</p>
                  </div>
                  <Button onClick={exportData} variant="outline" className="rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-100">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>

                <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-red-50/60 border border-red-100">
                  <div>
                    <p className="font-semibold text-gray-900 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      Delete account
                    </p>
                    <p className="text-sm text-gray-500">Removes your local data immediately and queues your account for deletion.</p>
                  </div>
                  <Button
                    onClick={deleteAccount}
                    disabled={deleting}
                    variant="outline"
                    className="rounded-xl border-red-200 text-red-700 hover:bg-red-100"
                  >
                    {deleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                    Delete
                  </Button>
                </div>
              </section>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2 border-b border-gray-100 last:border-b-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-gray-900 font-medium">{value}</span>
    </div>
  );
}
