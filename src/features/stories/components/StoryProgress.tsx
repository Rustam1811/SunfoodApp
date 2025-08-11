import React from 'react';

interface StoryProgressProps {
  count: number;
  activeIndex: number;
  progress: number; // 0-100
}

export const StoryProgress: React.FC<StoryProgressProps> = ({ count, activeIndex, progress }) => {
  return (
    <div className="absolute top-4 left-4 right-4 flex space-x-1">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex-1 h-0.5 rounded-full overflow-hidden bg-white/30">
          <div
            className="h-full rounded-full transition-all duration-100"
            style={{
              background: i < activeIndex
                ? '#fff'
                : i === activeIndex
                ? `linear-gradient(to right, #fff ${progress}%, transparent ${progress}%)`
                : 'transparent',
              width: '100%'
            }}
          />
        </div>
      ))}
    </div>
  );
};
