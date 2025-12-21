/**
 * ExerciseCard - Premium Glass Exercise Card
 *
 * Dreamkit-style glass card with depth, grain texture, and subtle animations.
 * Shows exercise name, set progress, and current weight/reps.
 *
 * @module ui/workout/ExerciseCard
 */

import React from 'react';
import { motion } from 'framer-motion';
import { SetDots } from './SetDots';

interface ExerciseCardProps {
  name: string;
  notes?: string;
  totalSets: number;
  completedSets: number;
  currentSet: number;
  weight: number;
  targetReps: number;
  onSetDone: () => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  name,
  notes,
  totalSets,
  completedSets,
  currentSet,
  weight,
  targetReps,
  onSetDone,
}) => {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
      className="
        relative overflow-hidden
        rounded-3xl
        bg-white/5
        border border-white/10
        backdrop-blur-xl
        shadow-[0_20px_70px_-30px_rgba(0,0,0,0.8)]
        p-6
      "
    >
      {/* Grain texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Inner glow at top */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Exercise Name */}
        <h2 className="text-2xl font-semibold tracking-tight text-white mb-1">
          {name}
        </h2>

        {/* Trainer Notes */}
        {notes && (
          <p className="text-sm text-white/50 mb-6 leading-relaxed">
            {notes}
          </p>
        )}

        {/* Set Dots */}
        <div className="my-8">
          <SetDots
            total={totalSets}
            completed={completedSets}
            current={currentSet}
          />
        </div>

        {/* Current Set Info */}
        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-3">
            Set {currentSet + 1}
          </p>

          {/* Weight Display */}
          <div className="flex items-baseline justify-center gap-2 mb-2">
            <span className="text-5xl font-semibold tabular-nums text-white">
              {weight}
            </span>
            <span className="text-lg text-white/50">kg</span>
          </div>

          {/* Target Reps */}
          <p className="text-white/70">
            Target: {targetReps} reps
          </p>
        </div>

        {/* Set Done Button */}
        <motion.button
          onClick={onSetDone}
          whileTap={{ scale: 0.99 }}
          whileHover={{ scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="
            w-full h-14
            rounded-2xl
            bg-gradient-to-r from-indigo-500/90 via-sky-500/90 to-cyan-400/90
            shadow-[0_18px_50px_-18px_rgba(56,189,248,0.7)]
            text-white font-semibold
            tracking-wide
            transition-all duration-200
            active:scale-[0.99]
            focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:ring-offset-2 focus:ring-offset-transparent
          "
          aria-label="Mark set as done"
        >
          ✓ Set Done
        </motion.button>
      </div>
    </motion.article>
  );
};

export default ExerciseCard;
