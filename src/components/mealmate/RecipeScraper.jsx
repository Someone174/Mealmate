import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Database, Check, RefreshCw } from 'lucide-react';
import { runInitialLoad, runPeriodicScrape, getDBRecipeCount } from './RecipeScraperServices';

const SCRAPE_INTERVAL_MS = 4 * 60 * 1000; // 4 minutes

function RecipeScraper({ onUpdate }) {
  const [phase, setPhase] = useState('idle'); // idle | checking | initial | periodic | done
  const [progress, setProgress] = useState({ saved: 0, total: 2000 });
  const [lastRun, setLastRun] = useState(null);
  const [periodicCount, setPeriodicCount] = useState(0);
  const mountedRef = useRef(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    mountedRef.current = true;
    init();

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const init = async () => {
    if (!mountedRef.current) return;
    setPhase('checking');

    const count = await getDBRecipeCount().catch(() => 0);

    if (!mountedRef.current) return;

    if (count < 100) {
      setPhase('initial');
      await runInitialLoad((saved, total) => {
        if (mountedRef.current) setProgress({ saved, total });
      });
      if (!mountedRef.current) return;
      setLastRun(new Date());
      setPhase('done');
      if (onUpdate) onUpdate();
    } else {
      setPhase('done');
      if (onUpdate) onUpdate();
    }

    // Start 4-minute periodic scraping
    intervalRef.current = setInterval(async () => {
      if (!mountedRef.current) return;
      setPhase('periodic');
      const added = await runPeriodicScrape().catch(() => 0);
      if (!mountedRef.current) return;
      setPeriodicCount(c => c + added);
      setLastRun(new Date());
      setPhase('done');
      if (onUpdate) onUpdate();
    }, SCRAPE_INTERVAL_MS);
  };

  const percent = Math.round((progress.saved / progress.total) * 100);

  return (
    <>
      {/* Initial Load Overlay */}
      <AnimatePresence>
        {phase === 'initial' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gray-950 border border-white/10 rounded-3xl p-12 max-w-md w-full mx-4 text-center"
            >
              <div className="w-16 h-16 mx-auto mb-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center">
                <Database className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-light text-white mb-2">Loading Recipe Database</h2>
              <p className="text-white/40 text-sm mb-8">
                Scraping 2,000 real recipes from the web.<br />This happens once on first launch.
              </p>

              {/* Progress bar */}
              <div className="bg-white/10 rounded-full h-2 mb-4 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-white/40">{progress.saved.toLocaleString()} recipes</span>
                <span className="text-white/70 font-light">{percent}%</span>
                <span className="text-white/40">of {progress.total.toLocaleString()}</span>
              </div>

              <p className="text-white/30 text-xs mt-6 flex items-center justify-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                Fetching from AllRecipes, Food Network, BBC Good Food…
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle status bar (bottom right) */}
      <AnimatePresence>
        {(phase === 'checking' || phase === 'periodic') && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gray-900/90 border border-white/10 rounded-full px-4 py-2 text-xs text-white/60 backdrop-blur-sm"
          >
            <RefreshCw className="w-3 h-3 animate-spin text-emerald-400" />
            {phase === 'checking' ? 'Checking recipe database…' : 'Fetching new recipes…'}
          </motion.div>
        )}
        {phase === 'done' && lastRun && periodicCount > 0 && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gray-900/90 border border-emerald-500/20 rounded-full px-4 py-2 text-xs text-emerald-400 backdrop-blur-sm"
            onAnimationComplete={() => {
              setTimeout(() => {
                if (mountedRef.current) setLastRun(null);
              }, 3000);
            }}
          >
            <Check className="w-3 h-3" />
            +{periodicCount} new recipes added
          </motion.div>
        )}
      </AnimatePresence>
 
    </>
  );
}

export default function useRecipeScraper({ onStatusUpdate } = {}) {
  useEffect(() => {
    let cancelled = false;
    let interval = null;

    const status = (msg) => { if (!cancelled && onStatusUpdate) onStatusUpdate(msg); };

    const start = async () => {
      try {
        const count = await getDBRecipeCount().catch(() => 0);
        if (count < 100) {
          status('Loading recipes...');
          await runInitialLoad(
            (p) => status(`Loading recipes (${p.saved}/${p.total})...`),
            () => {}
          );
          status('');
          if (onStatusUpdate) onStatusUpdate('');
        }
        interval = setInterval(async () => {
          if (cancelled) return;
          status('Refreshing recipes...');
          await runPeriodicScrape(() => {}).catch(() => {});
          status('');
        }, 4 * 60 * 1000);
      } catch (e) {
        status('');
      }
    };

    start();
    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
    };
  }, []);
}
