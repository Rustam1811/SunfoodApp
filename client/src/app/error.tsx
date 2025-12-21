"use client";

import React, { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error('Client error:', error);
  }, [error]);

  return (
    <div
      className="card"
      style={{ padding: 28 }}
      role="button"
      tabIndex={0}
      onClick={() => reset()}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') reset();
      }}
    >
      <div className="chip">Error</div>
      <h1 className="title" style={{ marginTop: 16, fontSize: 28 }}>
        Connection hiccup.
      </h1>
      <p style={{ marginTop: 12, color: 'var(--muted)' }}>
        We will retry as soon as the network is back.
      </p>
    </div>
  );
}
