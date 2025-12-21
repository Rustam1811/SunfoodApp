/**
 * ExerciseDetailModal - Full-screen modal for exercise execution
 * 
 * ⚡ PREMIUM UI VERSION
 * Design: Apple Fitness / Whoop / Nike Training Club inspired
 * Features: Glass morphism, depth, glow effects, powerful micro-interactions
 *
 * Features:
 * - Coach demo video at top
 * - Hidden client video upload (expandable on tap)
 * - Rest timer with pulsing glow
 * - Tactile set rows with depth
 * - Powerful CTA with animation
 *
 * @module ui/workout/ExerciseDetailModal
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  PlayIcon,
  VideoCameraIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CloudArrowUpIcon,
  CheckIcon,
  TrashIcon,
  FireIcon,
} from '@heroicons/react/24/solid';



// ============================================================================
// Types
// ============================================================================

interface SetData {
  setNumber: number;
  targetReps: number;
  targetWeight: number;
  restSeconds: number;
  completed: boolean;
  actualReps?: number;
  actualWeight?: number;
}

interface ExerciseData {
  id: string;
  name: string;
  coachVideoUrl?: string;
  coachNotes?: string;
  sets: SetData[];
}

interface ExerciseDetailModalProps {
  isOpen: boolean;
  exercise: ExerciseData | null;
  onClose: () => void;
  onSetComplete: (exerciseId: string, setIndex: number, weight: number, reps: number) => void;
  onVideoUpload?: (exerciseId: string, file: File) => Promise<void>;
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
// Grain Overlay Component
// ============================================================================

const GrainOverlay: React.FC = () => (
  <div 
    className="pointer-events-none fixed inset-0 z-[1]"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      opacity: 0.03,
    }}
  />
);

// ============================================================================
// Premium Rest Timer Component
// ============================================================================

interface RestTimerProps {
  duration: number;
  onComplete: () => void;
  onSkip: () => void;
}

const RestTimer: React.FC<RestTimerProps> = ({ duration, onComplete, onSkip }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    // Start pulsing when 5 seconds left
    if (timeLeft <= 5 && timeLeft > 0) {
      setIsPulsing(true);
      triggerHaptic('light');
    }
    
    if (timeLeft <= 0) {
      triggerHaptic('success');
      onComplete();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);

  const progress = (duration - timeLeft) / duration;
  const circumference = 2 * Math.PI * 45;

  return (
    <div className="flex flex-col items-center py-8">
      {/* Ambient glow behind timer */}
      <motion.div
        className="absolute w-48 h-48 rounded-full blur-3xl"
        animate={{
          opacity: isPulsing ? [0.3, 0.6, 0.3] : 0.2,
          scale: isPulsing ? [1, 1.1, 1] : 1,
        }}
        transition={{ duration: 1, repeat: Infinity }}
        style={{
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.5) 0%, transparent 70%)',
        }}
      />
      
      {/* Circular Progress - Premium */}
      <div className="relative w-40 h-40 mb-6">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="timerGradientPremium" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Background track */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="8"
          />
          
          {/* Progress circle with glow */}
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="url(#timerGradientPremium)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ 
              strokeDashoffset: circumference * (1 - progress),
              filter: isPulsing ? 'url(#glow)' : 'none'
            }}
            initial={{ strokeDashoffset: circumference }}
            transition={{ duration: 0.3 }}
          />
        </svg>
        
        {/* Time display - Premium */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span 
            key={timeLeft}
            initial={{ scale: 1.1, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-5xl font-bold tabular-nums text-white"
            style={{ 
              textShadow: isPulsing ? '0 0 20px rgba(99, 102, 241, 0.6)' : 'none',
            }}
          >
            {timeLeft}
          </motion.span>
          <span className="text-xs text-white/40 uppercase tracking-widest mt-1">сек</span>
        </div>
      </div>

      <p className="text-white/50 text-sm mb-6 font-medium">Отдых между подходами</p>

      {/* Skip button - Premium glass */}
      <motion.button
        onClick={onSkip}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.02 }}
        className="px-8 py-3 rounded-full text-white/80 text-sm font-medium transition-all duration-200"
        style={{
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
        }}
      >
        Пропустить →
      </motion.button>
    </div>
  );
};

// ============================================================================
// Video Upload Section (Hidden by default)
// ============================================================================

interface VideoUploadSectionProps {
  exerciseId: string;
  onUpload?: (exerciseId: string, file: File) => Promise<void>;
}

const VideoUploadSection: React.FC<VideoUploadSectionProps> = ({ exerciseId, onUpload }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate video
    if (!file.type.startsWith('video/')) {
      alert('Выберите видео файл');
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      alert('Максимальный размер 100MB');
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile || !onUpload) return;
    setUploading(true);
    try {
      await onUpload(exerciseId, selectedFile);
      setSelectedFile(null);
      setPreview(null);
      triggerHaptic('medium');
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreview(null);
  };

  return (
    <div className="border-t border-white/10">
      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-white/50"
      >
        <div className="flex items-center gap-2">
          <VideoCameraIcon className="w-4 h-4" />
          <span className="text-sm">Загрузить своё видео для тренера</span>
        </div>
        {isExpanded ? (
          <ChevronUpIcon className="w-4 h-4" />
        ) : (
          <ChevronDownIcon className="w-4 h-4" />
        )}
      </motion.button>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              {preview ? (
                <div className="relative rounded-xl overflow-hidden">
                  <video
                    src={preview}
                    className="w-full aspect-video object-cover"
                    controls
                  />
                  <div className="flex gap-2 mt-3">
                    <motion.button
                      onClick={handleClear}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 text-sm flex items-center justify-center gap-2"
                    >
                      <TrashIcon className="w-4 h-4" />
                      Удалить
                    </motion.button>
                    <motion.button
                      onClick={handleUpload}
                      disabled={uploading}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-400 text-white text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {uploading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          <CloudArrowUpIcon className="w-4 h-4" />
                        </motion.div>
                      ) : (
                        <CloudArrowUpIcon className="w-4 h-4" />
                      )}
                      Загрузить
                    </motion.button>
                  </div>
                </div>
              ) : (
                <motion.button
                  onClick={() => fileInputRef.current?.click()}
                  whileTap={{ scale: 0.98 }}
                  className="w-full aspect-video rounded-xl border-2 border-dashed border-white/20 bg-white/5 flex flex-col items-center justify-center gap-2 text-white/40"
                >
                  <CloudArrowUpIcon className="w-8 h-8" />
                  <span className="text-sm">Снять или выбрать видео</span>
                </motion.button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// Set Row Component
// ============================================================================
// Premium Set Row Component
// ============================================================================

interface SetRowProps {
  set: SetData;
  index: number;
  isActive: boolean;
  onComplete: (weight: number, reps: number) => void;
}

const SetRow: React.FC<SetRowProps> = ({ set, index, isActive, onComplete }) => {
  const [weight, setWeight] = useState(set.actualWeight ?? set.targetWeight);
  const [reps, setReps] = useState(set.actualReps ?? set.targetReps);
  const [isPressed, setIsPressed] = useState(false);

  // Completed set animation
  const completedStyles = set.completed ? {
    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    boxShadow: '0 0 20px rgba(16, 185, 129, 0.1), inset 0 1px 0 rgba(255,255,255,0.05)',
  } : {};

  // Active set glow
  const activeStyles = isActive && !set.completed ? {
    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.08) 100%)',
    borderColor: 'rgba(139, 92, 246, 0.4)',
    boxShadow: '0 0 30px rgba(139, 92, 246, 0.15), inset 0 1px 0 rgba(255,255,255,0.1)',
  } : {};

  const baseStyles = {
    background: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(10px)',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: isActive && !set.completed ? 1.01 : 1,
      }}
      transition={{ duration: 0.2 }}
      className="relative flex items-center gap-3 p-4 rounded-2xl border overflow-hidden"
      style={{
        ...baseStyles,
        ...activeStyles,
        ...completedStyles,
      }}
    >
      {/* Subtle inner glow for active */}
      {isActive && !set.completed && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at top, rgba(139, 92, 246, 0.1) 0%, transparent 60%)',
          }}
        />
      )}

      {/* Set number badge - Premium */}
      <div 
        className="relative w-10 h-10 rounded-full flex items-center justify-center shrink-0"
        style={{
          background: set.completed 
            ? 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)' 
            : isActive 
              ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(99, 102, 241, 0.2) 100%)'
              : 'rgba(255, 255, 255, 0.08)',
          boxShadow: set.completed 
            ? '0 0 20px rgba(16, 185, 129, 0.3)' 
            : 'inset 0 1px 0 rgba(255,255,255,0.1)',
        }}
      >
        {set.completed ? (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <CheckIcon className="w-5 h-5 text-white" />
          </motion.div>
        ) : (
          <span className="text-sm font-bold tabular-nums text-white/80">{index + 1}</span>
        )}
      </div>

      {/* Weight input - Premium */}
      <div className="flex-1">
        <label className="text-[10px] uppercase tracking-wider text-white/30 block mb-1.5 font-medium">
          Вес
        </label>
        <div className="relative">
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            disabled={set.completed}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-center font-semibold tabular-nums text-lg disabled:opacity-40 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 focus:outline-none transition-all"
            style={{ backdropFilter: 'blur(5px)' }}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 text-xs">кг</span>
        </div>
      </div>

      {/* Reps input - Premium */}
      <div className="flex-1">
        <label className="text-[10px] uppercase tracking-wider text-white/30 block mb-1.5 font-medium">
          Повторы
        </label>
        <input
          type="number"
          value={reps}
          onChange={(e) => setReps(Number(e.target.value))}
          disabled={set.completed}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-center font-semibold tabular-nums text-lg disabled:opacity-40 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 focus:outline-none transition-all"
          style={{ backdropFilter: 'blur(5px)' }}
        />
      </div>

      {/* Complete button - POWERFUL CTA */}
      {!set.completed && isActive && (
        <motion.button
          onClick={() => {
            triggerHaptic('success');
            onComplete(weight, reps);
          }}
          onTouchStart={() => setIsPressed(true)}
          onTouchEnd={() => setIsPressed(false)}
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
          onMouseLeave={() => setIsPressed(false)}
          whileTap={{ scale: 0.92 }}
          className="relative w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden shrink-0"
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)',
            boxShadow: isPressed 
              ? '0 0 40px rgba(99, 102, 241, 0.6), inset 0 0 20px rgba(0,0,0,0.2)'
              : '0 0 25px rgba(99, 102, 241, 0.4), 0 4px 15px rgba(0,0,0,0.3)',
          }}
        >
          {/* Shine effect */}
          <motion.div
            className="absolute inset-0"
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: '100%', opacity: [0, 0.3, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            }}
          />
          <CheckIcon className="w-6 h-6 text-white relative z-10" />
        </motion.button>
      )}

      {/* Completed checkmark for non-active completed sets */}
      {set.completed && !isActive && (
        <div className="w-14 h-14 flex items-center justify-center shrink-0">
          <CheckIcon className="w-5 h-5 text-emerald-400/60" />
        </div>
      )}
    </motion.div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({
  isOpen,
  exercise,
  onClose,
  onSetComplete,
  onVideoUpload,
}) => {
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [restDuration, setRestDuration] = useState(60);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);

  // Reset state when exercise changes
  useEffect(() => {
    if (exercise) {
      const firstIncomplete = exercise.sets.findIndex((s) => !s.completed);
      setCurrentSetIndex(firstIncomplete === -1 ? 0 : firstIncomplete);
      setShowRestTimer(false);
    }
  }, [exercise?.id]);

  const handleSetComplete = useCallback(
    (setIndex: number, weight: number, reps: number) => {
      if (!exercise) return;

      onSetComplete(exercise.id, setIndex, weight, reps);

      // Show rest timer if not last set
      const nextSetIndex = setIndex + 1;
      if (nextSetIndex < exercise.sets.length) {
        setRestDuration(exercise.sets[setIndex].restSeconds || 60);
        setShowRestTimer(true);
        setCurrentSetIndex(nextSetIndex);
      }
    },
    [exercise, onSetComplete]
  );

  const handleRestComplete = useCallback(() => {
    setShowRestTimer(false);
    triggerHaptic('medium');
  }, []);

  if (!isOpen || !exercise) return null;

  const completedSets = exercise.sets.filter((s) => s.completed).length;
  const allSetsComplete = completedSets === exercise.sets.length;
  const progressPercent = (completedSets / exercise.sets.length) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50"
        style={{ background: 'rgba(0, 0, 0, 0.95)' }}
      >
        {/* Grain texture overlay */}
        <GrainOverlay />
        
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="absolute inset-0 overflow-y-auto"
          style={{
            background: 'linear-gradient(180deg, #18181b 0%, #0a0a0b 50%, #09090b 100%)',
          }}
        >
          {/* Premium Header with progress */}
          <div 
            className="sticky top-0 z-10 border-b border-white/5"
            style={{
              background: 'linear-gradient(180deg, rgba(24, 24, 27, 0.98) 0%, rgba(24, 24, 27, 0.95) 100%)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Mini progress bar at very top */}
            <div className="h-1 w-full bg-white/5">
              <motion.div
                className="h-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                style={{
                  background: allSetsComplete 
                    ? 'linear-gradient(90deg, #10b981, #06b6d4)'
                    : 'linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)',
                  boxShadow: '0 0 10px rgba(99, 102, 241, 0.5)',
                }}
              />
            </div>
            
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex-1 pr-4">
                <h2 className="text-xl font-bold text-white truncate tracking-tight">
                  {exercise.name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center">
                    {[...Array(exercise.sets.length)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full mr-1"
                        initial={{ scale: 0 }}
                        animate={{ 
                          scale: 1,
                          backgroundColor: i < completedSets 
                            ? '#10b981' 
                            : i === currentSetIndex && !allSetsComplete
                              ? '#8b5cf6'
                              : 'rgba(255,255,255,0.2)'
                        }}
                        transition={{ delay: i * 0.05 }}
                        style={{
                          boxShadow: i < completedSets ? '0 0 8px rgba(16, 185, 129, 0.5)' : 'none'
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-white/40 tabular-nums">
                    {completedSets}/{exercise.sets.length}
                  </span>
                </div>
              </div>
              
              {/* Close button - Premium glass */}
              <motion.button
                onClick={onClose}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <XMarkIcon className="w-5 h-5 text-white/60" />
              </motion.button>
            </div>
          </div>

          {/* Coach Video Section - Premium */}
          <div 
            className="relative aspect-video"
            style={{
              background: 'linear-gradient(180deg, #1f1f23 0%, #18181b 100%)',
            }}
          >
            {exercise.coachVideoUrl ? (
              <video
                src={exercise.coachVideoUrl}
                poster={exercise.coachVideoUrl.replace(/\.[^.]+$/, '_thumb.jpg')}
                className="w-full h-full object-contain"
                controls
                playsInline
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <motion.div 
                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                    animate={{ 
                      boxShadow: ['0 0 20px rgba(139, 92, 246, 0.2)', '0 0 40px rgba(139, 92, 246, 0.3)', '0 0 20px rgba(139, 92, 246, 0.2)']
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{
                      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(99, 102, 241, 0.1) 100%)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                    }}
                  >
                    <PlayIcon className="w-10 h-10 text-violet-400/60" />
                  </motion.div>
                  <p className="text-sm text-white/50 font-medium">Видео тренера</p>
                  <p className="text-xs text-white/25 mt-1">Скоро будет добавлено</p>
                </div>
              </div>
            )}
            
            {/* Bottom gradient fade */}
            <div 
              className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
              style={{
                background: 'linear-gradient(180deg, transparent 0%, #18181b 100%)',
              }}
            />
          </div>

          {/* Coach Notes - Premium card */}
          {exercise.coachNotes && (
            <div 
              className="mx-4 -mt-4 mb-4 p-4 rounded-2xl relative z-10"
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <p className="text-sm text-white/70 leading-relaxed">{exercise.coachNotes}</p>
            </div>
          )}

          {/* Client Video Upload (Hidden) */}
          {onVideoUpload && (
            <VideoUploadSection exerciseId={exercise.id} onUpload={onVideoUpload} />
          )}

          {/* Rest Timer or Sets - Premium */}
          <div className="px-4 py-6 relative">
            {showRestTimer ? (
              <RestTimer
                duration={restDuration}
                onComplete={handleRestComplete}
                onSkip={handleRestComplete}
              />
            ) : (
              <div className="space-y-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/30 mb-4 font-semibold">
                  Подходы
                </p>
                {exercise.sets.map((set, index) => (
                  <SetRow
                    key={index}
                    set={set}
                    index={index}
                    isActive={index === currentSetIndex && !allSetsComplete}
                    onComplete={(weight, reps) => handleSetComplete(index, weight, reps)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Done Button - POWERFUL SUCCESS CTA */}
          {allSetsComplete && (
            <div className="px-4 pb-8">
              <motion.button
                onClick={() => {
                  triggerHaptic('success');
                  onClose();
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.97 }}
                className="relative w-full h-16 rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-3 overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                  boxShadow: '0 0 40px rgba(16, 185, 129, 0.4), 0 8px 30px rgba(0,0,0,0.3)',
                }}
              >
                {/* Celebration glow pulse */}
                <motion.div
                  className="absolute inset-0"
                  animate={{
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{
                    background: 'radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, transparent 70%)',
                  }}
                />
                
                {/* Shine sweep */}
                <motion.div
                  className="absolute inset-0"
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                  }}
                />
                
                <FireIcon className="w-6 h-6 relative z-10" />
                <span className="relative z-10">Упражнение завершено!</span>
              </motion.button>
            </div>
          )}

          {/* Safe area bottom padding */}
          <div className="h-8" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ExerciseDetailModal;
