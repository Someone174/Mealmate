import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, X } from 'lucide-react';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';

const ShortcutContext = createContext(null);

const SHORTCUTS = [
  { keys: ['?'], label: 'Show this shortcut help' },
  { keys: ['G', 'D'], label: 'Go to dashboard' },
  { keys: ['G', 'R'], label: 'Browse recipes' },
  { keys: ['G', 'S'], label: 'Open settings' },
  { keys: ['T'], label: 'Cycle theme (light → dark → system)' },
  { keys: ['N'], label: 'Generate new weekly plan' },
  { keys: ['L'], label: 'Toggle grocery list (mobile)' },
  { keys: ['/'], label: 'Focus search on Browse Recipes' },
  { keys: ['Esc'], label: 'Close any open modal' },
];

const Key = ({ children }) => (
  <kbd className="inline-flex items-center justify-center min-w-[1.75rem] h-7 px-1.5 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-[11px] font-mono font-semibold text-gray-700 dark:text-gray-200 shadow-[inset_0_-1px_0_0_rgba(0,0,0,0.05)]">
    {children}
  </kbd>
);

export function ShortcutHelpProvider({ children }) {
  const [open, setOpen] = useState(false);
  const show = useCallback(() => setOpen(true), []);
  const hide = useCallback(() => setOpen(false), []);

  useKeyboardShortcut('?', () => setOpen((v) => !v));
  useKeyboardShortcut('escape', () => setOpen(false), { allowInInputs: true, enabled: open });

  return (
    <ShortcutContext.Provider value={{ show, hide }}>
      {children}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Keyboard shortcuts"
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={hide} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 12 }}
              transition={{ type: 'spring', damping: 25 }}
              className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                    <Keyboard className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />
                  </div>
                  <h2 className="font-bold text-gray-900 dark:text-gray-50">Keyboard shortcuts</h2>
                </div>
                <button
                  type="button"
                  onClick={hide}
                  className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-label="Close shortcut help"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <ul className="p-5 space-y-3">
                {SHORTCUTS.map((s) => (
                  <li key={s.label} className="flex items-center justify-between gap-4">
                    <span className="text-sm text-gray-600 dark:text-gray-300">{s.label}</span>
                    <span className="flex items-center gap-1">
                      {s.keys.map((k, i) => (
                        <span key={i} className="flex items-center gap-1">
                          {i > 0 && <span className="text-xs text-gray-400">then</span>}
                          <Key>{k}</Key>
                        </span>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="px-5 pb-5 text-xs text-gray-400">
                Press <Key>?</Key> at any time to reopen this list.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ShortcutContext.Provider>
  );
}

export const useShortcutHelp = () => {
  const ctx = useContext(ShortcutContext);
  if (!ctx) throw new Error('useShortcutHelp must be used inside <ShortcutHelpProvider>');
  return ctx;
};
