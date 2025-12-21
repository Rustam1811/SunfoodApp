/**
 * AppShell - Premium Dark App Container
 *
 * Full-screen container with grain texture, vignette, and safe areas.
 * Provides the base layer for all premium dark screens.
 *
 * @module ui/premium/AppShell
 */

import React from 'react';
import { motion } from 'framer-motion';

interface AppShellProps {
  children: React.ReactNode;
  className?: string;
  /** Show grain texture overlay */
  grain?: boolean;
  /** Show vignette effect */
  vignette?: boolean;
  /** Ambient glow position */
  ambientGlow?: 'top' | 'center' | 'bottom' | 'none';
}

// Grain SVG as data URI for performance
const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`;

export const AppShell: React.FC<AppShellProps> = ({
  children,
  className = '',
  grain = true,
  vignette = true,
  ambientGlow = 'top',
}) => {
  const glowStyles: Record<string, React.CSSProperties> = {
    top: {
      background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(99, 102, 241, 0.15), transparent 50%)',
    },
    center: {
      background: 'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(99, 102, 241, 0.1), transparent 60%)',
    },
    bottom: {
      background: 'radial-gradient(ellipse 80% 50% at 50% 100%, rgba(56, 189, 248, 0.12), transparent 50%)',
    },
    none: {},
  };

  return (
    <div
      className={`
        relative min-h-screen w-full overflow-hidden
        bg-gradient-to-b from-zinc-950 via-neutral-950 to-zinc-950
        ${className}
      `}
    >
      {/* Ambient glow */}
      {ambientGlow !== 'none' && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={glowStyles[ambientGlow]}
          aria-hidden="true"
        />
      )}

      {/* Grain texture */}
      {grain && (
        <div
          className="fixed inset-0 pointer-events-none opacity-[0.025]"
          style={{ backgroundImage: GRAIN_SVG }}
          aria-hidden="true"
        />
      )}

      {/* Vignette */}
      {vignette && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.5) 100%)',
          }}
          aria-hidden="true"
        />
      )}

      {/* Content with safe areas */}
      <div
        className="relative z-10 min-h-screen"
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          paddingLeft: 'env(safe-area-inset-left, 0px)',
          paddingRight: 'env(safe-area-inset-right, 0px)',
        }}
      >
        {children}
      </div>
    </div>
  );
};

/**
 * BottomSafeArea - Safe area spacer for bottom content
 */
export const BottomSafeArea: React.FC<{ className?: string; minHeight?: number }> = ({
  className = '',
  minHeight = 20,
}) => (
  <div
    className={className}
    style={{
      height: `max(env(safe-area-inset-bottom, ${minHeight}px), ${minHeight}px)`,
    }}
    aria-hidden="true"
  />
);

/**
 * PageTransition - Wrapper for page-level animations
 */
export const PageTransition: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{
      type: 'spring',
      stiffness: 300,
      damping: 30,
    }}
    className={className}
  >
    {children}
  </motion.div>
);

export default AppShell;
