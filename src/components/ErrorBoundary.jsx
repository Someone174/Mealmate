import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('UI crashed:', error, info?.componentStack);
  }

  handleReset = () => {
    this.setState({ error: null });
    if (typeof window !== 'undefined') window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-emerald-50/30 to-white flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-8 text-white">
            <div className="text-3xl mb-1">🍽️</div>
            <h1 className="text-2xl font-bold">Something went wrong.</h1>
            <p className="text-emerald-50 mt-1">The app hit an unexpected error. We logged it.</p>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-gray-600 text-sm">
              You can usually recover by reloading the page. If it keeps happening, sign out and back in.
            </p>
            <button
              type="button"
              onClick={this.handleReset}
              className="w-full h-11 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors"
            >
              Reload
            </button>
            {import.meta.env.DEV && (
              <pre className="mt-3 text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg p-3 overflow-auto max-h-40">
                {String(this.state.error?.stack || this.state.error)}
              </pre>
            )}
          </div>
        </div>
      </div>
    );
  }
}
