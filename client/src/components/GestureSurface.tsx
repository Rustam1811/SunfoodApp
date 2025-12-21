"use client";

import React, { useRef } from 'react';

type GestureSurfaceProps = {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  threshold?: number;
};

export const GestureSurface: React.FC<GestureSurfaceProps> = ({
  className,
  style,
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onTap,
  threshold = 60,
}) => {
  const start = useRef<{ x: number; y: number; time: number } | null>(null);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    start.current = {
      x: event.clientX,
      y: event.clientY,
      time: Date.now(),
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!start.current) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    const dx = event.clientX - start.current.x;
    const dy = event.clientY - start.current.y;
    const adx = Math.abs(dx);
    const ady = Math.abs(dy);

    if (adx < 8 && ady < 8) {
      if (onTap) onTap();
      start.current = null;
      return;
    }

    if (adx > ady && adx > threshold) {
      if (dx > 0) {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
    } else if (ady > threshold) {
      if (dy > 0) {
        onSwipeDown?.();
      } else {
        onSwipeUp?.();
      }
    }

    start.current = null;
  };

  const handlePointerCancel = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!start.current) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    start.current = null;
  };

  return (
    <div
      className={className}
      style={{ touchAction: 'none', ...style }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      {children}
    </div>
  );
};
