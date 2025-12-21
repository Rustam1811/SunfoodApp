/**
 * ClientMainScreen - V1 Focused Today Screen
 * 
 * Single-purpose screen: Today's workout + quick actions
 * No tabs, no distraction. One primary action.
 * 
 * States:
 * - Rest Day: "День отдыха" message
 * - Scheduled: "НАЧАТЬ" button
 * - In Progress: "ПРОДОЛЖИТЬ" + progress indicator
 * - Completed: Success state
 * 
 * @module pages/ClientMainScreen
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckIcon, SparklesIcon, PlayIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../auth/AuthContextV2';
import { 
  subscribeTodayWorkout, 
  startWorkout,
  type TodayWorkoutState,
  type ScheduledWorkout,
} from '../services/workoutService';
import { getTodayCheckmarks, addWaterGlass, type NutritionCheckmark } from '../services/nutritionService';
import { subscribeClientMessages, type CoachMessage } from '../services/coachMessagesService';

// ============================================================================
// Design Tokens
// ============================================================================

const COLORS = {
  bg: '#050505',
  surface: '#0a0a0a',
  border: '#1a1a1a',
  borderActive: '#2a2a2a',
  text: '#ffffff',
  textMuted: '#666666',
  textDim: '#404040',
  accent: '#00ff87',
  accentDim: '#00cc6a',
};

// ============================================================================
// Progress Ring
// ============================================================================

interface ProgressRingProps {
  progress: number; // 0-1
  size?: number;
}

const ProgressRing: React.FC<ProgressRingProps> = ({ progress, size = 120 }) => {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress * circumference);

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={COLORS.border}
        strokeWidth="4"
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={COLORS.accent}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
    </svg>
  );
};

// ============================================================================
// Water Counter (Compact)
// ============================================================================

interface WaterCounterProps {
  count: number;
  onAdd: () => void;
}

const WaterCounter: React.FC<WaterCounterProps> = ({ count, onAdd }) => (
  <button
    onClick={onAdd}
    className="flex items-center gap-3 py-3 px-4"
    style={{ borderLeft: `1px solid ${COLORS.border}` }}
  >
    <span className="text-2xl font-light tabular-nums" style={{ color: COLORS.text }}>
      {count}
    </span>
    <div>
      <span className="text-xs uppercase tracking-widest block" style={{ color: COLORS.textDim }}>
        / 8
      </span>
      <span className="text-xs" style={{ color: COLORS.textMuted }}>
        💧
      </span>
    </div>
  </button>
);

// ============================================================================
// Trainer Note
// ============================================================================

interface TrainerNoteProps {
  note: string;
}

const TrainerNote: React.FC<TrainerNoteProps> = ({ note }) => (
  <div 
    className="p-4 mt-6"
    style={{ backgroundColor: COLORS.surface, borderLeft: `2px solid ${COLORS.accent}` }}
  >
    <p className="text-xs uppercase tracking-widest mb-2" style={{ color: COLORS.accent }}>
      От тренера
    </p>
    <p className="text-sm leading-relaxed" style={{ color: COLORS.textMuted }}>
      {note}
    </p>
  </div>
);

// ============================================================================
// Rest Day View
// ============================================================================

const RestDayView: React.FC = () => (
  <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
    <div 
      className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
      style={{ backgroundColor: COLORS.surface }}
    >
      <SparklesIcon className="w-10 h-10" style={{ color: COLORS.textMuted }} />
    </div>
    <h2 className="text-2xl font-light mb-2" style={{ color: COLORS.text }}>
      День отдыха
    </h2>
    <p className="text-sm" style={{ color: COLORS.textDim }}>
      Восстановление — часть прогресса
    </p>
  </div>
);

// ============================================================================
// Completed View
// ============================================================================

interface CompletedViewProps {
  workout: ScheduledWorkout;
}

const CompletedView: React.FC<CompletedViewProps> = ({ workout }) => {
  const completedSets = workout.results?.reduce(
    (sum, r) => sum + r.sets.filter(s => s.completed).length, 0
  ) || 0;
  const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets, 0);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
        style={{ backgroundColor: `${COLORS.accent}20` }}
      >
        <CheckIcon className="w-10 h-10" style={{ color: COLORS.accent }} />
      </motion.div>
      <h2 className="text-2xl font-light mb-2" style={{ color: COLORS.text }}>
        Выполнено
      </h2>
      <p className="text-sm" style={{ color: COLORS.textMuted }}>
        {completedSets}/{totalSets} подходов · {workout.title}
      </p>
    </div>
  );
};

// ============================================================================
// Workout Ready View
// ============================================================================

interface WorkoutReadyViewProps {
  workout: ScheduledWorkout;
  isInProgress: boolean;
  onStart: () => void;
  trainerNote?: string;
}

const WorkoutReadyView: React.FC<WorkoutReadyViewProps> = ({ 
  workout, 
  isInProgress, 
  onStart,
  trainerNote,
}) => {
  const completedSets = workout.results?.reduce(
    (sum, r) => sum + r.sets.filter(s => s.completed).length, 0
  ) || 0;
  const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets, 0);
  const progress = totalSets > 0 ? completedSets / totalSets : 0;

  return (
    <div className="flex-1 flex flex-col px-6 py-8">
      {/* Workout Title */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-8"
      >
        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: COLORS.textDim }}>
          Сегодня
        </p>
        <h1 className="text-3xl font-light" style={{ color: COLORS.text }}>
          {workout.title}
        </h1>
        <p className="text-sm mt-2" style={{ color: COLORS.textMuted }}>
          {workout.exercises.length} упражнений
          {workout.estimatedDuration && ` · ~${workout.estimatedDuration} мин`}
        </p>
      </motion.div>

      {/* In Progress: Show Progress Ring */}
      {isInProgress && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center justify-center my-8"
        >
          <div className="relative">
            <ProgressRing progress={progress} size={140} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span 
                className="text-3xl font-light tabular-nums"
                style={{ color: COLORS.text }}
              >
                {completedSets}
              </span>
              <span className="text-xs" style={{ color: COLORS.textDim }}>
                / {totalSets}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Not Started: Show Exercise List Preview */}
      {!isInProgress && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex-1"
        >
          {workout.exercises.slice(0, 4).map((ex, i) => (
            <div 
              key={ex.id}
              className="flex items-center py-3"
              style={{ borderBottom: `1px solid ${COLORS.border}` }}
            >
              <span 
                className="w-6 text-sm tabular-nums"
                style={{ color: COLORS.textDim }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <span 
                className="flex-1 text-sm ml-3"
                style={{ color: COLORS.textMuted }}
              >
                {ex.name.ru}
              </span>
              <span 
                className="text-xs"
                style={{ color: COLORS.textDim }}
              >
                {ex.sets}×{ex.reps}
              </span>
            </div>
          ))}
          {workout.exercises.length > 4 && (
            <p className="text-xs py-3 text-center" style={{ color: COLORS.textDim }}>
              +{workout.exercises.length - 4} ещё
            </p>
          )}
        </motion.div>
      )}

      {/* Trainer Note */}
      {trainerNote && <TrainerNote note={trainerNote} />}

      {/* CTA Button */}
      <motion.button
        onClick={onStart}
        whileTap={{ scale: 0.98 }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-auto w-full py-5 flex items-center justify-center gap-3 text-sm uppercase tracking-widest font-medium"
        style={{ backgroundColor: COLORS.accent, color: COLORS.bg }}
      >
        {isInProgress ? (
          <>
            Продолжить
            <ArrowRightIcon className="w-4 h-4" />
          </>
        ) : (
          <>
            <PlayIcon className="w-4 h-4" />
            Начать
          </>
        )}
      </motion.button>
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

const ClientMainScreen: React.FC = () => {
  const { user } = useAuth();
  const history = useHistory();

  const [workoutState, setWorkoutState] = useState<TodayWorkoutState | null>(null);
  const [checkmarks, setCheckmarks] = useState<NutritionCheckmark | null>(null);
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data
  useEffect(() => {
    if (!user?.id) return;

    const unsubWorkout = subscribeTodayWorkout(user.id, (state) => {
      setWorkoutState(state);
      setLoading(false);
    });

    const unsubMessages = subscribeClientMessages(user.id, (msgs) => {
      setMessages(msgs);
    });

    getTodayCheckmarks(user.id).then(setCheckmarks).catch(() => {});

    return () => {
      unsubWorkout();
      unsubMessages();
    };
  }, [user?.id]);

  // Handle start workout
  const handleStart = useCallback(async () => {
    if (!workoutState?.workout || !user?.id) return;

    // If not started yet, mark as in_progress
    if (workoutState.type === 'scheduled') {
      await startWorkout(workoutState.workout.id, user.id);
    }

    history.push(`/workout/${workoutState.workout.id}`);
  }, [workoutState, user?.id, history]);

  // Handle add water
  const handleAddWater = useCallback(async () => {
    if (!user?.id) return;
    try {
      const newCount = await addWaterGlass(user.id);
      setCheckmarks(prev => prev ? { ...prev, waterGlasses: newCount } : null);
    } catch (e) {
      // Silently fail
    }
  }, [user?.id]);

  // Get unread messages count
  const unreadCount = messages.filter(m => !m.read).length;

  // Get trainer note for today (most recent pinned or first unread)
  const trainerNote = messages.find(m => m.pinned)?.content 
    || messages.find(m => !m.read)?.content;

  // Format date
  const today = new Date();
  const dateStr = today.toLocaleDateString('ru-RU', { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'short' 
  });

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: COLORS.bg }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: `1px solid ${COLORS.border}` }}
      >
        <div>
          <p className="text-xs uppercase tracking-widest" style={{ color: COLORS.textDim }}>
            {dateStr}
          </p>
        </div>
        <div className="flex items-center">
          {/* Water */}
          <WaterCounter 
            count={checkmarks?.waterGlasses ?? 0} 
            onAdd={handleAddWater} 
          />
          
          {/* Messages indicator */}
          {unreadCount > 0 && (
            <button
              onClick={() => history.push('/messages')}
              className="ml-4 w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
              style={{ backgroundColor: COLORS.accent, color: COLORS.bg }}
            >
              {unreadCount}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div 
            className="w-8 h-8 border-2 rounded-full animate-spin"
            style={{ borderColor: `${COLORS.border} transparent` }}
          />
        </div>
      ) : workoutState?.type === 'rest_day' ? (
        <RestDayView />
      ) : workoutState?.type === 'completed' && workoutState.workout ? (
        <CompletedView workout={workoutState.workout} />
      ) : workoutState?.workout ? (
        <WorkoutReadyView
          workout={workoutState.workout}
          isInProgress={workoutState.type === 'in_progress'}
          onStart={handleStart}
          trainerNote={trainerNote}
        />
      ) : (
        <RestDayView />
      )}
    </div>
  );
};

export default ClientMainScreen;
