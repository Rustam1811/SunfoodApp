/**
 * CoachClientDetail - Client Detail Page (Trainer OS)
 * 
 * Shows client info, credentials, and their workouts.
 * Trainer can:
 * - See client login credentials
 * - View/edit client profile
 * - See workout history
 * - Create new workout for client
 * 
 * Design: Graphite + Wine
 * 
 * @module pages/coach/CoachClientDetail
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  PlusIcon,
  PhoneIcon,
  LockClosedIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  XMarkIcon,
  PencilIcon,
} from '@heroicons/react/24/solid';
import {
  getClientById,
  type ClientInfo,
} from '../../services/clientService';
import {
  getClientWorkouts,
  createScheduledWorkout,
  type ScheduledWorkout,
  type ScheduledExercise,
} from '../../services/workoutService';

// ============================================================================
// Types
// ============================================================================

interface WorkoutFormData {
  title: string;
  scheduledDate: string;
  exercises: ExerciseFormData[];
}

interface ExerciseFormData {
  id: string;
  name: string;
  sets: number;
  reps: number;
  restTime: number;
}

// ============================================================================
// Profile Section
// ============================================================================

interface ProfileSectionProps {
  client: ClientInfo;
  onEdit: () => void;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ client, onEdit }) => {
  const initials = client.name
    ? client.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  return (
    <div className="bg-tr-elevated rounded-2xl p-5 mx-5">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-tr-accent/20 flex items-center justify-center flex-shrink-0">
          {client.avatar ? (
            <img src={client.avatar} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            <span className="text-tr-accent font-bold text-lg">{initials}</span>
          )}
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-tr-text truncate">
              {client.name || 'Без имени'}
            </h2>
            <button onClick={onEdit} className="p-1">
              <PencilIcon className="w-4 h-4 text-tr-text-muted" />
            </button>
          </div>
          
          {/* Credentials */}
          <div className="mt-2 space-y-1">
            <p className="text-tr-text-secondary text-sm flex items-center gap-2">
              <PhoneIcon className="w-4 h-4 text-tr-text-muted" />
              {client.phone}
            </p>
            <p className="text-tr-text-secondary text-sm flex items-center gap-2">
              <LockClosedIcon className="w-4 h-4 text-tr-text-muted" />
              <span className="font-mono">{client.password}</span>
            </p>
          </div>
        </div>
      </div>
      
      {/* Stats row */}
      <div className="flex items-center gap-6 mt-4 pt-4 border-t border-tr-border-subtle">
        <div>
          <p className="text-2xl font-bold text-tr-text">{client.totalWorkouts}</p>
          <p className="text-tr-text-muted text-xs">тренировок</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-tr-text">{client.streak}</p>
          <p className="text-tr-text-muted text-xs">дней подряд</p>
        </div>
        {client.weight && (
          <div>
            <p className="text-2xl font-bold text-tr-text">{client.weight}</p>
            <p className="text-tr-text-muted text-xs">кг</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// Workout Card
// ============================================================================

interface WorkoutCardProps {
  workout: ScheduledWorkout;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout }) => {
  const isCompleted = workout.status === 'completed';
  const isToday = workout.scheduledDate === new Date().toISOString().split('T')[0];
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (dateStr === today.toISOString().split('T')[0]) return 'Сегодня';
    if (dateStr === tomorrow.toISOString().split('T')[0]) return 'Завтра';
    
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  return (
    <div className={`bg-tr-elevated rounded-xl p-4 ${isCompleted ? 'opacity-60' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isCompleted ? (
            <CheckCircleIcon className="w-5 h-5 text-tr-success" />
          ) : (
            <CalendarIcon className={`w-5 h-5 ${isToday ? 'text-tr-accent' : 'text-tr-text-muted'}`} />
          )}
          <div>
            <p className="text-tr-text font-medium">{workout.title}</p>
            <p className="text-tr-text-muted text-xs">
              {formatDate(workout.scheduledDate)} · {workout.exercises.length} упр.
            </p>
          </div>
        </div>
        
        {isCompleted && workout.duration && (
          <div className="flex items-center gap-1 text-tr-text-muted text-xs">
            <ClockIcon className="w-4 h-4" />
            {Math.round(workout.duration / 60)} мин
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// Create Workout Modal
// ============================================================================

interface CreateWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: WorkoutFormData) => Promise<void>;
}

// Preset exercises for quick add
const PRESET_EXERCISES = [
  { name: 'Приседания', sets: 4, reps: 12 },
  { name: 'Жим лёжа', sets: 4, reps: 10 },
  { name: 'Тяга штанги в наклоне', sets: 4, reps: 10 },
  { name: 'Жим стоя', sets: 3, reps: 12 },
  { name: 'Подтягивания', sets: 3, reps: 8 },
  { name: 'Выпады', sets: 3, reps: 12 },
  { name: 'Планка', sets: 3, reps: 60 },
  { name: 'Скручивания', sets: 3, reps: 20 },
  { name: 'Становая тяга', sets: 4, reps: 8 },
  { name: 'Разгибания на трицепс', sets: 3, reps: 15 },
  { name: 'Сгибания на бицепс', sets: 3, reps: 12 },
  { name: 'Жим ногами', sets: 4, reps: 12 },
];

const CreateWorkoutModal: React.FC<CreateWorkoutModalProps> = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [exercises, setExercises] = useState<ExerciseFormData[]>([]);
  const [loading, setSaving] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  const addExercise = (preset?: typeof PRESET_EXERCISES[0]) => {
    const newExercise: ExerciseFormData = {
      id: Date.now().toString(),
      name: preset?.name || '',
      sets: preset?.sets || 3,
      reps: preset?.reps || 10,
      restTime: 90,
    };
    setExercises([...exercises, newExercise]);
    setShowPresets(false);
  };

  const updateExercise = (id: string, updates: Partial<ExerciseFormData>) => {
    setExercises(exercises.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const removeExercise = (id: string) => {
    setExercises(exercises.filter(e => e.id !== id));
  };

  const handleSave = async () => {
    if (!title.trim() || exercises.length === 0) return;
    
    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        scheduledDate: date,
        exercises,
      });
      
      // Reset
      setTitle('');
      setExercises([]);
      onClose();
    } catch (error) {
      console.error('Failed to save workout:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-tr-base rounded-t-3xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-tr-base p-6 pb-4 flex items-center justify-between border-b border-tr-border-subtle">
          <h2 className="text-xl font-bold text-tr-text">Новая тренировка</h2>
          <button onClick={onClose} className="p-2 -mr-2">
            <XMarkIcon className="w-6 h-6 text-tr-text-muted" />
          </button>
        </div>
        
        <div className="p-6 pt-4 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-tr-text-secondary text-sm mb-2">Название</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Тренировка А - Ноги"
              className="w-full bg-tr-input border border-tr-border rounded-xl px-4 py-3 text-tr-text placeholder-tr-text-disabled focus:outline-none focus:border-tr-accent"
            />
          </div>
          
          {/* Date */}
          <div>
            <label className="block text-tr-text-secondary text-sm mb-2">Дата</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-tr-input border border-tr-border rounded-xl px-4 py-3 text-tr-text focus:outline-none focus:border-tr-accent"
            />
          </div>
          
          {/* Exercises */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-tr-text-secondary text-sm">Упражнения</label>
              <button
                onClick={() => setShowPresets(!showPresets)}
                className="text-tr-accent text-sm"
              >
                + Добавить
              </button>
            </div>
            
            {/* Preset selector */}
            {showPresets && (
              <div className="bg-tr-elevated rounded-xl p-3 mb-3 max-h-48 overflow-y-auto">
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_EXERCISES.map((preset, i) => (
                    <button
                      key={i}
                      onClick={() => addExercise(preset)}
                      className="text-left p-2 rounded-lg bg-tr-base text-tr-text text-sm hover:bg-tr-hover transition-colors"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => addExercise()}
                  className="w-full mt-2 p-2 border border-dashed border-tr-border rounded-lg text-tr-text-muted text-sm"
                >
                  Своё упражнение
                </button>
              </div>
            )}
            
            {/* Exercise list */}
            <div className="space-y-3">
              {exercises.map((exercise, index) => (
                <div key={exercise.id} className="bg-tr-elevated rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 rounded-full bg-tr-accent/20 text-tr-accent text-xs flex items-center justify-center font-medium">
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      value={exercise.name}
                      onChange={(e) => updateExercise(exercise.id, { name: e.target.value })}
                      placeholder="Название упражнения"
                      className="flex-1 bg-transparent text-tr-text font-medium focus:outline-none"
                    />
                    <button onClick={() => removeExercise(exercise.id)}>
                      <XMarkIcon className="w-5 h-5 text-tr-text-muted" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-tr-text-muted text-xs">Подходы</label>
                      <input
                        type="number"
                        value={exercise.sets}
                        onChange={(e) => updateExercise(exercise.id, { sets: parseInt(e.target.value) || 1 })}
                        className="w-12 bg-tr-base border border-tr-border rounded-lg px-2 py-1 text-tr-text text-center text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-tr-text-muted text-xs">Повторы</label>
                      <input
                        type="number"
                        value={exercise.reps}
                        onChange={(e) => updateExercise(exercise.id, { reps: parseInt(e.target.value) || 1 })}
                        className="w-12 bg-tr-base border border-tr-border rounded-lg px-2 py-1 text-tr-text text-center text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {exercises.length === 0 && !showPresets && (
                <button
                  onClick={() => setShowPresets(true)}
                  className="w-full py-8 border border-dashed border-tr-border rounded-xl text-tr-text-muted"
                >
                  Добавьте упражнения
                </button>
              )}
            </div>
          </div>
          
          {/* Save */}
          <motion.button
            onClick={handleSave}
            disabled={loading || !title.trim() || exercises.length === 0}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 rounded-xl font-semibold text-white disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #A64D55 0%, #8B3A42 100%)',
            }}
          >
            {loading ? 'Сохраняю...' : 'Создать тренировку'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

const CoachClientDetail: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const history = useHistory();
  
  const [client, setClient] = useState<ClientInfo | null>(null);
  const [workouts, setWorkouts] = useState<ScheduledWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Load client and workouts
  useEffect(() => {
    if (!clientId) return;

    const loadData = async () => {
      try {
        const [clientData, workoutsData] = await Promise.all([
          getClientById(clientId),
          getClientWorkouts(clientId),
        ]);
        
        setClient(clientData);
        setWorkouts(workoutsData);
      } catch (error) {
        console.error('Failed to load client:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [clientId]);

  const handleCreateWorkout = useCallback(async (data: WorkoutFormData) => {
    if (!client) return;

    const exercises: Omit<ScheduledExercise, 'id'>[] = data.exercises.map((e, index) => ({
      exerciseId: e.id,
      name: { ru: e.name, en: e.name, kz: e.name },
      sets: e.sets,
      reps: e.reps,
      restTime: e.restTime,
      restBetweenSets: 90,
      order: index,
    }));

    await createScheduledWorkout({
      clientId: client.id,
      trainerId: client.trainerId,
      title: data.title,
      scheduledDate: data.scheduledDate,
      exercises: exercises as ScheduledExercise[],
    });

    // Reload workouts
    const updatedWorkouts = await getClientWorkouts(client.id);
    setWorkouts(updatedWorkouts);
  }, [client]);

  const handleBack = () => {
    history.goBack();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-tr-base safe-area-inset-top">
        <div className="px-5 pt-4 flex items-center gap-3">
          <button onClick={handleBack} className="p-2 -ml-2">
            <ArrowLeftIcon className="w-6 h-6 text-tr-text" />
          </button>
        </div>
        <div className="animate-pulse p-5 space-y-4">
          <div className="h-32 bg-tr-elevated rounded-2xl" />
          <div className="h-24 bg-tr-elevated rounded-xl" />
          <div className="h-24 bg-tr-elevated rounded-xl" />
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-tr-base safe-area-inset-top flex flex-col items-center justify-center">
        <p className="text-tr-text-muted">Клиент не найден</p>
        <button onClick={handleBack} className="text-tr-accent mt-4">
          Назад
        </button>
      </div>
    );
  }

  const upcomingWorkouts = workouts.filter(w => w.status !== 'completed');
  const completedWorkouts = workouts.filter(w => w.status === 'completed');

  return (
    <div className="min-h-screen bg-tr-base safe-area-inset-top pb-24">
      {/* Header */}
      <div className="px-5 pt-4 pb-4 flex items-center justify-between">
        <button onClick={handleBack} className="p-2 -ml-2">
          <ArrowLeftIcon className="w-6 h-6 text-tr-text" />
        </button>
        
        <motion.button
          onClick={() => setShowCreateModal(true)}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #A64D55 0%, #8B3A42 100%)',
          }}
        >
          <PlusIcon className="w-5 h-5 text-white" />
        </motion.button>
      </div>

      {/* Profile */}
      <ProfileSection client={client} onEdit={() => {}} />

      {/* Upcoming Workouts */}
      <div className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-tr-text">Предстоящие</h3>
          <span className="text-tr-text-muted text-sm">{upcomingWorkouts.length}</span>
        </div>
        
        {upcomingWorkouts.length === 0 ? (
          <div className="bg-tr-elevated rounded-xl p-6 text-center">
            <p className="text-tr-text-muted text-sm">Нет запланированных тренировок</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-tr-accent text-sm mt-2"
            >
              Создать тренировку
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {upcomingWorkouts.map((workout) => (
              <WorkoutCard key={workout.id} workout={workout} />
            ))}
          </div>
        )}
      </div>

      {/* Completed Workouts */}
      {completedWorkouts.length > 0 && (
        <div className="px-5 mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-tr-text">Выполненные</h3>
            <span className="text-tr-text-muted text-sm">{completedWorkouts.length}</span>
          </div>
          <div className="space-y-2">
            {completedWorkouts.slice(0, 5).map((workout) => (
              <WorkoutCard key={workout.id} workout={workout} />
            ))}
          </div>
        </div>
      )}

      {/* Create Workout Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateWorkoutModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSave={handleCreateWorkout}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CoachClientDetail;
