/**
 * Body Page - Trainer OS
 * 
 * Placeholder for body measurements and progress photos.
 * NOT in current scope - Today screen is the focus.
 * 
 * @module pages/Body
 */

import React from 'react';
import { UserCircleIcon } from '@heroicons/react/24/outline';

const Body: React.FC = () => (
  <div className="min-h-screen bg-tr-base flex flex-col items-center justify-center px-6 text-center safe-area-inset-top">
    <div className="w-16 h-16 rounded-full bg-tr-elevated flex items-center justify-center mb-4">
      <UserCircleIcon className="w-8 h-8 text-tr-text-muted" />
    </div>
    <h1 className="text-xl font-semibold text-tr-text mb-2">Тело</h1>
    <p className="text-tr-text-secondary text-sm max-w-xs">
      Замеры и фото прогресса скоро появятся. Сейчас фокусируйтесь на тренировках.
    </p>
  </div>
);

export default Body;
