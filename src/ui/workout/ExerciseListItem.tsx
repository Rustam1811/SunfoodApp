/**
 * ExerciseListItem - Premium exercise card for list view
 * 
 * ⚡ PREMIUM UI VERSION
 * Design: Glass morphism with depth, glow on active, tactile feel
 *
 * Shows exercise thumbnail, name, sets/reps info, and completion status.
 * Tapping opens the detail modal.
 *
 * @module ui/workout/ExerciseListItem
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon, PlayCircleIcon } from '@heroicons/react/24/solid';

interface SetData {
  completed: boolean;
  actualReps?: number;
  actualWeight?: number;
}

interface ExerciseListItemProps {
  id: string;
  name: string;
  thumbnailUrl?: string;
  totalSets: number;
  targetReps: number;
  targetWeight: number;
  sets: SetData[];
  isActive: boolean;
  onClick: () => void;
}

export const ExerciseListItem: React.FC<ExerciseListItemProps> = ({
  name,
  thumbnailUrl,
  totalSets,
  targetReps,
  targetWeight,
  sets,
  isActive,
  onClick,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [imgError, setImgError] = useState(false);
  const completedSets = sets.filter((s) => s.completed).length;
  const isComplete = completedSets === totalSets;
  const progress = (completedSets / totalSets) * 100;
  
  // Validate thumbnail URL
  const validThumbnail = thumbnailUrl && 
    thumbnailUrl.startsWith('http') && 
    !thumbnailUrl.includes('youtube_thumb') &&
    !imgError;

  // Premium dynamic styles
  const getCardStyle = () => {
    if (isComplete) {
      return {
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        boxShadow: '0 0 20px rgba(16, 185, 129, 0.1), inset 0 1px 0 rgba(255,255,255,0.05)',
      };
    }
    if (isActive) {
      return {
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(99, 102, 241, 0.08) 100%)',
        border: '1px solid rgba(139, 92, 246, 0.4)',
        boxShadow: '0 0 30px rgba(139, 92, 246, 0.2), 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
      };
    }
    return {
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
    };
  };

  return (
    <motion.button
      onClick={onClick}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: isPressed ? 0.97 : isActive ? 1.01 : 1,
      }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="w-full flex items-center gap-4 p-4 rounded-2xl relative overflow-hidden"
      style={{
        ...getCardStyle(),
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* Active indicator glow line */}
      {isActive && !isComplete && (
        <motion.div
          className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          style={{
            background: 'linear-gradient(180deg, #8b5cf6, #06b6d4)',
            boxShadow: '0 0 15px rgba(139, 92, 246, 0.5)',
          }}
        />
      )}

      {/* Premium Thumbnail */}
      <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
        {/* Glass background */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 100%)',
          }}
        />
        
        {validThumbnail ? (
          <>
            <img 
              src={thumbnailUrl} 
              alt={name} 
              className="w-full h-full object-cover relative z-10"
              onError={() => setImgError(true)}
            />
            {/* Play overlay with glass effect */}
            <div 
              className="absolute inset-0 flex items-center justify-center z-20"
              style={{
                background: 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 100%)',
              }}
            >
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(4px)',
                }}
              >
                <PlayCircleIcon className="w-5 h-5 text-white" />
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center relative z-10">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(99, 102, 241, 0.2) 100%)',
              }}
            >
              <PlayCircleIcon className="w-6 h-6 text-violet-400/80" />
            </div>
          </div>
        )}
      </div>

      {/* Info section */}
      <div className="flex-1 text-left min-w-0">
        <h3 className="font-semibold text-white truncate tracking-tight text-[15px]">
          {name}
        </h3>
        
        {/* Premium stats row */}
        <div className="flex items-center gap-3 mt-1">
          <span className="text-white/60 text-sm tabular-nums">
            <span className="text-white font-semibold">{totalSets}</span>×{targetReps}
          </span>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <span className="text-white/60 text-sm tabular-nums">
            <span className="text-white font-semibold">{targetWeight}</span>кг
          </span>
        </div>
        
        {/* Premium progress bar */}
        <div 
          className="mt-3 h-1.5 rounded-full overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{
              background: isComplete 
                ? 'linear-gradient(90deg, #10b981, #06b6d4)'
                : 'linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)',
              boxShadow: progress > 0 
                ? isComplete 
                  ? '0 0 10px rgba(16, 185, 129, 0.5)'
                  : '0 0 10px rgba(99, 102, 241, 0.5)' 
                : 'none',
            }}
          />
        </div>
      </div>

      {/* Status badge - Premium */}
      <div className="flex-shrink-0">
        {isComplete ? (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="relative"
          >
            {/* Glow behind icon */}
            <div 
              className="absolute inset-0 blur-md"
              style={{ background: 'radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, transparent 70%)' }}
            />
            <CheckCircleIcon className="w-9 h-9 text-emerald-400 relative z-10 drop-shadow-lg" />
          </motion.div>
        ) : (
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: isActive 
                ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(99, 102, 241, 0.2) 100%)'
                : 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <span className="text-sm font-bold tabular-nums text-white/80">
              {completedSets}/{totalSets}
            </span>
          </div>
        )}
      </div>
      
      {/* Chevron hint for active */}
      {isActive && !isComplete && (
        <motion.div
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute right-3 text-violet-400/50"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.div>
      )}
    </motion.button>
  );
};

export default ExerciseListItem;
