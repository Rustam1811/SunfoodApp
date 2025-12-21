import React from 'react';

type OfflineStateProps = {
  message?: string;
};

export const OfflineState: React.FC<OfflineStateProps> = ({ message }) => {
  return (
    <div className="card" style={{ padding: 28 }}>
      <div className="chip">Offline</div>
      <h2 className="title" style={{ marginTop: 16, fontSize: 28 }}>
        Connection lost.
      </h2>
      <p style={{ marginTop: 12, color: 'var(--muted)' }}>
        {message || 'We will reconnect when the network is back.'}
      </p>
    </div>
  );
};
