/**
 * Onboarding Page V2 - Client Profile Setup
 * 
 * Multi-step onboarding flow for new clients:
 * 1. Name
 * 2. Physical data (height, weight, gender, birthdate)
 * 3. Fitness goal
 * 4. Experience level
 * 5. Completion
 * 
 * @module pages/OnboardingV2
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckIcon,
  UserIcon,
  ScaleIcon,
  FireIcon,
  ChartBarIcon,
} from '@heroicons/react/24/solid';
import { useAuth } from '../auth/AuthContextV2';
import type { UserGoal, UserLevel, OnboardingData } from '../services/authServiceV2';

// ============================================================================
// Types
// ============================================================================

type Step = 'name' | 'physical' | 'goal' | 'level' | 'complete';

interface StepConfig {
  id: Step;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}

// ============================================================================
// Constants
// ============================================================================

const STEPS: StepConfig[] = [
  { id: 'name', title: 'Как вас зовут?', subtitle: 'Так тренер будет к вам обращаться', icon: <UserIcon className="w-6 h-6" /> },
  { id: 'physical', title: 'Ваши параметры', subtitle: 'Для расчёта нагрузки', icon: <ScaleIcon className="w-6 h-6" /> },
  { id: 'goal', title: 'Ваша цель', subtitle: 'Что хотите достичь?', icon: <FireIcon className="w-6 h-6" /> },
  { id: 'level', title: 'Уровень подготовки', subtitle: 'Как давно тренируетесь?', icon: <ChartBarIcon className="w-6 h-6" /> },
];

const GOALS: { id: UserGoal; label: string; emoji: string; description: string }[] = [
  { id: 'lose_weight', label: 'Похудеть', emoji: '🔥', description: 'Сжечь жир, стать стройнее' },
  { id: 'gain_muscle', label: 'Набрать массу', emoji: '💪', description: 'Увеличить мышечную массу' },
  { id: 'maintain', label: 'Поддержать форму', emoji: '⚖️', description: 'Сохранить текущий уровень' },
  { id: 'general_fitness', label: 'Общий фитнес', emoji: '🏃', description: 'Быть в тонусе, здоровье' },
];

const LEVELS: { id: UserLevel; label: string; emoji: string; description: string }[] = [
  { id: 'beginner', label: 'Новичок', emoji: '🌱', description: 'Менее 6 месяцев опыта' },
  { id: 'intermediate', label: 'Средний', emoji: '⭐', description: '6 месяцев - 2 года опыта' },
  { id: 'advanced', label: 'Продвинутый', emoji: '🏆', description: 'Более 2 лет опыта' },
];

// ============================================================================
// Animation variants
// ============================================================================

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

// ============================================================================
// Main Component
// ============================================================================

const OnboardingV2: React.FC = () => {
  const history = useHistory();
  const { user, completeOnboarding, getRedirectPath } = useAuth();
  
  // State
  const [currentStep, setCurrentStep] = useState<Step>('name');
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form data
  const [name, setName] = useState(user?.name || '');
  const [height, setHeight] = useState(user?.height?.toString() || '');
  const [weight, setWeight] = useState(user?.weight?.toString() || '');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | undefined>(user?.gender);
  const [goal, setGoal] = useState<UserGoal | undefined>(user?.goal);
  const [level, setLevel] = useState<UserLevel | undefined>(user?.level);

  // Current step index
  const currentStepIndex = useMemo(
    () => STEPS.findIndex((s) => s.id === currentStep),
    [currentStep]
  );

  // Progress percentage
  const progress = useMemo(
    () => ((currentStepIndex + 1) / STEPS.length) * 100,
    [currentStepIndex]
  );

  // Validation
  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 'name':
        return name.trim().length >= 2;
      case 'physical':
        return height && weight && parseInt(height) > 100 && parseInt(weight) > 30;
      case 'goal':
        return !!goal;
      case 'level':
        return !!level;
      default:
        return true;
    }
  }, [currentStep, name, height, weight, goal, level]);

  // Navigation
  const handleNext = useCallback(async () => {
    if (!canProceed()) return;
    
    const steps: Step[] = ['name', 'physical', 'goal', 'level', 'complete'];
    const currentIndex = steps.indexOf(currentStep);
    
    if (currentIndex < steps.length - 1) {
      setDirection(1);
      setCurrentStep(steps[currentIndex + 1]);
    }
  }, [currentStep, canProceed]);

  const handleBack = useCallback(() => {
    const steps: Step[] = ['name', 'physical', 'goal', 'level', 'complete'];
    const currentIndex = steps.indexOf(currentStep);
    
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentStep(steps[currentIndex - 1]);
    }
  }, [currentStep]);

  // Complete onboarding
  const handleComplete = useCallback(async () => {
    setLoading(true);
    
    try {
      const data: OnboardingData = {
        name: name.trim(),
        height: parseInt(height) || undefined,
        weight: parseInt(weight) || undefined,
        gender,
        goal,
        level,
        weeklyGoal: 3,
      };
      
      await completeOnboarding(data);
      
      // Redirect to main app
      const destination = getRedirectPath();
      history.replace(destination);
    } catch (error) {
      console.error('Onboarding error:', error);
    } finally {
      setLoading(false);
    }
  }, [name, height, weight, gender, goal, level, completeOnboarding, history, getRedirectPath]);

  // Skip onboarding
  const handleSkip = useCallback(() => {
    history.replace('/main');
  }, [history]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      {/* Safe area */}
      <div className="pt-safe" />
      
      {/* Header with progress */}
      {currentStep !== 'complete' && (
        <div className="px-6 pt-4">
          {/* Progress bar */}
          <div className="h-1 bg-white/10 rounded-full overflow-hidden mb-6">
            <motion.div
              className="h-full bg-gradient-to-r from-rose-500 to-rose-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          
          {/* Step indicator */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">
              Шаг {currentStepIndex + 1} из {STEPS.length}
            </span>
            <button
              onClick={handleSkip}
              className="text-gray-500 text-sm hover:text-white transition-colors"
            >
              Пропустить
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col px-6 py-6 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          {/* Name step */}
          {currentStep === 'name' && (
            <motion.div
              key="name"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col"
            >
              <h1 className="text-2xl font-bold text-white mb-2">Как вас зовут?</h1>
              <p className="text-gray-400 mb-8">Так тренер будет к вам обращаться</p>
              
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ваше имя"
                autoFocus
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white text-lg placeholder-gray-500 focus:outline-none focus:border-rose-500/50 transition-all"
              />
            </motion.div>
          )}

          {/* Physical step */}
          {currentStep === 'physical' && (
            <motion.div
              key="physical"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col"
            >
              <h1 className="text-2xl font-bold text-white mb-2">Ваши параметры</h1>
              <p className="text-gray-400 mb-8">Для расчёта нагрузки</p>
              
              <div className="space-y-4">
                {/* Gender selector */}
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Пол</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'male', label: 'Мужской', emoji: '👨' },
                      { id: 'female', label: 'Женский', emoji: '👩' },
                      { id: 'other', label: 'Другой', emoji: '🧑' },
                    ].map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setGender(g.id as any)}
                        className={`p-3 rounded-xl border transition-all ${
                          gender === g.id
                            ? 'bg-rose-500/20 border-rose-500/50 text-white'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        <span className="text-xl">{g.emoji}</span>
                        <span className="block text-xs mt-1">{g.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Рост (см)</label>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      placeholder="175"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white text-lg placeholder-gray-500 focus:outline-none focus:border-rose-500/50 transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Вес (кг)</label>
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="70"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white text-lg placeholder-gray-500 focus:outline-none focus:border-rose-500/50 transition-all"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Goal step */}
          {currentStep === 'goal' && (
            <motion.div
              key="goal"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col"
            >
              <h1 className="text-2xl font-bold text-white mb-2">Ваша цель</h1>
              <p className="text-gray-400 mb-8">Что хотите достичь?</p>
              
              <div className="space-y-3">
                {GOALS.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGoal(g.id)}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${
                      goal === g.id
                        ? 'bg-rose-500/20 border-rose-500/50'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{g.emoji}</span>
                      <div>
                        <p className={`font-medium ${goal === g.id ? 'text-white' : 'text-gray-300'}`}>
                          {g.label}
                        </p>
                        <p className="text-sm text-gray-500">{g.description}</p>
                      </div>
                      {goal === g.id && (
                        <CheckIcon className="w-5 h-5 text-rose-500 ml-auto" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Level step */}
          {currentStep === 'level' && (
            <motion.div
              key="level"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col"
            >
              <h1 className="text-2xl font-bold text-white mb-2">Уровень подготовки</h1>
              <p className="text-gray-400 mb-8">Как давно тренируетесь?</p>
              
              <div className="space-y-3">
                {LEVELS.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setLevel(l.id)}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${
                      level === l.id
                        ? 'bg-rose-500/20 border-rose-500/50'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{l.emoji}</span>
                      <div>
                        <p className={`font-medium ${level === l.id ? 'text-white' : 'text-gray-300'}`}>
                          {l.label}
                        </p>
                        <p className="text-sm text-gray-500">{l.description}</p>
                      </div>
                      {level === l.id && (
                        <CheckIcon className="w-5 h-5 text-rose-500 ml-auto" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Complete step */}
          {currentStep === 'complete' && (
            <motion.div
              key="complete"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col items-center justify-center text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-8 shadow-lg shadow-emerald-500/20"
              >
                <CheckIcon className="w-12 h-12 text-white" />
              </motion.div>
              
              <h1 className="text-2xl font-bold text-white mb-2">Отлично, {name}!</h1>
              <p className="text-gray-400 mb-8">Ваш профиль настроен и готов к тренировкам</p>
              
              <div className="w-full max-w-xs space-y-4 text-sm text-gray-500">
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span>Цель</span>
                  <span className="text-white">{GOALS.find((g) => g.id === goal)?.label}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span>Уровень</span>
                  <span className="text-white">{LEVELS.find((l) => l.id === level)?.label}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span>Рост / Вес</span>
                  <span className="text-white">{height} см / {weight} кг</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer with navigation buttons */}
      <div className="px-6 pb-safe pb-6">
        <div className="flex gap-3">
          {currentStep !== 'name' && currentStep !== 'complete' && (
            <motion.button
              type="button"
              onClick={handleBack}
              whileTap={{ scale: 0.95 }}
              className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </motion.button>
          )}
          
          <motion.button
            type="button"
            onClick={currentStep === 'complete' ? handleComplete : handleNext}
            disabled={!canProceed() || loading}
            whileTap={{ scale: 0.98 }}
            className="flex-1 h-14 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: currentStep === 'complete'
                ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #A64D55 0%, #8B3A42 100%)',
            }}
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              />
            ) : currentStep === 'complete' ? (
              <>
                <span>Начать тренировки</span>
                <ArrowRightIcon className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Далее</span>
                <ArrowRightIcon className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingV2;
