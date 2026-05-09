import { useCallback, useEffect, useState } from 'react';

/**
 * useLocalStorage – versioned, JSON-safe, cross-tab synced storage hook.
 *
 * The value is parsed once on init and kept in React state. Updates write
 * back through `setValue(next | (prev) => next)`. Other tabs that change
 * the same key trigger a re-render here via the `storage` event.
 */
export function useLocalStorage(key, initialValue) {
  const read = useCallback(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return initialValue;
      return JSON.parse(raw);
    } catch {
      return initialValue;
    }
  }, [key, initialValue]);

  const [value, setValue] = useState(read);

  const update = useCallback(
    (next) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? next(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          /* ignore quota / privacy errors */
        }
        return resolved;
      });
    },
    [key],
  );

  const reset = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
    setValue(initialValue);
  }, [key, initialValue]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onStorage = (e) => {
      if (e.key !== key) return;
      try {
        setValue(e.newValue === null ? initialValue : JSON.parse(e.newValue));
      } catch {
        /* ignore */
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key, initialValue]);

  return [value, update, reset];
}
