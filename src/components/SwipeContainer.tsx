// components/SwipeContainer.tsx
import React from 'react';
import { useSwipe } from '../hooks/useSwipe';

interface SwipeContainerProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  className?: string;
  threshold?: number;
}

export const SwipeContainer: React.FC<SwipeContainerProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  className = '',
  threshold = 50,
}) => {
  const swipeHandlers = useSwipe(
    {
      onSwipeLeft,
      onSwipeRight,
      onSwipeUp,
      onSwipeDown,
    },
    { threshold }
  );

  return (
    <div
      className={`${className} touch-pan-y`}
      {...swipeHandlers}
    >
      {children}
    </div>
  );
};