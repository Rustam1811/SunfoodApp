/**
 * Coach Page - Trainer OS
 * 
 * Client's view of their assigned coach.
 * Contact info and communication.
 * 
 * NOT in current scope - Today screen is the focus.
 * 
 * @module pages/Coach
 */

import React from 'react';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

const Coach: React.FC = () => (
  <div className="min-h-screen bg-tr-base flex flex-col items-center justify-center px-6 text-center safe-area-inset-top">
    <div className="w-16 h-16 rounded-full bg-tr-elevated flex items-center justify-center mb-4">
      <ChatBubbleLeftRightIcon className="w-8 h-8 text-tr-text-muted" />
    </div>
    <h1 className="text-xl font-semibold text-tr-text mb-2">Тренер</h1>
    <p className="text-tr-text-secondary text-sm max-w-xs">
      Связь с тренером скоро появится. Сейчас фокусируйтесь на тренировках.
    </p>
  </div>
);

export default Coach;
