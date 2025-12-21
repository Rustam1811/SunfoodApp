/**
 * Skeleton Components - Loading States
 * 
 * Shimmer-based loading skeletons for Trainer OS.
 * 
 * @module components/Skeleton
 */

import React from 'react';

// ============================================================================
// Base Skeleton
// ============================================================================

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  rounded = 'md',
}) => {
  const roundedClasses = {
    none: '',
    sm: 'rounded',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    full: 'rounded-full',
  };

  return (
    <div
      className={`tr-skeleton ${roundedClasses[rounded]} ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    />
  );
};

// ============================================================================
// Home Skeleton - Full page loading state
// ============================================================================

export const HomeSkeleton: React.FC = () => (
  <div className="min-h-screen bg-tr-base px-5 py-6 animate-pulse">
    {/* Header */}
    <div className="flex items-center justify-between mb-8">
      <div>
        <div className="h-4 w-16 bg-tr-elevated rounded mb-2" />
        <div className="h-8 w-48 bg-tr-elevated rounded" />
      </div>
      <div className="w-12 h-12 bg-tr-elevated rounded-full" />
    </div>
    
    {/* Stats */}
    <div className="flex gap-4 mb-8">
      <div className="h-16 flex-1 bg-tr-elevated rounded-xl" />
      <div className="h-16 flex-1 bg-tr-elevated rounded-xl" />
    </div>
    
    {/* Content cards */}
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-20 bg-tr-elevated rounded-xl" />
      ))}
    </div>
    
    {/* CTA */}
    <div className="mt-8 h-14 bg-tr-elevated rounded-2xl" />
  </div>
);

// ============================================================================
// Card Skeleton
// ============================================================================

export const CardSkeleton: React.FC<{ rows?: number }> = ({ rows = 3 }) => (
  <div className="bg-tr-card rounded-xl p-4 animate-pulse">
    <div className="h-5 w-1/3 bg-tr-elevated rounded mb-4" />
    <div className="space-y-3">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-4 bg-tr-elevated rounded" style={{ width: `${100 - i * 15}%` }} />
      ))}
    </div>
  </div>
);

// ============================================================================
// List Item Skeleton
// ============================================================================

export const ListItemSkeleton: React.FC = () => (
  <div className="flex items-center gap-4 py-3 animate-pulse">
    <div className="w-10 h-10 bg-tr-elevated rounded-xl" />
    <div className="flex-1">
      <div className="h-4 w-2/3 bg-tr-elevated rounded mb-2" />
      <div className="h-3 w-1/3 bg-tr-elevated rounded" />
    </div>
    <div className="w-6 h-6 bg-tr-elevated rounded" />
  </div>
);

// ============================================================================
// Avatar Skeleton
// ============================================================================

export const AvatarSkeleton: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return <div className={`${sizeClasses[size]} bg-tr-elevated rounded-full animate-pulse`} />;
};
