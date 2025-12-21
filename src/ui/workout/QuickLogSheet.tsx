/**
 * QuickLogSheet - Premium Weight/Reps Input Overlay
 *
 * Bottom sheet with glass morphism for logging set results.
 * Features stepper controls with haptic feedback and smooth animations.
 *
 * @module ui/workout/QuickLogSheet
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/solid';

interface QuickLogSheetProps {
  isOpen: boolean;
  exerciseName: string;
  setNumber: number;
  defaultWeight: number;
  defaultReps: number;
  onSave: (weight: number, reps: number) => void;
  onClose: () => void;
}

// Haptic feedback utility
const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if ('vibrate' in navigator) {
    const patterns = {
      light: 10,
      medium: 20,
      heavy: 40,
    };
    navigator.vibrate(patterns[type]);
  }
};

interface StepperProps {
  label: string;
  value: number;
  step: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  unit?: string;
}

const Stepper: React.FC<StepperProps> = ({
  label,
  value,
  step,
  min,
  max,
  onChange,
  unit,
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

  return (
    <div className="mb-6">
      <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-4">
        {label}
      </p>
      <div className="flex items-center justify-center gap-6">
        {/* Decrement */}
        <motion.button
          onClick={handleDecrement}
          whileTap={{ scale: 0.92 }}
          disabled={value <= min}
          className="
            w-14 h-14
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
          "
          aria-label={`Decrease ${label.toLowerCase()}`}
        >
          <MinusIcon className="w-5 h-5" />
        </motion.button>

        {/* Value */}
        <div className="flex items-baseline justify-center min-w-[100px]">
          <span className="text-5xl font-semibold tabular-nums text-white">
            {value}
          </span>
          {unit && (
            <span className="text-lg text-white/50 ml-1">{unit}</span>
          )}
        </div>

        {/* Increment */}
        <motion.button
          onClick={handleIncrement}
          whileTap={{ scale: 0.92 }}
          disabled={value >= max}
          className="
            w-14 h-14
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
          "
          aria-label={`Increase ${label.toLowerCase()}`}
        >
          <PlusIcon className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
};

export const QuickLogSheet: React.FC<QuickLogSheetProps> = ({
  isOpen,
  exerciseName,
  setNumber,
  defaultWeight,
  defaultReps,
  onSave,
  onClose,
}) => {
  const [weight, setWeight] = useState(defaultWeight);
  const [reps, setReps] = useState(defaultReps);

  // Reset values when opening
  React.useEffect(() => {
    if (isOpen) {
      setWeight(defaultWeight);
      setReps(defaultReps);
    }
  }, [isOpen, defaultWeight, defaultReps]);

  const handleSave = useCallback(() => {
    triggerHaptic('medium');
    onSave(weight, reps);
  }, [weight, reps, onSave]);

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
              bg-gradient-to-b from-zinc-900/95 to-zinc-950/98
              border-t border-white/10
              backdrop-blur-xl
              shadow-[0_-20px_70px_-20px_rgba(0,0,0,0.9)]
              p-6 pb-10
            "
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-log-title"
          >
            {/* Drag Handle */}
            <div className="flex justify-center mb-4">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* Header */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-1">
                  Set {setNumber}
                </p>
                <h2
                  id="quick-log-title"
                  className="text-xl font-semibold tracking-tight text-white"
                >
                  {exerciseName}
                </h2>
              </div>
              <motion.button
                onClick={onClose}
                whileTap={{ scale: 0.9 }}
                className="
                  w-10 h-10
                  rounded-full
                  bg-white/10
                  flex items-center justify-center
                  text-white/60
                  hover:bg-white/15
                  transition-colors
                "
                aria-label="Close"
              >
                <XMarkIcon className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Steppers */}
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
              min={1}
              max={100}
              onChange={setReps}
            />

            {/* Save Button */}
            <motion.button
              onClick={handleSave}
              whileTap={{ scale: 0.98 }}
              className="
                w-full h-14 mt-4
                rounded-2xl
                bg-gradient-to-r from-indigo-500/90 via-sky-500/90 to-cyan-400/90
                shadow-[0_18px_50px_-18px_rgba(56,189,248,0.7)]
                text-white font-semibold
                tracking-wide
                transition-all duration-200
                active:scale-[0.99]
                focus:outline-none focus:ring-2 focus:ring-sky-400/50
              "
              aria-label="Save set result"
            >
              Save
            </motion.button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default QuickLogSheet;
