import React from 'react';

export default function RootLoading() {
  return (
    <div className="card" style={{ padding: 28 }}>
      <div className="skeleton" style={{ height: 18, width: 140 }} />
      <div className="skeleton" style={{ height: 32, width: '80%', marginTop: 16 }} />
      <div className="skeleton" style={{ height: 120, marginTop: 20 }} />
    </div>
  );
}
