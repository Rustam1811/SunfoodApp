/**
 * GlassCard - Premium Glass Morphism Card
 *
 * Tactile glass card with depth, subtle border, and glow effects.
 * Supports press feedback and hover states.
 *
 * @module ui/premium/GlassCard
 */

import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: React.ReactNode;
  /** Visual depth level */
  depth?: 'flat' | 'raised' | 'floating';
  /** Enable press feedback animation */
  pressable?: boolean;
  /** Enable glow effect on hover/focus */
  glow?: boolean;
  /** Padding preset */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Border radius preset */
  radius?: 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  /** Additional class names */
  className?: string;
}

const paddingMap = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const radiusMap = {
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  xl: 'rounded-[20px]',
  '2xl': 'rounded-3xl',
  '3xl': 'rounded-[32px]',
};

const depthShadows = {
  flat: 'shadow-none',
  raised: 'shadow-[0_8px_32px_-12px_rgba(0,0,0,0.6)]',
  floating: 'shadow-[0_20px_70px_-30px_rgba(0,0,0,0.8)]',
};

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  depth = 'raised',
  pressable = false,
  glow = false,
  padding = 'md',
  radius = '2xl',
  className = '',
  ...motionProps
}) => {
  const baseStyles = `
    relative overflow-hidden
    bg-white/[0.03]
    border border-white/10
    backdrop-blur-xl
    ${radiusMap[radius]}
    ${paddingMap[padding]}
    ${depthShadows[depth]}
  `;

  const interactiveStyles = pressable
    ? 'cursor-pointer active:scale-[0.98] transition-transform duration-150'
    : '';

  const glowStyles = glow
    ? 'hover:border-white/20 hover:shadow-[0_20px_70px_-30px_rgba(99,102,241,0.3)]'
    : '';

  return (
    <motion.div
      className={`${baseStyles} ${interactiveStyles} ${glowStyles} ${className}`}
      whileTap={pressable ? { scale: 0.98 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      {...motionProps}
    >
      {/* Top edge highlight */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
        }}
        aria-hidden="true"
      />

      {/* Grain texture inside card */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};

/**
 * GlassPanel - Larger glass surface for sections
 */
export const GlassPanel: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div
    className={`
      relative overflow-hidden
      bg-white/[0.02]
      border border-white/[0.06]
      backdrop-blur-2xl
      rounded-3xl
      ${className}
    `}
  >
    {/* Subtle inner glow */}
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.03), transparent 60%)',
      }}
      aria-hidden="true"
    />
    <div className="relative z-10">{children}</div>
  </div>
);

/**
 * GlassDivider - Horizontal divider with glass effect
 */
export const GlassDivider: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`h-px ${className}`}
    style={{
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
    }}
    aria-hidden="true"
  />
);

export default GlassCard;
