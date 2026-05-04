import { AlertCircle } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';

// Shows a non-blocking banner at the top of the app when the backend
// isn't configured yet. Hidden once VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
// are set in .env.local (or Vercel env).
export default function ConfigBanner() {
  if (isSupabaseConfigured) return null;

  return (
    <div
      role="status"
      className="bg-amber-50 border-b border-amber-200 text-amber-900 text-sm"
    >
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <p>
          <span className="font-medium">Local mode.</span>{' '}
          Set <code className="px-1 py-0.5 bg-amber-100 rounded">VITE_SUPABASE_URL</code> and{' '}
          <code className="px-1 py-0.5 bg-amber-100 rounded">VITE_SUPABASE_ANON_KEY</code>{' '}
          in <code className="px-1 py-0.5 bg-amber-100 rounded">.env.local</code> to enable real accounts.
        </p>
      </div>
    </div>
  );
}
