import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-emerald-50/30 to-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to MealMate
        </Link>

        <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Terms of use</h1>
        <p className="text-gray-500 mb-10">Last updated: today.</p>

        <div className="prose prose-slate max-w-none space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-bold text-gray-900">The deal</h2>
            <p>
              MealMate suggests meal plans and grocery lists. Recipes, prices, and nutrition are
              best-effort. Always sanity-check ingredients for allergies and confirm prices in
              store.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900">Your account</h2>
            <p>
              You’re responsible for keeping your password safe. Don’t share it. If something
              looks off with your account, sign out everywhere and reset.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900">Acceptable use</h2>
            <p>
              Don’t use MealMate to scrape data, abuse the AI Planner with automated traffic, or
              harass others. We may rate-limit or suspend accounts that do.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900">Pricing &amp; refunds</h2>
            <p>
              Subscriptions aren’t live yet — the Pricing page collects waitlist intent only.
              Once subscriptions launch, you’ll get a clear cancellation flow and a 14-day
              money-back guarantee on first purchase.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900">Liability</h2>
            <p>
              MealMate is provided “as is.” We’re not liable for kitchen mishaps, missed
              ingredients, or that one time the price was wrong at the till.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
