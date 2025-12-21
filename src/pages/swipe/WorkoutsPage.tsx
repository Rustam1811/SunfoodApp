/**
 * WorkoutsPage - Center Swipe Page
 *
 * Today's workout with date swiper for Tomorrow/Week preview.
 * Primary action: Start Workout button at bottom.
 *
 * @module pages/swipe/WorkoutsPage
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayIcon, CheckIcon, CalendarIcon } from '@heroicons/react/24/solid';
import { SwipePage } from '../../components/shell/SwipeShell';
import { GlassCard, PrimaryButton, ProgressRing, SetDotsCompact } from '../../ui/premium';
import { useAuth } from '../../auth/AuthContextV2';
import {
  subscribeTodayWorkout,
  startWorkout,
  type ScheduledWorkout,
  type TodayWorkoutState,
} from '../../services/workoutService';

// ============================================================================
// Date Swiper
// ============================================================================

const DATES = ['Today', 'Tomorrow', 'This Week'];

interface DateSwiperProps {
  selected: number;
  onChange: (index: number) => void;
}

const DateSwiper: React.FC<DateSwiperProps> = ({ selected, onChange }) => {
  return (
    <div className="flex items-center justify-center gap-2 px-4 py-3">
      {DATES.map((label, index) => (
        <motion.button
          key={label}
          onClick={() => onChange(index)}
          whileTap={{ scale: 0.95 }}
          className={`
            px-4 py-2 rounded-full text-sm font-medium
            transition-all duration-200
            ${selected === index
              ? 'bg-white text-zinc-900'
              : 'bg-white/5 text-white/60 hover:bg-white/10'
            }
          `}
        >
          {label}
        </motion.button>
      ))}
    </div>
  );
};

// ============================================================================
// Workout Card
// ============================================================================

interface WorkoutCardProps {
  workout: ScheduledWorkout;
  onStart: () => void;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout, onStart }) => {
  const isInProgress = workout.status === 'in_progress';
  const isCompleted = workout.status === 'completed';
  
  // Calculate progress
  const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets, 0);
  const completedSets = workout.results?.reduce(
    (sum, r) => sum + r.sets.filter(s => s.completed).length, 0
  ) || 0;
  const progress = totalSets > 0 ? completedSets / totalSets : 0;

  return (
    <GlassCard depth="floating" padding="lg" className="mx-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">
            {workout.title}
          </h2>
          <p className="text-sm text-white/50">
            {workout.exercises.length} exercises · {totalSets} sets
          </p>
        </div>
        
        {/* Status badge */}
        {isCompleted && (
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <CheckIcon className="w-5 h-5 text-emerald-400" />
          </div>
        )}
        {isInProgress && (
          <ProgressRing value={progress * 100} size={48} strokeWidth={4} showValue={false} />
        )}
      </div>

      {/* Exercise list */}
      <div className="space-y-2 mb-6">
        {workout.exercises.slice(0, 4).map((exercise, index) => {
          const exerciseResult = workout.results?.find(r => r.exerciseId === exercise.id);
          const completedExerciseSets = exerciseResult?.sets.filter(s => s.completed).length || 0;
          const isExerciseComplete = completedExerciseSets >= exercise.sets;
          
          return (
            <div
              key={exercise.id}
              className={`
                flex items-center justify-between py-2
                ${index < 3 ? 'border-b border-white/5' : ''}
              `}
            >
              <span className={`text-sm ${isExerciseComplete ? 'text-white/40 line-through' : 'text-white/70'}`}>
                {exercise.name.ru || exercise.name.en}
              </span>
              <SetDotsCompact total={exercise.sets} completed={completedExerciseSets} className="w-20" />
            </div>
          );
        })}
        
        {workout.exercises.length > 4 && (
          <p className="text-xs text-white/40 text-center pt-2">
            +{workout.exercises.length - 4} more exercises
          </p>
        )}
      </div>

      {/* Action button */}
      {!isCompleted && (
        <PrimaryButton fullWidth onClick={onStart}>
          {isInProgress ? (
            <>Continue Workout</>
          ) : (
            <>
              <PlayIcon className="w-5 h-5 mr-2" />
              Start Workout
            </>
          )}
        </PrimaryButton>
      )}
      
      {isCompleted && (
        <div className="text-center py-3">
          <p className="text-emerald-400 font-medium">Workout Complete!</p>
          <p className="text-xs text-white/40 mt-1">Great job today 💪</p>
        </div>
      )}
    </GlassCard>
  );
};

// ============================================================================
// Empty State
// ============================================================================

const RestDayCard: React.FC = () => (
  <GlassCard depth="raised" padding="lg" className="mx-4 text-center">
    <div className="py-8">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
        <CalendarIcon className="w-8 h-8 text-white/30" />
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">Rest Day</h2>
      <p className="text-sm text-white/50">
        No workout scheduled for today.<br />
        Take time to recover and come back stronger!
      </p>
    </div>
  </GlassCard>
);

// ============================================================================
// Main Component
// ============================================================================

export const WorkoutsPage: React.FC = () => {
  const { user } = useAuth();
  const history = useHistory();
  const [dateIndex, setDateIndex] = useState(0);
  const [workoutState, setWorkoutState] = useState<TodayWorkoutState | null>(null);
  const [loading, setLoading] = useState(true);

  // Subscribe to today's workout
  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = subscribeTodayWorkout(user.id, (data) => {
      setWorkoutState(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.id]);

  // Get workout from state
  const workout = workoutState?.workout;

  // Handle start workout
  const handleStartWorkout = useCallback(async () => {
    if (!workout || !user?.id) return;

    // Start workout if not already in progress
    if (workout.status === 'scheduled') {
      await startWorkout(workout.id, user.id);
    }

    // Navigate to workout execution
    history.push(`/workout/${workout.id}`);
  }, [workout, user?.id, history]);

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <SwipePage withBottomPadding>
      {/* Header */}
      <div className="px-4 pt-safe">
        <div className="pt-4 pb-2">
          <p className="text-sm text-white/40">{getGreeting()}</p>
          <h1 className="text-2xl font-semibold text-white">
            {user?.name?.split(' ')[0] || 'Athlete'}
          </h1>
        </div>
      </div>

      {/* Date swiper */}
      <DateSwiper selected={dateIndex} onChange={setDateIndex} />

      {/* Content */}
      <div className="pt-4">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mx-4"
            >
              <div className="glass rounded-3xl p-6 animate-pulse">
                <div className="h-6 w-1/2 bg-white/10 rounded mb-4" />
                <div className="h-4 w-1/3 bg-white/5 rounded mb-6" />
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-10 bg-white/5 rounded" />
                  ))}
                </div>
              </div>
            </motion.div>
          ) : workout && dateIndex === 0 ? (
            <motion.div
              key="workout"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <WorkoutCard workout={workout} onStart={handleStartWorkout} />
            </motion.div>
          ) : (
            <motion.div
              key="rest"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <RestDayCard />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SwipePage>
  );
};

export default WorkoutsPage;
