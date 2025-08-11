import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LazyImage } from './LazyImage';
import { FavoriteButton } from './FavoriteButton';

export interface ProductCardItem {
  id: number | string;
  name: string;
  price: number;
  image: string;
  description?: string;
  badge?: 'new' | 'hit' | 'limited';
}
interface QuickSize { key: string; label: string; multiplier: number; }
interface Props {
  product: ProductCardItem;
  onSelect: (p: ProductCardItem) => void;
  onFav: (id: number | string) => void;
  isFavorite: boolean;
  t: (k: string) => string;
  quickSizes?: QuickSize[];
  onQuickAdd?: (p: ProductCardItem, sizeKey: string, multiplier: number) => void;
  onPeek?: (p: ProductCardItem) => void;
}
export const ProductCard: React.FC<Props> = ({ product, onSelect, onFav, isFavorite, t, quickSizes, onQuickAdd, onPeek }) => {
  const [showSizes, setShowSizes] = useState(false);
  // Parallax effect
  useEffect(() => {
    const el = document.querySelector(`[data-parallax-id="${product.id}"]`) as HTMLElement | null;
    if (!el) return;
    const handler = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // progress -1..1 around center
      const center = rect.top + rect.height / 2;
      const delta = (center - vh / 2) / (vh / 2);
      const translate = Math.max(-1, Math.min(1, delta)) * 6; // px
      el.style.transform = `translateY(${translate}px)`;
    };
    handler();
    window.addEventListener('scroll', handler, { passive: true });
    return () => { window.removeEventListener('scroll', handler); };
  }, [product.id]);
  const pressTimer = React.useRef<number | null>(null);
  const pointerDownTime = React.useRef<number>(0);
  const handlePointerDown = () => {
    pointerDownTime.current = Date.now();
    if (onPeek) {
      pressTimer.current = window.setTimeout(() => { onPeek(product); }, 420); // long-press threshold
    }
  };
  const cancelPress = () => { if (pressTimer.current) { clearTimeout(pressTimer.current); pressTimer.current = null; } };
  const handlePointerUp = () => {
    if (pressTimer.current) {
      // short tap -> open full
      cancelPress();
      onSelect(product);
    }
  };
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: .95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: .9, y: 10 }}
      transition={{ type: 'spring', stiffness: 260, damping: 26 }}
      onClick={() => onSelect(product)}
      className="relative cursor-pointer select-none group"
      whileTap={{ scale: .965 }}
      onMouseEnter={() => setShowSizes(true)}
      onMouseLeave={() => setShowSizes(false)}
      role="button"
      aria-label={t(product.name)}
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={cancelPress}
      onKeyDown={(e)=>{ if (e.key==='Enter' || e.key===' ') { e.preventDefault(); onSelect(product); } }}
    >
      {/* Favorite */}
      <FavoriteButton active={isFavorite} onToggle={() => onFav(product.id)} />
      {/* Badge */}
      {product.badge && (
        <span className="absolute left-3 top-3 z-20 text-[10px] font-bold tracking-wide px-2 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-ambient">
          {product.badge === 'new' ? t('ui.badge_new') : product.badge === 'hit' ? t('ui.badge_hit') : t('ui.badge_limited')}
        </span>
      )}
      {/* Card */}
      <div data-parallax data-parallax-id={product.id} className="relative elev-card p-4 pt-28 text-center overflow-hidden transition-all duration-500 group-hover:elev-card-strong">
        {/* Image */}
        <LazyImage
          layoutId={`product-image-${product.id}`}
          src={product.image}
          alt={t(product.name)}
          className="w-32 h-32 absolute top-2 left-1/2 -translate-x-1/2 drop-shadow-lg group-hover:scale-105 transition-transform"
          rounded="rounded-2xl"
        />
        <h3 className="font-semibold text-[15px] leading-tight text-[var(--color-text-primary)] line-clamp-2 h-12 mt-1 tracking-tight">{t(product.name)}</h3>
        <p className="mt-2 font-bold text-[var(--color-brand-coffee)] dark:text-[var(--color-brand-amber)] text-[15px] tracking-tight relative inline-block after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-full after:h-[2px] after:rounded-full after:bg-[var(--color-border)]/60 group-hover:after:bg-[var(--color-brand-amber)]/50 after:transition" >{product.price} ₸</p>
      </div>
      {/* Quick sizes */}
      {quickSizes && quickSizes.length > 0 && (
        <AnimatePresence>
          {(showSizes) && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="mt-2 flex items-center justify-center gap-2"
            >
              {quickSizes.map(sz => (
                <button
                  key={sz.key}
                  onClick={(e) => { e.stopPropagation(); if (onQuickAdd) { onQuickAdd(product, sz.key, sz.multiplier); } }}
                  className="px-2.5 py-1.5 rounded-full text-[11px] font-semibold bg-[var(--color-bg-elev-1)] shadow-ambient hover:shadow-float border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition"
                >{sz.label}</button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
};
