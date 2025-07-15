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
      const timer = setTimeout(() => setIsVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  const hintText = text || (direction === 'horizontal' ? 'Свайпните влево или вправо' : 'Свайпните вверх или вниз');

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-black/80 text-white px-4 py-2 rounded-full text-sm backdrop-blur-md flex items-center gap-2">
            {direction === 'horizontal' ? (
              <>
                <span>👈</span>
                <span>{hintText}</span>
                <span>👉</span>
              </>
            ) : (
              <>
                <span>👆</span>
                <span>{hintText}</span>
                <span>👇</span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
