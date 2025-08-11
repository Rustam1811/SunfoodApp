import { useCallback, useRef, useState, useEffect } from 'react';

interface FlyItem {
  id: number;
  startX: number; startY: number;
  endX: number; endY: number;
  progress: number;
  image?: string;
  createdAt: number;
  duration: number;
}

export function useFlyToCart() {
  const [items, setItems] = useState<FlyItem[]>([]);
  const rafRef = useRef<number | null>(null);

  // Animation loop
  useEffect(() => {
    if (!items.length) return;
    const tick = () => {
      setItems(prev => prev
        .map(it => ({ ...it, progress: (Date.now() - it.createdAt) / it.duration }))
        .filter(it => it.progress < 1));
      if (items.length) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [items.length]);

  const trigger = useCallback((sourceEl: HTMLElement | null, targetEl: HTMLElement | null, image?: string) => {
    if (!sourceEl || !targetEl) return;
    const s = sourceEl.getBoundingClientRect();
    const t = targetEl.getBoundingClientRect();
    const startX = s.left + s.width / 2;
    const startY = s.top + s.height / 2;
    const endX = t.left + t.width / 2;
    const endY = t.top + t.height / 2;
    setItems(prev => [...prev, { id: Date.now() + Math.random(), startX, startY, endX, endY, progress: 0, createdAt: Date.now(), duration: 620, image }]);
    // impact shake
    setTimeout(() => {
      targetEl.animate([
        { transform: 'scale(1)' },
        { transform: 'scale(1.15)' },
        { transform: 'scale(0.94)' },
        { transform: 'scale(1)' }
      ], { duration: 340, easing: 'cubic-bezier(.34,1.56,.64,1)' });
    }, 560);
  }, []);

  return { items, trigger };
}
