/**
 * RestTimerOverlayCompact - Bottom Third Rest Timer
 *
 * Non-fullscreen rest timer overlay that appears at the bottom third
 * of the screen. Features animated progress ring and skip/add time controls.
 *
 * @module ui/workout/RestTimerOverlayCompact
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, PlusIcon, ForwardIcon } from '@heroicons/react/24/solid';

// ============================================================================
// Types
// ============================================================================

interface RestTimerOverlayCompactProps {
  isOpen: boolean;
  duration: number;
  nextExerciseName?: string;
  nextSetNumber?: number;
  onComplete: () => void;
  onSkip: () => void;
  onAddTime?: (seconds: number) => void;
}

// ============================================================================
// Haptic Feedback
// ============================================================================

const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if ('vibrate' in navigator) {
    const patterns = { light: 10, medium: 30, heavy: [50, 30, 50] };
    navigator.vibrate(patterns[type]);
  }
};

// ============================================================================
// Main Component
// ============================================================================

export const RestTimerOverlayCompact: React.FC<RestTimerOverlayCompactProps> = ({
  isOpen,
  duration,
  nextExerciseName,
  nextSetNumber,
  onComplete,
  onSkip,
  onAddTime,
}) => {
  const [remaining, setRemaining] = useState(duration);
  const [totalDuration, setTotalDuration] = useState(duration);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const addedTimeRef = useRef<number>(0);

  // Reset timer when opening
  useEffect(() => {
    if (isOpen) {
      setRemaining(duration);
      setTotalDuration(duration);
      startTimeRef.current = Date.now();
      addedTimeRef.current = 0;
    }
  }, [isOpen, duration]);

  // Timer logic
  useEffect(() => {
    if (!isOpen) return;

    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const newRemaining = Math.max(0, totalDuration + addedTimeRef.current - elapsed);
      setRemaining(newRemaining);

      if (newRemaining <= 0) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        triggerHaptic('heavy');
        onComplete();
      }
    }, 100);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isOpen, totalDuration, onComplete]);

  // Handle skip
  const handleSkip = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    triggerHaptic('light');
    onSkip();
  }, [onSkip]);

  // Handle add time
  const handleAddTime = useCallback(
    (seconds: number) => {
      triggerHaptic('light');
      addedTimeRef.current += seconds;
      setRemaining((prev) => prev + seconds);
      setTotalDuration((prev) => prev + seconds);
      onAddTime?.(seconds);
    },
    [onAddTime]
  );

  // Ring calculations
  const progress = 1 - remaining / (totalDuration + addedTimeRef.current);
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference * (1 - progress);

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0
      ? `${mins}:${secs.toString().padStart(2, '0')}`
      : `${secs}s`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Semi-transparent backdrop - tappable to skip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleSkip}
            className="fixed inset-0 z-40 bg-black/40"
            aria-hidden="true"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 300,
            }}
            className="
              fixed bottom-0 left-0 right-0 z-50
              h-[33vh] min-h-[240px] max-h-[320px]
              rounded-t-3xl
              bg-gradient-to-b from-zinc-900/98 to-zinc-950/99
              border-t border-white/10
              backdrop-blur-xl
              shadow-[0_-20px_70px_-20px_rgba(0,0,0,0.9)]
            "
            role="dialog"
            aria-modal="true"
            aria-label="Rest timer"
          >
            {/* Grain overlay */}
            <div
              className="absolute inset-0 opacity-[0.02] pointer-events-none rounded-t-3xl"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              }}
            />

            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center px-6 h-full">
              {/* Timer Row */}
              <div className="flex items-center justify-between w-full mb-4">
                {/* Ring + Time */}
                <div className="flex items-center gap-4">
                  {/* Animated Ring */}
                  <div className="relative">
                    <svg width="80" height="80" className="-rotate-90">
                      {/* Background ring */}
                      <circle
                        cx="40"
                        cy="40"
                        r={radius}
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="4"
                      />
                      {/* Progress ring */}
                      <motion.circle
                        cx="40"
                        cy="40"
                        r={radius}
                        fill="none"
                        stroke="url(#compactTimerGradient)"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        animate={{ strokeDashoffset: strokeOffset }}
                        transition={{ duration: 0.3, ease: 'linear' }}
                      />
                      <defs>
                        <linearGradient
                          id="compactTimerGradient"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="0%"
                        >
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#22d3ee" />
                        </linearGradient>
                      </defs>
                    </svg>

                    {/* Time inside ring */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.span
                        key={remaining}
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        className="text-xl font-semibold tabular-nums text-white"
                      >
                        {formatTime(remaining)}
                      </motion.span>
                    </div>
                  </div>

                  {/* Rest Label */}
                  <div>
                    <p className="text-xs uppercase tracking-[0.15em] text-white/40 mb-1">
                      Rest
                    </p>
                    <p className="text-lg font-semibold text-white">
                      {nextSetNumber
                        ? `Set ${nextSetNumber} next`
                        : nextExerciseName
                        ? 'Next exercise'
                        : 'Rest'}
                    </p>
                  </div>
                </div>

                {/* Skip Button */}
                <motion.button
                  onClick={handleSkip}
                  whileTap={{ scale: 0.95 }}
                  className="
                    flex items-center gap-2
                    px-5 py-3
                    rounded-full
                    bg-white/10
                    border border-white/10
                    text-white font-medium
                    transition-colors
                    hover:bg-white/15
                  "
                >
                  <ForwardIcon className="w-5 h-5" />
                  Skip
                </motion.button>
              </div>

              {/* Next Up (if provided) */}
              {nextExerciseName && (
                <div className="w-full p-3 rounded-xl bg-white/5 border border-white/5 mb-4">
                  <p className="text-xs text-white/40 mb-1">Up next</p>
                  <p className="text-sm font-medium text-white truncate">
                    {nextExerciseName}
                  </p>
                </div>
              )}

              {/* Add Time Buttons */}
              <div className="flex items-center gap-3 mt-auto mb-6">
                {[15, 30, 60].map((secs) => (
                  <motion.button
                    key={secs}
                    onClick={() => handleAddTime(secs)}
                    whileTap={{ scale: 0.95 }}
                    className="
                      flex items-center gap-1.5
                      px-4 py-2.5
                      rounded-full
                      bg-white/5
                      border border-white/10
                      text-sm text-white/70
                      transition-colors
                      hover:bg-white/10
                      hover:text-white
                    "
                  >
                    <PlusIcon className="w-4 h-4" />
                    {secs < 60 ? `${secs}s` : '1m'}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default RestTimerOverlayCompact;
