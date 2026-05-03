import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function UserNotRegisteredError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Account not found</h2>
        <p className="text-gray-500 mb-6">This account isn't registered. Please sign in or create a new account.</p>
        <div className="flex gap-3 justify-center">
          <Link to={createPageUrl('SignIn')} className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600">
            Sign In
          </Link>
          <Link to={createPageUrl('CreateAccount')} className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
