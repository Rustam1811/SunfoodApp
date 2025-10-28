import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './i18n';
import { startAutoVersionCheck } from './utils/versionCheck';

// Start automatic version checking for updates
startAutoVersionCheck();

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);