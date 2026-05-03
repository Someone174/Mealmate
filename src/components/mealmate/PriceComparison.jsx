import React, { useState } from 'react';
import { ChevronDown, ChevronUp, TrendingDown, MapPin, Truck, XCircle, Sparkles, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

export default function PriceComparison({ priceData, compact = false }) {
  const [expanded, setExpanded] = useState(false);
  
  if (!priceData) {
    return (
      <span className="text-xs text-gray-400">Price unavailable</span>
    );
  }
  
  const { stores, cheapestStore, cheapestPrice, savings, currency } = priceData;
  const cheapestStoreData = stores[cheapestStore];
  
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="font-semibold text-emerald-600 text-sm">
          {cheapestPrice.toFixed(2)} {currency}
        </span>
        {savings > 0.5 && (
          <Badge className="bg-green-100 text-green-700 border-green-200 text-xs px-1.5 py-0">
            Save {savings.toFixed(2)}
          </Badge>
        )}
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 hover:shadow-md transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-800">
              {cheapestPrice.toFixed(2)} {currency}
            </p>
            <p className="text-xs text-gray-500">
              Cheapest at {cheapestStoreData.name}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {savings > 0.5 && (
            <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
              <TrendingDown className="w-3 h-3" />
              Save {savings.toFixed(2)}
            </div>
          )}
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
          )}
        </div>
      </button>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-2 pl-2">
              {Object.entries(stores).map(([storeKey, storeData]) => (
                <motion.div
                  key={storeKey}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className={`p-3 rounded-xl border-2 ${
                    storeKey === cheapestStore 
                      ? 'border-emerald-500 bg-emerald-50' 
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800">{storeData.name}</span>
                      {storeKey === cheapestStore && (
                        <Badge className="bg-emerald-500 text-white text-xs px-2 py-0.5">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Best
                        </Badge>
                      )}
                    </div>
                    <span className={`font-bold text-lg ${
                      storeKey === cheapestStore ? 'text-emerald-600' : 'text-gray-700'
                    }`}>
                      {storeData.price.toFixed(2)} {currency}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs">
                    <div className={`flex items-center gap-1 ${
                      storeData.inStock ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {storeData.inStock ? (
                        <>
                          <MapPin className="w-3 h-3" />
                          In Stock
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" />
                          Out of Stock
                        </>
                      )}
                    </div>
                    
                    <div className={`flex items-center gap-1 ${
                      storeData.delivery ? 'text-blue-600' : 'text-gray-400'
                    }`}>
                      <Truck className="w-3 h-3" />
                      {storeData.delivery ? 'Delivery Available' : 'Pickup Only'}
                    </div>
                  </div>
                  
                  {storeKey !== cheapestStore && storeData.inStock && cheapestStoreData.inStock && (
                    <p className="text-xs text-gray-500 mt-2">
                      +{(storeData.price - cheapestPrice).toFixed(2)} {currency} more than {cheapestStoreData.name}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}