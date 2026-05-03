import React, { useState, useEffect } from 'react';
import { Check, Printer, ShoppingCart, ChevronDown, ChevronUp, Sparkles, TrendingDown, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import PriceComparison from './PriceComparison';

const aisleIcons = {
  'Produce': '🥬',
  'Proteins': '🥩',
  'Seafood': '🐟',
  'Dairy': '🧀',
  'Bakery': '🥖',
  'Pantry': '🫙',
  'Frozen': '❄️',
  'Deli': '🥓'
};

const aisleColors = {
  'Produce': 'bg-green-50 border-green-200 text-green-700',
  'Proteins': 'bg-red-50 border-red-200 text-red-700',
  'Seafood': 'bg-blue-50 border-blue-200 text-blue-700',
  'Dairy': 'bg-yellow-50 border-yellow-200 text-yellow-700',
  'Bakery': 'bg-amber-50 border-amber-200 text-amber-700',
  'Pantry': 'bg-orange-50 border-orange-200 text-orange-700',
  'Frozen': 'bg-cyan-50 border-cyan-200 text-cyan-700',
  'Deli': 'bg-pink-50 border-pink-200 text-pink-700'
};

export default function GroceryList({ groceryList, onToggleItem, pricedList, onRefreshPrices, loadingPrices, storeTotals, cheapestStore }) {
  const [expandedAisles, setExpandedAisles] = useState(
    Object.keys(groceryList || {}).reduce((acc, key) => ({ ...acc, [key]: true }), {})
  );

  // Expand any new aisles when groceryList changes (e.g. after regenerating plan)
  useEffect(() => {
    setExpandedAisles(prev => {
      const next = { ...prev };
      Object.keys(groceryList || {}).forEach(key => {
        if (!(key in next)) next[key] = true;
      });
      return next;
    });
  }, [groceryList]);
  
  if (!groceryList || Object.keys(groceryList).length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Generate a meal plan to see your grocery list!</p>
      </div>
    );
  }
  
  const toggleAisle = (aisle) => {
    setExpandedAisles(prev => ({ ...prev, [aisle]: !prev[aisle] }));
  };
  
  const totalItems = Object.values(groceryList).flat().length;
  const checkedItems = Object.values(groceryList).flat().filter(item => item.checked).length;
  const progress = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0;
  
  const handlePrint = () => {
    window.print();
  };
  
  const sortedAisles = Object.keys(groceryList).sort((a, b) => {
    const order = ['Produce', 'Proteins', 'Seafood', 'Dairy', 'Bakery', 'Pantry', 'Frozen', 'Deli'];
    return order.indexOf(a) - order.indexOf(b);
  });
  
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-4 text-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            <h3 className="font-semibold">Grocery List</h3>
          </div>
          <div className="flex gap-2">
            {onRefreshPrices && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefreshPrices}
                disabled={loadingPrices}
                className="text-white hover:bg-white/20 print:hidden"
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${loadingPrices ? 'animate-spin' : ''}`} />
                Prices
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrint}
              className="text-white hover:bg-white/20 print:hidden"
            >
              <Printer className="w-4 h-4 mr-1" />
              Print
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{checkedItems} of {totalItems} items</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-white/30" />
        </div>
        
        {progress === 100 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-3 flex items-center gap-2 text-sm bg-white/20 rounded-lg px-3 py-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>All done! You're ready to cook! 🎉</span>
          </motion.div>
        )}
      </div>
      
      {/* Store Comparison Summary */}
      {cheapestStore && storeTotals && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-4 border-2 ${cheapestStore.color}`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5" />
              <span className="font-semibold">Best Deal</span>
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
          <p className="text-sm text-gray-500">Comparing prices at Lulu, Carrefour & Megamart...</p>
        </motion.div>
      )}
      
      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
        {sortedAisles.map((aisle) => (
          <div key={aisle} className="rounded-xl border border-gray-100 overflow-hidden bg-white">
            <button
              onClick={() => toggleAisle(aisle)}
              className={`w-full flex items-center justify-between p-3 ${aisleColors[aisle]} border-b transition-colors`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{aisleIcons[aisle] || '🛒'}</span>
                <span className="font-medium">{aisle}</span>
                <span className="text-xs opacity-70">
                  ({groceryList[aisle].filter(i => i.checked).length}/{groceryList[aisle].length})
                </span>
              </div>
              {expandedAisles[aisle] ? (
                <ChevronUp className="w-4 h-4 opacity-50" />
              ) : (
                <ChevronDown className="w-4 h-4 opacity-50" />
              )}
            </button>
            
            <AnimatePresence>
              {expandedAisles[aisle] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="p-2 space-y-2">
                    {groceryList[aisle].map((item, idx) => {
                      const pricedItem = pricedList?.[aisle]?.[idx];
                      return (
                        <motion.div
                          key={`${aisle}-${idx}`}
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: idx * 0.03 }}
                          className={`rounded-lg hover:bg-gray-50 transition-colors ${
                            item.checked ? 'opacity-50' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3 p-2">
                            <Checkbox
                              checked={item.checked}
                              onCheckedChange={() => onToggleItem(aisle, idx)}
                              className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-medium ${item.checked ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                    {item.item}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {item.amount} {item.count > 1 && `(×${item.count})`}
                                  </p>
                                </div>
                                {pricedItem?.priceData && (
                                  <div className="text-right flex-shrink-0">
                                    <p className="text-sm font-semibold text-emerald-600">
                                      {pricedItem.priceData.cheapestPrice.toFixed(2)} QAR
                                    </p>
                                  </div>
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
        ))}
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
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
        @media print {
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}