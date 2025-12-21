/**
 * ExerciseModal - Full-Screen Exercise Execution Modal
 *
 * Premium full-screen modal for executing an exercise. Includes:
 * - Collapsible coach video player
 * - Set buttons with states (pending/completed/skipped)
 * - Quick edit via bottom sheet
 * - Rest timer overlay (bottom third)
 * - Record video button
 *
 * @module ui/workout/ExerciseModal
 */

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  ChevronLeftIcon,
  VideoCameraIcon,
  CheckIcon,
  ForwardIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/solid';
import { CoachVideoPlayer } from './CoachVideoPlayer';
import { QuickLogSheetV2 } from './QuickLogSheetV2';
import { RestTimerOverlayCompact } from './RestTimerOverlayCompact';
import type { LoggedSet, SetStatus } from '../../services/workoutLogService';

// ============================================================================
// Types
// ============================================================================

export interface ExerciseSet {
  setNumber: number;
  targetReps: number;
  targetWeight: number;
  restSeconds: number;
  status: SetStatus;
  actualReps?: number;
  actualWeight?: number;
}

export interface ExerciseData {
  id: string;
  name: string;
  description?: string;
  coachVideoUrl?: string;
  thumbnailUrl?: string;
  notes?: string;
  sets: ExerciseSet[];
}

interface ExerciseModalProps {
  isOpen: boolean;
  exercise: ExerciseData;
  exerciseIndex: number;
  totalExercises: number;
  onSetComplete: (setIndex: number, actualWeight: number, actualReps: number) => void;
  onSetSkip: (setIndex: number) => void;
  onExerciseComplete: () => void;
  onClose: () => void;
  onRecordVideo?: () => void;
}

// ============================================================================
// Haptic Feedback
// ============================================================================

const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if ('vibrate' in navigator) {
    const patterns = { light: 10, medium: 25, heavy: [40, 20, 40] };
    navigator.vibrate(patterns[type]);
  }
};

// ============================================================================
// Set Button Component
// ============================================================================

interface SetButtonProps {
  setNumber: number;
  status: SetStatus;
  targetReps: number;
  targetWeight: number;
  actualReps?: number;
  actualWeight?: number;
  isActive: boolean;
  onClick: () => void;
}

const SetButton: React.FC<SetButtonProps> = ({
  setNumber,
  status,
  targetReps,
  targetWeight,
  actualReps,
  actualWeight,
  isActive,
  onClick,
}) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400';
      case 'skipped':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-400/70';
      default:
        return isActive
          ? 'bg-white/10 border-cyan-400/50 text-white ring-2 ring-cyan-400/30'
          : 'bg-white/5 border-white/10 text-white/60';
    }
  };

  const displayWeight = status === 'completed' && actualWeight !== undefined ? actualWeight : targetWeight;
  const displayReps = status === 'completed' && actualReps !== undefined ? actualReps : targetReps;

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      disabled={status === 'completed' || status === 'skipped'}
      className={`
        relative
        w-full
        p-4
        rounded-2xl
        border
        ${getStatusStyles()}
        transition-all duration-200
        disabled:cursor-default
      `}
    >
      <div className="flex items-center justify-between">
        {/* Set Number */}
        <div className="flex items-center gap-3">
          <div
            className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
              ${status === 'completed' ? 'bg-emerald-500 text-white' : ''}
              ${status === 'skipped' ? 'bg-amber-500/30 text-amber-400' : ''}
              ${status === 'pending' ? 'bg-white/10 text-white/70' : ''}
            `}
          >
            {status === 'completed' ? (
              <CheckIcon className="w-4 h-4" />
            ) : status === 'skipped' ? (
              <ForwardIcon className="w-4 h-4" />
            ) : (
              setNumber
            )}
          </div>
          <span className="text-sm font-medium">Set {setNumber}</span>
        </div>

        {/* Weight x Reps */}
        <div className="text-right">
          <p className="text-lg font-semibold tabular-nums">
            {displayWeight}kg × {displayReps}
          </p>
          {status === 'completed' && actualWeight !== targetWeight && (
            <p className="text-xs text-white/40 line-through">
              {targetWeight}kg × {targetReps}
            </p>
          )}
        </div>
      </div>

      {/* Active indicator glow */}
      {isActive && status === 'pending' && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            boxShadow: '0 0 30px rgba(56, 189, 248, 0.3)',
          }}
        />
      )}
    </motion.button>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export const ExerciseModal: React.FC<ExerciseModalProps> = ({
  isOpen,
  exercise,
  exerciseIndex,
  totalExercises,
  onSetComplete,
  onSetSkip,
  onExerciseComplete,
  onClose,
  onRecordVideo,
}) => {
  const [isVideoCollapsed, setIsVideoCollapsed] = useState(true);
  const [showQuickLog, setShowQuickLog] = useState(false);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [activeSetIndex, setActiveSetIndex] = useState<number>(0);
  const [restDuration, setRestDuration] = useState(60);

  // Find first pending set
  const firstPendingSetIndex = useMemo(() => {
    const idx = exercise.sets.findIndex((s) => s.status === 'pending');
    return idx >= 0 ? idx : exercise.sets.length;
  }, [exercise.sets]);

  // Update active set when sets change
  React.useEffect(() => {
    setActiveSetIndex(firstPendingSetIndex);
  }, [firstPendingSetIndex]);

  // Check if all sets complete
  const allSetsComplete = useMemo(() => {
    return exercise.sets.every((s) => s.status !== 'pending');
  }, [exercise.sets]);

  // Handle set button click
  const handleSetClick = useCallback(
    (index: number) => {
      const set = exercise.sets[index];
      if (set.status !== 'pending') return;

      triggerHaptic('light');
      setActiveSetIndex(index);
      setShowQuickLog(true);
    },
    [exercise.sets]
  );

  // Handle quick log save
  const handleQuickLogSave = useCallback(
    (weight: number, reps: number) => {
      onSetComplete(activeSetIndex, weight, reps);
      setShowQuickLog(false);

      // Show rest timer if not last set
      const currentSet = exercise.sets[activeSetIndex];
      const nextPendingIndex = exercise.sets.findIndex(
        (s, i) => i > activeSetIndex && s.status === 'pending'
      );

      if (nextPendingIndex >= 0) {
        setRestDuration(currentSet.restSeconds);
        setShowRestTimer(true);
      }
    },
    [activeSetIndex, exercise.sets, onSetComplete]
  );

  // Handle quick log skip
  const handleQuickLogSkip = useCallback(() => {
    onSetSkip(activeSetIndex);
    setShowQuickLog(false);

    // Check if more pending sets
    const nextPendingIndex = exercise.sets.findIndex(
      (s, i) => i > activeSetIndex && s.status === 'pending'
    );

    if (nextPendingIndex >= 0) {
      setActiveSetIndex(nextPendingIndex);
    }
  }, [activeSetIndex, exercise.sets, onSetSkip]);

  // Handle rest timer complete
  const handleRestComplete = useCallback(() => {
    setShowRestTimer(false);
    // Move to next pending set
    const nextPendingIndex = exercise.sets.findIndex(
      (s, i) => i > activeSetIndex && s.status === 'pending'
    );
    if (nextPendingIndex >= 0) {
      setActiveSetIndex(nextPendingIndex);
    }
  }, [activeSetIndex, exercise.sets]);

  // Handle rest timer skip
  const handleRestSkip = useCallback(() => {
    setShowRestTimer(false);
    // Move to next pending set
    const nextPendingIndex = exercise.sets.findIndex(
      (s, i) => i > activeSetIndex && s.status === 'pending'
    );
    if (nextPendingIndex >= 0) {
      setActiveSetIndex(nextPendingIndex);
    }
  }, [activeSetIndex, exercise.sets]);

  // Handle close/back
  const handleClose = useCallback(() => {
    triggerHaptic('light');
    onClose();
  }, [onClose]);

  // Get current set for quick log defaults
  const currentSet = exercise.sets[activeSetIndex];

  // Calculate next exercise/set info for rest timer
  const nextSetNumber = useMemo(() => {
    const idx = exercise.sets.findIndex(
      (s, i) => i > activeSetIndex && s.status === 'pending'
    );
    return idx >= 0 ? exercise.sets[idx].setNumber : undefined;
  }, [exercise.sets, activeSetIndex]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-gradient-to-b from-zinc-950 via-neutral-950 to-zinc-950"
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
              background:
                'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)',
            }}
          />

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-safe">
              <div className="pt-4 flex items-center gap-3">
                <motion.button
                  onClick={handleClose}
                  whileTap={{ scale: 0.92 }}
                  className="
                    w-10 h-10
                    rounded-full
                    bg-white/5
                    border border-white/10
                    flex items-center justify-center
                    text-white/70
                    hover:bg-white/10
                    transition-colors
                  "
                  aria-label="Back"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </motion.button>
                <div>
                  <p className="text-xs text-white/40">
                    Exercise {exerciseIndex + 1} of {totalExercises}
                  </p>
                  <h1 className="text-xl font-semibold text-white">
                    {exercise.name}
                  </h1>
                </div>
              </div>

              {/* Record Video Button */}
              {onRecordVideo && (
                <motion.button
                  onClick={onRecordVideo}
                  whileTap={{ scale: 0.92 }}
                  className="
                    mt-4
                    w-10 h-10
                    rounded-full
                    bg-red-500/20
                    border border-red-500/30
                    flex items-center justify-center
                    text-red-400
                    hover:bg-red-500/30
                    transition-colors
                  "
                  aria-label="Record video"
                >
                  <VideoCameraIcon className="w-5 h-5" />
                </motion.button>
              )}
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-4 pt-4 pb-safe">
              {/* Coach Video Player */}
              {exercise.coachVideoUrl && (
                <div className="mb-6">
                  <CoachVideoPlayer
                    videoUrl={exercise.coachVideoUrl}
                    thumbnailUrl={exercise.thumbnailUrl}
                    exerciseName={exercise.name}
                    isCollapsed={isVideoCollapsed}
                    onToggleCollapse={setIsVideoCollapsed}
                  />
                </div>
              )}

              {/* Coach Notes */}
              {exercise.notes && (
                <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-start gap-3">
                    <InformationCircleIcon className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-white/70 leading-relaxed">
                      {exercise.notes}
                    </p>
                  </div>
                </div>
              )}

              {/* Sets List */}
              <div className="mb-6">
                <h2 className="text-xs uppercase tracking-[0.15em] text-white/40 mb-4">
                  Sets
                </h2>
                <div className="space-y-3">
                  {exercise.sets.map((set, index) => (
                    <SetButton
                      key={set.setNumber}
                      setNumber={set.setNumber}
                      status={set.status}
                      targetReps={set.targetReps}
                      targetWeight={set.targetWeight}
                      actualReps={set.actualReps}
                      actualWeight={set.actualWeight}
                      isActive={index === activeSetIndex}
                      onClick={() => handleSetClick(index)}
                    />
                  ))}
                </div>
              </div>

              {/* Complete Exercise Button (when all sets done) */}
              {allSetsComplete && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6"
                >
                  <motion.button
                    onClick={onExerciseComplete}
                    whileTap={{ scale: 0.98 }}
                    className="
                      w-full
                      h-14
                      rounded-2xl
                      bg-gradient-to-r from-emerald-500/90 to-cyan-500/90
                      shadow-[0_18px_50px_-18px_rgba(16,185,129,0.7)]
                      text-white font-semibold
                      flex items-center justify-center gap-2
                    "
                  >
                    <CheckIcon className="w-5 h-5" />
                    Complete Exercise
                  </motion.button>
                </motion.div>
              )}

              {/* Tap Pending Set Hint */}
              {!allSetsComplete && (
                <p className="text-center text-sm text-white/30 mb-6">
                  Tap a set to log your results
                </p>
              )}
            </div>
          </div>

          {/* Quick Log Sheet */}
          {currentSet && (
            <QuickLogSheetV2
              isOpen={showQuickLog}
              exerciseName={exercise.name}
              setNumber={currentSet.setNumber}
              totalSets={exercise.sets.length}
              defaultWeight={currentSet.targetWeight}
              defaultReps={currentSet.targetReps}
              onSave={handleQuickLogSave}
              onSkip={handleQuickLogSkip}
              onClose={() => setShowQuickLog(false)}
            />
          )}

          {/* Rest Timer Overlay */}
          <RestTimerOverlayCompact
            isOpen={showRestTimer}
            duration={restDuration}
            nextSetNumber={nextSetNumber}
            onComplete={handleRestComplete}
            onSkip={handleRestSkip}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExerciseModal;
