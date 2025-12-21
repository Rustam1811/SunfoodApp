/**
 * Premium Motion Variants - Framer Motion Presets
 *
 * Reusable animation variants for consistent motion design.
 * Includes modal, sheet, page, and micro-interaction animations.
 *
 * @module ui/premium/motion
 */

import { type Variants, type Transition } from 'framer-motion';

// ============================================================================
// Transition Presets
// ============================================================================

export const springTransition: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
};

export const springBouncyTransition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 20,
};

export const springSnappyTransition: Transition = {
  type: 'spring',
  stiffness: 500,
  damping: 35,
};

export const easeTransition: Transition = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1],
};

// ============================================================================
// Page Transitions
// ============================================================================

export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1],
    },
  },
};

export const swipePageVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: springTransition,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
    transition: springTransition,
  }),
};

// ============================================================================
// Modal Transitions
// ============================================================================

export const modalBackdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15 },
  },
};

export const modalContentVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 10,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springTransition,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.15 },
  },
};

// ============================================================================
// Bottom Sheet Transitions
// ============================================================================

export const sheetBackdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15, delay: 0.05 },
  },
};

export const sheetContentVariants: Variants = {
  hidden: { y: '100%' },
  visible: {
    y: 0,
    transition: springBouncyTransition,
  },
  exit: {
    y: '100%',
    transition: { duration: 0.25, ease: [0.4, 0, 1, 1] },
  },
};

// ============================================================================
// List Item Animations
// ============================================================================

export const listContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const listItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springTransition,
  },
};

// ============================================================================
// Card Animations
// ============================================================================

export const cardVariants: Variants = {
  initial: {
    opacity: 0,
    y: 30,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springTransition,
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 },
  },
};

// ============================================================================
// Micro-interactions
// ============================================================================

export const pressVariants: Variants = {
  rest: { scale: 1 },
  pressed: { scale: 0.98 },
};

export const hoverGlowVariants: Variants = {
  rest: {
    boxShadow: '0 0 0 0 rgba(99, 102, 241, 0)',
  },
  hover: {
    boxShadow: '0 0 30px 10px rgba(99, 102, 241, 0.15)',
  },
};

export const pulseVariants: Variants = {
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const fadeInUpVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

export const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springBouncyTransition,
  },
};

// ============================================================================
// Overlay Animations (Rest Timer, etc.)
// ============================================================================

export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

export const ringProgressVariants = (circumference: number, progress: number): Variants => ({
  initial: {
    strokeDashoffset: circumference,
  },
  animate: {
    strokeDashoffset: circumference * (1 - progress),
    transition: { duration: 0.5, ease: 'easeOut' },
  },
});

// ============================================================================
// Gesture Helpers
// ============================================================================

export const swipeConfidenceThreshold = 10000;
export const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};
