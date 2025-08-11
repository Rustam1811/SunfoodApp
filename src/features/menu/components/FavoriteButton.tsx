import React, { useState } from 'react';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as SolidHeartIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';

interface Props { active: boolean; onToggle: ()=>void; }
export const FavoriteButton: React.FC<Props> = ({ active, onToggle }) => {
  const [burst, setBurst] = useState(false);
  return (
    <button
      aria-label="favorite"
      onClick={(e) => { e.stopPropagation(); setBurst(true); onToggle(); setTimeout(()=>setBurst(false), 400); }}
      className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full flex items-center justify-center bg-[var(--color-bg-glass)] backdrop-blur-md shadow-ambient hover:shadow-float transition overflow-visible"
    >
      {active ? <SolidHeartIcon className="w-5 h-5 text-red-500" /> : <HeartIcon className="w-5 h-5 text-[var(--color-text-secondary)]" />}
      <AnimatePresence>
        {burst && (
          <motion.span
            initial={{ scale:.4, opacity:.8 }}
            animate={{ scale:1.4, opacity:0 }}
            exit={{ opacity:0 }}
            transition={{ duration:.45, ease:'easeOut' }}
            className="absolute inset-0 rounded-full bg-pink-400/40" />
        )}
      </AnimatePresence>
    </button>
  );
};
