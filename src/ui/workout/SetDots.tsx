/**
 * SetDots - Premium Set Progress Indicator
 *
 * Displays set completion status as animated dots with glass morphism.
 * Design: Dreamkit-level depth with glow effects.
 *
 * @module ui/workout/SetDots
 */

import React from 'react';
import { motion } from 'framer-motion';

interface SetDotsProps {
  total: number;
  completed: number;
  current: number;
}

export const SetDots: React.FC<SetDotsProps> = ({ total, completed, current }) => {
  return (
    <div
      className="flex items-center justify-center gap-3"
      role="progressbar"
      aria-valuenow={completed}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label={`Set ${completed} of ${total} completed`}
    >
      {Array.from({ length: total }).map((_, index) => {
        const isCompleted = index < completed;
        const isCurrent = index === current;

        return (
          <motion.div
            key={index}
            initial={false}
            animate={{
              scale: isCurrent ? 1.4 : 1,
              opacity: isCompleted ? 1 : isCurrent ? 1 : 0.3,
            }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 25,
            }}
            className="relative"
          >
            {/* Glow effect for completed/current */}
            {(isCompleted || isCurrent) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 rounded-full blur-sm"
                style={{
                  backgroundColor: isCompleted
                    ? 'rgba(56, 189, 248, 0.5)'
                    : 'rgba(255, 255, 255, 0.3)',
                }}
              />
            )}

            {/* Dot */}
            <div
              className={`
                relative w-3 h-3 rounded-full transition-colors duration-300
                ${isCompleted
                  ? 'bg-gradient-to-br from-sky-400 to-cyan-400'
                  : isCurrent
                    ? 'bg-white'
                    : 'bg-white/20 border border-white/10'
                }
              `}
            />

            {/* Inner shine for completed */}
            {isCompleted && (
              <div className="absolute inset-0.5 rounded-full bg-white/30" />
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default SetDots;
