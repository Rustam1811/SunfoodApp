/**
 * RestTimerOverlay - Premium Full-Screen Rest Timer
 *
 * Full-screen overlay with animated progress ring and countdown.
 * Features haptic feedback on completion and skip capability.
 *
 * @module ui/workout/RestTimerOverlay
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RestTimerOverlayProps {
  isOpen: boolean;
  duration: number;
  nextExercise?: string;
  nextSet?: number;
  onComplete: () => void;
  onSkip: () => void;
}

// Haptic feedback utility
const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if ('vibrate' in navigator) {
    const patterns = {
      light: 10,
      medium: 30,
      heavy: [50, 30, 50],
    };
    navigator.vibrate(patterns[type]);
  }
};

export const RestTimerOverlay: React.FC<RestTimerOverlayProps> = ({
  isOpen,
  duration,
  nextExercise,
  nextSet,
  onComplete,
  onSkip,
}) => {
  const [remaining, setRemaining] = useState(duration);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  // Reset timer when opening
  useEffect(() => {
    if (isOpen) {
      setRemaining(duration);
      startTimeRef.current = Date.now();
    }
  }, [isOpen, duration]);

  // Timer logic
  useEffect(() => {
    if (!isOpen) return;

    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const newRemaining = Math.max(0, duration - elapsed);
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
  }, [isOpen, duration, onComplete]);

  const handleSkip = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    triggerHaptic('light');
    onSkip();
  }, [onSkip]);

  // Ring calculations
  const progress = 1 - remaining / duration;
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference * (1 - progress);

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0
      ? `${mins}:${secs.toString().padStart(2, '0')}`
      : `${secs}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="
            fixed inset-0 z-50
            flex flex-col items-center justify-center
            bg-gradient-to-b from-zinc-950 via-neutral-950 to-zinc-950
          "
          role="dialog"
          aria-modal="true"
          aria-label="Rest timer"
        >
          {/* Grain overlay */}
          <div
            className="absolute inset-0 opacity-[0.02] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.6) 100%)',
            }}
          />

          {/* Timer Ring */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 20 }}
            className="relative mb-10"
          >
            <svg
              width="220"
              height="220"
              className="-rotate-90"
              aria-hidden="true"
            >
              {/* Background ring */}
              <circle
                cx="110"
                cy="110"
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="6"
              />

              {/* Progress ring */}
              <motion.circle
                cx="110"
                cy="110"
                r={radius}
                fill="none"
                stroke="url(#timerGradient)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: strokeOffset }}
                transition={{ duration: 0.3, ease: 'linear' }}
              />

              {/* Gradient definition */}
              <defs>
                <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="50%" stopColor="#0ea5e9" />
                  <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
              </defs>
            </svg>

            {/* Time display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                key={remaining}
                initial={{ scale: 1.1, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-6xl font-semibold tabular-nums text-white"
              >
                {formatTime(remaining)}
              </motion.span>
              <span className="text-xs uppercase tracking-[0.2em] text-white/40 mt-2">
                Rest
              </span>
            </div>

            {/* Glow effect behind ring */}
            <div
              className="absolute inset-0 -z-10 blur-3xl opacity-30"
              style={{
                background: 'radial-gradient(circle, rgba(56,189,248,0.4) 0%, transparent 70%)',
              }}
            />
          </motion.div>

          {/* Next Up Info */}
          {nextExercise && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-12"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-2">
                Up Next
              </p>
              <p className="text-white/70">
                {nextExercise}
                {nextSet && (
                  <span className="text-white/40"> · Set {nextSet}</span>
                )}
              </p>
            </motion.div>
          )}

          {/* Skip Button */}
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            onClick={handleSkip}
            whileTap={{ scale: 0.95 }}
            className="
              px-8 py-3
              rounded-full
              bg-white/5
              border border-white/10
              backdrop-blur-sm
              text-xs uppercase tracking-[0.2em] text-white/50
              hover:bg-white/10 hover:text-white/70
              transition-all duration-200
            "
            aria-label="Skip rest timer"
          >
            Skip
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RestTimerOverlay;
