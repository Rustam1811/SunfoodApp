import React from 'react';
import { motion } from 'framer-motion';

interface CategoryStripProps {
  categories: { id: string | number; title: string }[];
  activeIndex: number;
  onSelect: (idx: number) => void;
  t: (k: string) => string;
}
export const CategoryStrip: React.FC<CategoryStripProps> = ({ categories, activeIndex, onSelect, t }) => {
  return (
    <div className="relative w-full">
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 px-1">
        {categories.map((cat, idx) => {
          const active = idx === activeIndex;
          return (
            <button
              key={cat.id}
              onClick={() => onSelect(idx)}
              className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-all flex-shrink-0 \n                ${active ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'} `}
            >
              <span className="relative z-10">{t(cat.title)}</span>
              {active && (
                <motion.span
                  layoutId="cat-pill"
                  className="absolute inset-0 rounded-xl bg-[var(--color-bg-elev-1)] shadow-ambient border border-[var(--color-border)]"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
