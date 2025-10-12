import React, { useReducer, useCallback, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { LazyImage } from './LazyImage';
import { UpsellStrip } from './UpsellStrip';

interface SizeDef { key: string; label: string; ml: number; priceMultiplier: number; }
interface SyrupDef { key: string; name: string; price: number; image?: string; }
interface MilkDef { key: string; name: string; price: number; image?: string; }
interface TogetherBetterLite { id:number|string; name:string; image:string; }
interface ProductLite { id: number | string; name: string; description?: string; price: number; image: string; energy?: number; protein?: number; fat?: number; carbs?: number; togetherBetter?: TogetherBetterLite[]; }

interface ProductConfiguratorProps {
  open: boolean;
  product: ProductLite | null;
  onClose: () => void;
  onAdd: (config: { productId: number | string; name: string; sizeKey: string; syrupKey: string; milkKey: string; quantity: number; totalPrice: number; }) => void;
  sizes: SizeDef[];
  syrups: SyrupDef[];
  milks: MilkDef[];
  t: (k: string) => string;
  peek?: boolean;
}

type Action =
  | { type: 'SET'; field: 'sizeKey' | 'milkKey' | 'syrupKey'; value: string }
  | { type: 'QTY'; delta: number };

export const ProductConfiguratorSheet: React.FC<ProductConfiguratorProps> = ({ open, product, onClose, onAdd, sizes, syrups, milks, t, peek=false }) => {
  const initial = { sizeKey: 'M', milkKey: 'regular', syrupKey: 'none', quantity: 1 };
  function reducer(state: typeof initial, action: Action) {
    switch (action.type) {
      case 'SET': return { ...state, [action.field]: action.value };
      case 'QTY': return { ...state, quantity: Math.max(1, state.quantity + action.delta) };
      default: return state;
    }
  }
  const [state, dispatch] = useReducer(reducer, initial);
  const price = useCallback(() => {
    if (!product) return 0;
    const size = sizes.find(s => s.key === state.sizeKey);
    const syrup = syrups.find(s => s.key === state.syrupKey);
    const milk = milks.find(m => m.key === state.milkKey);
    return Math.round((product.price * (size?.priceMultiplier || 1) + (syrup?.price || 0) + (milk?.price || 0)) * state.quantity);
  }, [product, state, sizes, syrups, milks]);
  const total = price();
  const [showSyrups, setShowSyrups] = useState(false);
  const [showMilks, setShowMilks] = useState(false);
  const baseSize = useMemo(()=> sizes.find(s=>s.key==='M') || sizes[0], [sizes]);
  const currentSize = useMemo(()=> sizes.find(s=>s.key===state.sizeKey) || baseSize, [sizes, state.sizeKey, baseSize]);
  const sizeFactor = useMemo(()=> currentSize && baseSize ? currentSize.ml / baseSize.ml : 1, [currentSize, baseSize]);
  const scaledNutrition = useMemo(()=>{
    if(!product) return null;
    return {
      energy: product.energy ? Math.round(product.energy * sizeFactor) : undefined,
      protein: product.protein ? +(product.protein * sizeFactor).toFixed(1) : undefined,
      fat: product.fat ? +(product.fat * sizeFactor).toFixed(1) : undefined,
      carbs: product.carbs ? +(product.carbs * sizeFactor).toFixed(1) : undefined,
    };
  }, [product, sizeFactor]);

  return (
    <AnimatePresence>
      {open && product && (
        <div className="fixed inset-0 z-[var(--layer-dialog)] flex items-end" role="dialog" aria-modal="true" aria-label={t(product.name)}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: .6 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: peek ? '55%' : 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 420, damping: 42 }}
            className="relative z-10 w-full bg-[var(--color-bg-elev-1)] rounded-t-[34px] shadow-float max-h-[100vh] flex flex-col"
          >
            <header className="p-5 pt-6 text-center relative border-b border-[var(--color-border)] cursor-pointer select-none" onClick={()=>{ if (peek) {/* expand on tap */} }}>
              <LazyImage layoutId={`product-image-${product.id}`} src={product.image} alt={t(product.name)} className="w-48 h-48 mx-auto -mt-32 drop-shadow-2xl" rounded="rounded-2xl" />
              <h2 className="text-2xl font-extrabold mt-4 text-[var(--color-text-primary)] tracking-tight">{t(product.name)}</h2>
              {product.description && <p className="text-sm text-[var(--color-text-secondary)] mt-2 px-4 line-clamp-3">{t(product.description)}</p>}
              <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-[var(--color-bg-elev-2)] hover:shadow-ambient">
                <XMarkIcon className="h-5 w-5 text-[var(--color-text-secondary)]" />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-8 pb-44">
              <div>
                <h4 className="text-sm font-semibold mb-2 tracking-wide text-[var(--color-text-secondary)] uppercase">{t('ui.size')}</h4>
                <div className="grid grid-cols-3 gap-3">
                  {sizes.map(s => (
                    <button key={s.key} onClick={() => dispatch({ type: 'SET', field: 'sizeKey', value: s.key })} className={`rounded-2xl border-2 px-2 py-3 flex flex-col items-center gap-0.5 transition text-sm font-semibold min-h-[70px] ${state.sizeKey === s.key ? 'bg-[var(--color-brand-amber)]/10 border-[var(--color-brand-amber)] text-[var(--color-text-primary)] shadow-ambient' : 'bg-[var(--color-bg-elev-2)] border-[var(--color-border)] text-[var(--color-text-secondary)]'}`}> <span className="text-base font-bold">{s.label}</span><span className="text-[10px] opacity-70">{s.ml} мл</span></button>
                  ))}
                </div>
              </div>
              <div>
                <button type="button" onClick={()=>setShowSyrups(s=>!s)} className="w-full flex items-center justify-between mb-2 group">
                  <h4 className="text-sm font-semibold tracking-wide text-[var(--color-text-secondary)] uppercase">{t('ui.syrup')}</h4>
                  <span className="text-[10px] px-2 py-1 rounded-full bg-[var(--color-bg-elev-2)] border border-[var(--color-border)] group-hover:bg-[var(--color-bg-elev-2)]/60 transition">{showSyrups?t('ui.hide')||'Скрыть':t('ui.show')||'Показать'}</span>
                </button>
                <AnimatePresence initial={false}>
                  {showSyrups && (
                    <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} className="overflow-hidden">
                      <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar snap-x snap-mandatory">
                        {syrups.map(s => (
                          <button
                            key={s.key}
                            onClick={() => dispatch({ type: 'SET', field: 'syrupKey', value: s.key })}
                            className={`relative flex-shrink-0 w-32 snap-center syrup-tile px-3 py-4 transition group ${state.syrupKey === s.key ? 'syrup-tile-selected ring-2 ring-[var(--color-brand-amber)]/60' : ''}`}
                          >
                            <LazyImage src={s.image || ''} alt="" className="w-12 h-12 mx-auto mb-2 rounded-xl shadow-ambient group-hover:scale-105 transition-transform" />
                            <span className="block leading-tight line-clamp-2 text-[var(--color-text-primary)]/90">{s.name}</span>
                            {s.price > 0 && <span className="mt-1 text-[10px] font-semibold text-[var(--color-brand-coffee)] dark:text-[var(--color-brand-amber)]">+{s.price}₸</span>}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div>
                <button type="button" onClick={()=>setShowMilks(s=>!s)} className="w-full flex items-center justify-between mb-2 group">
                  <h4 className="text-sm font-semibold tracking-wide text-[var(--color-text-secondary)] uppercase">{t('ui.milk') || 'Молоко'}</h4>
                  <span className="text-[10px] px-2 py-1 rounded-full bg-[var(--color-bg-elev-2)] border border-[var(--color-border)] group-hover:bg-[var(--color-bg-elev-2)]/60 transition">{showMilks?t('ui.hide')||'Скрыть':t('ui.show')||'Показать'}</span>
                </button>
                <AnimatePresence initial={false}>
                  {showMilks && (
                    <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} className="overflow-hidden">
                      <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar snap-x snap-mandatory">
                        {milks.map(m => (
                          <button
                            key={m.key}
                            onClick={() => dispatch({ type: 'SET', field: 'milkKey', value: m.key })}
                            className={`relative flex-shrink-0 w-32 snap-center syrup-tile px-3 py-4 transition group ${state.milkKey === m.key ? 'syrup-tile-selected ring-2 ring-[var(--color-brand-amber)]/60' : ''}`}
                          >
                            <LazyImage src={m.image || ''} alt="" className="w-14 h-14 mx-auto mb-2 rounded-xl shadow-ambient group-hover:scale-105 transition-transform" />
                            <span className="block leading-tight line-clamp-2 text-[var(--color-text-primary)]/90">{m.name}</span>
                            {m.price > 0 && <span className="mt-1 text-[10px] font-semibold text-[var(--color-brand-coffee)] dark:text-[var(--color-brand-amber)]">+{m.price}₸</span>}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {product && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold tracking-wide text-[var(--color-text-secondary)] uppercase">{t('ui.nutrition') || 'Пищевая ценность'}</h4>
                  <div className="grid grid-cols-4 gap-3">
                    {(['energy','protein','fat','carbs'] as const).map(k => (
                      <div key={k} className="glossy-pill px-3 py-2 flex flex-col items-center text-center">
                        <span className="text-[10px] uppercase tracking-wide text-[var(--color-text-secondary)]">{t('ui.'+k) || k}</span>
                        <span className="text-[13px] font-semibold text-[var(--color-text-primary)]">{scaledNutrition?.[k] ?? '-'}{k==='energy' ? (scaledNutrition?.[k] ? ' ккал' : '') : (scaledNutrition?.[k] ? ' г' : '')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {product && product.togetherBetter && product.togetherBetter.length > 0 && (
                <UpsellStrip
                  items={product.togetherBetter.map(tb=>({ id:tb.id, name:tb.name, price: Math.round((product.price*0.75)), image: tb.image }))}
                  onAdd={(it)=>{ onAdd({ productId: it.id, name: it.name, sizeKey: state.sizeKey, milkKey: state.milkKey, syrupKey: state.syrupKey, quantity:1, totalPrice: it.price }); }}
                />
              )}
            </div>
            <div className="absolute left-0 right-0 bottom-[70px] p-4 pb-6 bg-gradient-to-t from-[var(--color-bg-elev-1)] via-[var(--color-bg-elev-1)]/95 to-[var(--color-bg-elev-1)]/60 backdrop-blur-xl border-t border-[var(--color-border)] flex items-center gap-3">
              <div className="flex items-center gap-2 bg-[var(--color-bg-elev-2)] rounded-2xl px-2 py-2">
                <button onClick={() => dispatch({ type: 'QTY', delta: -1 })} disabled={state.quantity === 1} className="w-8 h-8 rounded-xl bg-[var(--color-bg-elev-1)] flex items-center justify-center text-lg font-bold disabled:opacity-40">-</button>
                <span className="w-6 text-center font-semibold select-none">{state.quantity}</span>
                <button onClick={() => dispatch({ type: 'QTY', delta: 1 })} className="w-8 h-8 rounded-xl bg-[var(--color-bg-elev-1)] flex items-center justify-center text-lg font-bold">+</button>
              </div>
              <button
                onClick={() => { if (!product) return; onAdd({ productId: product.id, name: product.name, sizeKey: state.sizeKey, milkKey: state.milkKey, syrupKey: state.syrupKey, quantity: state.quantity, totalPrice: total }); onClose(); }}
                className="flex-1 glossy-pill bg-gradient-to-r from-[var(--color-action-strong)] to-amber-500 text-white font-semibold py-4 rounded-2xl shadow-float text-sm tracking-wide relative overflow-hidden"
              >
                <span className="relative z-10">{t('ui.add_for') || 'Добавить за'} {total} ₸</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
