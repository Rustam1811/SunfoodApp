/**
 * Workout Plan Editor - Create and edit client workout plans
 * 
 * Features:
 * - Week schedule view
 * - Daily plan editor
 * - Exercise selection from library
 * - Sets/reps/rest configuration
 * - Coach demo video attachment
 * - Copy/paste plans between days
 * 
 * @module admin/pages/WorkoutPlanEditor
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  ClipboardIcon,
  ArrowsUpDownIcon,
  VideoCameraIcon,
  XMarkIcon,
  CheckIcon,
  CalendarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../auth/AuthContextV2';
import {
  getClient,
  getWorkoutPlan,
  getWorkoutPlans,
  saveWorkoutPlan,
  deleteWorkoutPlan,
  getExercises,
  getWeekSchedule,
  saveWeekSchedule,
  type Client,
  type Exercise,
  type WorkoutPlan,
  type WeekSchedule,
} from '../services/adminService';
import {
  workoutPlanSchema,
  plannedSetSchema,
  type WorkoutPlanFormData,
  type PlannedExerciseFormData,
  type PlannedSetFormData,
  type DayOfWeek,
} from '../schemas';
import {
  Input,
  NumberInput,
  Textarea,
  Select,
  RangeInput,
  Button,
  Card,
  EmptyState,
  LoadingState,
  Toggle,
} from '../components/FormComponents';

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_TENANT = 'default';

const DAYS_OF_WEEK: { key: DayOfWeek; label: string; short: string }[] = [
  { key: 'monday', label: 'Понедельник', short: 'Пн' },
  { key: 'tuesday', label: 'Вторник', short: 'Вт' },
  { key: 'wednesday', label: 'Среда', short: 'Ср' },
  { key: 'thursday', label: 'Четверг', short: 'Чт' },
  { key: 'friday', label: 'Пятница', short: 'Пт' },
  { key: 'saturday', label: 'Суббота', short: 'Сб' },
  { key: 'sunday', label: 'Воскресенье', short: 'Вс' },
];

const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Легкая' },
  { value: 'moderate', label: 'Средняя' },
  { value: 'hard', label: 'Тяжёлая' },
];

// ============================================================================
// Helpers
// ============================================================================

function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff)).toISOString().split('T')[0];
}

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// ============================================================================
// Exercise Selector Modal
// ============================================================================

interface ExerciseSelectorProps {
  exercises: Exercise[];
  onSelect: (exercise: Exercise) => void;
  onClose: () => void;
}

const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({
  exercises,
  onSelect,
  onClose,
}) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const filtered = exercises.filter(ex => {
    const matchesSearch = !search || 
      ex.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !category || ex.category === category;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(exercises.map(e => e.category)));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-tr-card border border-tr-border rounded-tr-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-tr-border">
          <h2 className="text-lg font-semibold text-white">Выберите упражнение</h2>
          <button onClick={onClose} className="p-2 text-tr-text-muted hover:text-white">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-tr-border space-y-3">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск..."
            className="w-full bg-tr-input border border-tr-border rounded-tr-md px-4 py-2.5 text-white"
          />
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setCategory('')}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                !category ? 'bg-tr-accent text-white' : 'bg-tr-elevated text-tr-text-muted hover:text-white'
              }`}
            >
              Все
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  category === cat ? 'bg-tr-accent text-white' : 'bg-tr-elevated text-tr-text-muted hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map(exercise => (
              <button
                key={exercise.id}
                onClick={() => onSelect(exercise)}
                className="flex items-start gap-3 p-3 bg-tr-elevated border border-tr-border rounded-tr-md hover:border-tr-accent transition-colors text-left"
              >
                {exercise.videoUrl ? (
                  <video
                    src={exercise.videoUrl}
                    className="w-16 h-16 rounded-tr-sm object-cover"
                    muted
                  />
                ) : (
                  <div className="w-16 h-16 rounded-tr-sm bg-tr-input flex items-center justify-center">
                    <VideoCameraIcon className="w-6 h-6 text-tr-text-disabled" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white truncate">{exercise.name}</h4>
                  <p className="text-xs text-tr-text-muted truncate">{exercise.description}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {exercise.muscleGroups.slice(0, 3).map(muscle => (
                      <span key={muscle} className="text-xs text-tr-accent">{muscle}</span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="text-center text-tr-text-muted py-8">Упражнения не найдены</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ============================================================================
// Set Editor Component
// ============================================================================

interface SetEditorProps {
  set: PlannedSetFormData;
  index: number;
  onChange: (set: PlannedSetFormData) => void;
  onRemove: () => void;
  canRemove: boolean;
}

const SetEditor: React.FC<SetEditorProps> = ({
  set,
  index,
  onChange,
  onRemove,
  canRemove,
}) => {
  return (
    <div className="flex items-center gap-3 bg-tr-input border border-tr-border rounded-tr-sm p-3">
      <span className="text-tr-accent font-semibold w-8">{index + 1}</span>
      
      <div className="flex-1 grid grid-cols-4 gap-2">
        <div>
          <label className="text-xs text-tr-text-muted">Повт. мин</label>
          <input
            type="number"
            value={set.targetRepsMin}
            onChange={e => onChange({ ...set, targetRepsMin: parseInt(e.target.value) || 1 })}
            min={1}
            max={100}
            className="w-full bg-tr-card border border-tr-border rounded-tr-sm px-2 py-1 text-white text-center"
          />
        </div>
        <div>
          <label className="text-xs text-tr-text-muted">Повт. макс</label>
          <input
            type="number"
            value={set.targetRepsMax}
            onChange={e => onChange({ ...set, targetRepsMax: parseInt(e.target.value) || 1 })}
            min={set.targetRepsMin}
            max={100}
            className="w-full bg-tr-card border border-tr-border rounded-tr-sm px-2 py-1 text-white text-center"
          />
        </div>
        <div>
          <label className="text-xs text-tr-text-muted">Вес (кг)</label>
          <input
            type="number"
            value={set.targetWeight}
            onChange={e => onChange({ ...set, targetWeight: parseFloat(e.target.value) || 0 })}
            min={0}
            step={2.5}
            className="w-full bg-tr-card border border-tr-border rounded-tr-sm px-2 py-1 text-white text-center"
          />
        </div>
        <div>
          <label className="text-xs text-tr-text-muted">Отдых (сек)</label>
          <input
            type="number"
            value={set.restSeconds}
            onChange={e => onChange({ ...set, restSeconds: parseInt(e.target.value) || 0 })}
            min={0}
            max={600}
            step={15}
            className="w-full bg-tr-card border border-tr-border rounded-tr-sm px-2 py-1 text-white text-center"
          />
        </div>
      </div>

      {canRemove && (
        <button
          onClick={onRemove}
          className="p-1 text-tr-text-muted hover:text-tr-error"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

// ============================================================================
// Exercise Editor Component
// ============================================================================

interface ExerciseEditorProps {
  exercise: PlannedExerciseFormData;
  exerciseLib: Exercise[];
  onChange: (exercise: PlannedExerciseFormData) => void;
  onRemove: () => void;
  onVideoSelect: (exerciseId: string) => void;
}

const ExerciseEditor: React.FC<ExerciseEditorProps> = ({
  exercise,
  exerciseLib,
  onChange,
  onRemove,
  onVideoSelect,
}) => {
  const [expanded, setExpanded] = useState(true);

  const addSet = () => {
    const newSet: PlannedSetFormData = {
      setNumber: exercise.sets.length + 1,
      targetRepsMin: 8,
      targetRepsMax: 12,
      targetWeight: 0,
      restSeconds: 90,
    };
    onChange({ ...exercise, sets: [...exercise.sets, newSet] });
  };

  const updateSet = (index: number, set: PlannedSetFormData) => {
    const newSets = [...exercise.sets];
    newSets[index] = set;
    onChange({ ...exercise, sets: newSets });
  };

  const removeSet = (index: number) => {
    const newSets = exercise.sets.filter((_, i) => i !== index);
    // Renumber sets
    newSets.forEach((s, i) => s.setNumber = i + 1);
    onChange({ ...exercise, sets: newSets });
  };

  const libExercise = exerciseLib.find(e => e.id === exercise.exerciseId);

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-3">
        {/* Drag handle */}
        <div className="cursor-move text-tr-text-muted">
          <ArrowsUpDownIcon className="w-5 h-5" />
        </div>

        {/* Thumbnail */}
        {exercise.coachVideoUrl || libExercise?.videoUrl ? (
          <video
            src={exercise.coachVideoUrl || libExercise?.videoUrl}
            className="w-12 h-12 rounded-tr-sm object-cover"
            muted
          />
        ) : (
          <div className="w-12 h-12 rounded-tr-sm bg-tr-elevated flex items-center justify-center">
            <VideoCameraIcon className="w-5 h-5 text-tr-text-disabled" />
          </div>
        )}

        {/* Title */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-white truncate">{exercise.name}</h4>
          <p className="text-xs text-tr-text-muted">
            {exercise.sets.length} подходов
          </p>
        </div>

        {/* Actions */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-2 text-tr-text-muted hover:text-white"
        >
          <ChevronRightIcon className={`w-5 h-5 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </button>
        <button
          onClick={onRemove}
          className="p-2 text-tr-text-muted hover:text-tr-error"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-tr-border space-y-3">
              {/* Sets */}
              {exercise.sets.map((set, index) => (
                <SetEditor
                  key={index}
                  set={set}
                  index={index}
                  onChange={s => updateSet(index, s)}
                  onRemove={() => removeSet(index)}
                  canRemove={exercise.sets.length > 1}
                />
              ))}

              <Button
                variant="ghost"
                size="sm"
                icon={<PlusIcon className="w-4 h-4" />}
                onClick={addSet}
              >
                Добавить подход
              </Button>

              {/* Notes */}
              <Textarea
                label="Заметки тренера"
                value={exercise.notes || ''}
                onChange={e => onChange({ ...exercise, notes: e.target.value })}
                placeholder="Особые указания для клиента..."
                rows={2}
              />

              {/* Coach Video */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-tr-text-muted">Демо-видео тренера</span>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<VideoCameraIcon className="w-4 h-4" />}
                  onClick={() => onVideoSelect(exercise.id || '')}
                >
                  {exercise.coachVideoUrl ? 'Изменить' : 'Добавить'}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

// ============================================================================
// Week Calendar Component
// ============================================================================

interface WeekCalendarProps {
  weekStart: string;
  selectedDate: string;
  plans: WorkoutPlan[];
  onSelectDate: (date: string) => void;
  onWeekChange: (direction: number) => void;
}

const WeekCalendar: React.FC<WeekCalendarProps> = ({
  weekStart,
  selectedDate,
  plans,
  onSelectDate,
  onWeekChange,
}) => {
  const weekDates = DAYS_OF_WEEK.map((_, i) => addDays(weekStart, i));
  const planDates = new Set(plans.map(p => p.date));

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onWeekChange(-1)}
          className="p-2 text-tr-text-muted hover:text-white"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <span className="font-medium text-white">
          {formatDate(weekStart)} — {formatDate(addDays(weekStart, 6))}
        </span>
        <button
          onClick={() => onWeekChange(1)}
          className="p-2 text-tr-text-muted hover:text-white"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {DAYS_OF_WEEK.map((day, i) => {
          const date = weekDates[i];
          const hasPlan = planDates.has(date);
          const isSelected = date === selectedDate;
          const isToday = date === new Date().toISOString().split('T')[0];

          return (
            <button
              key={day.key}
              onClick={() => onSelectDate(date)}
              className={`
                flex flex-col items-center p-2 rounded-tr-md transition-colors
                ${isSelected 
                  ? 'bg-tr-accent text-white' 
                  : 'hover:bg-tr-hover text-tr-text-muted hover:text-white'
                }
                ${isToday && !isSelected ? 'ring-1 ring-tr-accent' : ''}
              `}
            >
              <span className="text-xs">{day.short}</span>
              <span className="text-lg font-semibold">
                {new Date(date).getDate()}
              </span>
              {hasPlan && (
                <div className={`w-1.5 h-1.5 rounded-full mt-1 ${
                  isSelected ? 'bg-white' : 'bg-tr-accent'
                }`} />
              )}
            </button>
          );
        })}
      </div>
    </Card>
  );
};

// ============================================================================
// Main Page Component
// ============================================================================

export const WorkoutPlanEditorPage: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const history = useHistory();
  const { user } = useAuth();

  const [client, setClient] = useState<Client | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Week & date selection
  const [weekStart, setWeekStart] = useState(getWeekStart());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [weekPlans, setWeekPlans] = useState<WorkoutPlan[]>([]);

  // Plan form
  const [plan, setPlan] = useState<WorkoutPlanFormData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Modals
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [clipboard, setClipboard] = useState<WorkoutPlanFormData | null>(null);

  // Load initial data
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [clientData, exerciseData] = await Promise.all([
          getClient(clientId, DEFAULT_TENANT),
          getExercises(DEFAULT_TENANT, user?.id),
        ]);
        setClient(clientData);
        setExercises(exerciseData);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [clientId, user?.id]);

  // Load week plans when week changes
  useEffect(() => {
    const loadWeekPlans = async () => {
      const endDate = addDays(weekStart, 6);
      const plans = await getWorkoutPlans(clientId, DEFAULT_TENANT, weekStart, endDate);
      setWeekPlans(plans);
    };
    loadWeekPlans();
  }, [clientId, weekStart]);

  // Load plan for selected date
  useEffect(() => {
    const loadPlan = async () => {
      const existingPlan = weekPlans.find(p => p.date === selectedDate);
      if (existingPlan) {
        setPlan(existingPlan);
      } else {
        // Create new empty plan
        setPlan({
          clientId,
          trainerId: user?.id || '',
          tenantId: DEFAULT_TENANT,
          date: selectedDate,
          title: `Тренировка ${formatDate(selectedDate)}`,
          description: '',
          exercises: [],
          estimatedDuration: 60,
          difficulty: 'moderate',
          tags: [],
        });
      }
    };
    loadPlan();
  }, [selectedDate, weekPlans, clientId, user?.id]);

  const handleWeekChange = (direction: number) => {
    setWeekStart(prev => addDays(prev, direction * 7));
  };

  const handleAddExercise = (exercise: Exercise) => {
    if (!plan) return;

    const newExercise: PlannedExerciseFormData = {
      id: generateId(),
      exerciseId: exercise.id,
      name: exercise.name,
      description: exercise.description,
      coachVideoUrl: '',
      thumbnailUrl: exercise.thumbnailUrl,
      targetMuscles: exercise.muscleGroups,
      equipment: exercise.equipment?.join(', ') || '',
      sets: [
        { setNumber: 1, targetRepsMin: 8, targetRepsMax: 12, targetWeight: 0, restSeconds: 90 },
        { setNumber: 2, targetRepsMin: 8, targetRepsMax: 12, targetWeight: 0, restSeconds: 90 },
        { setNumber: 3, targetRepsMin: 8, targetRepsMax: 12, targetWeight: 0, restSeconds: 90 },
      ],
      notes: '',
      order: plan.exercises.length,
    };

    setPlan({
      ...plan,
      exercises: [...plan.exercises, newExercise],
    });
    setShowExerciseSelector(false);
  };

  const handleExerciseChange = (index: number, exercise: PlannedExerciseFormData) => {
    if (!plan) return;
    const newExercises = [...plan.exercises];
    newExercises[index] = exercise;
    setPlan({ ...plan, exercises: newExercises });
  };

  const handleExerciseRemove = (index: number) => {
    if (!plan) return;
    const newExercises = plan.exercises.filter((_, i) => i !== index);
    // Update order
    newExercises.forEach((e, i) => e.order = i);
    setPlan({ ...plan, exercises: newExercises });
  };

  const handleReorder = (newOrder: PlannedExerciseFormData[]) => {
    if (!plan) return;
    newOrder.forEach((e, i) => e.order = i);
    setPlan({ ...plan, exercises: newOrder });
  };

  const handleSave = async () => {
    if (!plan) return;

    const result = workoutPlanSchema.safeParse(plan);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach(err => {
        newErrors[err.path.join('.')] = err.message;
      });
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      await saveWorkoutPlan(result.data, DEFAULT_TENANT);
      // Refresh week plans
      const endDate = addDays(weekStart, 6);
      const plans = await getWorkoutPlans(clientId, DEFAULT_TENANT, weekStart, endDate);
      setWeekPlans(plans);
      setErrors({});
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!plan || !confirm('Удалить тренировку?')) return;

    try {
      await deleteWorkoutPlan(clientId, selectedDate, DEFAULT_TENANT);
      // Refresh
      const endDate = addDays(weekStart, 6);
      const plans = await getWorkoutPlans(clientId, DEFAULT_TENANT, weekStart, endDate);
      setWeekPlans(plans);
      setPlan(null);
    } catch (error) {
      console.error('Error deleting plan:', error);
    }
  };

  const handleCopy = () => {
    if (plan) {
      setClipboard(plan);
    }
  };

  const handlePaste = () => {
    if (!clipboard) return;
    setPlan({
      ...clipboard,
      date: selectedDate,
      title: `Тренировка ${formatDate(selectedDate)}`,
    });
  };

  if (loading) {
    return <LoadingState message="Загрузка..." />;
  }

  if (!client) {
    return (
      <EmptyState
        title="Клиент не найден"
        action={<Button onClick={() => history.push('/admin/clients')}>К списку клиентов</Button>}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => history.push('/admin/clients')}
          className="p-2 text-tr-text-muted hover:text-white"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">{client.name}</h1>
          <p className="text-tr-text-muted">Редактор тренировок</p>
        </div>
      </div>

      {/* Week Calendar */}
      <WeekCalendar
        weekStart={weekStart}
        selectedDate={selectedDate}
        plans={weekPlans}
        onSelectDate={setSelectedDate}
        onWeekChange={handleWeekChange}
      />

      {/* Plan Editor */}
      {plan && (
        <div className="space-y-4">
          {/* Plan Meta */}
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Название"
                value={plan.title}
                onChange={e => setPlan({ ...plan, title: e.target.value })}
                error={errors.title}
                required
              />
              <Select
                label="Сложность"
                value={plan.difficulty}
                onChange={v => setPlan({ ...plan, difficulty: v as WorkoutPlanFormData['difficulty'] })}
                options={DIFFICULTY_OPTIONS}
              />
              <NumberInput
                label="Длительность"
                value={plan.estimatedDuration}
                onChange={v => setPlan({ ...plan, estimatedDuration: v })}
                min={5}
                max={180}
                suffix="мин"
              />
            </div>
            <div className="mt-4">
              <Textarea
                label="Описание"
                value={plan.description || ''}
                onChange={e => setPlan({ ...plan, description: e.target.value })}
                placeholder="Общие указания к тренировке..."
                rows={2}
              />
            </div>
          </Card>

          {/* Exercises */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">Упражнения ({plan.exercises.length})</h3>
            <div className="flex gap-2">
              {clipboard && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<ClipboardIcon className="w-4 h-4" />}
                  onClick={handlePaste}
                >
                  Вставить
                </Button>
              )}
              {plan.exercises.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<DocumentDuplicateIcon className="w-4 h-4" />}
                  onClick={handleCopy}
                >
                  Копировать
                </Button>
              )}
            </div>
          </div>

          {plan.exercises.length > 0 ? (
            <Reorder.Group
              axis="y"
              values={plan.exercises}
              onReorder={handleReorder}
              className="space-y-3"
            >
              {plan.exercises.map((exercise, index) => (
                <Reorder.Item key={exercise.id} value={exercise}>
                  <ExerciseEditor
                    exercise={exercise}
                    exerciseLib={exercises}
                    onChange={e => handleExerciseChange(index, e)}
                    onRemove={() => handleExerciseRemove(index)}
                    onVideoSelect={() => {}}
                  />
                </Reorder.Item>
              ))}
            </Reorder.Group>
          ) : (
            <Card className="py-8">
              <EmptyState
                title="Нет упражнений"
                description="Добавьте упражнения из библиотеки"
              />
            </Card>
          )}

          <Button
            variant="secondary"
            icon={<PlusIcon className="w-5 h-5" />}
            onClick={() => setShowExerciseSelector(true)}
            fullWidth
          >
            Добавить упражнение
          </Button>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-tr-border">
            {weekPlans.some(p => p.date === selectedDate) && (
              <Button variant="danger" onClick={handleDelete}>
                Удалить
              </Button>
            )}
            <div className="flex-1" />
            <Button variant="secondary" onClick={() => history.push('/admin/clients')}>
              Отмена
            </Button>
            <Button onClick={handleSave} loading={saving}>
              Сохранить
            </Button>
          </div>
        </div>
      )}

      {/* Exercise Selector Modal */}
      <AnimatePresence>
        {showExerciseSelector && (
          <ExerciseSelector
            exercises={exercises}
            onSelect={handleAddExercise}
            onClose={() => setShowExerciseSelector(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkoutPlanEditorPage;
