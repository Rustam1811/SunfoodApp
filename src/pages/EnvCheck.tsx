import React from 'react';

const EnvCheck = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  return (
    <div style={{ padding: 20, fontSize: 20 }}>
      <strong>VITE_BACKEND_URL:</strong> {backendUrl || '❌ НЕ НАЙДЕН'}
    </div>
  );
};

export default EnvCheck;
