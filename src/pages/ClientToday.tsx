/**
 * ClientToday - The Today Screen (Trainer OS)
 * 
 * THE primary screen for clients.
 * 1 screen = 1 action: Execute today's workout.
 * 
 * States:
 * - rest_day: Recovery day, no workout
 * - scheduled: Workout ready to start  
 * - in_progress: Auto-redirect to execution
 * - completed: Done for today
 * 
 * Design: Graphite + Wine. Calm, focused, premium.
 * 
 * @module pages/ClientToday
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayIcon, CheckIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../auth/AuthContextV2';
import {
  subscribeTodayWorkout,
  type TodayWorkoutState,
  type ScheduledWorkout,
} from '../services/workoutService';

// ============================================================================
// Rest Day — Calm, purposeful, no action needed
// ============================================================================

const RestDayView: React.FC = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.6 }}
    className="flex flex-col items-center justify-center min-h-[70vh] px-8 text-center"
  >
    <h1 className="text-2xl font-semibold text-tr-text mb-3">
      День восстановления
    </h1>
    <p className="text-tr-text-secondary text-base leading-relaxed max-w-[280px]">
      Сегодня тренировки нет. Отдыхайте.
    </p>
  </motion.div>
);

// ============================================================================
// Scheduled — Ready to start, ONE action
// ============================================================================

interface ScheduledViewProps {
  workout: ScheduledWorkout;
  onStart: () => void;
}

const ScheduledView: React.FC<ScheduledViewProps> = ({ workout, onStart }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="flex flex-col min-h-[calc(100vh-6rem)] px-6 pt-8 pb-10"
  >
    {/* Header — minimal context */}
    <div className="mb-10">
      <p className="text-tr-text-muted text-xs uppercase tracking-widest mb-3">
        Сегодня
      </p>
      <h1 className="text-[28px] font-bold text-tr-text leading-tight">
        {workout.title || 'Тренировка'}
      </h1>
    </div>

    {/* Exercise preview — just names, no numbers overload */}
    <div className="flex-1 space-y-1">
      {workout.exercises.slice(0, 6).map((exercise) => (
        <div
          key={exercise.id}
          className="py-3 border-b border-tr-border-subtle last:border-0"
        >
          <p className="text-tr-text text-base">
            {exercise.name.ru}
          </p>
        </div>
      ))}
      {workout.exercises.length > 6 && (
        <p className="text-tr-text-muted text-sm pt-3">
          ещё {workout.exercises.length - 6}
        </p>
      )}
    </div>

    {/* THE action — primary CTA */}
    <motion.button
      onClick={onStart}
      whileTap={{ scale: 0.98 }}
      className="w-full py-4 rounded-2xl font-semibold text-white text-base flex items-center justify-center gap-3"
      style={{
        background: 'linear-gradient(135deg, #A64D55 0%, #8B3A42 100%)',
        boxShadow: '0 8px 32px rgba(166, 77, 85, 0.35)',
      }}
    >
      <PlayIcon className="w-5 h-5" />
      Начать
    </motion.button>
  </motion.div>
);

// ============================================================================
// Completed — Satisfaction, optional note
// ============================================================================

interface CompletedViewProps {
  workoutId: string;
}

const CompletedView: React.FC<CompletedViewProps> = () => {
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // TODO: Save note to workout
    setSaved(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col min-h-[calc(100vh-6rem)] px-6 pt-12 pb-10"
    >
      {/* Success state */}
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-16 h-16 rounded-full bg-tr-success/15 flex items-center justify-center mb-6"
        >
          <CheckIcon className="w-8 h-8 text-tr-success" />
        </motion.div>
        
        <h1 className="text-2xl font-semibold text-tr-text mb-2">
          Готово
        </h1>
        <p className="text-tr-text-secondary text-base">
          Тренировка завершена
        </p>
      </div>

      {/* Note for trainer — optional */}
      <div className="mt-auto">
        {!saved ? (
          <>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Заметка для тренера..."
              rows={3}
              className="w-full bg-tr-elevated border-0 rounded-xl p-4 text-tr-text text-base placeholder-tr-text-disabled resize-none focus:outline-none focus:ring-1 focus:ring-tr-accent/50 transition-all"
            />
            {note.trim() && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleSave}
                className="w-full mt-3 py-3 rounded-xl font-medium text-tr-accent bg-tr-accent/10"
              >
                Отправить
              </motion.button>
            )}
          </>
        ) : (
          <p className="text-center text-tr-text-muted text-sm">
            Заметка отправлена
          </p>
        )}
      </div>
    </motion.div>
  );
};

// ============================================================================
// Loading — Minimal skeleton
// ============================================================================

const LoadingView: React.FC = () => (
  <div className="flex flex-col min-h-[calc(100vh-6rem)] px-6 pt-8 pb-10">
    <div className="animate-pulse">
      <div className="h-3 w-12 bg-tr-elevated rounded mb-3" />
      <div className="h-8 w-40 bg-tr-elevated rounded mb-10" />
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-5 bg-tr-elevated rounded w-full" style={{ width: `${90 - i * 10}%` }} />
        ))}
      </div>
    </div>
  </div>
);

// ============================================================================
// Main Component
// ============================================================================

const ClientToday: React.FC = () => {
  const { user } = useAuth();
  const history = useHistory();
  const [state, setState] = useState<TodayWorkoutState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = subscribeTodayWorkout(user.id, (newState) => {
      setState(newState);
      setLoading(false);

      // Auto-redirect if in progress
      if (newState.type === 'in_progress' && newState.workout) {
        history.replace(`/workout/${newState.workout.id}`);
      }
    });

    return () => unsubscribe();
  }, [user?.id, history]);

  const handleStart = useCallback(() => {
    if (state?.workout) {
      history.push(`/workout/${state.workout.id}`);
    }
  }, [state?.workout, history]);

  if (loading) {
    return (
      <div className="min-h-screen bg-tr-base">
        <LoadingView />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tr-base safe-area-inset-top">
      <AnimatePresence mode="wait">
        {state?.type === 'rest_day' && <RestDayView key="rest" />}
        
        {state?.type === 'scheduled' && state.workout && (
          <ScheduledView key="scheduled" workout={state.workout} onStart={handleStart} />
        )}
        
        {state?.type === 'completed' && state.workout && (
          <CompletedView key="completed" workoutId={state.workout.id} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClientToday;
