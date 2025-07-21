import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SwipeHintProps {
  show?: boolean;
  direction?: 'horizontal' | 'vertical';
  text?: string;
}

export const SwipeHint: React.FC<SwipeHintProps> = ({ 
  show = true, 
  direction = 'horizontal',
  text 
}) => {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => setIsVisible(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [show]);

  const hintText = text || (direction === 'horizontal' ? 'Свайпните для переключения' : 'Свайпните вверх или вниз');

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25
          }}
          className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-black/90 text-white px-6 py-3 rounded-2xl text-sm backdrop-blur-xl flex items-center gap-3 shadow-2xl border border-white/10">
            {direction === 'horizontal' ? (
              <>
                <span className="text-lg">👈</span>
                <span className="font-medium">{hintText}</span>
                <span className="text-lg">👉</span>
              </>
            ) : (
              <>
                <span className="text-lg">👆</span>
                <span className="font-medium">{hintText}</span>
                <span className="text-lg">👇</span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
