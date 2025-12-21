/**
 * WaterWidget - Premium Water Tracking Widget
 *
 * Features:
 * - Animated bottle fill level
 * - Cup increment buttons
 * - Progress display in cups and liters
 *
 * @module ui/nutrition/WaterWidget
 */

import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, MinusIcon } from '@heroicons/react/24/solid';

// ============================================================================
// Types
// ============================================================================

interface WaterWidgetProps {
  cupsConsumed: number;
  cupsTarget: number;
  cupSizeMl: number;
  onAddCup: () => void;
  onRemoveCup: () => void;
}

// ============================================================================
// Haptic
// ============================================================================

const triggerHaptic = () => {
  if ('vibrate' in navigator) {
    navigator.vibrate(10);
  }
};

// ============================================================================
// Bottle SVG Component
// ============================================================================

interface BottleFillProps {
  fillPercentage: number;
}

const BottleFill: React.FC<BottleFillProps> = ({ fillPercentage }) => {
  const clampedFill = Math.min(Math.max(fillPercentage, 0), 100);
  
  return (
    <svg
      width="60"
      height="100"
      viewBox="0 0 60 100"
      fill="none"
      className="drop-shadow-lg"
    >
      <defs>
        <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        <clipPath id="bottleClip">
          {/* Bottle shape */}
          <path d="M20 10 L20 5 Q20 0 25 0 L35 0 Q40 0 40 5 L40 10 L45 20 Q50 25 50 35 L50 85 Q50 95 40 95 L20 95 Q10 95 10 85 L10 35 Q10 25 15 20 Z" />
        </clipPath>
      </defs>

      {/* Bottle outline */}
      <path
        d="M20 10 L20 5 Q20 0 25 0 L35 0 Q40 0 40 5 L40 10 L45 20 Q50 25 50 35 L50 85 Q50 95 40 95 L20 95 Q10 95 10 85 L10 35 Q10 25 15 20 Z"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="2"
        fill="rgba(255,255,255,0.05)"
      />

      {/* Water fill */}
      <g clipPath="url(#bottleClip)">
        <motion.rect
          x="0"
          width="60"
          fill="url(#waterGradient)"
          initial={{ y: 100, height: 0 }}
          animate={{
            y: 100 - clampedFill,
            height: clampedFill,
          }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        />

        {/* Water wave effect */}
        <motion.path
          d="M0 0 Q15 -5 30 0 T60 0 L60 10 L0 10 Z"
          fill="rgba(255,255,255,0.2)"
          animate={{
            y: [100 - clampedFill - 5, 100 - clampedFill - 3, 100 - clampedFill - 5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </g>

      {/* Shine effect */}
      <path
        d="M15 25 L15 80 Q15 90 20 90"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};

// ============================================================================
// Cup Button
// ============================================================================

interface CupButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  disabled?: boolean;
}

const CupButton: React.FC<CupButtonProps> = ({ onClick, icon, disabled }) => (
  <motion.button
    onClick={() => {
      triggerHaptic();
      onClick();
    }}
    whileTap={{ scale: 0.9 }}
    disabled={disabled}
    className="
      w-12 h-12
      rounded-full
      bg-white/10
      border border-white/10
      flex items-center justify-center
      text-white
      disabled:opacity-30 disabled:cursor-not-allowed
      transition-colors
      hover:bg-white/15
    "
  >
    {icon}
  </motion.button>
);

// ============================================================================
// Main Component
// ============================================================================

export const WaterWidget: React.FC<WaterWidgetProps> = ({
  cupsConsumed,
  cupsTarget,
  cupSizeMl,
  onAddCup,
  onRemoveCup,
}) => {
  const fillPercentage = (cupsConsumed / cupsTarget) * 100;
  const currentMl = cupsConsumed * cupSizeMl;
  const targetMl = cupsTarget * cupSizeMl;
  const currentLiters = (currentMl / 1000).toFixed(1);
  const targetLiters = (targetMl / 1000).toFixed(1);
  const isComplete = cupsConsumed >= cupsTarget;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="
        relative overflow-hidden
        rounded-2xl
        bg-white/5
        border border-white/10
        p-5
      "
    >
      {/* Grain texture */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Complete glow */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-sky-500/10"
        />
      )}

      <div className="relative z-10 flex items-center gap-5">
        {/* Bottle */}
        <div className="flex-shrink-0">
          <BottleFill fillPercentage={fillPercentage} />
        </div>

        {/* Info + Controls */}
        <div className="flex-1">
          {/* Label */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">💧</span>
            <h3 className="font-medium text-white">Water</h3>
            {isComplete && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400"
              >
                Goal!
              </motion.span>
            )}
          </div>

          {/* Progress text */}
          <div className="mb-3">
            <p className="text-2xl font-semibold tabular-nums text-white">
              {currentLiters}
              <span className="text-sm text-white/40 ml-1">/ {targetLiters}L</span>
            </p>
            <p className="text-xs text-white/40">
              {cupsConsumed} of {cupsTarget} cups ({cupSizeMl}ml each)
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <CupButton
              onClick={onRemoveCup}
              icon={<MinusIcon className="w-5 h-5" />}
              disabled={cupsConsumed <= 0}
            />
            <CupButton
              onClick={onAddCup}
              icon={<PlusIcon className="w-5 h-5" />}
            />
            <motion.button
              onClick={() => {
                triggerHaptic();
                onAddCup();
              }}
              whileTap={{ scale: 0.95 }}
              className="
                flex-1 h-12
                rounded-xl
                bg-gradient-to-r from-cyan-500/20 to-sky-500/20
                border border-cyan-500/30
                text-cyan-400 font-medium text-sm
                flex items-center justify-center gap-2
                hover:from-cyan-500/30 hover:to-sky-500/30
                transition-colors
              "
            >
              <PlusIcon className="w-4 h-4" />
              Add Cup
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WaterWidget;
