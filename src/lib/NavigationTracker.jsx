import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Lightweight navigation hook. Fires on every route change.
// Extend here when adding analytics (e.g. Google Analytics gtag, Plausible, etc.).
export default function NavigationTracker() {
  const location = useLocation();

  useEffect(() => {
    // Page-view tracking placeholder.
    // Example for Google Analytics:
    //   gtag('event', 'page_view', { page_path: location.pathname });
  }, [location.pathname]);

  return null;
}
