/**
 * Onboarding Page - Trainer OS
 * 
 * Initial profile setup for new clients.
 * Collects: name, height, weight, goal.
 * 
 * @module pages/Onboarding
 */

import React, { useState, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRightIcon, ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../auth/AuthContextV2';

type Step = 'name' | 'physical' | 'goal' | 'complete';

const GOALS = [
  { id: 'lose_weight', label: 'Похудеть', emoji: '🔥' },
  { id: 'gain_muscle', label: 'Набрать массу', emoji: '💪' },
  { id: 'maintain', label: 'Поддержать форму', emoji: '⚖️' },
  { id: 'general_fitness', label: 'Общий фитнес', emoji: '🏃' },
] as const;

const Onboarding: React.FC = () => {
  const history = useHistory();
  const { updateProfile, user } = useAuth();
  
  const [step, setStep] = useState<Step>('name');
  const [loading, setLoading] = useState(false);
  
  // Form data
  const [name, setName] = useState(user?.name || '');
  const [height, setHeight] = useState(user?.height?.toString() || '');
  const [weight, setWeight] = useState(user?.weight?.toString() || '');
  const [goal, setGoal] = useState<string>(user?.goal || '');
  
  const handleNext = useCallback(async () => {
    if (step === 'name') {
      setStep('physical');
    } else if (step === 'physical') {
      setStep('goal');
    } else if (step === 'goal') {
      setLoading(true);
      try {
        await updateProfile({
          name,
          height: parseInt(height) || undefined,
          weight: parseInt(weight) || undefined,
          goal: goal as 'lose_weight' | 'gain_muscle' | 'maintain' | 'general_fitness',
        });
        setStep('complete');
      } catch {
        // Handle error
      } finally {
        setLoading(false);
      }
    } else if (step === 'complete') {
      history.replace('/today');
    }
  }, [step, name, height, weight, goal, updateProfile, history]);
  
  const handleBack = useCallback(() => {
    if (step === 'physical') setStep('name');
    else if (step === 'goal') setStep('physical');
  }, [step]);
  
  const canProceed = () => {
    if (step === 'name') return name.trim().length > 0;
    if (step === 'physical') return height && weight;
    if (step === 'goal') return goal;
    return true;
  };
  
  return (
    <div className="min-h-screen bg-tr-base flex flex-col px-6 py-12 safe-area-inset-top">
      {/* Progress indicator */}
      {step !== 'complete' && (
        <div className="flex gap-2 mb-12">
          {['name', 'physical', 'goal'].map((s, i) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                ['name', 'physical', 'goal'].indexOf(step) >= i
                  ? 'bg-tr-accent'
                  : 'bg-tr-elevated'
              }`}
            />
          ))}
        </div>
      )}
      
      <AnimatePresence mode="wait">
        {/* Name step */}
        {step === 'name' && (
          <motion.div
            key="name"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            <h1 className="text-2xl font-bold text-tr-text mb-2">Как вас зовут?</h1>
            <p className="text-tr-text-secondary mb-8">Так тренер будет к вам обращаться</p>
            
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ваше имя"
              autoFocus
              className="w-full bg-tr-input border border-tr-border rounded-xl px-4 py-4 text-tr-text text-lg placeholder-tr-text-disabled focus:outline-none focus:border-tr-accent transition-colors"
            />
          </motion.div>
        )}
        
        {/* Physical step */}
        {step === 'physical' && (
          <motion.div
            key="physical"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            <h1 className="text-2xl font-bold text-tr-text mb-2">Ваши параметры</h1>
            <p className="text-tr-text-secondary mb-8">Для расчёта нагрузки</p>
            
            <div className="space-y-4">
              <div>
                <label className="text-tr-text-muted text-sm mb-2 block">Рост (см)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="175"
                  className="w-full bg-tr-input border border-tr-border rounded-xl px-4 py-4 text-tr-text text-lg placeholder-tr-text-disabled focus:outline-none focus:border-tr-accent transition-colors"
                />
              </div>
              
              <div>
                <label className="text-tr-text-muted text-sm mb-2 block">Вес (кг)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="70"
                  className="w-full bg-tr-input border border-tr-border rounded-xl px-4 py-4 text-tr-text text-lg placeholder-tr-text-disabled focus:outline-none focus:border-tr-accent transition-colors"
                />
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Goal step */}
        {step === 'goal' && (
          <motion.div
            key="goal"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            <h1 className="text-2xl font-bold text-tr-text mb-2">Ваша цель</h1>
            <p className="text-tr-text-secondary mb-8">Выберите основную</p>
            
            <div className="space-y-3">
              {GOALS.map((g) => (
                <motion.button
                  key={g.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setGoal(g.id)}
                  className={`w-full p-4 rounded-xl flex items-center gap-4 transition-all ${
                    goal === g.id
                      ? 'bg-tr-accent/15 border-2 border-tr-accent'
                      : 'bg-tr-card border-2 border-transparent'
                  }`}
                >
                  <span className="text-2xl">{g.emoji}</span>
                  <span className={`text-lg font-medium ${
                    goal === g.id ? 'text-tr-accent' : 'text-tr-text'
                  }`}>
                    {g.label}
                  </span>
                  {goal === g.id && (
                    <CheckIcon className="w-5 h-5 text-tr-accent ml-auto" />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
        
        {/* Complete step */}
        {step === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="w-20 h-20 rounded-full bg-tr-success/15 flex items-center justify-center mb-6"
            >
              <CheckIcon className="w-10 h-10 text-tr-success" />
            </motion.div>
            
            <h1 className="text-2xl font-bold text-tr-text mb-2">Готово!</h1>
            <p className="text-tr-text-secondary max-w-xs">
              Профиль создан. Ваш тренер скоро назначит первую тренировку.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Navigation */}
      <div className="flex gap-3 mt-8">
        {step !== 'name' && step !== 'complete' && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleBack}
            className="w-14 h-14 rounded-xl bg-tr-elevated flex items-center justify-center"
          >
            <ArrowLeftIcon className="w-5 h-5 text-tr-text" />
          </motion.button>
        )}
        
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleNext}
          disabled={!canProceed() || loading}
          className={`flex-1 py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-opacity ${
            !canProceed() ? 'opacity-50' : ''
          }`}
          style={{
            background: 'linear-gradient(135deg, #A64D55 0%, #8B3A42 100%)',
          }}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>{step === 'complete' ? 'Начать' : 'Далее'}</span>
              <ArrowRightIcon className="w-5 h-5" />
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default Onboarding;
