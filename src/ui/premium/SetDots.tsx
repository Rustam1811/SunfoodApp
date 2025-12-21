/**
 * SetDots - Premium Set Progress Indicator (Premium Version)
 *
 * Animated dot indicator for workout sets with glow effects.
 * Enhanced version with pulse animation for current set.
 *
 * @module ui/premium/SetDots
 */

import React from 'react';
import { motion } from 'framer-motion';

interface SetDotsProps {
  /** Total number of sets */
  total: number;
  /** Number of completed sets */
  completed: number;
  /** Current active set index (0-based) */
  current: number;
  /** Dot size preset */
  size?: 'sm' | 'md' | 'lg';
  /** Show labels (set numbers) */
  showLabels?: boolean;
  className?: string;
}

const dotSizes = {
  sm: { dot: 8, gap: 8, font: 'text-[10px]' },
  md: { dot: 12, gap: 12, font: 'text-xs' },
  lg: { dot: 16, gap: 16, font: 'text-sm' },
};

export const SetDots: React.FC<SetDotsProps> = ({
  total,
  completed,
  current,
  size = 'md',
  showLabels = false,
  className = '',
}) => {
  const { dot, gap, font } = dotSizes[size];

  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{ gap }}
      role="progressbar"
      aria-valuenow={completed}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label={`Set ${completed} of ${total} completed`}
    >
      {Array.from({ length: total }).map((_, index) => {
        const isCompleted = index < completed;
        const isCurrent = index === current;
        const isFuture = index > current;

        return (
          <div key={index} className="flex flex-col items-center">
            <motion.div
              initial={false}
              animate={{
                scale: isCurrent ? 1.3 : 1,
                opacity: isFuture ? 0.3 : 1,
              }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 25,
              }}
              className="relative"
            >
              {/* Glow for completed/current */}
              {(isCompleted || isCurrent) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1.5 }}
                  className="absolute inset-0 rounded-full blur-md"
                  style={{
                    width: dot,
                    height: dot,
                    backgroundColor: isCompleted
                      ? 'rgba(34, 211, 238, 0.5)'
                      : 'rgba(255, 255, 255, 0.3)',
                  }}
                  aria-hidden="true"
                />
              )}

              {/* Pulse animation for current */}
              {isCurrent && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    width: dot,
                    height: dot,
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  }}
                  animate={{
                    scale: [1, 1.8, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  aria-hidden="true"
                />
              )}

              {/* Dot */}
              <div
                className="relative rounded-full transition-colors duration-300"
                style={{
                  width: dot,
                  height: dot,
                  background: isCompleted
                    ? 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)'
                    : isCurrent
                      ? '#ffffff'
                      : 'rgba(255, 255, 255, 0.15)',
                  border: isFuture ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                }}
              >
                {/* Inner highlight for completed */}
                {isCompleted && (
                  <div
                    className="absolute inset-[2px] rounded-full"
                    style={{
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 50%)',
                    }}
                    aria-hidden="true"
                  />
                )}
              </div>
            </motion.div>

            {/* Label */}
            {showLabels && (
              <span
                className={`mt-1 tabular-nums ${font} ${
                  isCurrent
                    ? 'text-white font-medium'
                    : isCompleted
                      ? 'text-cyan-400'
                      : 'text-white/30'
                }`}
              >
                {index + 1}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

/**
 * SetDotsCompact - Horizontal line-based progress
 */
export const SetDotsCompact: React.FC<{
  total: number;
  completed: number;
  className?: string;
}> = ({ total, completed, className = '' }) => {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {Array.from({ length: total }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: index * 0.05, duration: 0.2 }}
          className="h-1 flex-1 rounded-full"
          style={{
            backgroundColor:
              index < completed
                ? 'rgb(34, 211, 238)'
                : 'rgba(255, 255, 255, 0.1)',
            transformOrigin: 'left',
          }}
        />
      ))}
    </div>
  );
};

export default SetDots;
