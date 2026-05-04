import { useEffect, useState } from 'react';
import { Cookie, X } from 'lucide-react';

const KEY = 'mealmate_cookie_consent';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(KEY)) {
      const t = setTimeout(() => setVisible(true), 700);
      return () => clearTimeout(t);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(KEY, JSON.stringify({ accepted: true, at: new Date().toISOString() }));
    setVisible(false);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('mealmate:consent', { detail: { accepted: true } }));
    }
  };

  const dismiss = () => {
    localStorage.setItem(KEY, JSON.stringify({ accepted: false, at: new Date().toISOString() }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-4 sm:w-[28rem] z-50"
    >
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0">
          <Cookie className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 text-sm text-gray-700">
          <p className="font-semibold text-gray-900 mb-1">A quick note on cookies</p>
          <p className="text-gray-500 leading-relaxed">
            We use only the cookies needed for sign-in. Optional analytics stay off until you tap accept.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={accept}
              className="px-4 py-1.5 rounded-lg bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600"
            >
              Accept
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="px-4 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50"
            >
              Essential only
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss cookie banner"
          className="text-gray-300 hover:text-gray-500"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
