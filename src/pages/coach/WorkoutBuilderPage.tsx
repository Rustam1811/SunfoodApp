/**
 * Workout Builder Wizard - Trainer OS (Coach)
 * 
 * 5-Step Wizard:
 * 1. Day Selection - which day(s) of week
 * 2. Exercise Selection - pick from library
 * 3. Sets/Reps Configuration - configure each exercise
 * 4. Video Attachment - optional reference videos
 * 5. Save/Template - save as template or assign directly
 * 
 * @module pages/coach/WorkoutBuilderPage
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHistory, useLocation } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
  VideoCameraIcon,
  XMarkIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../auth/AuthContextV2';
import { getExercises, type Exercise } from '../../services/exerciseService';

// ============================================================================
// Types
// ============================================================================

interface SelectedExercise extends Exercise {
  sets: number;
  reps: string; // Can be "10" or "8-12"
  rest: number; // seconds
  notes?: string;
  videoUrl?: string;
}

interface WorkoutPlan {
  name: string;
  days: number[]; // 0-6, Sunday = 0
  exercises: SelectedExercise[];
  isTemplate: boolean;
  clientId?: string;
}

type WizardStep = 1 | 2 | 3 | 4 | 5;

const DAYS_OF_WEEK = [
  { key: 1, label: 'Пн' },
  { key: 2, label: 'Вт' },
  { key: 3, label: 'Ср' },
  { key: 4, label: 'Чт' },
  { key: 5, label: 'Пт' },
  { key: 6, label: 'Сб' },
  { key: 0, label: 'Вс' },
];

// ============================================================================
// Step Indicator
// ============================================================================

interface StepIndicatorProps {
  currentStep: WizardStep;
  totalSteps: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps }) => (
  <div className="flex items-center justify-center gap-2 mb-6">
    {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
      <div
        key={step}
        className={`w-2 h-2 rounded-full transition-all ${
          step === currentStep
            ? 'w-8 bg-tr-accent'
            : step < currentStep
              ? 'bg-tr-accent'
              : 'bg-tr-elevated'
        }`}
      />
    ))}
  </div>
);

// ============================================================================
// Step 1: Day Selection
// ============================================================================

interface Step1Props {
  selectedDays: number[];
  onChange: (days: number[]) => void;
}

const Step1DaySelection: React.FC<Step1Props> = ({ selectedDays, onChange }) => {
  const toggleDay = (day: number) => {
    if (selectedDays.includes(day)) {
      onChange(selectedDays.filter((d) => d !== day));
    } else {
      onChange([...selectedDays, day]);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-tr-text mb-2">Выберите дни</h2>
      <p className="text-tr-text-muted text-sm mb-8">
        В какие дни будет выполняться тренировка?
      </p>

      <div className="grid grid-cols-7 gap-2">
        {DAYS_OF_WEEK.map((day) => (
          <button
            key={day.key}
            onClick={() => toggleDay(day.key)}
            className={`aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all ${
              selectedDays.includes(day.key)
                ? 'bg-tr-accent text-white'
                : 'bg-tr-elevated text-tr-text-secondary'
            }`}
          >
            {day.label}
          </button>
        ))}
      </div>

      {/* Quick presets */}
      <div className="mt-8">
        <p className="text-tr-text-muted text-xs mb-3">Быстрый выбор:</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onChange([1, 3, 5])}
            className="px-4 py-2 bg-tr-elevated rounded-lg text-tr-text-secondary text-sm"
          >
            Пн-Ср-Пт
          </button>
          <button
            onClick={() => onChange([2, 4, 6])}
            className="px-4 py-2 bg-tr-elevated rounded-lg text-tr-text-secondary text-sm"
          >
            Вт-Чт-Сб
          </button>
          <button
            onClick={() => onChange([1, 2, 3, 4, 5])}
            className="px-4 py-2 bg-tr-elevated rounded-lg text-tr-text-secondary text-sm"
          >
            Будни
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Step 2: Exercise Selection
// ============================================================================

interface Step2Props {
  selectedExercises: SelectedExercise[];
  onChange: (exercises: SelectedExercise[]) => void;
}

const Step2ExerciseSelection: React.FC<Step2Props> = ({ selectedExercises, onChange }) => {
  const { user } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadExercises = async () => {
      try {
        const data = await getExercises(user?.id);
        setExercises(data);
      } catch (error) {
        console.error('Failed to load exercises:', error);
      } finally {
        setLoading(false);
      }
    };
    loadExercises();
  }, [user?.id]);

  // Get unique categories
  const categories = [...new Set(exercises.map((e) => e.category))].filter(Boolean);

  // Filter exercises
  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch = !searchQuery || 
      ex.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || ex.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const isSelected = (exerciseId: string) => 
    selectedExercises.some((e) => e.id === exerciseId);

  const toggleExercise = (exercise: Exercise) => {
    if (isSelected(exercise.id)) {
      onChange(selectedExercises.filter((e) => e.id !== exercise.id));
    } else {
      onChange([
        ...selectedExercises,
        {
          ...exercise,
          sets: 3,
          reps: '10',
          rest: 60,
        },
      ]);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-tr-text mb-2">Выберите упражнения</h2>
      <p className="text-tr-text-muted text-sm mb-6">
        Выбрано: {selectedExercises.length}
      </p>

      {/* Search */}
      <div className="relative mb-4">
        <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-tr-text-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Поиск упражнений..."
          className="w-full bg-tr-elevated rounded-xl py-3 pl-12 pr-4 text-tr-text placeholder:text-tr-text-muted outline-none"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 -mx-6 px-6">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
            !selectedCategory ? 'bg-tr-accent text-white' : 'bg-tr-elevated text-tr-text-secondary'
          }`}
        >
          Все
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
              selectedCategory === cat ? 'bg-tr-accent text-white' : 'bg-tr-elevated text-tr-text-secondary'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Exercise List */}
      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 bg-tr-elevated rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-2 max-h-[50vh] overflow-y-auto">
          {filteredExercises.map((exercise) => (
            <button
              key={exercise.id}
              onClick={() => toggleExercise(exercise)}
              className={`w-full p-3 rounded-xl flex items-center justify-between transition-all ${
                isSelected(exercise.id)
                  ? 'bg-tr-accent/10 border border-tr-accent/30'
                  : 'bg-tr-elevated'
              }`}
            >
              <div className="text-left">
                <p className="text-tr-text font-medium">{exercise.name}</p>
                <p className="text-tr-text-muted text-xs">{exercise.category}</p>
              </div>
              {isSelected(exercise.id) && (
                <CheckIcon className="w-5 h-5 text-tr-accent" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Step 3: Sets/Reps Configuration
// ============================================================================

interface Step3Props {
  exercises: SelectedExercise[];
  onChange: (exercises: SelectedExercise[]) => void;
}

const Step3Configuration: React.FC<Step3Props> = ({ exercises, onChange }) => {
  const updateExercise = (index: number, updates: Partial<SelectedExercise>) => {
    const updated = exercises.map((ex, i) => 
      i === index ? { ...ex, ...updates } : ex
    );
    onChange(updated);
  };

  const moveExercise = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= exercises.length) return;
    
    const updated = [...exercises];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange(updated);
  };

  const removeExercise = (index: number) => {
    onChange(exercises.filter((_, i) => i !== index));
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-tr-text mb-2">Настройте упражнения</h2>
      <p className="text-tr-text-muted text-sm mb-6">
        Задайте подходы, повторения и отдых
      </p>

      <div className="space-y-4">
        {exercises.map((exercise, index) => (
          <div
            key={exercise.id}
            className="bg-tr-elevated rounded-xl p-4"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-tr-accent/20 text-tr-accent text-xs flex items-center justify-center font-medium">
                  {index + 1}
                </span>
                <p className="text-tr-text font-medium">{exercise.name}</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => moveExercise(index, 'up')}
                  disabled={index === 0}
                  className="p-1 text-tr-text-muted disabled:opacity-30"
                >
                  <ChevronUpIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => moveExercise(index, 'down')}
                  disabled={index === exercises.length - 1}
                  className="p-1 text-tr-text-muted disabled:opacity-30"
                >
                  <ChevronDownIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => removeExercise(index)}
                  className="p-1 text-red-400"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-3 gap-3">
              {/* Sets */}
              <div>
                <label className="text-tr-text-muted text-xs mb-1 block">Подходы</label>
                <div className="flex items-center bg-tr-base rounded-lg">
                  <button
                    onClick={() => updateExercise(index, { sets: Math.max(1, exercise.sets - 1) })}
                    className="px-3 py-2 text-tr-text-muted"
                  >
                    −
                  </button>
                  <span className="flex-1 text-center text-tr-text font-medium">
                    {exercise.sets}
                  </span>
                  <button
                    onClick={() => updateExercise(index, { sets: exercise.sets + 1 })}
                    className="px-3 py-2 text-tr-text-muted"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Reps */}
              <div>
                <label className="text-tr-text-muted text-xs mb-1 block">Повторения</label>
                <input
                  type="text"
                  value={exercise.reps}
                  onChange={(e) => updateExercise(index, { reps: e.target.value })}
                  className="w-full bg-tr-base rounded-lg py-2 px-3 text-tr-text text-center outline-none"
                  placeholder="10"
                />
              </div>

              {/* Rest */}
              <div>
                <label className="text-tr-text-muted text-xs mb-1 block">Отдых (с)</label>
                <input
                  type="number"
                  value={exercise.rest}
                  onChange={(e) => updateExercise(index, { rest: parseInt(e.target.value) || 60 })}
                  className="w-full bg-tr-base rounded-lg py-2 px-3 text-tr-text text-center outline-none"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="mt-3">
              <input
                type="text"
                value={exercise.notes || ''}
                onChange={(e) => updateExercise(index, { notes: e.target.value })}
                placeholder="Заметки (необязательно)"
                className="w-full bg-tr-base rounded-lg py-2 px-3 text-tr-text text-sm outline-none placeholder:text-tr-text-muted"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// Step 4: Video Attachment
// ============================================================================

interface Step4Props {
  exercises: SelectedExercise[];
  onChange: (exercises: SelectedExercise[]) => void;
}

const Step4VideoAttachment: React.FC<Step4Props> = ({ exercises, onChange }) => {
  const updateVideoUrl = (index: number, videoUrl: string) => {
    const updated = exercises.map((ex, i) =>
      i === index ? { ...ex, videoUrl } : ex
    );
    onChange(updated);
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-tr-text mb-2">Прикрепите видео</h2>
      <p className="text-tr-text-muted text-sm mb-6">
        Добавьте ссылки на видео с техникой выполнения (необязательно)
      </p>

      <div className="space-y-3">
        {exercises.map((exercise, index) => (
          <div
            key={exercise.id}
            className="bg-tr-elevated rounded-xl p-4"
          >
            <p className="text-tr-text font-medium mb-2">{exercise.name}</p>
            <div className="flex items-center gap-2">
              <VideoCameraIcon className="w-5 h-5 text-tr-text-muted flex-shrink-0" />
              <input
                type="url"
                value={exercise.videoUrl || ''}
                onChange={(e) => updateVideoUrl(index, e.target.value)}
                placeholder="Ссылка на видео (YouTube, и т.д.)"
                className="flex-1 bg-tr-base rounded-lg py-2 px-3 text-tr-text text-sm outline-none placeholder:text-tr-text-muted"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// Step 5: Save/Template
// ============================================================================

interface Step5Props {
  workoutName: string;
  isTemplate: boolean;
  onNameChange: (name: string) => void;
  onTemplateChange: (isTemplate: boolean) => void;
}

const Step5Save: React.FC<Step5Props> = ({
  workoutName,
  isTemplate,
  onNameChange,
  onTemplateChange,
}) => (
  <div>
    <h2 className="text-xl font-bold text-tr-text mb-2">Сохранение</h2>
    <p className="text-tr-text-muted text-sm mb-8">
      Дайте название и выберите способ сохранения
    </p>

    {/* Name */}
    <div className="mb-6">
      <label className="text-tr-text-muted text-xs mb-2 block">Название тренировки</label>
      <input
        type="text"
        value={workoutName}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="Например: Верх тела, Ноги A, Кардио..."
        className="w-full bg-tr-elevated rounded-xl py-3 px-4 text-tr-text outline-none placeholder:text-tr-text-muted"
      />
    </div>

    {/* Save options */}
    <div className="space-y-3">
      <button
        onClick={() => onTemplateChange(true)}
        className={`w-full p-4 rounded-xl text-left transition-all ${
          isTemplate
            ? 'bg-tr-accent/10 border border-tr-accent/30'
            : 'bg-tr-elevated'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-tr-text font-medium">Сохранить как шаблон</p>
            <p className="text-tr-text-muted text-sm">
              Можно будет переиспользовать для других клиентов
            </p>
          </div>
          {isTemplate && <CheckIcon className="w-5 h-5 text-tr-accent" />}
        </div>
      </button>

      <button
        onClick={() => onTemplateChange(false)}
        className={`w-full p-4 rounded-xl text-left transition-all ${
          !isTemplate
            ? 'bg-tr-accent/10 border border-tr-accent/30'
            : 'bg-tr-elevated'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-tr-text font-medium">Назначить клиенту</p>
            <p className="text-tr-text-muted text-sm">
              Тренировка сразу появится в календаре клиента
            </p>
          </div>
          {!isTemplate && <CheckIcon className="w-5 h-5 text-tr-accent" />}
        </div>
      </button>
    </div>
  </div>
);

// ============================================================================
// Main Component
// ============================================================================

const WorkoutBuilderPage: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const { user } = useAuth();

  // Parse clientId from URL if present
  const params = new URLSearchParams(location.search);
  const clientId = params.get('clientId');

  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [saving, setSaving] = useState(false);

  // Wizard state
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([]);
  const [workoutName, setWorkoutName] = useState('');
  const [isTemplate, setIsTemplate] = useState(!clientId);

  // Validation
  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedDays.length > 0;
      case 2:
        return selectedExercises.length > 0;
      case 3:
        return selectedExercises.every((e) => e.sets > 0 && e.reps);
      case 4:
        return true; // Videos are optional
      case 5:
        return workoutName.trim().length > 0;
    }
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep((s) => (s + 1) as WizardStep);
    } else {
      handleSave();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => (s - 1) as WizardStep);
    } else {
      history.goBack();
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;

    setSaving(true);
    try {
      const workoutPlan: WorkoutPlan = {
        name: workoutName,
        days: selectedDays,
        exercises: selectedExercises,
        isTemplate,
        clientId: clientId || undefined,
      };

      // TODO: Call workout service to save

      // Navigate back
      if (clientId) {
        history.push(`/coach/client/${clientId}`);
      } else {
        history.push('/coach/clients');
      }
    } catch (error) {
      // Error saving workout
    } finally {
      setSaving(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1DaySelection selectedDays={selectedDays} onChange={setSelectedDays} />;
      case 2:
        return (
          <Step2ExerciseSelection
            selectedExercises={selectedExercises}
            onChange={setSelectedExercises}
          />
        );
      case 3:
        return (
          <Step3Configuration
            exercises={selectedExercises}
            onChange={setSelectedExercises}
          />
        );
      case 4:
        return (
          <Step4VideoAttachment
            exercises={selectedExercises}
            onChange={setSelectedExercises}
          />
        );
      case 5:
        return (
          <Step5Save
            workoutName={workoutName}
            isTemplate={isTemplate}
            onNameChange={setWorkoutName}
            onTemplateChange={setIsTemplate}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-tr-base safe-area-inset-top pb-32">
      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={handleBack} className="p-2 -ml-2">
            <ArrowLeftIcon className="w-6 h-6 text-tr-text" />
          </button>
          <button
            onClick={() => history.goBack()}
            className="p-2 -mr-2"
          >
            <XMarkIcon className="w-6 h-6 text-tr-text-muted" />
          </button>
        </div>
        <StepIndicator currentStep={currentStep} totalSteps={5} />
      </div>

      {/* Content */}
      <div className="px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-tr-base via-tr-base to-transparent pt-12">
        <button
          onClick={handleNext}
          disabled={!canProceed() || saving}
          className="w-full py-4 bg-tr-accent rounded-2xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            'Сохранение...'
          ) : currentStep === 5 ? (
            <>
              <CheckIcon className="w-5 h-5" />
              Сохранить
            </>
          ) : (
            <>
              Далее
              <ArrowRightIcon className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default WorkoutBuilderPage;
