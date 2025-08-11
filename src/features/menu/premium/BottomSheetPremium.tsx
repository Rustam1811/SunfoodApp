import React, { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, PanInfo } from 'framer-motion';

interface Props {
  open: boolean;
  onClose: ()=>void;
  children: React.ReactNode;
  maxHeight?: string | number;
  variant?: 'dark' | 'light';
  className?: string;
}

/**
 * Premium bottom sheet:
 * — без чёрных бордеров; только мягкие тени
 * — backdrop blur, градиентный overlay
 * — свайп вниз с порогом по доле высоты
 * — Esc/overlay закрывают
 * — блокирует скролл body при открытии
 */
export const BottomSheetPremium: React.FC<Props> = ({
  open,
  onClose,
  children,
  maxHeight = '92vh',
  variant = 'dark',
  className
}) => {
  const y = useMotionValue(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isLight = variant === 'light';

  // Сброс смещения при закрытии
  useEffect(()=>{ if (!open) y.set(0); }, [open, y]);

  // Блокируем фоновый скролл, когда открыт
  useEffect(()=>{
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return ()=> { document.body.style.overflow = overflow; };
  }, [open]);

  // Esc для закрытия
  useEffect(()=>{
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return ()=> window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const handleDragEnd = useCallback((_: unknown, info: PanInfo) => {
    const panel = panelRef.current;
    if (!panel) return onClose();
    const h = panel.getBoundingClientRect().height;
    const passedDistance = info.offset.y > h * 0.18;     // порог 18% высоты
    const fastSwipe = info.velocity.y > 900;             // быстрый свайп вниз
    if (passedDistance || fastSwipe) onClose();
    else y.set(0); // вернуться на место
  }, [onClose, y]);

  // Предотвращаем «протекание» скролла: если контент на верх/низ — разрешаем свайп листа
  const onWheelCapture = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    const atTop = el.scrollTop <= 0 && e.deltaY < 0;
    const atBottom = Math.ceil(el.scrollTop + el.clientHeight) >= el.scrollHeight && e.deltaY > 0;
    if (atTop || atBottom) {
      // позволяем фреймеру ловить жест, не стопим
    } else {
      e.stopPropagation();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay без бордеров: градиент + blur */}
          <motion.button
            aria-label="Закрыть"
            onClick={onClose}
            className="fixed inset-0 z-40 cursor-default focus:outline-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            // составной фон: лёгкий градиент + затемнение, разный для тем/свет
            style={{
              backdropFilter: isLight ? 'blur(6px)' : 'blur(10px)'
            }}
          >
            <span
              className={`absolute inset-0 ${isLight ? 'bg-[radial-gradient(120%_120%_at_50%_20%,rgba(0,0,0,0.25),rgba(0,0,0,0.55))]' : 'bg-[radial-gradient(120%_120%_at_50%_20%,rgba(0,0,0,0.4),rgba(0,0,0,0.7))]'}`}
            />
          </motion.button>

          {/* Sheet без чёрных бордеров, только мягкие тени */}
          <motion.div
            ref={panelRef}
            className={[
              'fixed inset-x-0 bottom-0 z-50 will-change-transform flex flex-col',
              'rounded-t-[32px]',
              isLight
                ? 'bg-[var(--color-bg-elev-1)] text-[var(--color-text-primary)]'
                : 'bg-[#0F1215] text-white',
              // мягкая объёмная тень без бордера
              'shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.25)]',
              className || ''
            ].join(' ')}
            style={{ y, maxHeight }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 460, damping: 40 }}
            drag="y"
            dragElastic={{ top: 0, bottom: 0.35 }}
            dragConstraints={{ top: 0, bottom: 0 }}
            onDragEnd={handleDragEnd}
          >
            {/* хэндл */}
            <div className="relative w-full shrink-0 select-none">
              <div className="w-full h-1.5 flex justify-center py-3">
                <div
                  className={`w-12 h-1.5 rounded-full ${
                    isLight ? 'bg-[var(--color-border)]' : 'bg-white/20'
                  }`}
                />
              </div>
              {/* Верхний мягкий fade — без бордеров */}
              <div className="pointer-events-none absolute top-0 left-0 right-0 h-8 rounded-t-[32px] bg-gradient-to-b from-black/5 to-transparent mix-blend-multiply" />
            </div>

            {/* контентная область со своим скроллом */}
            <div
              ref={scrollRef}
              id="premium-sheet-scroll"
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain scrollbar-none"
              onWheel={onWheelCapture}
            >
              {children}
              {/* Отступ под iOS home-indicator / sticky CTA снизу */}
              <div className="h-[28px]" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
