import React from 'react';
import { DrinkCategoryTab } from './types';
import { motion } from 'framer-motion';

interface Props {
  tabs: DrinkCategoryTab[];
  active: string;
  onChange: (key:string)=>void;
}

export const CategoryTabs: React.FC<Props> = ({ tabs, active, onChange }) => {
  return (
    <nav
      aria-label="Категории"
      className="
        flex gap-6 px-5 pt-4 overflow-x-auto no-scrollbar select-none
        bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70
        [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]
      "
    >
      {tabs.map(t => {
        const isActive = t.key === active;
        return (
          <button
            key={t.key}
            type="button"
            onClick={()=>onChange(t.key)}
            role="tab"
            aria-selected={isActive}
            className={`
              relative pb-3 text-[13px] tracking-tight transition-colors
              focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/20 rounded-md
              ${isActive ? 'text-neutral-900 font-semibold' : 'text-neutral-400 hover:text-neutral-700'}
            `}
          >
            <span className="px-1 py-1.5">{t.label}</span>
            {isActive && (
              <motion.span
                layoutId="tab-underline"
                transition={{ type:'spring', stiffness:520, damping:32 }}
                className="absolute left-0 right-0 -bottom-[1px] h-[2px] rounded-full bg-neutral-900"
              />
            )}
          </button>
        );
      })}
    </nav>
  );
};
