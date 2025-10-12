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
        <div className="fixed inset-0 z-[var(--layer-dialog)] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 500, damping: 40 }}
            className="relative z-10 w-full max-w-md bg-[var(--color-bg-elev-1)] rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
          >
            {/* Header - компактный */}
            <header className="flex-shrink-0 p-5 pt-6 text-center relative border-b border-[var(--color-border)]">
              <div className="w-32 h-32 mx-auto mb-3 rounded-2xl overflow-hidden">
                <img src={product.image} alt={t(product.name)} className="w-full h-full object-cover" />
              </div>
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">{t(product.name)}</h2>
              {product.description && <p className="text-xs text-[var(--color-text-secondary)] mt-1 line-clamp-2">{t(product.description)}</p>}
              <button onClick={onClose} className="absolute top-3 right-3 p-2 rounded-full bg-[var(--color-bg-elev-2)] hover:bg-gray-200 transition-colors">
                <XMarkIcon className="h-5 w-5 text-[var(--color-text-secondary)]" />
              </button>
            </header>

            {/* Content - скроллится */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              {/* Size */}
              <div>
                <h4 className="text-xs font-semibold mb-2 tracking-wide text-[var(--color-text-secondary)] uppercase">{t('ui.size')}</h4>
                <div className="grid grid-cols-3 gap-2">
                  {sizes.map(s => (
                    <button 
                      key={s.key} 
                      onClick={() => dispatch({ type: 'SET', field: 'sizeKey', value: s.key })} 
                      className={`rounded-xl border-2 px-2 py-2 flex flex-col items-center gap-0.5 transition-all text-sm font-semibold ${
                        state.sizeKey === s.key 
                          ? 'bg-[var(--color-brand-amber)]/10 border-[var(--color-brand-amber)] text-[var(--color-text-primary)] shadow-md' 
                          : 'bg-[var(--color-bg-elev-2)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-gray-300'
                      }`}
                    >
                      <span className="text-base font-bold">{s.label}</span>
                      <span className="text-[9px] opacity-70">{s.ml} мл</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Syrup */}
              <div>
                <button type="button" onClick={()=>setShowSyrups(s=>!s)} className="w-full flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold tracking-wide text-[var(--color-text-secondary)] uppercase">{t('ui.syrup')}</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-bg-elev-2)] border border-[var(--color-border)]">{showSyrups?'Скрыть':'Показать'}</span>
                </button>
                <AnimatePresence initial={false}>
                  {showSyrups && (
                    <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} className="overflow-hidden">
                      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                        {syrups.map(s => (
                          <button
                            key={s.key}
                            onClick={() => dispatch({ type: 'SET', field: 'syrupKey', value: s.key })}
                            className={`flex-shrink-0 w-24 rounded-xl p-2 transition ${state.syrupKey === s.key ? 'ring-2 ring-[var(--color-brand-amber)] bg-[var(--color-brand-amber)]/10' : 'bg-[var(--color-bg-elev-2)]'}`}
                          >
                            <img src={s.image || ''} alt="" className="w-10 h-10 mx-auto mb-1 rounded-lg" />
                            <span className="block text-[10px] leading-tight line-clamp-2 text-[var(--color-text-primary)]">{s.name}</span>
                            {s.price > 0 && <span className="mt-0.5 text-[9px] font-semibold text-[var(--color-brand-amber)]">+{s.price}₸</span>}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Milk */}
              <div>
                <button type="button" onClick={()=>setShowMilks(s=>!s)} className="w-full flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold tracking-wide text-[var(--color-text-secondary)] uppercase">{t('ui.milk') || 'Молоко'}</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-bg-elev-2)] border border-[var(--color-border)]">{showMilks?'Скрыть':'Показать'}</span>
                </button>
                <AnimatePresence initial={false}>
                  {showMilks && (
                    <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} className="overflow-hidden">
                      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                        {milks.map(m => (
                          <button
                            key={m.key}
                            onClick={() => dispatch({ type: 'SET', field: 'milkKey', value: m.key })}
                            className={`flex-shrink-0 w-24 rounded-xl p-2 transition ${state.milkKey === m.key ? 'ring-2 ring-[var(--color-brand-amber)] bg-[var(--color-brand-amber)]/10' : 'bg-[var(--color-bg-elev-2)]'}`}
                          >
                            <img src={m.image || ''} alt="" className="w-10 h-10 mx-auto mb-1 rounded-lg" />
                            <span className="block text-[10px] leading-tight line-clamp-2 text-[var(--color-text-primary)]">{m.name}</span>
                            {m.price > 0 && <span className="mt-0.5 text-[9px] font-semibold text-[var(--color-brand-amber)]">+{m.price}₸</span>}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Nutrition */}
              {product && scaledNutrition && (
                <div>
                  <h4 className="text-xs font-semibold mb-2 tracking-wide text-[var(--color-text-secondary)] uppercase">{t('ui.nutrition') || 'Пищевая ценность'}</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {(['energy','protein','fat','carbs'] as const).map(k => (
                      <div key={k} className="rounded-xl bg-[var(--color-bg-elev-2)] px-2 py-2 text-center">
                        <span className="block text-[9px] uppercase tracking-wide text-[var(--color-text-secondary)]">{t('ui.'+k) || k}</span>
                        <span className="block text-xs font-semibold text-[var(--color-text-primary)] mt-0.5">{scaledNutrition?.[k] ?? '-'}{k==='energy' ? (scaledNutrition?.[k] ? ' ккал' : '') : (scaledNutrition?.[k] ? ' г' : '')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upsell */}
              {product && product.togetherBetter && product.togetherBetter.length > 0 && (
                <UpsellStrip
                  items={product.togetherBetter.map(tb=>({ id:tb.id, name:tb.name, price: Math.round((product.price*0.75)), image: tb.image }))}
                  onAdd={(it)=>{ onAdd({ productId: it.id, name: it.name, sizeKey: state.sizeKey, milkKey: state.milkKey, syrupKey: state.syrupKey, quantity:1, totalPrice: it.price }); }}
                />
              )}
            </div>

            {/* Footer - фиксированная кнопка */}
            <div className="flex-shrink-0 p-4 border-t border-[var(--color-border)] bg-[var(--color-bg-elev-1)] flex items-center gap-3">
              <div className="flex items-center gap-2 bg-[var(--color-bg-elev-2)] rounded-xl px-2 py-2">
                <button onClick={() => dispatch({ type: 'QTY', delta: -1 })} disabled={state.quantity === 1} className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-base font-bold disabled:opacity-40 disabled:cursor-not-allowed">-</button>
                <span className="w-6 text-center font-semibold text-sm">{state.quantity}</span>
                <button onClick={() => dispatch({ type: 'QTY', delta: 1 })} className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-base font-bold">+</button>
              </div>
              <button
                onClick={() => { if (!product) return; onAdd({ productId: product.id, name: product.name, sizeKey: state.sizeKey, milkKey: state.milkKey, syrupKey: state.syrupKey, quantity: state.quantity, totalPrice: total }); onClose(); }}
                className="flex-1 bg-gradient-to-r from-[var(--color-action-strong)] to-amber-500 text-white font-semibold py-3 rounded-xl shadow-lg text-sm"
              >
                {t('ui.add_for') || 'Добавить за'} {total} ₸
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
