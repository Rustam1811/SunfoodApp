/**
 * WorkoutExecutionScreen - Premium Workout Execution Page (v2)
 * 
 * ⚡ PREMIUM UI VERSION
 * Design: Apple Fitness / Whoop / Nike Training Club inspired
 * Features: Vignette, premium gradients, glass morphism, powerful CTAs
 *
 * Now uses REAL Firebase data from users/{clientId}/workoutPlans
 *
 * @module ui/workout/WorkoutExecutionScreen
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, CheckCircleIcon, FireIcon, TrophyIcon, BoltIcon } from '@heroicons/react/24/solid';
import { ExerciseListItem } from './ExerciseListItem';
import { ExerciseDetailModal } from './ExerciseDetailModal';
import { useAuth } from '../../auth/AuthContextV2';
import {
  getWorkoutById,
  saveSetResult,
  completeWorkout,
  subscribeToWorkout,
  addExerciseVideo,
  type ScheduledWorkout,
  type ExerciseResult,
} from '../../services/workoutService';
import { uploadVideo } from '../../services/videoService';

// ============================================================================
// Types
// ============================================================================

interface SetResult {
  setNumber: number;
  targetReps: number;
  targetWeight: number;
  restSeconds: number;
  completed: boolean;
  actualWeight?: number;
  actualReps?: number;
}

interface ExerciseResultLocal {
  exerciseId: string;
  sets: SetResult[];
}

interface Exercise {
  id: string;
  name: string;
  notes?: string;
  coachVideoUrl?: string;
  thumbnailUrl?: string;
  sets: number;
  reps: number;
  weight: number;
  restTime: number;
}

interface WorkoutSession {
  id: string;
  title: string;
  exercises: Exercise[];
  results: ExerciseResultLocal[];
  status: 'idle' | 'in_progress' | 'completed';
  startedAt?: Date;
  completedAt?: Date;
  trainerId?: string;
}

// ============================================================================
// Haptic Feedback (Enhanced)
// ============================================================================

const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'success' = 'light') => {
  if ('vibrate' in navigator) {
    const patterns = { 
      light: 10, 
      medium: 25, 
      heavy: [40, 20, 40],
      success: [10, 30, 10, 30, 50]  // Victory pattern
    };
    navigator.vibrate(patterns[type]);
  }
};

// ============================================================================
// Premium Grain Overlay
// ============================================================================

const GrainOverlay: React.FC = () => (
  <div 
    className="fixed inset-0 pointer-events-none z-[1]"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      opacity: 0.025,
    }}
  />
);

// ============================================================================
// Premium Vignette Overlay
// ============================================================================

const VignetteOverlay: React.FC = () => (
  <div 
    className="fixed inset-0 pointer-events-none z-[2]"
    style={{
      background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.4) 100%)',
    }}
  />
);

// ============================================================================
// Premium Completion Screen
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

  const completedSets = session.results.reduce(
    (sum, r) => sum + r.sets.filter((s) => s.completed).length,
    0
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center px-6 relative"
    >
      {/* Background celebration glow */}
      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl"
        animate={{
          opacity: [0.2, 0.4, 0.2],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 3, repeat: Infinity }}
        style={{
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, rgba(6, 182, 212, 0.2) 40%, transparent 70%)',
        }}
      />
      
      {/* Success Icon - Premium */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
        className="relative mb-8"
      >
        {/* Glow rings */}
        <motion.div
          className="absolute -inset-4 rounded-full"
          animate={{
            boxShadow: [
              '0 0 40px rgba(16, 185, 129, 0.3)',
              '0 0 60px rgba(16, 185, 129, 0.4)',
              '0 0 40px rgba(16, 185, 129, 0.3)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        
        <div 
          className="w-28 h-28 rounded-full flex items-center justify-center relative z-10"
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(6, 182, 212, 0.15) 100%)',
            border: '2px solid rgba(16, 185, 129, 0.4)',
            boxShadow: 'inset 0 0 30px rgba(16, 185, 129, 0.2)',
          }}
        >
          <TrophyIcon className="w-14 h-14 text-emerald-400 drop-shadow-lg" />
        </div>
      </motion.div>

      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-3xl font-bold text-white mb-2 tracking-tight"
      >
        Тренировка завершена!
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-white/50 mb-10"
      >
        {session.title}
      </motion.p>

      {/* Premium Stats Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="w-full max-w-sm py-6 px-8 rounded-3xl mb-10 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}
      >
        {/* Subtle inner glow */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at top, rgba(16, 185, 129, 0.08) 0%, transparent 60%)',
          }}
        />
        
        <div className="flex items-center justify-around relative z-10">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <BoltIcon className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-4xl font-bold tabular-nums text-white">{duration}</p>
            <p className="text-[10px] uppercase tracking-[0.15em] text-white/40 mt-1 font-medium">минут</p>
          </div>
          
          <div className="w-px h-16 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <FireIcon className="w-4 h-4 text-orange-400" />
            </div>
            <p className="text-4xl font-bold tabular-nums text-white">{session.exercises.length}</p>
            <p className="text-[10px] uppercase tracking-[0.15em] text-white/40 mt-1 font-medium">упражнений</p>
          </div>
          
          <div className="w-px h-16 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-4xl font-bold tabular-nums text-white">{completedSets}</p>
            <p className="text-[10px] uppercase tracking-[0.15em] text-white/40 mt-1 font-medium">подходов</p>
          </div>
        </div>
      </motion.div>

      {/* Powerful Finish Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        onClick={() => {
          triggerHaptic('success');
          onFinish();
        }}
        whileTap={{ scale: 0.97 }}
        className="relative w-full max-w-xs h-16 rounded-2xl text-white font-bold text-lg overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
          boxShadow: '0 0 40px rgba(16, 185, 129, 0.35), 0 8px 30px rgba(0,0,0,0.3)',
        }}
      >
        {/* Shine effect */}
        <motion.div
          className="absolute inset-0"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
          }}
        />
        <span className="relative z-10">Отлично! 🔥</span>
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

export const WorkoutExecutionScreen: React.FC<WorkoutExecutionScreenProps> = ({ sessionId, onExit }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<WorkoutSession | null>(null);

  // Load workout from Firebase
  useEffect(() => {
    if (!sessionId || !user?.id) {
      setLoading(false);
      return;
    }

    const loadWorkout = async () => {
      try {
        const workout = await getWorkoutById(sessionId, user.id);
        if (workout) {
          // Convert Firebase workout to local session format
          const exercises: Exercise[] = workout.exercises.map(ex => ({
            id: ex.id,
            name: ex.name.ru || ex.name.en || 'Упражнение',
            notes: ex.notes,
            coachVideoUrl: ex.videoUrl,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight || 0,
            restTime: ex.restTime || 60,
          }));

          // Build results from existing or create new
          const results: ExerciseResultLocal[] = exercises.map(ex => {
            const existingResult = workout.results?.find(r => r.exerciseId === ex.id);
            if (existingResult) {
              return {
                exerciseId: ex.id,
                sets: Array.from({ length: ex.sets }, (_, i) => ({
                  setNumber: i + 1,
                  targetReps: ex.reps,
                  targetWeight: ex.weight,
                  restSeconds: ex.restTime,
                  completed: existingResult.sets[i]?.completed || false,
                  actualWeight: existingResult.sets[i]?.weight,
                  actualReps: existingResult.sets[i]?.reps,
                })),
              };
            }
            return {
              exerciseId: ex.id,
              sets: Array.from({ length: ex.sets }, (_, i) => ({
                setNumber: i + 1,
                targetReps: ex.reps,
                targetWeight: ex.weight,
                restSeconds: ex.restTime,
                completed: false,
              })),
            };
          });

          setSession({
            id: workout.id,
            title: workout.title,
            exercises,
            results,
            status: workout.status === 'completed' ? 'completed' : 'in_progress',
            startedAt: workout.startedAt ? new Date(workout.startedAt) : new Date(),
            completedAt: workout.completedAt ? new Date(workout.completedAt) : undefined,
          });
        }
      } catch (error) {
        // Error loading workout
      } finally {
        setLoading(false);
      }
    };

    loadWorkout();
  }, [sessionId, user?.id]);

  // Modal state
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);

  // Get selected exercise data for modal
  const selectedExercise = useMemo(() => {
    if (!selectedExerciseId || !session) return null;
    const exercise = session.exercises.find((e) => e.id === selectedExerciseId);
    const result = session.results.find((r) => r.exerciseId === selectedExerciseId);
    if (!exercise || !result) return null;

    return {
      id: exercise.id,
      name: exercise.name,
      coachVideoUrl: exercise.coachVideoUrl,
      coachNotes: exercise.notes,
      sets: result.sets,
    };
  }, [selectedExerciseId, session]);

  // Check if workout is complete
  const isComplete = useMemo(() => {
    if (!session) return false;
    return session.results.every((r) => r.sets.every((s) => s.completed));
  }, [session?.results]);

  // Find active exercise (first incomplete)
  const activeExerciseId = useMemo(() => {
    if (!session) return null;
    for (const result of session.results) {
      if (result.sets.some((s) => !s.completed)) {
        return result.exerciseId;
      }
    }
    return null;
  }, [session?.results]);

  // Handle exercise tap
  const handleExerciseTap = useCallback((exerciseId: string) => {
    triggerHaptic('light');
    setSelectedExerciseId(exerciseId);
  }, []);

  // Handle set complete - saves to Firebase
  const handleSetComplete = useCallback(
    async (exerciseId: string, setIndex: number, weight: number, reps: number) => {
      if (!session || !user?.id) return;

      // Update local state immediately for responsiveness
      setSession((prev) => {
        if (!prev) return prev;
        const newResults = prev.results.map((r) => {
          if (r.exerciseId !== exerciseId) return r;
          return {
            ...r,
            sets: r.sets.map((s, i) =>
              i === setIndex ? { ...s, completed: true, actualWeight: weight, actualReps: reps } : s
            ),
          };
        });

        const allDone = newResults.every((r) => r.sets.every((s) => s.completed));

        return {
          ...prev,
          results: newResults,
          status: allDone ? 'completed' : 'in_progress',
          completedAt: allDone ? new Date() : undefined,
        };
      });

      // Save to Firebase
      try {
        await saveSetResult(session.id, exerciseId, setIndex, { weight, reps, completed: true }, user.id);
      } catch (error) {
        // Silent fail - local state already updated
      }
    },
    [session, user?.id]
  );

  // Handle client video upload
  const handleVideoUpload = useCallback(async (exerciseId: string, file: File) => {
    if (!session || !user?.id) return;
    
    try {
      // Convert File to Blob for upload
      const blob = new Blob([await file.arrayBuffer()], { type: file.type });
      
      // Find exercise name (it's a string in our Exercise interface)
      const exerciseName = session.exercises.find(e => e.id === exerciseId)?.name;
      
      // Upload to Firebase Storage
      await uploadVideo(
        user.id,
        session.trainerId || user.id,
        blob,
        {
          sessionId: session.id,
          exerciseId,
          exerciseName: exerciseName || undefined,
          duration: 0, // Will be set when video is processed
        }
      );
      
      // Note: videoUrl will be stored in clientVideos collection
      // Coach can view it from the VideoDetailPage
    } catch (error) {
      throw error;
    }
  }, [session, user?.id]);

  // Handle exit
  const handleExit = useCallback(() => {
    triggerHaptic('light');
    onExit?.();
  }, [onExit]);

  // Handle finish - complete workout in Firebase
  const handleFinish = useCallback(async () => {
    if (!session || !user?.id) {
      onExit?.();
      return;
    }
    
    triggerHaptic('medium');
    
    // Convert results to Firebase format
    const firebaseResults: ExerciseResult[] = session.results.map(r => ({
      exerciseId: r.exerciseId,
      sets: r.sets.map(s => ({
        setNumber: s.setNumber,
        completed: s.completed,
        weight: s.actualWeight,
        reps: s.actualReps,
      })),
      completed: r.sets.every(s => s.completed),
    }));
    
    try {
      await completeWorkout(session.id, { results: firebaseResults }, user.id);
    } catch (error) {
      // Silent fail
    }
    
    onExit?.();
  }, [session, user?.id, onExit]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f0f11' }}>
        <div className="text-white/50">Загрузка...</div>
      </div>
    );
  }

  // No workout found
  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: '#0f0f11' }}>
        <p className="text-white/50 mb-4">Тренировка не найдена</p>
        <button onClick={onExit} className="text-blue-400">Назад</button>
      </div>
    );
  }

  // Progress calculation
  const totalSets = session.exercises.reduce((sum, ex) => sum + ex.sets, 0);
  const completedSets = session.results.reduce(
    (sum, r) => sum + r.sets.filter((s) => s.completed).length,
    0
  );
  const progress = (completedSets / totalSets) * 100;

  // Render completion screen
  if (isComplete && session.status === 'completed') {
    return (
      <div 
        className="min-h-screen relative"
        style={{
          background: 'linear-gradient(180deg, #0f0f11 0%, #0a0a0b 50%, #050506 100%)',
        }}
      >
        <GrainOverlay />
        <VignetteOverlay />
        <CompletionScreen session={session} onFinish={handleFinish} />
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen relative"
      style={{
        background: 'linear-gradient(180deg, #0f0f11 0%, #0a0a0b 50%, #050506 100%)',
      }}
    >
      {/* Premium overlays */}
      <GrainOverlay />
      <VignetteOverlay />

      {/* Premium Header */}
      <header 
        className="sticky top-0 z-20 border-b border-white/5"
        style={{
          background: 'linear-gradient(180deg, rgba(15, 15, 17, 0.98) 0%, rgba(15, 15, 17, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Subtle top glow */}
        <div 
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.3), transparent)',
          }}
        />
        
        <div className="flex items-center gap-4 px-4 py-4">
          {/* Back button - Glass */}
          <motion.button
            onClick={handleExit}
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <ChevronLeftIcon className="w-5 h-5 text-white/60" />
          </motion.button>

          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-white truncate tracking-tight">{session.title}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-white/40 tabular-nums">
                <span className="text-white/70 font-semibold">{completedSets}</span>/{totalSets} подходов
              </span>
              {progress > 0 && (
                <>
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  <span className="text-xs text-emerald-400/80 font-medium tabular-nums">
                    {Math.round(progress)}%
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Premium progress bar */}
        <div className="h-1 bg-white/5 relative overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full absolute left-0 top-0"
            style={{
              background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)',
              boxShadow: '0 0 15px rgba(99, 102, 241, 0.5)',
            }}
          />
        </div>
      </header>

      {/* Exercise List - Premium container */}
      <main className="px-4 py-6 space-y-3 relative z-10">
        {/* Section header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/30 font-semibold">
            Упражнения
          </p>
          <div className="flex items-center gap-1.5">
            <FireIcon className="w-3.5 h-3.5 text-orange-400/70" />
            <span className="text-[11px] text-white/40 tabular-nums font-medium">
              {session.exercises.length} шт
            </span>
          </div>
        </div>
        
        <AnimatePresence>
          {session.exercises.map((exercise, index) => {
            const result = session.results.find((r) => r.exerciseId === exercise.id);
            return (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ExerciseListItem
                  id={exercise.id}
                  name={exercise.name}
                  thumbnailUrl={exercise.thumbnailUrl}
                  totalSets={exercise.sets}
                  targetReps={exercise.reps}
                  targetWeight={exercise.weight}
                  sets={result?.sets || []}
                  isActive={exercise.id === activeExerciseId}
                  onClick={() => handleExerciseTap(exercise.id)}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {/* Bottom padding for safe area */}
        <div className="h-8" />
      </main>

      {/* Exercise Detail Modal */}
      <ExerciseDetailModal
        isOpen={selectedExerciseId !== null}
        exercise={selectedExercise}
        onClose={() => setSelectedExerciseId(null)}
        onSetComplete={handleSetComplete}
        onVideoUpload={handleVideoUpload}
      />
    </div>
  );
};

export default WorkoutExecutionScreen;
