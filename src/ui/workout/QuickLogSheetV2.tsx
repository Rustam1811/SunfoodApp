/**
 * QuickLogSheetV2 - Premium Weight/Reps Input Bottom Sheet
 *
 * Bottom sheet with glass morphism for logging set results.
 * Features stepper controls with haptic feedback, smooth animations,
 * and support for skipping sets.
 *
 * @module ui/workout/QuickLogSheetV2
 */

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, MinusIcon, PlusIcon, CheckIcon } from '@heroicons/react/24/solid';

// ============================================================================
// Types
// ============================================================================

interface QuickLogSheetV2Props {
  isOpen: boolean;
  exerciseName: string;
  setNumber: number;
  totalSets: number;
  defaultWeight: number;
  defaultReps: number;
  onSave: (weight: number, reps: number) => void;
  onSkip: () => void;
  onClose: () => void;
}

// ============================================================================
// Haptic Feedback
// ============================================================================

const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if ('vibrate' in navigator) {
    const patterns = { light: 10, medium: 20, heavy: 40 };
    navigator.vibrate(patterns[type]);
  }
};

// ============================================================================
// Stepper Component
// ============================================================================

interface StepperProps {
  label: string;
  value: number;
  step: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  unit?: string;
  size?: 'sm' | 'lg';
}

const Stepper: React.FC<StepperProps> = ({
  label,
  value,
  step,
  min,
  max,
  onChange,
  unit,
  size = 'lg',
}) => {
  const handleDecrement = useCallback(() => {
    const newValue = Math.max(min, value - step);
    onChange(newValue);
    triggerHaptic('light');
  }, [value, step, min, onChange]);

  const handleIncrement = useCallback(() => {
    const newValue = Math.min(max, value + step);
    onChange(newValue);
    triggerHaptic('light');
  }, [value, step, max, onChange]);

  // Long press for continuous change
  const holdRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const valueRef = React.useRef(value);
  React.useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const startHold = useCallback(
    (direction: 'inc' | 'dec') => {
      let count = 0;
      holdRef.current = setInterval(() => {
        count++;
        // Accelerate after a few ticks
        const currentStep = count > 5 ? step * 2 : step;
        if (direction === 'inc') {
          const newVal = Math.min(max, valueRef.current + currentStep);
          valueRef.current = newVal;
          onChange(newVal);
        } else {
          const newVal = Math.max(min, valueRef.current - currentStep);
          valueRef.current = newVal;
          onChange(newVal);
        }
        triggerHaptic('light');
      }, 150);
    },
    [step, min, max, onChange]
  );

  const stopHold = useCallback(() => {
    if (holdRef.current) {
      clearInterval(holdRef.current);
      holdRef.current = null;
    }
  }, []);

  const buttonSize = size === 'lg' ? 'w-14 h-14' : 'w-12 h-12';
  const textSize = size === 'lg' ? 'text-5xl' : 'text-4xl';
  const iconSize = size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';

  return (
    <div className="flex flex-col items-center">
      <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-3">
        {label}
      </p>
      <div className="flex items-center gap-4">
        {/* Decrement */}
        <motion.button
          onClick={handleDecrement}
          onMouseDown={() => startHold('dec')}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          onTouchStart={() => startHold('dec')}
          onTouchEnd={stopHold}
          whileTap={{ scale: 0.92 }}
          disabled={value <= min}
          className={`
            ${buttonSize}
            rounded-full
            bg-white/10
            border border-white/10
            backdrop-blur-sm
            flex items-center justify-center
            text-white
            disabled:opacity-30 disabled:cursor-not-allowed
            transition-colors
            hover:bg-white/15
            active:bg-white/20
          `}
          aria-label={`Decrease ${label.toLowerCase()}`}
        >
          <MinusIcon className={iconSize} />
        </motion.button>

        {/* Value */}
        <div className="flex items-baseline justify-center min-w-[90px]">
          <motion.span
            key={value}
            initial={{ scale: 1.1, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`${textSize} font-semibold tabular-nums text-white`}
          >
            {value}
          </motion.span>
          {unit && <span className="text-lg text-white/50 ml-1">{unit}</span>}
        </div>

        {/* Increment */}
        <motion.button
          onClick={handleIncrement}
          onMouseDown={() => startHold('inc')}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          onTouchStart={() => startHold('inc')}
          onTouchEnd={stopHold}
          whileTap={{ scale: 0.92 }}
          disabled={value >= max}
          className={`
            ${buttonSize}
            rounded-full
            bg-white/10
            border border-white/10
            backdrop-blur-sm
            flex items-center justify-center
            text-white
            disabled:opacity-30 disabled:cursor-not-allowed
            transition-colors
            hover:bg-white/15
            active:bg-white/20
          `}
          aria-label={`Increase ${label.toLowerCase()}`}
        >
          <PlusIcon className={iconSize} />
        </motion.button>
      </div>
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export const QuickLogSheetV2: React.FC<QuickLogSheetV2Props> = ({
  isOpen,
  exerciseName,
  setNumber,
  totalSets,
  defaultWeight,
  defaultReps,
  onSave,
  onSkip,
  onClose,
}) => {
  const [weight, setWeight] = useState(defaultWeight);
  const [reps, setReps] = useState(defaultReps);

  // Reset values when opening
  useEffect(() => {
    if (isOpen) {
      setWeight(defaultWeight);
      setReps(defaultReps);
    }
  }, [isOpen, defaultWeight, defaultReps]);

  const handleSave = useCallback(() => {
    triggerHaptic('medium');
    onSave(weight, reps);
  }, [weight, reps, onSave]);

  const handleSkip = useCallback(() => {
    triggerHaptic('light');
    onSkip();
  }, [onSkip]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 300,
            }}
            className="
              fixed bottom-0 left-0 right-0 z-50
              rounded-t-3xl
              bg-gradient-to-b from-zinc-900/98 to-zinc-950/99
              border-t border-white/10
              backdrop-blur-xl
              shadow-[0_-20px_70px_-20px_rgba(0,0,0,0.9)]
              pb-safe
            "
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-log-title"
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

            {/* Header */}
            <div className="relative z-10 px-6 pt-2 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2
                    id="quick-log-title"
                    className="text-lg font-semibold text-white"
                  >
                    {exerciseName}
                  </h2>
                  <p className="text-sm text-white/40">
                    Set {setNumber} of {totalSets}
                  </p>
                </div>
                <motion.button
                  onClick={onClose}
                  whileTap={{ scale: 0.92 }}
                  className="
                    w-10 h-10
                    rounded-full
                    bg-white/5
                    border border-white/10
                    flex items-center justify-center
                    text-white/60
                    hover:bg-white/10
                    transition-colors
                  "
                  aria-label="Close"
                >
                  <XMarkIcon className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Steppers */}
            <div className="relative z-10 px-6 py-6">
              <div className="flex items-start justify-around gap-6">
                <Stepper
                  label="Weight"
                  value={weight}
                  step={2.5}
                  min={0}
                  max={500}
                  onChange={setWeight}
                  unit="kg"
                />
                <Stepper
                  label="Reps"
                  value={reps}
                  step={1}
                  min={0}
                  max={100}
                  onChange={setReps}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="relative z-10 px-6 pb-6 flex gap-3">
              {/* Skip Button */}
              <motion.button
                onClick={handleSkip}
                whileTap={{ scale: 0.98 }}
                className="
                  flex-1
                  h-14
                  rounded-2xl
                  bg-white/5
                  border border-white/10
                  text-white/70 font-medium
                  transition-colors
                  hover:bg-white/10
                  hover:text-white
                "
              >
                Skip Set
              </motion.button>

              {/* Save Button */}
              <motion.button
                onClick={handleSave}
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: 1.01 }}
                className="
                  flex-[2]
                  h-14
                  rounded-2xl
                  bg-gradient-to-r from-indigo-500/90 via-sky-500/90 to-cyan-400/90
                  shadow-[0_18px_50px_-18px_rgba(56,189,248,0.7)]
                  text-white font-semibold
                  flex items-center justify-center gap-2
                  transition-all
                "
              >
                <CheckIcon className="w-5 h-5" />
                Log Set
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default QuickLogSheetV2;
