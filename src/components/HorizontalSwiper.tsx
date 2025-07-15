// components/HorizontalSwiper.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useSwipe } from '../hooks/useSwipe';

interface HorizontalSwiperProps {
  children: React.ReactNode[];
  currentIndex?: number;
  onIndexChange?: (index: number) => void;
  className?: string;
  itemClassName?: string;
  showIndicators?: boolean;
}

export const HorizontalSwiper: React.FC<HorizontalSwiperProps> = ({
  children,
  currentIndex = 0,
  onIndexChange,
  className = '',
  itemClassName = '',
  showIndicators = true,
}) => {
  const [activeIndex, setActiveIndex] = useState(currentIndex);
  const containerRef = useRef<HTMLDivElement>(null);

  const goToSlide = (index: number) => {
    const newIndex = Math.max(0, Math.min(index, children.length - 1));
    setActiveIndex(newIndex);
    onIndexChange?.(newIndex);
  };

  const swipeHandlers = useSwipe({
    onSwipeLeft: () => goToSlide(activeIndex + 1),
    onSwipeRight: () => goToSlide(activeIndex - 1),
  });

  useEffect(() => {
    if (containerRef.current) {
      const translateX = -activeIndex * 100;
      containerRef.current.style.transform = `translateX(${translateX}%)`;
    }
  }, [activeIndex]);

  return (
    <div className={`relative overflow-hidden ${className}`} {...swipeHandlers}>
      <div
        ref={containerRef}
        className="flex transition-transform duration-300 ease-out"
        style={{ width: `${children.length * 100}%` }}
      >
        {children.map((child, index) => (
          <div
            key={index}
            className={`flex-shrink-0 w-full ${itemClassName}`}
            style={{ width: `${100 / children.length}%` }}
          >
            {child}
          </div>
        ))}
      </div>
      
      {showIndicators && children.length > 1 && (
        <div className="flex justify-center space-x-2 mt-4">
          {children.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === activeIndex ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};