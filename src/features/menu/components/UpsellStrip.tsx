import React from 'react';
import { motion } from 'framer-motion';
import { LazyImage } from './LazyImage';

interface UpsellItem { id:number|string; name:string; price:number; image:string; }
interface Props { items: UpsellItem[]; title?: string; onAdd:(item:UpsellItem)=>void; }

export const UpsellStrip: React.FC<Props> = ({ items, title='Вместе вкуснее', onAdd }) => {
  if (!items.length) return null;
  return (
    <div className="space-y-3 mt-4">
      <h4 className="text-[15px] font-semibold tracking-tight text-[var(--color-text-primary)]">{title}</h4>
      <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar snap-x snap-mandatory">
        {items.map(it => (
          <motion.button
            key={it.id}
            whileTap={{ scale:.94 }}
            className="relative flex-shrink-0 w-40 snap-start elev-card px-3 pt-3 pb-4 text-left"
            onClick={() => onAdd(it)}
          >
            <LazyImage src={it.image} alt={it.name} className="w-32 h-32 mx-auto mb-2" />
            <div className="text-[13px] font-medium leading-tight line-clamp-2 min-h-[34px]">{it.name}</div>
            <div className="mt-1 text-[13px] font-bold text-[var(--color-brand-coffee)] dark:text-[var(--color-brand-amber)]">{it.price} ₸</div>
            <span className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[var(--color-brand-amber)] text-white flex items-center justify-center text-lg font-bold shadow-ambient">+</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};
