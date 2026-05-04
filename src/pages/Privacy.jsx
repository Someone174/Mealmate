import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-emerald-50/30 to-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to MealMate
        </Link>

        <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Privacy</h1>
        <p className="text-gray-500 mb-10">Last updated: today.</p>

        <div className="prose prose-slate max-w-none space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-bold text-gray-900">What we collect</h2>
            <p>
              Your account email and the preferences you set inside MealMate (dietary, cuisines,
              servings, weekly budget). Your meal plan and grocery list are stored against your
              account so you can pick up where you left off.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900">What we don’t collect</h2>
            <p>
              No payment info today — there’s nothing to charge yet. No third-party trackers run
              until you accept analytics in the cookie banner.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900">Where it lives</h2>
            <p>
              Auth and profile data sit in our Supabase project (Postgres, encrypted at rest). Your
              meal plan and grocery list are cached locally in your browser to keep the app fast
              offline.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900">Your controls</h2>
            <p>
              From <strong>Settings → Data</strong> you can export everything we have on you, or
              delete your account permanently. We honor account deletion within 30 days across all
              backups.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900">Contact</h2>
            <p>
              Questions? Email <a className="text-emerald-600 hover:underline" href="mailto:hello@mealmate.app">hello@mealmate.app</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
