/**
 * Premium Buttons - Tactile, Gradient, Glow Effects
 *
 * PrimaryButton: Gradient background with glow shadow
 * SecondaryButton: Glass morphism with subtle border
 * IconButton: Circular icon-only button
 * GhostButton: Text-only with hover state
 *
 * @module ui/premium/Buttons
 */

import React, { useCallback } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

// ============================================================================
// Haptic Feedback Utility
// ============================================================================

const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    const patterns = { light: 10, medium: 20, heavy: 40 };
    navigator.vibrate(patterns[type]);
  }
};

// ============================================================================
// Shared Types
// ============================================================================

interface BaseButtonProps {
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  haptic?: boolean;
  fullWidth?: boolean;
  className?: string;
}

type ButtonProps = BaseButtonProps &
  Omit<HTMLMotionProps<'button'>, 'children' | 'disabled'>;

// ============================================================================
// Primary Button - Gradient + Glow
// ============================================================================

export const PrimaryButton: React.FC<ButtonProps> = ({
  children,
  disabled = false,
  loading = false,
  haptic = true,
  fullWidth = false,
  className = '',
  onClick,
  ...props
}) => {
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (haptic && !disabled && !loading) {
        triggerHaptic('medium');
      }
      onClick?.(e);
    },
    [haptic, disabled, loading, onClick]
  );

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled || loading}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`
        relative overflow-hidden
        h-14 px-6
        rounded-2xl
        bg-gradient-to-r from-indigo-500/90 via-sky-500/90 to-cyan-400/90
        shadow-[0_18px_50px_-18px_rgba(56,189,248,0.7)]
        text-white font-semibold tracking-wide
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:ring-offset-2 focus:ring-offset-transparent
        disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      aria-busy={loading}
      {...props}
    >
      {/* Shimmer effect on hover */}
      <div
        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s infinite',
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading ? (
          <svg
            className="animate-spin h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            aria-label="Loading"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          children
        )}
      </span>
    </motion.button>
  );
};

// ============================================================================
// Secondary Button - Glass + Border
// ============================================================================

export const SecondaryButton: React.FC<ButtonProps> = ({
  children,
  disabled = false,
  loading = false,
  haptic = true,
  fullWidth = false,
  className = '',
  onClick,
  ...props
}) => {
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (haptic && !disabled && !loading) {
        triggerHaptic('light');
      }
      onClick?.(e);
    },
    [haptic, disabled, loading, onClick]
  );

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled || loading}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`
        relative overflow-hidden
        h-14 px-6
        rounded-2xl
        bg-white/5
        border border-white/10
        backdrop-blur-sm
        text-white font-medium tracking-wide
        transition-all duration-200
        hover:bg-white/10 hover:border-white/15
        focus:outline-none focus:ring-2 focus:ring-white/20
        disabled:opacity-50 disabled:cursor-not-allowed
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      aria-busy={loading}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading ? (
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          children
        )}
      </span>
    </motion.button>
  );
};

// ============================================================================
// Icon Button - Circular
// ============================================================================

interface IconButtonProps extends Omit<ButtonProps, 'children' | 'fullWidth'> {
  icon: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'glass' | 'solid';
  'aria-label': string;
}

const iconSizes = {
  sm: 'w-9 h-9',
  md: 'w-11 h-11',
  lg: 'w-14 h-14',
};

const iconVariants = {
  ghost: 'bg-transparent hover:bg-white/10',
  glass: 'bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10',
  solid: 'bg-white/10 hover:bg-white/15',
};

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  size = 'md',
  variant = 'ghost',
  disabled = false,
  haptic = true,
  className = '',
  onClick,
  'aria-label': ariaLabel,
  ...props
}) => {
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (haptic && !disabled) {
        triggerHaptic('light');
      }
      onClick?.(e);
    },
    [haptic, disabled, onClick]
  );

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled}
      whileTap={{ scale: disabled ? 1 : 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`
        flex items-center justify-center
        rounded-full
        text-white/70
        transition-all duration-200
        hover:text-white
        focus:outline-none focus:ring-2 focus:ring-white/20
        disabled:opacity-50 disabled:cursor-not-allowed
        ${iconSizes[size]}
        ${iconVariants[variant]}
        ${className}
      `}
      aria-label={ariaLabel}
      {...props}
    >
      {icon}
    </motion.button>
  );
};

// ============================================================================
// Ghost Button - Text Only
// ============================================================================

export const GhostButton: React.FC<ButtonProps> = ({
  children,
  disabled = false,
  haptic = true,
  className = '',
  onClick,
  ...props
}) => {
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (haptic && !disabled) {
        triggerHaptic('light');
      }
      onClick?.(e);
    },
    [haptic, disabled, onClick]
  );

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      className={`
        px-4 py-2
        text-white/60 font-medium
        transition-colors duration-200
        hover:text-white
        focus:outline-none
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.button>
  );
};

// ============================================================================
// Pill Button - Compact rounded
// ============================================================================

export const PillButton: React.FC<ButtonProps & { active?: boolean }> = ({
  children,
  active = false,
  disabled = false,
  haptic = true,
  className = '',
  onClick,
  ...props
}) => {
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (haptic && !disabled) {
        triggerHaptic('light');
      }
      onClick?.(e);
    },
    [haptic, disabled, onClick]
  );

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      className={`
        px-4 py-2
        rounded-full
        text-sm font-medium
        transition-all duration-200
        focus:outline-none
        disabled:opacity-50 disabled:cursor-not-allowed
        ${active
          ? 'bg-white text-zinc-900'
          : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:text-white'
        }
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default PrimaryButton;
