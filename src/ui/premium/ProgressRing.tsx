/**
 * ProgressRing - Animated Circular Progress Indicator
 *
 * Premium progress ring with gradient stroke and glow.
 * Supports value display in center and smooth animations.
 *
 * @module ui/premium/ProgressRing
 */

import React from 'react';
import { motion } from 'framer-motion';

interface ProgressRingProps {
  /** Progress value 0-100 */
  value: number;
  /** Ring size in pixels */
  size?: number;
  /** Stroke thickness */
  strokeWidth?: number;
  /** Show value in center */
  showValue?: boolean;
  /** Custom label in center */
  label?: string;
  /** Gradient ID (for multiple rings) */
  gradientId?: string;
  /** Color theme */
  theme?: 'primary' | 'success' | 'warning' | 'neutral';
  className?: string;
}

const themeColors = {
  primary: {
    start: '#6366f1',
    mid: '#0ea5e9',
    end: '#22d3ee',
    glow: 'rgba(56, 189, 248, 0.4)',
  },
  success: {
    start: '#22c55e',
    mid: '#16a34a',
    end: '#15803d',
    glow: 'rgba(34, 197, 94, 0.4)',
  },
  warning: {
    start: '#f59e0b',
    mid: '#d97706',
    end: '#b45309',
    glow: 'rgba(245, 158, 11, 0.4)',
  },
  neutral: {
    start: '#71717a',
    mid: '#52525b',
    end: '#3f3f46',
    glow: 'rgba(113, 113, 122, 0.3)',
  },
};

export const ProgressRing: React.FC<ProgressRingProps> = ({
  value,
  size = 120,
  strokeWidth = 8,
  showValue = true,
  label,
  gradientId = 'progress-gradient',
  theme = 'primary',
  className = '',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;
  const colors = themeColors[theme];

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {/* Glow effect */}
      <div
        className="absolute inset-0 rounded-full blur-xl opacity-30"
        style={{ backgroundColor: colors.glow }}
        aria-hidden="true"
      />

      <svg width={size} height={size} className="-rotate-90">
        {/* Gradient definition */}
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.start} />
            <stop offset="50%" stopColor={colors.mid} />
            <stop offset="100%" stopColor={colors.end} />
          </linearGradient>
        </defs>

        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
        />

        {/* Progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </svg>

      {/* Center content */}
      {(showValue || label) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {showValue && (
            <span className="text-2xl font-semibold tabular-nums text-white">
              {Math.round(value)}%
            </span>
          )}
          {label && (
            <span className="text-xs uppercase tracking-wider text-white/50 mt-0.5">
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * MiniProgressRing - Compact version for inline use
 */
export const MiniProgressRing: React.FC<{
  value: number;
  size?: number;
  theme?: 'primary' | 'success' | 'warning' | 'neutral';
  className?: string;
}> = ({ value, size = 24, theme = 'primary', className = '' }) => {
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;
  const colors = themeColors[theme];

  return (
    <svg
      width={size}
      height={size}
      className={`-rotate-90 ${className}`}
      aria-hidden="true"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255, 255, 255, 0.1)"
        strokeWidth={strokeWidth}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={colors.start}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
    </svg>
  );
};

export default ProgressRing;
