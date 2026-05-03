import React, { useState, useEffect } from 'react';
import { X, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DemoTooltip() {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    const dismissed = sessionStorage.getItem('mealmate_tooltip_dismissed');
    if (!dismissed) {
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);
  
  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem('mealmate_tooltip_dismissed', 'true');
  };
  
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-[90%]"
        >
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl shadow-2xl shadow-emerald-500/20 p-4 pr-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            
            <button
              onClick={dismiss}
              className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-start gap-3 relative">
              <div className="p-2 bg-white/20 rounded-xl">
                <Info className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">Demo Mode Active</h4>
                <p className="text-white/90 text-sm leading-relaxed">
                  No real email required! All data is saved locally in your browser. 
                  Perfect for testing and investor demos.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}