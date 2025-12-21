/**
 * Nutrition Page - Trainer OS
 * 
 * Placeholder for nutrition tracking.
 * NOT in current scope - Today screen is the focus.
 * 
 * @module pages/Nutrition
 */

import React from 'react';
import { motion } from 'framer-motion';
import { FireIcon } from '@heroicons/react/24/outline';

const Nutrition: React.FC = () => (
  <div className="min-h-screen bg-tr-base flex flex-col items-center justify-center px-6 text-center safe-area-inset-top">
    <div className="w-16 h-16 rounded-full bg-tr-elevated flex items-center justify-center mb-4">
      <FireIcon className="w-8 h-8 text-tr-text-muted" />
    </div>
    <h1 className="text-xl font-semibold text-tr-text mb-2">Питание</h1>
    <p className="text-tr-text-secondary text-sm max-w-xs">
      Раздел питания скоро появится. Сейчас фокусируйтесь на тренировках.
    </p>
  </div>
);

export default Nutrition;
