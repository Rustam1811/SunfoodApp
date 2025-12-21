/**
 * Premium Design System - Barrel Export
 *
 * @module ui/premium
 */

// Components
export { AppShell, BottomSafeArea, PageTransition } from './AppShell';
export { GlassCard, GlassPanel, GlassDivider } from './GlassCard';
export {
  PrimaryButton,
  SecondaryButton,
  IconButton,
  GhostButton,
  PillButton,
} from './Buttons';
export { ProgressRing, MiniProgressRing } from './ProgressRing';
export { SetDots, SetDotsCompact } from './SetDots';

// Motion
export {
  // Transitions
  springTransition,
  springBouncyTransition,
  springSnappyTransition,
  easeTransition,
  // Page
  pageVariants,
  swipePageVariants,
  // Modal/Sheet
  modalBackdropVariants,
  modalContentVariants,
  sheetBackdropVariants,
  sheetContentVariants,
  // List
  listContainerVariants,
  listItemVariants,
  // Card
  cardVariants,
  // Micro
  pressVariants,
  hoverGlowVariants,
  pulseVariants,
  fadeInUpVariants,
  scaleInVariants,
  // Overlay
  overlayVariants,
  ringProgressVariants,
  // Gesture
  swipeConfidenceThreshold,
  swipePower,
} from './motion';
