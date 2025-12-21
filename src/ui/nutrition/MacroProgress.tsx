/**
 * MacroProgress - Premium Macro Progress Component
 * 
 * ⚡ PREMIUM UI VERSION
 * Design: Apple Fitness rings / Whoop strain gauge inspired
 * Features: Aggressive kcal ring, glowing progress, gauge-like feel
 *
 * Displays macro progress with animated rings and values.
 * Shows kcal, protein, fat, carbs with progress indicators.
 *
 * @module ui/nutrition/MacroProgress
 */

import React from 'react';
import { motion } from 'framer-motion';

// ============================================================================
// Types
// ============================================================================

interface MacroItem {
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
  gradientStart: string;
  gradientEnd: string;
  glowColor: string;
}

interface MacroProgressProps {
  kcal: { current: number; target: number };
  protein: { current: number; target: number };
  fat: { current: number; target: number };
  carbs: { current: number; target: number };
}

// ============================================================================
// Premium Mini Ring Component
// ============================================================================

interface MiniRingProps {
  value: number;
  size: number;
  strokeWidth: number;
  gradientId: string;
  gradientStart: string;
  gradientEnd: string;
  glowColor?: string;
}

const MiniRing: React.FC<MiniRingProps> = ({
  value,
  size,
  strokeWidth,
  gradientId,
  gradientStart,
  gradientEnd,
  glowColor,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value, 100);
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Glow effect behind */}
      {value > 20 && glowColor && (
        <motion.div 
          className="absolute inset-0 rounded-full blur-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          style={{
            background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
          }}
        />
      )}
      
      <svg width={size} height={size} className="-rotate-90 relative z-10">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradientStart} />
            <stop offset="100%" stopColor={gradientEnd} />
          </linearGradient>
          <filter id={`${gradientId}-glow`}>
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.06)"
          strokeWidth={strokeWidth}
        />
        
        {/* Progress arc with glow */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          filter={value > 30 ? `url(#${gradientId}-glow)` : undefined}
        />
      </svg>
    </div>
  );
};

// ============================================================================
// Premium Main Kcal Ring
// ============================================================================

interface MainKcalRingProps {
  current: number;
  target: number;
}

const MainKcalRing: React.FC<MainKcalRingProps> = ({ current, target }) => {
  const percentage = Math.min((current / target) * 100, 100);
  const remaining = Math.max(0, target - current);
  const size = 180;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const isNearGoal = percentage >= 80;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Ambient glow - more aggressive */}
      <motion.div
        className="absolute inset-2 rounded-full blur-2xl"
        animate={{
          opacity: isNearGoal ? [0.4, 0.6, 0.4] : 0.35,
          scale: isNearGoal ? [1, 1.05, 1] : 1,
        }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{
          background: isNearGoal 
            ? 'radial-gradient(circle, rgba(16, 185, 129, 0.5) 0%, rgba(6, 182, 212, 0.3) 50%, transparent 70%)'
            : 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, rgba(139, 92, 246, 0.2) 50%, transparent 70%)',
        }}
      />

      <svg width={size} height={size} className="-rotate-90 relative z-10">
        <defs>
          <linearGradient id="kcal-gradient-premium" x1="0%" y1="0%" x2="100%" y2="100%">
            {isNearGoal ? (
              <>
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#22d3ee" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </>
            )}
          </linearGradient>
          <filter id="kcal-glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Track marks - gauge feel */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180);
          const x1 = size/2 + (radius - 6) * Math.cos(angle);
          const y1 = size/2 + (radius - 6) * Math.sin(angle);
          const x2 = size/2 + (radius + 2) * Math.cos(angle);
          const y2 = size/2 + (radius + 2) * Math.sin(angle);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
            />
          );
        })}
        
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.06)"
          strokeWidth={strokeWidth}
        />
        
        {/* Progress arc with glow */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#kcal-gradient-premium)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          filter="url(#kcal-glow)"
        />
      </svg>

      {/* Center Content - Premium */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
        <motion.span
          key={remaining}
          initial={{ scale: 1.1, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-5xl font-bold tabular-nums text-white"
          style={{ 
            textShadow: isNearGoal 
              ? '0 0 30px rgba(16, 185, 129, 0.4)' 
              : '0 0 20px rgba(99, 102, 241, 0.3)',
          }}
        >
          {remaining}
        </motion.span>
        <span className="text-xs text-white/40 mt-1 uppercase tracking-widest font-medium">
          kcal осталось
        </span>
      </div>
    </div>
  );
};

// ============================================================================
// Premium Macro Item
// ============================================================================

interface MacroItemDisplayProps {
  item: MacroItem;
}

const MacroItemDisplay: React.FC<MacroItemDisplayProps> = ({ item }) => {
  const percentage = Math.min((item.current / item.target) * 100, 100);
  const isComplete = percentage >= 100;

  return (
    <motion.div 
      className="flex flex-col items-center"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="relative mb-3">
        <MiniRing
          value={percentage}
          size={64}
          strokeWidth={5}
          gradientId={`macro-premium-${item.label}`}
          gradientStart={item.gradientStart}
          gradientEnd={item.gradientEnd}
          glowColor={item.glowColor}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span 
            className="text-sm font-bold tabular-nums"
            style={{ 
              color: isComplete ? item.gradientStart : 'rgba(255,255,255,0.8)',
              textShadow: isComplete ? `0 0 10px ${item.glowColor}` : 'none',
            }}
          >
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
      
      {/* Values with premium styling */}
      <p className="text-base font-bold tabular-nums text-white tracking-tight">
        {item.current}
        <span className="text-white/30 text-sm font-medium">/{item.target}</span>
      </p>
      <p className="text-[10px] uppercase tracking-[0.15em] text-white/40 font-medium mt-0.5">
        {item.label}
      </p>
    </motion.div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export const MacroProgress: React.FC<MacroProgressProps> = ({
  kcal,
  protein,
  fat,
  carbs,
}) => {
  const macroItems: MacroItem[] = [
    {
      label: 'Белки',
      current: protein.current,
      target: protein.target,
      unit: 'g',
      color: '#22c55e',
      gradientStart: '#22c55e',
      gradientEnd: '#10b981',
      glowColor: 'rgba(34, 197, 94, 0.4)',
    },
    {
      label: 'Жиры',
      current: fat.current,
      target: fat.target,
      unit: 'g',
      color: '#f59e0b',
      gradientStart: '#f59e0b',
      gradientEnd: '#f97316',
      glowColor: 'rgba(245, 158, 11, 0.4)',
    },
    {
      label: 'Углеводы',
      current: carbs.current,
      target: carbs.target,
      unit: 'g',
      color: '#8b5cf6',
      gradientStart: '#8b5cf6',
      gradientEnd: '#a855f7',
      glowColor: 'rgba(139, 92, 246, 0.4)',
    },
  ];

  const consumedPercent = Math.round((kcal.current / kcal.target) * 100);

  return (
    <div className="flex flex-col items-center relative">
      {/* Main Kcal Ring */}
      <MainKcalRing current={kcal.current} target={kcal.target} />

      {/* Consumed label - Premium */}
      <div className="mt-4 mb-8 text-center">
        <p className="text-sm text-white/50">
          <span className="text-white font-bold text-lg tabular-nums">{kcal.current}</span>
          <span className="text-white/30 mx-1">/</span>
          <span className="text-white/40">{kcal.target}</span>
          <span className="text-white/30 ml-1">kcal</span>
        </p>
        {consumedPercent > 0 && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-white/30 mt-1"
          >
            {consumedPercent}% от цели
          </motion.p>
        )}
      </div>

      {/* Premium Macro breakdown card */}
      <div 
        className="w-full max-w-sm py-5 px-6 rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      >
        <div className="flex items-center justify-around">
          {macroItems.map((item, index) => (
            <React.Fragment key={item.label}>
              <MacroItemDisplay item={item} />
              {index < macroItems.length - 1 && (
                <div className="w-px h-16 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MacroProgress;
