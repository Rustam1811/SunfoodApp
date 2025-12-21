import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="card" style={{ padding: 24 }}>
      <div className="skeleton" style={{ height: 14, width: 120 }} />
      <div className="skeleton" style={{ height: 28, width: '70%', marginTop: 18 }} />
      <div className="skeleton" style={{ height: 140, marginTop: 20 }} />
      <div className="skeleton" style={{ height: 14, width: 160, marginTop: 16 }} />
    </div>
  );
};
