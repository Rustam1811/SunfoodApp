/**
 * SwipeShell - 3-Page Horizontal Swipe Navigation
 *
 * Drinkit-style smooth swipe navigation with inertia.
 * Pages: Profile (left), Workouts (center), Nutrition (right)
 *
 * Features:
 * - Touch/pointer event handling for smooth swipe
 * - Framer Motion for inertia and spring animations
 * - Tab persistence via localStorage
 * - Optional tab buttons for accessibility
 * - One-hand UX with bottom-aligned actions
 *
 * @module components/shell/SwipeShell
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, useAnimation, useMotionValue, useTransform, PanInfo } from 'framer-motion';

// ============================================================================
// Types
// ============================================================================

export interface SwipePage {
  id: string;
  label: string;
  icon?: React.ReactNode;
  component: React.ReactNode;
}

export interface SwipeShellProps {
  pages: SwipePage[];
  /** Initial page index (0-based) */
  initialPage?: number;
  /** Show tab navigation dots */
  showTabs?: boolean;
  /** Show tab labels */
  showLabels?: boolean;
  /** Persist tab selection to localStorage */
  persistKey?: string;
  /** Called when page changes */
  onPageChange?: (index: number, pageId: string) => void;
  /** Custom class for container */
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

const SWIPE_CONFIDENCE_THRESHOLD = 10000;
const SWIPE_VELOCITY_THRESHOLD = 500;
const DRAG_ELASTIC = 0.2;
const TRANSITION_SPRING = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
};

// ============================================================================
// Utilities
// ============================================================================

const swipePower = (offset: number, velocity: number): number => {
  return Math.abs(offset) * velocity;
};

const getStoredPage = (key: string, fallback: number): number => {
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = localStorage.getItem(key);
    if (stored !== null) {
      const parsed = parseInt(stored, 10);
      return isNaN(parsed) ? fallback : parsed;
    }
  } catch {
    // localStorage may be unavailable
  }
  return fallback;
};

const setStoredPage = (key: string, value: number): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value.toString());
  } catch {
    // localStorage may be unavailable
  }
};

// ============================================================================
// Tab Indicator Component
// ============================================================================

interface TabIndicatorProps {
  pages: SwipePage[];
  currentIndex: number;
  onTabClick: (index: number) => void;
  showLabels?: boolean;
}

const TabIndicator: React.FC<TabIndicatorProps> = ({
  pages,
  currentIndex,
  onTabClick,
  showLabels = false,
}) => {
  return (
    <div className="flex items-center justify-center gap-2 py-3">
      {pages.map((page, index) => {
        const isActive = index === currentIndex;
        return (
          <button
            key={page.id}
            onClick={() => onTabClick(index)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-full
              transition-all duration-200
              ${isActive
                ? 'bg-white/10 text-white'
                : 'bg-transparent text-white/40 hover:text-white/60'
              }
            `}
            aria-label={page.label}
            aria-current={isActive ? 'page' : undefined}
          >
            {page.icon && (
              <span className="w-4 h-4">{page.icon}</span>
            )}
            {showLabels && (
              <span className="text-xs font-medium">{page.label}</span>
            )}
            {!showLabels && !page.icon && (
              <span
                className={`
                  w-2 h-2 rounded-full transition-all duration-200
                  ${isActive ? 'bg-white scale-100' : 'bg-white/30 scale-75'}
                `}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

// ============================================================================
// Dot Indicator (Minimal)
// ============================================================================

interface DotIndicatorProps {
  total: number;
  current: number;
}

const DotIndicator: React.FC<DotIndicatorProps> = ({ total, current }) => {
  return (
    <div className="flex items-center justify-center gap-2 py-2">
      {Array.from({ length: total }).map((_, index) => (
        <motion.div
          key={index}
          initial={false}
          animate={{
            width: index === current ? 24 : 6,
            opacity: index === current ? 1 : 0.3,
          }}
          transition={{ duration: 0.2 }}
          className="h-1.5 rounded-full bg-white"
        />
      ))}
    </div>
  );
};

// ============================================================================
// Main SwipeShell Component
// ============================================================================

export const SwipeShell: React.FC<SwipeShellProps> = ({
  pages,
  initialPage = 1, // Center page by default (Workouts)
  showTabs = true,
  showLabels = false,
  persistKey = 'swipe-shell-page',
  onPageChange,
  className = '',
}) => {
  // Get initial page from localStorage or prop
  const [currentIndex, setCurrentIndex] = useState(() => {
    const stored = persistKey ? getStoredPage(persistKey, initialPage) : initialPage;
    return Math.min(Math.max(0, stored), pages.length - 1);
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const x = useMotionValue(0);
  const containerWidth = useRef(0);

  // Track container width
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        containerWidth.current = containerRef.current.offsetWidth;
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Navigate to page
  const navigateToPage = useCallback(
    (index: number, immediate = false) => {
      const clampedIndex = Math.min(Math.max(0, index), pages.length - 1);
      setCurrentIndex(clampedIndex);

      if (persistKey) {
        setStoredPage(persistKey, clampedIndex);
      }

      onPageChange?.(clampedIndex, pages[clampedIndex].id);

      controls.start({
        x: -clampedIndex * containerWidth.current,
        transition: immediate ? { duration: 0 } : TRANSITION_SPRING,
      });
    },
    [pages, persistKey, onPageChange, controls]
  );

  // Initial position
  useEffect(() => {
    if (containerWidth.current > 0) {
      controls.set({ x: -currentIndex * containerWidth.current });
    }
  }, [currentIndex, controls]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (containerWidth.current > 0) {
        controls.set({ x: -currentIndex * containerWidth.current });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentIndex, controls]);

  // Handle drag end
  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const { offset, velocity } = info;
      const swipe = swipePower(offset.x, velocity.x);

      let newIndex = currentIndex;

      // Determine direction based on swipe power or velocity
      if (swipe > SWIPE_CONFIDENCE_THRESHOLD || velocity.x > SWIPE_VELOCITY_THRESHOLD) {
        // Swiped right → go to previous page
        newIndex = Math.max(0, currentIndex - 1);
      } else if (swipe < -SWIPE_CONFIDENCE_THRESHOLD || velocity.x < -SWIPE_VELOCITY_THRESHOLD) {
        // Swiped left → go to next page
        newIndex = Math.min(pages.length - 1, currentIndex + 1);
      }

      navigateToPage(newIndex);
    },
    [currentIndex, pages.length, navigateToPage]
  );

  // Handle tab click
  const handleTabClick = useCallback(
    (index: number) => {
      navigateToPage(index);
    },
    [navigateToPage]
  );

  // Calculate drag constraints
  const dragConstraints = {
    left: -(pages.length - 1) * (containerWidth.current || 0),
    right: 0,
  };

  return (
    <div
      ref={containerRef}
      className={`
        relative w-full h-full overflow-hidden
        bg-gradient-to-b from-zinc-950 via-neutral-950 to-zinc-950
        ${className}
      `}
    >
      {/* Swipeable pages container */}
      <motion.div
        className="flex h-full"
        style={{
          width: `${pages.length * 100}%`,
          x,
        }}
        drag="x"
        dragConstraints={dragConstraints}
        dragElastic={DRAG_ELASTIC}
        onDragEnd={handleDragEnd}
        animate={controls}
      >
        {pages.map((page, index) => (
          <div
            key={page.id}
            className="flex-shrink-0 h-full overflow-y-auto"
            style={{ width: `${100 / pages.length}%` }}
          >
            {page.component}
          </div>
        ))}
      </motion.div>

      {/* Tab indicator - fixed at bottom */}
      {showTabs && (
        <div
          className="
            absolute bottom-0 left-0 right-0 z-20
            bg-gradient-to-t from-zinc-950/90 via-zinc-950/70 to-transparent
            pb-safe
          "
          style={{
            paddingBottom: 'max(env(safe-area-inset-bottom, 8px), 8px)',
          }}
        >
          <TabIndicator
            pages={pages}
            currentIndex={currentIndex}
            onTabClick={handleTabClick}
            showLabels={showLabels}
          />
        </div>
      )}

      {/* Minimal dot indicator (alternative) */}
      {!showTabs && (
        <div className="absolute top-safe left-0 right-0 z-20 pt-2">
          <DotIndicator total={pages.length} current={currentIndex} />
        </div>
      )}
    </div>
  );
};

// ============================================================================
// SwipePage Wrapper - For consistent page styling
// ============================================================================

export interface SwipePageProps {
  children: React.ReactNode;
  className?: string;
  /** Add padding for bottom tabs */
  withBottomPadding?: boolean;
}

export const SwipePage: React.FC<SwipePageProps> = ({
  children,
  className = '',
  withBottomPadding = true,
}) => {
  return (
    <div
      className={`
        min-h-full
        ${withBottomPadding ? 'pb-20' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default SwipeShell;
