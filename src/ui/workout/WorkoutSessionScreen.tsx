/**
 * WorkoutSessionScreen - Premium Workout Session Page
 *
 * Full-featured workout execution screen with:
 * - Exercise list with progress indicators
 * - Tap to open ExerciseModal
 * - Resume support (persists progress)
 * - Completion flow with stats
 *
 * @module ui/workout/WorkoutSessionScreen
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  PlayIcon,
  CheckIcon,
  ChevronRightIcon,
  ClockIcon,
  FireIcon,
  TrophyIcon,
} from '@heroicons/react/24/solid';
import { ExerciseModal, type ExerciseData, type ExerciseSet } from './ExerciseModal';
import { ProgressRing } from '../premium';
import { useAuth } from '../../auth/AuthContextV2';
import {
  getWorkoutPlan,
  subscribeToWorkoutPlan,
  type WorkoutPlan,
  type PlannedExercise,
} from '../../services/workoutPlanService';
import {
  getActiveSession,
  startWorkoutSession,
  updateSessionProgress,
  completeWorkout,
  logSetCompletion,
  type ActiveSession,
  type ExerciseLogEntry,
  type LoggedSet,
  type SetStatus,
} from '../../services/workoutLogService';

// ============================================================================
// Types
// ============================================================================

interface WorkoutSessionScreenProps {
  planId: string;
  planDate: string;
  onComplete: () => void;
  onExit: () => void;
}

type SessionStatus = 'loading' | 'ready' | 'in_progress' | 'completed' | 'error';

interface LocalExerciseState extends ExerciseData {
  originalIndex: number;
  isCompleted: boolean;
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
// Loading Skeleton
// ============================================================================

const LoadingSkeleton: React.FC = () => (
  <div className="animate-pulse p-6">
    <div className="h-8 w-2/3 bg-white/10 rounded mb-2" />
    <div className="h-4 w-1/3 bg-white/5 rounded mb-8" />
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-20 bg-white/5 rounded-2xl" />
      ))}
    </div>
  </div>
);

// ============================================================================
// Exercise List Item
// ============================================================================

interface ExerciseListItemProps {
  exercise: LocalExerciseState;
  index: number;
  isActive: boolean;
  onClick: () => void;
}

const ExerciseListItem: React.FC<ExerciseListItemProps> = ({
  exercise,
  index,
  isActive,
  onClick,
}) => {
  const completedSets = exercise.sets.filter((s) => s.status === 'completed').length;
  const totalSets = exercise.sets.length;
  const progress = totalSets > 0 ? completedSets / totalSets : 0;

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className={`
        w-full
        p-4
        rounded-2xl
        border
        text-left
        transition-all duration-200
        ${
          exercise.isCompleted
            ? 'bg-emerald-500/10 border-emerald-500/30'
            : isActive
            ? 'bg-white/10 border-cyan-400/40 ring-2 ring-cyan-400/20'
            : 'bg-white/5 border-white/10 hover:bg-white/10'
        }
      `}
    >
      <div className="flex items-center gap-4">
        {/* Progress Ring */}
        <div className="relative">
          <ProgressRing
            value={progress * 100}
            size={48}
            strokeWidth={3}
            showValue={false}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            {exercise.isCompleted ? (
              <CheckIcon className="w-5 h-5 text-emerald-400" />
            ) : (
              <span className="text-sm font-medium text-white/70">{index + 1}</span>
            )}
          </div>
        </div>

        {/* Exercise Info */}
        <div className="flex-1 min-w-0">
          <h3
            className={`font-medium truncate ${
              exercise.isCompleted ? 'text-emerald-400' : 'text-white'
            }`}
          >
            {exercise.name}
          </h3>
          <p className="text-sm text-white/40">
            {completedSets}/{totalSets} sets
            {exercise.sets[0] && ` • ${exercise.sets[0].targetWeight}kg`}
          </p>
        </div>

        {/* Arrow */}
        <ChevronRightIcon
          className={`w-5 h-5 ${
            exercise.isCompleted ? 'text-emerald-400/50' : 'text-white/30'
          }`}
        />
      </div>
    </motion.button>
  );
};

// ============================================================================
// Completion Screen
// ============================================================================

interface CompletionScreenProps {
  duration: number;
  totalSets: number;
  completedSets: number;
  planTitle: string;
  onFinish: () => void;
}

const CompletionScreen: React.FC<CompletionScreenProps> = ({
  duration,
  totalSets,
  completedSets,
  planTitle,
  onFinish,
}) => {
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
          bg-gradient-to-br from-emerald-500/20 to-cyan-400/20
          border border-white/10
          flex items-center justify-center
        "
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: 'spring' }}
        >
          <TrophyIcon className="w-12 h-12 text-amber-400" />
        </motion.div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-3xl font-semibold tracking-tight text-white mb-2"
      >
        Workout Complete!
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-white/50 mb-10"
      >
        {planTitle}
      </motion.p>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="
          flex items-center gap-8 py-6 px-8
          rounded-2xl
          bg-white/5
          border border-white/10
          backdrop-blur-sm
          mb-10
        "
      >
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-white/60 mb-1">
            <ClockIcon className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider">Duration</span>
          </div>
          <p className="text-2xl font-semibold tabular-nums text-white">
            {formatDuration(duration)}
          </p>
        </div>

        <div className="w-px h-12 bg-white/10" />

        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-white/60 mb-1">
            <FireIcon className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider">Sets</span>
          </div>
          <p className="text-2xl font-semibold tabular-nums text-white">
            {completedSets}/{totalSets}
          </p>
        </div>
      </motion.div>

      {/* Finish Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        onClick={onFinish}
        whileTap={{ scale: 0.98 }}
        className="
          w-full max-w-xs
          h-14
          rounded-2xl
          bg-gradient-to-r from-indigo-500/90 via-sky-500/90 to-cyan-400/90
          shadow-[0_18px_50px_-18px_rgba(56,189,248,0.7)]
          text-white font-semibold
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

export const WorkoutSessionScreen: React.FC<WorkoutSessionScreenProps> = ({
  planId,
  planDate,
  onComplete,
  onExit,
}) => {
  const { user } = useAuth();
  const [status, setStatus] = useState<SessionStatus>('loading');
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [exercises, setExercises] = useState<LocalExerciseState[]>([]);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number | null>(null);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);

  const tenantId = 'default';

  // Initialize: Load plan and check for active session
  useEffect(() => {
    if (!user?.id) return;

    const loadData = async () => {
      try {
        // Get plan
        const planData = await getWorkoutPlan(user.id, planDate, tenantId);
        if (!planData) {
          setStatus('error');
          return;
        }
        setPlan(planData);

        // Check for active session (resume support)
        const activeSession = await getActiveSession(user.id, tenantId);

        if (activeSession && activeSession.planId === planId) {
          // Resume existing session
          setSession(activeSession);
          setStartTime(new Date(activeSession.startedAt));

          // Rebuild exercise state from session
          const exerciseStates = buildExerciseStates(
            planData.exercises,
            activeSession.exerciseResults
          );
          setExercises(exerciseStates);
          setStatus('in_progress');
        } else {
          // Build fresh exercise states
          const exerciseStates = buildExerciseStates(planData.exercises, []);
          setExercises(exerciseStates);
          setStatus('ready');
        }
      } catch {
        setStatus('error');
      }
    };

    loadData();
  }, [user?.id, planId, planDate, tenantId]);

  // Build exercise states from plan and logged results
  const buildExerciseStates = (
    plannedExercises: PlannedExercise[],
    loggedResults: ExerciseLogEntry[]
  ): LocalExerciseState[] => {
    return plannedExercises.map((pe, index) => {
      const logged = loggedResults.find((r) => r.exerciseId === pe.id);

      const sets: ExerciseSet[] = pe.sets.map((ps, setIdx) => {
        const loggedSet = logged?.sets.find((s) => s.setNumber === ps.setNumber);
        return {
          setNumber: ps.setNumber,
          targetReps: ps.targetReps,
          targetWeight: ps.targetWeight,
          restSeconds: ps.restSeconds,
          status: loggedSet?.status || 'pending',
          actualReps: loggedSet?.actualReps,
          actualWeight: loggedSet?.actualWeight,
        };
      });

      const allComplete = sets.every((s) => s.status !== 'pending');

      return {
        id: pe.id,
        name: pe.name,
        description: pe.description,
        coachVideoUrl: pe.coachVideoUrl,
        thumbnailUrl: pe.thumbnailUrl,
        notes: pe.notes,
        sets,
        originalIndex: index,
        isCompleted: allComplete,
      };
    });
  };

  // Start workout
  const handleStart = useCallback(async () => {
    if (!user?.id || !plan) return;

    triggerHaptic('medium');

    try {
      const newSession = await startWorkoutSession(user.id, planId, planDate, tenantId);
      setSession(newSession);
      setStartTime(new Date());
      setStatus('in_progress');
    } catch {
      // Silent fail - continue with local state
      setStartTime(new Date());
      setStatus('in_progress');
    }
  }, [user?.id, plan, planId, planDate, tenantId]);

  // Handle exercise tap
  const handleExerciseTap = useCallback(
    (index: number) => {
      triggerHaptic('light');
      setActiveExerciseIndex(index);
      setShowExerciseModal(true);
    },
    []
  );

  // Handle set complete
  const handleSetComplete = useCallback(
    async (setIndex: number, actualWeight: number, actualReps: number) => {
      if (activeExerciseIndex === null) return;

      const exercise = exercises[activeExerciseIndex];
      const set = exercise.sets[setIndex];

      // Update local state
      const updatedExercises = [...exercises];
      const updatedSets = [...updatedExercises[activeExerciseIndex].sets];
      updatedSets[setIndex] = {
        ...set,
        status: 'completed' as SetStatus,
        actualWeight,
        actualReps,
      };
      updatedExercises[activeExerciseIndex] = {
        ...exercise,
        sets: updatedSets,
        isCompleted: updatedSets.every((s) => s.status !== 'pending'),
      };
      setExercises(updatedExercises);

      // Update session in Firestore
      if (user?.id && session) {
        const loggedSet: LoggedSet = {
          setNumber: set.setNumber,
          status: 'completed',
          targetReps: set.targetReps,
          targetWeight: set.targetWeight,
          actualReps,
          actualWeight,
          completedAt: new Date().toISOString(),
        };

        const updatedResults = await logSetCompletion(
          user.id,
          activeExerciseIndex,
          exercise.id,
          exercise.name,
          loggedSet,
          session.exerciseResults,
          tenantId
        );

        // Update session progress
        await updateSessionProgress(
          user.id,
          activeExerciseIndex,
          setIndex + 1,
          updatedResults,
          tenantId
        );

        setSession({
          ...session,
          exerciseResults: updatedResults,
          currentExerciseIndex: activeExerciseIndex,
          currentSetIndex: setIndex + 1,
        });
      }

      triggerHaptic('medium');
    },
    [activeExerciseIndex, exercises, user?.id, session, tenantId]
  );

  // Handle set skip
  const handleSetSkip = useCallback(
    async (setIndex: number) => {
      if (activeExerciseIndex === null) return;

      const exercise = exercises[activeExerciseIndex];
      const set = exercise.sets[setIndex];

      // Update local state
      const updatedExercises = [...exercises];
      const updatedSets = [...updatedExercises[activeExerciseIndex].sets];
      updatedSets[setIndex] = {
        ...set,
        status: 'skipped' as SetStatus,
      };
      updatedExercises[activeExerciseIndex] = {
        ...exercise,
        sets: updatedSets,
        isCompleted: updatedSets.every((s) => s.status !== 'pending'),
      };
      setExercises(updatedExercises);

      // Update session in Firestore
      if (user?.id && session) {
        const loggedSet: LoggedSet = {
          setNumber: set.setNumber,
          status: 'skipped',
          targetReps: set.targetReps,
          targetWeight: set.targetWeight,
          completedAt: new Date().toISOString(),
        };

        const updatedResults = await logSetCompletion(
          user.id,
          activeExerciseIndex,
          exercise.id,
          exercise.name,
          loggedSet,
          session.exerciseResults,
          tenantId
        );

        await updateSessionProgress(
          user.id,
          activeExerciseIndex,
          setIndex + 1,
          updatedResults,
          tenantId
        );

        setSession({
          ...session,
          exerciseResults: updatedResults,
        });
      }

      triggerHaptic('light');
    },
    [activeExerciseIndex, exercises, user?.id, session, tenantId]
  );

  // Handle exercise complete
  const handleExerciseComplete = useCallback(() => {
    setShowExerciseModal(false);
    triggerHaptic('heavy');

    // Check if all exercises complete
    const allComplete = exercises.every((e) => e.isCompleted);
    if (allComplete) {
      handleWorkoutComplete();
    }
  }, [exercises]);

  // Handle workout complete
  const handleWorkoutComplete = useCallback(async () => {
    if (!user?.id || !plan || !session) {
      setStatus('completed');
      return;
    }

    const totalSets = exercises.reduce((sum, e) => sum + e.sets.length, 0);

    try {
      await completeWorkout(
        user.id,
        session,
        plan.title,
        exercises.length,
        totalSets,
        undefined,
        undefined,
        tenantId
      );
    } catch {
      // Silent fail
    }

    setStatus('completed');
    triggerHaptic('heavy');
  }, [user?.id, plan, session, exercises, tenantId]);

  // Calculate stats
  const totalSets = useMemo(
    () => exercises.reduce((sum, e) => sum + e.sets.length, 0),
    [exercises]
  );

  const completedSets = useMemo(
    () =>
      exercises.reduce(
        (sum, e) => sum + e.sets.filter((s) => s.status === 'completed').length,
        0
      ),
    [exercises]
  );

  const overallProgress = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

  const duration = useMemo(() => {
    if (!startTime) return 0;
    return Math.floor((Date.now() - startTime.getTime()) / 1000);
  }, [startTime]);

  // Find first incomplete exercise
  const firstIncompleteIndex = useMemo(
    () => exercises.findIndex((e) => !e.isCompleted),
    [exercises]
  );

  // Handle exit
  const handleExit = useCallback(() => {
    triggerHaptic('light');
    onExit();
  }, [onExit]);

  // Render based on status
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-neutral-950 to-zinc-950">
        <LoadingSkeleton />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-neutral-950 to-zinc-950 flex flex-col items-center justify-center px-6">
        <p className="text-white/60 mb-6">Unable to load workout plan</p>
        <button
          onClick={onExit}
          className="px-6 py-3 rounded-xl bg-white/10 text-white font-medium"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (status === 'completed') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-neutral-950 to-zinc-950">
        <CompletionScreen
          duration={duration}
          totalSets={totalSets}
          completedSets={completedSets}
          planTitle={plan?.title || 'Workout'}
          onFinish={onComplete}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-neutral-950 to-zinc-950">
      {/* Grain overlay */}
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
            'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="px-4 pt-safe">
          <div className="pt-4 pb-4 flex items-center justify-between">
            <motion.button
              onClick={handleExit}
              whileTap={{ scale: 0.92 }}
              className="
                w-10 h-10
                rounded-full
                bg-white/5
                border border-white/10
                flex items-center justify-center
                text-white/70
              "
              aria-label="Exit"
            >
              <XMarkIcon className="w-5 h-5" />
            </motion.button>

            {/* Progress indicator */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-white/40">Progress</p>
                <p className="text-sm font-medium text-white tabular-nums">
                  {completedSets}/{totalSets} sets
                </p>
              </div>
              <ProgressRing value={overallProgress} size={40} strokeWidth={3} />
            </div>
          </div>

          {/* Title */}
          <div className="pb-6">
            <h1 className="text-2xl font-semibold text-white mb-1">
              {plan?.title || 'Workout'}
            </h1>
            <p className="text-sm text-white/40">
              {exercises.length} exercises • ~{plan?.estimatedDuration || 45} min
            </p>
          </div>
        </div>

        {/* Exercise List */}
        <div className="px-4 pb-6">
          <div className="space-y-3">
            {exercises.map((exercise, index) => (
              <ExerciseListItem
                key={exercise.id}
                exercise={exercise}
                index={index}
                isActive={index === firstIncompleteIndex}
                onClick={() => handleExerciseTap(index)}
              />
            ))}
          </div>
        </div>

        {/* Start/Continue Button (when ready or in progress) */}
        {(status === 'ready' || status === 'in_progress') && (
          <div className="fixed bottom-0 left-0 right-0 p-4 pb-safe bg-gradient-to-t from-zinc-950 via-zinc-950/95 to-transparent">
            <motion.button
              onClick={
                status === 'ready'
                  ? handleStart
                  : () => handleExerciseTap(Math.max(0, firstIncompleteIndex))
              }
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: 1.01 }}
              className="
                w-full
                h-14
                rounded-2xl
                bg-gradient-to-r from-indigo-500/90 via-sky-500/90 to-cyan-400/90
                shadow-[0_18px_50px_-18px_rgba(56,189,248,0.7)]
                text-white font-semibold
                flex items-center justify-center gap-2
              "
            >
              {status === 'ready' ? (
                <>
                  <PlayIcon className="w-5 h-5" />
                  Start Workout
                </>
              ) : firstIncompleteIndex >= 0 ? (
                <>
                  <PlayIcon className="w-5 h-5" />
                  Continue: {exercises[firstIncompleteIndex]?.name}
                </>
              ) : (
                <>
                  <CheckIcon className="w-5 h-5" />
                  Complete Workout
                </>
              )}
            </motion.button>
          </div>
        )}
      </div>

      {/* Exercise Modal */}
      {activeExerciseIndex !== null && exercises[activeExerciseIndex] && (
        <ExerciseModal
          isOpen={showExerciseModal}
          exercise={exercises[activeExerciseIndex]}
          exerciseIndex={activeExerciseIndex}
          totalExercises={exercises.length}
          onSetComplete={handleSetComplete}
          onSetSkip={handleSetSkip}
          onExerciseComplete={handleExerciseComplete}
          onClose={() => setShowExerciseModal(false)}
        />
      )}
    </div>
  );
};

export default WorkoutSessionScreen;
