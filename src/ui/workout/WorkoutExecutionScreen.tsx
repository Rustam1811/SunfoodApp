/**
 * WorkoutExecutionScreen - Premium Workout Execution Page
 *
 * Dreamkit-level dark UI with glass morphism, grain texture, and vignette.
 * One-tap flow: Exercise → Set Done → QuickLog → Rest Timer → Next Set
 *
 * Features:
 * - Premium glass cards with depth
 * - Animated progress indicators
 * - Haptic feedback on interactions
 * - Full-screen rest timer with animated ring
 * - Local state management (mock data)
 *
 * @module ui/workout/WorkoutExecutionScreen
 */

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ChevronLeftIcon } from '@heroicons/react/24/solid';
import { ExerciseCard } from './ExerciseCard';
import { QuickLogSheet } from './QuickLogSheet';
import { RestTimerOverlay } from './RestTimerOverlay';

// ============================================================================
// Types
// ============================================================================

interface SetResult {
  setNumber: number;
  completed: boolean;
  weight?: number;
  reps?: number;
}

interface ExerciseResult {
  exerciseId: string;
  sets: SetResult[];
}

interface Exercise {
  id: string;
  name: string;
  notes?: string;
  sets: number;
  reps: number;
  weight: number;
  restTime: number;
}

interface WorkoutSession {
  id: string;
  title: string;
  exercises: Exercise[];
  results: ExerciseResult[];
  currentExerciseIndex: number;
  currentSetIndex: number;
  status: 'idle' | 'in_progress' | 'completed';
  startedAt?: Date;
  completedAt?: Date;
}

// ============================================================================
// Mock Data
// ============================================================================

const MOCK_SESSION: WorkoutSession = {
  id: 'session-001',
  title: 'Upper Body Strength',
  status: 'in_progress',
  startedAt: new Date(),
  currentExerciseIndex: 0,
  currentSetIndex: 0,
  exercises: [
    {
      id: 'ex-1',
      name: 'Bench Press',
      notes: 'Control the descent, explosive push. Keep shoulder blades retracted.',
      sets: 4,
      reps: 8,
      weight: 80,
      restTime: 90,
    },
    {
      id: 'ex-2',
      name: 'Incline Dumbbell Press',
      notes: 'Slight arch in lower back. Full range of motion.',
      sets: 4,
      reps: 10,
      weight: 30,
      restTime: 75,
    },
    {
      id: 'ex-3',
      name: 'Cable Fly',
      notes: 'Focus on the squeeze at the top. Keep elbows slightly bent.',
      sets: 3,
      reps: 12,
      weight: 15,
      restTime: 60,
    },
    {
      id: 'ex-4',
      name: 'Overhead Press',
      notes: 'Engage core throughout. Avoid excessive back arch.',
      sets: 4,
      reps: 8,
      weight: 50,
      restTime: 90,
    },
  ],
  results: [],
};

// ============================================================================
// Haptic Feedback
// ============================================================================

const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if ('vibrate' in navigator) {
    const patterns = {
      light: 10,
      medium: 25,
      heavy: [40, 20, 40],
    };
    navigator.vibrate(patterns[type]);
  }
};

// ============================================================================
// Completion Screen
// ============================================================================

interface CompletionScreenProps {
  session: WorkoutSession;
  onFinish: () => void;
}

const CompletionScreen: React.FC<CompletionScreenProps> = ({ session, onFinish }) => {
  const duration = useMemo(() => {
    if (!session.startedAt) return 0;
    return Math.floor((Date.now() - session.startedAt.getTime()) / 1000 / 60);
  }, [session.startedAt]);

  const totalSets = session.exercises.reduce((sum, ex) => sum + ex.sets, 0);
  const completedSets = session.results.reduce(
    (sum, r) => sum + r.sets.filter((s) => s.completed).length,
    0
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center px-6"
    >
      {/* Success Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="
          w-24 h-24 mb-8
          rounded-full
          bg-gradient-to-br from-indigo-500/20 to-cyan-400/20
          border border-white/10
          flex items-center justify-center
        "
      >
        <motion.svg
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="w-12 h-12 text-cyan-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <motion.path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </motion.svg>
      </motion.div>

      <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">
        Workout Complete
      </h1>
      <p className="text-white/50 mb-10">{session.title}</p>

      {/* Stats */}
      <div className="
        flex items-center gap-8 py-6 px-8
        rounded-2xl
        bg-white/5
        border border-white/10
        backdrop-blur-sm
        mb-10
      ">
        <div className="text-center">
          <p className="text-3xl font-semibold tabular-nums text-white">
            {duration}
          </p>
          <p className="text-xs uppercase tracking-[0.15em] text-white/40 mt-1">
            min
          </p>
        </div>
        <div className="w-px h-10 bg-white/10" />
        <div className="text-center">
          <p className="text-3xl font-semibold tabular-nums text-white">
            {session.exercises.length}
          </p>
          <p className="text-xs uppercase tracking-[0.15em] text-white/40 mt-1">
            exercises
          </p>
        </div>
        <div className="w-px h-10 bg-white/10" />
        <div className="text-center">
          <p className="text-3xl font-semibold tabular-nums text-white">
            {completedSets}/{totalSets}
          </p>
          <p className="text-xs uppercase tracking-[0.15em] text-white/40 mt-1">
            sets
          </p>
        </div>
      </div>

      {/* Finish Button */}
      <motion.button
        onClick={onFinish}
        whileTap={{ scale: 0.98 }}
        className="
          w-full max-w-xs h-14
          rounded-2xl
          bg-gradient-to-r from-indigo-500/90 via-sky-500/90 to-cyan-400/90
          shadow-[0_18px_50px_-18px_rgba(56,189,248,0.7)]
          text-white font-semibold
          tracking-wide
          transition-all duration-200
        "
      >
        Done
      </motion.button>
    </motion.div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

interface WorkoutExecutionScreenProps {
  sessionId?: string;
  onExit?: () => void;
}

export const WorkoutExecutionScreen: React.FC<WorkoutExecutionScreenProps> = ({
  onExit,
}) => {
  // Local state (using mock data)
  const [session, setSession] = useState<WorkoutSession>(() => ({
    ...MOCK_SESSION,
    startedAt: new Date(),
    results: MOCK_SESSION.exercises.map((ex) => ({
      exerciseId: ex.id,
      sets: Array.from({ length: ex.sets }, (_, i) => ({
        setNumber: i + 1,
        completed: false,
      })),
    })),
  }));

  // UI State
  const [showQuickLog, setShowQuickLog] = useState(false);
  const [showRestTimer, setShowRestTimer] = useState(false);

  // Current exercise and set
  const currentExercise = session.exercises[session.currentExerciseIndex];
  const currentResult = session.results.find(
    (r) => r.exerciseId === currentExercise?.id
  );
  const completedSetsCount =
    currentResult?.sets.filter((s) => s.completed).length || 0;

  // Last logged weight for this exercise
  const lastLoggedWeight = useMemo(() => {
    const lastCompleted = currentResult?.sets
      .filter((s) => s.completed && s.weight !== undefined)
      .pop();
    return lastCompleted?.weight ?? currentExercise?.weight ?? 0;
  }, [currentResult, currentExercise]);

  // Is workout complete?
  const isComplete = session.status === 'completed';

  // Handle "Set Done" tap
  const handleSetDone = useCallback(() => {
    triggerHaptic('light');
    setShowQuickLog(true);
  }, []);

  // Handle save from QuickLog
  const handleSaveSet = useCallback(
    (weight: number, reps: number) => {
      setSession((prev) => {
        const newResults = [...prev.results];
        const resultIndex = newResults.findIndex(
          (r) => r.exerciseId === currentExercise.id
        );

        if (resultIndex !== -1) {
          newResults[resultIndex] = {
            ...newResults[resultIndex],
            sets: newResults[resultIndex].sets.map((s, i) =>
              i === prev.currentSetIndex
                ? { ...s, completed: true, weight, reps }
                : s
            ),
          };
        }

        return {
          ...prev,
          results: newResults,
        };
      });

      triggerHaptic('medium');
      setShowQuickLog(false);

      // Check if this was the last set of the last exercise
      const isLastSet =
        session.currentSetIndex + 1 >= currentExercise.sets;
      const isLastExercise =
        session.currentExerciseIndex + 1 >= session.exercises.length;

      if (isLastSet && isLastExercise) {
        // Workout complete
        setSession((prev) => ({
          ...prev,
          status: 'completed',
          completedAt: new Date(),
        }));
      } else {
        // Show rest timer
        setShowRestTimer(true);
      }
    },
    [session, currentExercise]
  );

  // Handle rest timer complete
  const handleRestComplete = useCallback(() => {
    setShowRestTimer(false);

    const isLastSet =
      session.currentSetIndex + 1 >= currentExercise.sets;

    if (isLastSet) {
      // Move to next exercise
      setSession((prev) => ({
        ...prev,
        currentExerciseIndex: prev.currentExerciseIndex + 1,
        currentSetIndex: 0,
      }));
    } else {
      // Move to next set
      setSession((prev) => ({
        ...prev,
        currentSetIndex: prev.currentSetIndex + 1,
      }));
    }
  }, [session, currentExercise]);

  // Handle exit
  const handleExit = useCallback(() => {
    triggerHaptic('light');
    onExit?.();
  }, [onExit]);

  // Handle finish
  const handleFinish = useCallback(() => {
    triggerHaptic('medium');
    onExit?.();
  }, [onExit]);

  // Get next exercise/set info for rest timer
  const isLastSet =
    session.currentSetIndex + 1 >= (currentExercise?.sets || 0);
  const nextExercise = isLastSet
    ? session.exercises[session.currentExerciseIndex + 1]
    : currentExercise;
  const nextSetNumber = isLastSet ? 1 : session.currentSetIndex + 2;

  // Render completion screen
  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-neutral-950 to-zinc-950">
        {/* Grain */}
        <div
          className="fixed inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
        {/* Vignette */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.5) 100%)',
          }}
        />
        <CompletionScreen session={session} onFinish={handleFinish} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-neutral-950 to-zinc-950">
      {/* Grain texture overlay */}
      <div
        className="fixed inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Vignette effect */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.5) 100%)',
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 py-4 border-b border-white/5">
        <motion.button
          onClick={handleExit}
          whileTap={{ scale: 0.9 }}
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
          aria-label="Exit workout"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </motion.button>

        <span className="text-xs uppercase tracking-[0.2em] text-white/40">
          {session.currentExerciseIndex + 1} / {session.exercises.length}
        </span>

        <div className="w-10" aria-hidden="true" />
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-4 py-8">
        <AnimatePresence mode="wait">
          {currentExercise && (
            <ExerciseCard
              key={currentExercise.id + session.currentSetIndex}
              name={currentExercise.name}
              notes={currentExercise.notes}
              totalSets={currentExercise.sets}
              completedSets={completedSetsCount}
              currentSet={session.currentSetIndex}
              weight={lastLoggedWeight}
              targetReps={currentExercise.reps}
              onSetDone={handleSetDone}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Quick Log Sheet */}
      <QuickLogSheet
        isOpen={showQuickLog}
        exerciseName={currentExercise?.name || ''}
        setNumber={session.currentSetIndex + 1}
        defaultWeight={lastLoggedWeight}
        defaultReps={currentExercise?.reps || 10}
        onSave={handleSaveSet}
        onClose={() => setShowQuickLog(false)}
      />

      {/* Rest Timer Overlay */}
      <RestTimerOverlay
        isOpen={showRestTimer}
        duration={currentExercise?.restTime || 90}
        nextExercise={nextExercise?.name}
        nextSet={nextSetNumber}
        onComplete={handleRestComplete}
        onSkip={handleRestComplete}
      />
    </div>
  );
};

export default WorkoutExecutionScreen;
