/**
 * CommandExecutor — The "second chat" CLI window.
 * 
 * The AI agent includes special command blocks in its messages like:
 *   ```COMMAND
 *   /find recipe for Chicken Tikka Masala
 *   ```
 * 
 * This component detects those commands, executes them against TheMealDB
 * or the mock price scraper, and streams output back to the main chat.
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Loader2, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { TheMealDB, normalizeMealDBRecipe } from '@/lib/themealdb';

// ── Command Parsers ─────────────────────────────────────────────────────────

const STORES = ['Carrefour', 'LuLu', 'Mega Mart'];

const mockScrapeStore = async (store, ingredients, onLog) => {
  onLog(`  [${store}] Connecting...`);
  await delay(400 + Math.random() * 400);
  const results = {};
  for (const ing of ingredients.slice(0, 8)) {
    const base = 2 + Math.random() * 18;
    results[ing] = parseFloat(base.toFixed(2));
  }
  onLog(`  [${store}] ✓ ${Object.keys(results).length} prices fetched`);
  return results;
};

const delay = (ms) => new Promise(r => setTimeout(r, ms));

// Execute a single parsed command, streaming log lines via onLog
// Returns a result object the caller can use
export const executeCommand = async (command, onLog) => {
  const cmd = command.trim();

  // ── /find recipe for <name> ──────────────────────────────────────────────
  if (/^\/find recipe for (.+)/i.test(cmd)) {
    const name = cmd.match(/^\/find recipe for (.+)/i)[1].trim();
    onLog(`> /find recipe for "${name}"`);
    onLog(`  Querying TheMealDB...`);
    const meals = await TheMealDB.searchByName(name);
    if (!meals.length) {
      onLog(`  ✗ No results found for "${name}"`);
      return { type: 'recipe', success: false, query: name };
    }
    const full = await TheMealDB.getFullDetails(meals[0]);
    if (!full) {
      onLog(`  ✗ Could not fetch details`);
      return { type: 'recipe', success: false };
    }
    const normalized = normalizeMealDBRecipe(full);
    onLog(`  ✓ Found: ${full.strMeal} (${full.strArea || 'International'})`);
    onLog(`  ✓ ${normalized.ingredients.length} ingredients | YouTube: ${full.strYoutube ? 'yes' : 'no'}`);
    return { type: 'recipe', success: true, recipe: normalized, raw: full };
  }

  // ── /spawn scraper <ingredient1>, <ingredient2>, ... ──────────────────────
  if (/^\/spawn scraper (.+)/i.test(cmd)) {
    const ingredientsStr = cmd.match(/^\/spawn scraper (.+)/i)[1];
    const ingredients = ingredientsStr.split(',').map(s => s.trim()).filter(Boolean);
    onLog(`> /spawn scraper [${ingredients.slice(0, 3).join(', ')}${ingredients.length > 3 ? '...' : ''}]`);
    onLog(`  Spawning 3 store scrapers in parallel...`);

    const [c, l, m] = await Promise.all(
      STORES.map(store => mockScrapeStore(store, ingredients, onLog))
    );

    const priceMap = {};
    ingredients.forEach(ing => {
      priceMap[ing] = {
        Carrefour: c[ing] || null,
        LuLu: l[ing] || null,
        'Mega Mart': m[ing] || null,
      };
    });

    // Find cheapest store overall
    const totals = { Carrefour: 0, LuLu: 0, 'Mega Mart': 0 };
    Object.values(priceMap).forEach(prices => {
      STORES.forEach(s => { if (prices[s]) totals[s] += prices[s]; });
    });
    const cheapest = Object.entries(totals).sort((a, b) => a[1] - b[1])[0];
    onLog(`  ✓ Cheapest: ${cheapest[0]} @ ${cheapest[1].toFixed(2)} QAR`);

    return { type: 'prices', success: true, priceMap, totals };
  }

  // ── /random meal <mealType?> ─────────────────────────────────────────────
  if (/^\/random meal/i.test(cmd)) {
    const mealTypeMatch = cmd.match(/^\/random meal\s+(\w+)?/i);
    const mealType = mealTypeMatch?.[1] || 'dinner';
    onLog(`> /random meal ${mealType}`);
    onLog(`  Fetching random meal from TheMealDB...`);
    const raw = await TheMealDB.random();
    if (!raw) { onLog(`  ✗ Failed`); return { type: 'recipe', success: false }; }
    const recipe = normalizeMealDBRecipe(raw, mealType);
    onLog(`  ✓ Got: ${raw.strMeal}`);
    return { type: 'recipe', success: true, recipe, raw };
  }

  // ── /build pool ─────────────────────────────────────────────────────────
  if (/^\/build pool/i.test(cmd)) {
    onLog(`> /build pool`);
    onLog(`  Fetching 4-7 meals per type from TheMealDB...`);
    const pool = await TheMealDB.buildWeeklyPool();
    onLog(`  ✓ breakfast: ${pool.breakfast.length}, lunch: ${pool.lunch.length}, dinner: ${pool.dinner.length}`);
    return { type: 'pool', success: true, pool };
  }

  onLog(`  ✗ Unknown command: ${cmd}`);
  return { type: 'unknown', success: false };
};

// ── Parse command blocks from AI message content ─────────────────────────────
export const extractCommands = (content) => {
  if (!content) return [];
  const matches = [...content.matchAll(/```COMMAND\s*([\s\S]*?)```/g)];
  return matches.map(m => m[1].trim()).filter(Boolean);
};

export const stripCommandBlocks = (content) => {
  return content?.replace(/```COMMAND[\s\S]*?```/g, '').trim() || '';
};

// ── UI Component ──────────────────────────────────────────────────────────────

export default function CommandExecutor({ commands, onCommandResults }) {
  const [logs, setLogs] = useState([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const logsEndRef = useRef(null);

  const addLog = (line) => setLogs(prev => [...prev, line]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    if (commands?.length && !running && !done) {
      runAll();
    }
  }, [commands, running, done]); // eslint-disable-line react-hooks/exhaustive-deps

  const runAll = async () => {
    setRunning(true);
    setLogs([]);
    addLog(`$ Executing ${commands.length} command(s)...`);
    addLog('');

    const results = [];
    for (const cmd of commands) {
      const result = await executeCommand(cmd, addLog);
      results.push(result);
      addLog('');
    }

    addLog('$ Done.');
    setRunning(false);
    setDone(true);
    if (onCommandResults) onCommandResults(results);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden shadow-xl w-full max-w-sm text-xs font-mono"
    >
      {/* Title bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-gray-300 text-xs font-semibold">MealMate CLI</span>
          {running && <Loader2 className="w-3 h-3 text-emerald-400 animate-spin" />}
          {done && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
        </div>
        <button
          onClick={() => setCollapsed(c => !c)}
          className="text-gray-400 hover:text-gray-200 transition-colors"
        >
          {collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Log output */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 py-2 max-h-44 overflow-y-auto space-y-0.5 bg-gray-900">
              {logs.map((line, i) => (
                <div
                  key={i}
                  className={`leading-relaxed ${
                    line.startsWith('$') ? 'text-emerald-400' :
                    line.startsWith('>') ? 'text-cyan-400' :
                    line.includes('✓') ? 'text-green-400' :
                    line.includes('✗') ? 'text-red-400' :
                    'text-gray-400'
                  }`}
                >
                  {line || '\u00A0'}
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}