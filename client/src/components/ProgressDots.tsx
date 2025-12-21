import React from 'react';

export const ProgressDots: React.FC<{ count: number; activeIndex: number }> = ({
  count,
  activeIndex,
}) => {
  return (
    <div className="progress-dots" aria-hidden>
      {Array.from({ length: count }).map((_, index) => (
        <span
          key={index}
          className={`progress-dot${index === activeIndex ? ' active' : ''}`}
        />
      ))}
    </div>
  );
};
