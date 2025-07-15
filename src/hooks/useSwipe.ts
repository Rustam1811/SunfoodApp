// hooks/useSwipe.ts
import { useState, useRef, useCallback } from 'react';

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

interface SwipeConfig {
  threshold?: number;
  preventDefaultTouchmoveEvent?: boolean;
}

export const useSwipe = (handlers: SwipeHandlers, config: SwipeConfig = {}) => {
  const { threshold = 50, preventDefaultTouchmoveEvent = false } = config;
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const touchEnd = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchEnd.current = null;
    touchStart.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
    setIsSwiping(true);
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (preventDefaultTouchmoveEvent) {
      e.preventDefault();
    }
    touchEnd.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
  }, [preventDefaultTouchmoveEvent]);

  const onTouchEnd = useCallback(() => {
    if (!touchStart.current || !touchEnd.current) {
      setIsSwiping(false);
      return;
    }

    const distanceX = touchStart.current.x - touchEnd.current.x;
    const distanceY = touchStart.current.y - touchEnd.current.y;
    const isLeftSwipe = distanceX > threshold;
    const isRightSwipe = distanceX < -threshold;
    const isUpSwipe = distanceY > threshold;
    const isDownSwipe = distanceY < -threshold;

    // Определяем основное направление
    if (Math.abs(distanceX) > Math.abs(distanceY)) {
      if (isLeftSwipe && handlers.onSwipeLeft) {
        handlers.onSwipeLeft();
      }
      if (isRightSwipe && handlers.onSwipeRight) {
        handlers.onSwipeRight();
      }
    } else {
      if (isUpSwipe && handlers.onSwipeUp) {
        handlers.onSwipeUp();
      }
      if (isDownSwipe && handlers.onSwipeDown) {
        handlers.onSwipeDown();
      }
    }

    setIsSwiping(false);
  }, [handlers, threshold]);

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    isSwiping,
  };
};