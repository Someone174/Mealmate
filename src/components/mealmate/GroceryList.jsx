import { useEffect, useMemo, useState } from 'react';
import {
  Printer, ShoppingCart, ChevronDown, ChevronUp,
  Sparkles, TrendingDown, RefreshCw, Plus, Trash2,
  Eye, EyeOff, Download, Copy, Mail, ListOrdered, Check,
  ArrowUpDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import PriceComparison from './PriceComparison';

const aisleIcons = {
  Produce: '🥬', Proteins: '🥩', Seafood: '🐟', Dairy: '🧀',
  Bakery: '🥖', Pantry: '🫙', Frozen: '❄️', Deli: '🥓', Other: '🛒',
};

const aisleColors = {
  Produce: 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300',
  Proteins: 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300',
  Seafood: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300',
  Dairy: 'bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300',
  Bakery: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300',
  Pantry: 'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-300',
  Frozen: 'bg-cyan-50 border-cyan-200 text-cyan-700 dark:bg-cyan-900/20 dark:border-cyan-800 dark:text-cyan-300',
  Deli: 'bg-pink-50 border-pink-200 text-pink-700 dark:bg-pink-900/20 dark:border-pink-800 dark:text-pink-300',
  Other: 'bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-900/40 dark:border-gray-700 dark:text-gray-300',
};

const AISLES = ['Produce', 'Proteins', 'Seafood', 'Dairy', 'Bakery', 'Pantry', 'Frozen', 'Deli', 'Other'];

const SORT_LABELS = {
  aisle: 'Aisle order',
  alpha: 'Alphabetical',
  unchecked: 'Unchecked first',
};

const buildExportText = (groceryList, customItems) => {
  const lines = ['MealMate grocery list', `Generated: ${new Date().toLocaleString()}`, ''];
  Object.keys(groceryList).forEach((aisle) => {
    if (!groceryList[aisle].length) return;
    lines.push(`— ${aisle.toUpperCase()} —`);
    groceryList[aisle].forEach((it) => {
      const mark = it.checked ? '[x]' : '[ ]';
      const qty = it.count > 1 ? ` (×${it.count})` : '';
      lines.push(`  ${mark} ${it.item} — ${it.amount}${qty}`);
    });
    lines.push('');
  });
  if (customItems?.length) {
    lines.push('— EXTRAS —');
    customItems.forEach((it) => {
      lines.push(`  ${it.checked ? '[x]' : '[ ]'} ${it.item} — ${it.amount}`);
    });
  }
  return lines.join('\n');
};

export default function GroceryList({
  groceryList,
  onToggleItem,
  pricedList,
  onRefreshPrices,
  loadingPrices,
  storeTotals,
  cheapestStore,
  customItems = [],
  onAddCustomItem,
  onUpdateCustomItem,
  onRemoveCustomItem,
}) {
  const [expandedAisles, setExpandedAisles] = useState({});
  const [hideChecked, setHideChecked] = useState(false);
  const [sortMode, setSortMode] = useState('aisle');
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ item: '', amount: '', aisle: 'Pantry' });

  useEffect(() => {
    setExpandedAisles((prev) => {
      const next = { ...prev };
      Object.keys(groceryList || {}).forEach((key) => {
        if (!(key in next)) next[key] = true;
      });
      if (customItems.length && !('Extras' in next)) next.Extras = true;
      return next;
    });
  }, [groceryList, customItems.length]);

  // Merge custom items into a virtual "Extras" aisle for unified rendering.
  const mergedList = useMemo(() => {
    const base = { ...(groceryList || {}) };
    if (customItems.length) base.Extras = customItems;
    return base;
  }, [groceryList, customItems]);

  const flat = useMemo(
    () => Object.values(mergedList).flat(),
    [mergedList],
  );
  const totalItems = flat.length;
  const checkedItems = flat.filter((i) => i.checked).length;
  const progress = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0;

  const toggleAisle = (aisle) =>
    setExpandedAisles((prev) => ({ ...prev, [aisle]: !prev[aisle] }));

  const sortedAisles = useMemo(() => {
    const keys = Object.keys(mergedList);
    return keys.sort((a, b) => {
      if (a === 'Extras') return 1;
      if (b === 'Extras') return -1;
      return AISLES.indexOf(a) - AISLES.indexOf(b);
    });
  }, [mergedList]);

  if (!groceryList || Object.keys(groceryList).length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingCart className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
        <p className="text-muted">Generate a meal plan to see your grocery list.</p>
      </div>
    );
  }

  const sortItems = (items) => {
    if (sortMode === 'alpha') {
      return [...items].sort((a, b) => (a.item || '').localeCompare(b.item || ''));
    }
    if (sortMode === 'unchecked') {
      return [...items].sort((a, b) => Number(a.checked) - Number(b.checked));
    }
    return items;
  };

  const handlePrint = () => window.print();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildExportText(groceryList, customItems));
      toast.success('Copied to clipboard.');
    } catch {
      toast.error('Could not copy.');
    }
  };

  const handleEmail = () => {
    const body = encodeURIComponent(buildExportText(groceryList, customItems));
    const subject = encodeURIComponent('MealMate grocery list');
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([buildExportText(groceryList, customItems)], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mealmate-grocery-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Download started.');
  };

  const submitCustom = (e) => {
    e?.preventDefault();
    if (!draft.item.trim()) return;
    onAddCustomItem?.({
      item: draft.item.trim(),
      amount: draft.amount.trim() || '1',
      aisle: draft.aisle,
    });
    setDraft({ item: '', amount: '', aisle: draft.aisle });
    setAdding(false);
    toast.success('Added to extras.');
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-4 text-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            <h3 className="font-semibold">Grocery List</h3>
          </div>
          <div className="flex gap-1.5">
            {onRefreshPrices && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefreshPrices}
                disabled={loadingPrices}
                className="text-white hover:bg-white/20 print:hidden"
                title="Refresh prices"
              >
                <RefreshCw className={`w-4 h-4 ${loadingPrices ? 'animate-spin' : ''}`} />
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 print:hidden"
                  title="Export"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleCopy}>
                  <Copy className="w-4 h-4 mr-2" /> Copy as text
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleEmail}>
                  <Mail className="w-4 h-4 mr-2" /> Email list
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadTxt}>
                  <Download className="w-4 h-4 mr-2" /> Download .txt
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handlePrint}>
                  <Printer className="w-4 h-4 mr-2" /> Print
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setHideChecked((v) => !v)}
              className="text-white hover:bg-white/20 print:hidden"
              title={hideChecked ? 'Show checked items' : 'Hide checked items'}
            >
              {hideChecked ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 print:hidden"
                  title="Sort"
                >
                  <ArrowUpDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                {Object.entries(SORT_LABELS).map(([k, label]) => (
                  <DropdownMenuItem key={k} onClick={() => setSortMode(k)}>
                    {sortMode === k ? <Check className="w-4 h-4 mr-2 text-emerald-500" /> : <ListOrdered className="w-4 h-4 mr-2 opacity-50" />}
                    {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{checkedItems} of {totalItems} items</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-white/30" />
        </div>

        {progress === 100 && totalItems > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-3 flex items-center gap-2 text-sm bg-white/20 rounded-lg px-3 py-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>All done. You're ready to cook.</span>
          </motion.div>
        )}
      </div>

      {cheapestStore && storeTotals && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-4 border-2 ${cheapestStore.color}`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5" />
              <span className="font-semibold">Best deal</span>
            </div>
            <span className="text-xs opacity-75">Qatar prices</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{cheapestStore.total.toFixed(2)} QAR</p>
              <p className="text-sm opacity-80">{cheapestStore.storeName}</p>
            </div>
            {cheapestStore.savings > 1 && (
              <div className="text-right">
                <p className="text-lg font-semibold">Save {cheapestStore.savings.toFixed(2)} QAR</p>
                <p className="text-xs opacity-80">vs. most expensive</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {loadingPrices && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-4"
        >
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-500 mx-auto mb-2" />
          <p className="text-sm text-muted">Comparing prices at Lulu, Carrefour & Megamart…</p>
        </motion.div>
      )}

      {/* Add custom item */}
      <div className="rounded-2xl border border-dashed border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-900/10 p-3 print:hidden">
        {!adding ? (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="w-full flex items-center justify-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-300 py-1.5 hover:bg-emerald-100/40 dark:hover:bg-emerald-900/20 rounded-lg"
          >
            <Plus className="w-4 h-4" />
            Add an item
          </button>
        ) : (
          <form onSubmit={submitCustom} className="space-y-2">
            <div className="flex gap-2">
              <Input
                autoFocus
                placeholder="Eggs"
                value={draft.item}
                onChange={(e) => setDraft({ ...draft, item: e.target.value })}
                className="h-9 rounded-lg flex-1"
              />
              <Input
                placeholder="1 dozen"
                value={draft.amount}
                onChange={(e) => setDraft({ ...draft, amount: e.target.value })}
                className="h-9 rounded-lg w-28"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {AISLES.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setDraft({ ...draft, aisle: a })}
                  className={`text-[11px] px-2 py-1 rounded-full border transition-all ${
                    draft.aisle === a
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {aisleIcons[a]} {a}
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setAdding(false);
                  setDraft({ item: '', amount: '', aisle: draft.aisle });
                }}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white">
                Add
              </Button>
            </div>
          </form>
        )}
      </div>

      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
        {sortedAisles.map((aisle) => {
          const items = sortItems(mergedList[aisle] || []);
          const visibleItems = hideChecked ? items.filter((it) => !it.checked) : items;
          if (!items.length) return null;
          const isExtras = aisle === 'Extras';

          return (
            <div
              key={aisle}
              className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900"
            >
              <button
                type="button"
                onClick={() => toggleAisle(aisle)}
                className={`w-full flex items-center justify-between p-3 ${aisleColors[aisle] || aisleColors.Other} border-b transition-colors`}
                aria-expanded={expandedAisles[aisle] !== false}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{aisleIcons[aisle] || '🛒'}</span>
                  <span className="font-medium">{aisle}</span>
                  <span className="text-xs opacity-70">
                    ({items.filter((i) => i.checked).length}/{items.length})
                  </span>
                </div>
                {expandedAisles[aisle] !== false ? (
                  <ChevronUp className="w-4 h-4 opacity-50" />
                ) : (
                  <ChevronDown className="w-4 h-4 opacity-50" />
                )}
              </button>

              <AnimatePresence initial={false}>
                {expandedAisles[aisle] !== false && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-2 space-y-2">
                      {visibleItems.length === 0 && (
                        <p className="text-xs text-gray-400 text-center py-2">
                          {hideChecked ? 'All checked off here.' : 'Empty.'}
                        </p>
                      )}
                      {visibleItems.map((item, idx) => {
                        const realIdx = items.indexOf(item);
                        const pricedItem = !isExtras ? pricedList?.[aisle]?.[realIdx] : null;
                        return (
                          <motion.div
                            key={item.id || `${aisle}-${realIdx}-${item.item}`}
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: Math.min(idx, 6) * 0.02 }}
                            className={`rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors ${
                              item.checked ? 'opacity-50' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3 p-2">
                              <Checkbox
                                checked={item.checked}
                                onCheckedChange={() =>
                                  isExtras
                                    ? onUpdateCustomItem?.(item.id, { checked: !item.checked })
                                    : onToggleItem(aisle, realIdx)
                                }
                                className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 mt-1"
                                aria-label={`Mark ${item.item} as ${item.checked ? 'unchecked' : 'checked'}`}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <p
                                      className={`text-sm font-medium ${
                                        item.checked
                                          ? 'line-through text-gray-400 dark:text-gray-500'
                                          : 'text-gray-700 dark:text-gray-200'
                                      }`}
                                    >
                                      {item.item}
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500">
                                      {item.amount}
                                      {item.count > 1 && ` (×${item.count})`}
                                    </p>
                                  </div>
                                  {pricedItem?.priceData && (
                                    <div className="text-right flex-shrink-0">
                                      <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                        {pricedItem.priceData.cheapestPrice.toFixed(2)} QAR
                                      </p>
                                    </div>
                                  )}
                                  {isExtras && (
                                    <button
                                      type="button"
                                      onClick={() => onRemoveCustomItem?.(item.id)}
                                      className="p-1 text-gray-300 hover:text-red-500 print:hidden"
                                      aria-label={`Remove ${item.item}`}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>

                                {pricedItem?.priceData && !item.checked && (
                                  <div className="mt-2">
                                    <PriceComparison priceData={pricedItem.priceData} />
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 3px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #374151;
        }
      `}</style>
    </div>
  );
}
