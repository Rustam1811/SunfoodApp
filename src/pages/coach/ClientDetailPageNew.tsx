/**
 * Client Detail Page - Full Client Management
 * 
 * Tabs:
 * - Overview: Basic info, stats
 * - Workouts: Plan editor, history
 * - Nutrition: Meal plan editor
 * - Body: Measurements, health notes
 * 
 * @module pages/coach/ClientDetailPage
 */

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useHistory } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  UserIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  CheckIcon,
  XMarkIcon,
  CalendarIcon,
  FireIcon,
  SparklesIcon,
  HeartIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { VideoAttachmentCard } from '../../ui/video';
import type { VideoMetadata } from '../../services/videoUploadService';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  getDocs, 
  addDoc,
  deleteDoc,
  orderBy,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useToast } from '../../ui/Toast';

// ============================================================================
// Types
// ============================================================================

interface ClientData {
  id: string;
  name: string;
  phone: string;
  avatarUrl?: string;
  height?: number;
  weight?: number;
  targetWeight?: number;
  goal?: string;
  level?: string;
  weeklyGoal?: number;
  totalWorkouts?: number;
  streak?: number;
  points?: number;
  lastLoginAt?: string;
  lastWorkoutAt?: string;
  createdAt?: string;
}

interface WorkoutPlan {
  id: string;
  date: string;
  title: string;
  exercises: ExercisePlan[];
  status?: 'planned' | 'completed' | 'skipped';
}

interface ExercisePlan {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  restSeconds?: number;
  notes?: string;
  videoUrl?: string;
}

interface NutritionPlan {
  id: string;
  date: string;
  meals: {
    breakfast: MealPlan;
    lunch: MealPlan;
    dinner: MealPlan;
    snacks?: MealPlan[];
  };
  targetCalories?: number;
  targetProtein?: number;
  targetCarbs?: number;
  targetFat?: number;
}

interface MealPlan {
  name: string;
  description?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

type TabKey = 'overview' | 'workouts' | 'nutrition' | 'body';

// ============================================================================
// Tab Button
// ============================================================================

interface TabButtonProps {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ active, icon, label, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl transition-all ${
      active ? 'bg-blue-600 text-white' : 'bg-zinc-900 text-zinc-500'
    }`}
  >
    {icon}
    <span className="text-xs font-medium">{label}</span>
  </button>
);

// ============================================================================
// Overview Tab
// ============================================================================

interface OverviewTabProps {
  client: ClientData;
  onUpdate: (data: Partial<ClientData>) => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ client, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: client.name || '',
    height: client.height?.toString() || '',
    weight: client.weight?.toString() || '',
    targetWeight: client.targetWeight?.toString() || '',
    goal: client.goal || '',
    level: client.level || 'beginner',
    weeklyGoal: client.weeklyGoal?.toString() || '3',
  });

  const handleSave = () => {
    onUpdate({
      name: form.name,
      height: form.height ? parseInt(form.height) : undefined,
      weight: form.weight ? parseFloat(form.weight) : undefined,
      targetWeight: form.targetWeight ? parseFloat(form.targetWeight) : undefined,
      goal: form.goal,
      level: form.level,
      weeklyGoal: form.weeklyGoal ? parseInt(form.weeklyGoal) : 3,
    });
    setEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center">
              {client.avatarUrl ? (
                <img src={client.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <UserIcon className="w-8 h-8 text-zinc-500" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{client.name || 'Без имени'}</h2>
              <p className="text-zinc-500">{client.phone}</p>
            </div>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className={`p-2 rounded-xl ${editing ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}
          >
            <PencilIcon className="w-5 h-5" />
          </button>
        </div>

        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="text-zinc-500 text-sm mb-1 block">Имя</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-zinc-500 text-sm mb-1 block">Рост (см)</label>
                <input
                  type="number"
                  value={form.height}
                  onChange={(e) => setForm({ ...form, height: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white"
                />
              </div>
              <div>
                <label className="text-zinc-500 text-sm mb-1 block">Вес (кг)</label>
                <input
                  type="number"
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-zinc-500 text-sm mb-1 block">Цель (кг)</label>
                <input
                  type="number"
                  value={form.targetWeight}
                  onChange={(e) => setForm({ ...form, targetWeight: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white"
                />
              </div>
              <div>
                <label className="text-zinc-500 text-sm mb-1 block">Трен./нед.</label>
                <input
                  type="number"
                  value={form.weeklyGoal}
                  onChange={(e) => setForm({ ...form, weeklyGoal: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white"
                />
              </div>
            </div>
            <div>
              <label className="text-zinc-500 text-sm mb-1 block">Цель</label>
              <select
                value={form.goal}
                onChange={(e) => setForm({ ...form, goal: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white"
              >
                <option value="">Не указана</option>
                <option value="lose_weight">Похудеть</option>
                <option value="gain_muscle">Набрать массу</option>
                <option value="maintain">Поддержание</option>
                <option value="get_fit">Привести в форму</option>
              </select>
            </div>
            <div>
              <label className="text-zinc-500 text-sm mb-1 block">Уровень</label>
              <select
                value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white"
              >
                <option value="beginner">Начинающий</option>
                <option value="intermediate">Средний</option>
                <option value="advanced">Продвинутый</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2"
              >
                <CheckIcon className="w-5 h-5" />
                Сохранить
              </button>
              <button
                onClick={() => setEditing(false)}
                className="flex-1 bg-zinc-800 text-zinc-400 py-3 rounded-xl font-medium"
              >
                Отмена
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-800 rounded-xl p-3">
              <p className="text-zinc-500 text-xs mb-1">Рост</p>
              <p className="text-white font-medium">{client.height ? `${client.height} см` : '—'}</p>
            </div>
            <div className="bg-zinc-800 rounded-xl p-3">
              <p className="text-zinc-500 text-xs mb-1">Вес</p>
              <p className="text-white font-medium">{client.weight ? `${client.weight} кг` : '—'}</p>
            </div>
            <div className="bg-zinc-800 rounded-xl p-3">
              <p className="text-zinc-500 text-xs mb-1">Цель</p>
              <p className="text-white font-medium">{client.targetWeight ? `${client.targetWeight} кг` : '—'}</p>
            </div>
            <div className="bg-zinc-800 rounded-xl p-3">
              <p className="text-zinc-500 text-xs mb-1">Трен./нед.</p>
              <p className="text-white font-medium">{client.weeklyGoal || 3}</p>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
        <h3 className="text-white font-semibold mb-4">Статистика</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{client.totalWorkouts || 0}</p>
            <p className="text-zinc-500 text-sm">Тренировок</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{client.streak || 0}</p>
            <p className="text-zinc-500 text-sm">Серия</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{client.points || 0}</p>
            <p className="text-zinc-500 text-sm">Очков</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Workouts Tab
// ============================================================================

interface WorkoutsTabProps {
  clientId: string;
}

const WorkoutsTab: React.FC<WorkoutsTabProps> = ({ clientId }) => {
  const toast = useToast();
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingPlan, setEditingPlan] = useState<WorkoutPlan | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Load plans
  useEffect(() => {
    const loadPlans = async () => {
      try {
        const plansRef = collection(db, 'users', clientId, 'workoutPlans');
        const q = query(plansRef, orderBy('date', 'desc'));
        const snapshot = await getDocs(q);
        
        const plansList: WorkoutPlan[] = [];
        snapshot.forEach((docSnap) => {
          plansList.push({ id: docSnap.id, ...docSnap.data() } as WorkoutPlan);
        });
        setPlans(plansList);
      } catch (error) {
        toast.error('Не удалось загрузить планы');
      } finally {
        setLoading(false);
      }
    };
    loadPlans();
  }, [clientId]);

  const handleSavePlan = async (plan: Omit<WorkoutPlan, 'id'>) => {
    if (!clientId) return;
    
    try {
      if (editingPlan) {
        await updateDoc(doc(db, 'users', clientId, 'workoutPlans', editingPlan.id), plan);
        setPlans(plans.map(p => p.id === editingPlan.id ? { ...plan, id: editingPlan.id } : p));
        toast.success('Тренировка обновлена');
      } else {
        const docRef = await addDoc(collection(db, 'users', clientId, 'workoutPlans'), {
          ...plan,
          createdAt: new Date().toISOString(),
        });
        setPlans([{ ...plan, id: docRef.id }, ...plans]);
        toast.success('Тренировка создана');
      }
      setShowEditor(false);
      setEditingPlan(null);
    } catch (error) {
      toast.error('Ошибка сохранения');
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Удалить план тренировки?')) return;
    try {
      await deleteDoc(doc(db, 'users', clientId, 'workoutPlans', planId));
      setPlans(plans.filter(p => p.id !== planId));
      toast.success('Тренировка удалена');
    } catch (error) {
      toast.error('Не удалось удалить');
    }
  };

  if (showEditor) {
    return (
      <WorkoutPlanEditor
        plan={editingPlan}
        date={selectedDate}
        onSave={handleSavePlan}
        onCancel={() => { setShowEditor(false); setEditingPlan(null); }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Add Button */}
      <button
        onClick={() => setShowEditor(true)}
        className="w-full bg-blue-600 text-white py-4 rounded-xl font-medium flex items-center justify-center gap-2"
      >
        <PlusIcon className="w-5 h-5" />
        Создать тренировку
      </button>

      {/* Date Picker */}
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white"
      />

      {/* Plans List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-zinc-900 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-zinc-900 rounded-2xl p-8 text-center border border-zinc-800">
          <FireIcon className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500">Нет планов тренировок</p>
        </div>
      ) : (
        <div className="space-y-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-zinc-500 text-sm">{plan.date}</p>
                  <h3 className="text-white font-medium">{plan.title}</h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setEditingPlan(plan); setShowEditor(true); }}
                    className="p-2 bg-zinc-800 rounded-lg text-zinc-400"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePlan(plan.id)}
                    className="p-2 bg-zinc-800 rounded-lg text-red-400"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-zinc-500 text-sm">
                {plan.exercises.length} упражнений
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Workout Plan Editor
// ============================================================================

interface WorkoutPlanEditorProps {
  plan: WorkoutPlan | null;
  date: string;
  onSave: (plan: Omit<WorkoutPlan, 'id'>) => void;
  onCancel: () => void;
}

const WorkoutPlanEditor: React.FC<WorkoutPlanEditorProps> = ({ plan, date, onSave, onCancel }) => {
  const toast = useToast();
  const [title, setTitle] = useState(plan?.title || 'Тренировка');
  const [exercises, setExercises] = useState<ExercisePlan[]>(plan?.exercises || []);
  const [planDate, setPlanDate] = useState(plan?.date || date);

  const addExercise = () => {
    setExercises([
      ...exercises,
      {
        id: `ex_${Date.now()}`,
        name: '',
        sets: 3,
        reps: 10,
        weight: 0,
        restSeconds: 60,
      },
    ]);
  };

  const updateExercise = (index: number, updates: Partial<ExercisePlan>) => {
    const newExercises = [...exercises];
    newExercises[index] = { ...newExercises[index], ...updates };
    setExercises(newExercises);
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!title.trim()) {
      toast.warning('Введите название тренировки');
      return;
    }
    
    const validExercises = exercises.filter(e => e.name.trim());
    
    if (validExercises.length === 0) {
      toast.warning('Добавьте хотя бы одно упражнение с названием');
      return;
    }
    
    onSave({
      date: planDate,
      title: title.trim(),
      exercises: validExercises,
      status: 'planned' as const,
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold">
          {plan ? 'Редактировать' : 'Новая тренировка'}
        </h3>
        <button onClick={onCancel} className="text-zinc-500">
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Form */}
      <div className="space-y-4">
        <div>
          <label className="text-zinc-500 text-sm mb-1 block">Дата</label>
          <input
            type="date"
            value={planDate}
            onChange={(e) => setPlanDate(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white"
          />
        </div>
        <div>
          <label className="text-zinc-500 text-sm mb-1 block">Название</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Например: Ноги + Плечи"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white"
          />
        </div>
      </div>

      {/* Exercises */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-white font-medium">Упражнения</h4>
          <button onClick={addExercise} className="text-blue-500 text-sm flex items-center gap-1">
            <PlusIcon className="w-4 h-4" />
            Добавить
          </button>
        </div>

        {exercises.map((exercise, index) => (
          <div key={exercise.id} className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <div className="flex items-start gap-3 mb-3">
              <span className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-400 text-sm flex items-center justify-center flex-shrink-0">
                {index + 1}
              </span>
              <input
                type="text"
                value={exercise.name}
                onChange={(e) => updateExercise(index, { name: e.target.value })}
                placeholder="Название упражнения"
                className="flex-1 bg-transparent text-white outline-none"
              />
              <button onClick={() => removeExercise(index)} className="text-red-400">
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="text-zinc-600 text-xs">Подходов</label>
                <input
                  type="number"
                  value={exercise.sets}
                  onChange={(e) => updateExercise(index, { sets: parseInt(e.target.value) || 0 })}
                  className="w-full bg-zinc-800 rounded-lg px-2 py-2 text-white text-center text-sm"
                />
              </div>
              <div>
                <label className="text-zinc-600 text-xs">Повторов</label>
                <input
                  type="number"
                  value={exercise.reps}
                  onChange={(e) => updateExercise(index, { reps: parseInt(e.target.value) || 0 })}
                  className="w-full bg-zinc-800 rounded-lg px-2 py-2 text-white text-center text-sm"
                />
              </div>
              <div>
                <label className="text-zinc-600 text-xs">Вес (кг)</label>
                <input
                  type="number"
                  value={exercise.weight || ''}
                  onChange={(e) => updateExercise(index, { weight: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-zinc-800 rounded-lg px-2 py-2 text-white text-center text-sm"
                />
              </div>
              <div>
                <label className="text-zinc-600 text-xs">Отдых (с)</label>
                <input
                  type="number"
                  value={exercise.restSeconds || 60}
                  onChange={(e) => updateExercise(index, { restSeconds: parseInt(e.target.value) || 60 })}
                  className="w-full bg-zinc-800 rounded-lg px-2 py-2 text-white text-center text-sm"
                />
              </div>
            </div>
            {/* Notes */}
            <div className="mt-3">
              <input
                type="text"
                value={exercise.notes || ''}
                onChange={(e) => updateExercise(index, { notes: e.target.value })}
                placeholder="📝 Заметки (техника, советы...)"
                className="w-full bg-zinc-800 rounded-lg px-3 py-2 text-zinc-400 text-sm"
              />
            </div>
            {/* Video Upload - Premium VideoAttachmentCard */}
            <div className="mt-3">
              <label className="text-zinc-600 text-xs block mb-2">🎬 Видео упражнения</label>
              <VideoAttachmentCard
                userId="coach"
                entityType="exercise"
                entityId={exercise.id}
                initialVideo={exercise.videoUrl ? {
                  id: `legacy_${exercise.id}`,
                  type: exercise.videoUrl.includes('youtube.com') || exercise.videoUrl.includes('youtu.be') ? 'youtube' : 'file',
                  status: 'ready',
                  originalUrl: exercise.videoUrl,
                  youtubeId: exercise.videoUrl.includes('youtube.com') ? 
                    new URL(exercise.videoUrl).searchParams.get('v') || undefined : undefined,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  uploadedBy: 'coach',
                } as VideoMetadata : null}
                onVideoChange={(video) => {
                  if (video) {
                    const url = video.type === 'youtube' && video.youtubeId 
                      ? `https://youtube.com/watch?v=${video.youtubeId}`
                      : video.processedUrl || video.originalUrl || '';
                    updateExercise(index, { videoUrl: url });
                  } else {
                    updateExercise(index, { videoUrl: '' });
                  }
                }}
              />
            </div>
          </div>
        ))}

        {exercises.length === 0 && (
          <div className="bg-zinc-900 rounded-xl p-6 text-center border border-dashed border-zinc-700">
            <p className="text-zinc-500 text-sm">Нажмите "Добавить" чтобы создать упражнение</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={handleSave}
          className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-medium"
        >
          Сохранить
        </button>
        <button
          onClick={onCancel}
          className="flex-1 bg-zinc-800 text-zinc-400 py-4 rounded-xl font-medium"
        >
          Отмена
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// Nutrition Tab
// ============================================================================

interface NutritionTabProps {
  clientId: string;
}

const NutritionTab: React.FC<NutritionTabProps> = ({ clientId }) => {
  const toast = useToast();
  const [plans, setPlans] = useState<NutritionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingPlan, setEditingPlan] = useState<NutritionPlan | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Load plans
  useEffect(() => {
    const loadPlans = async () => {
      try {
        const plansRef = collection(db, 'users', clientId, 'nutritionPlans');
        const q = query(plansRef, orderBy('date', 'desc'));
        const snapshot = await getDocs(q);
        
        const plansList: NutritionPlan[] = [];
        snapshot.forEach((docSnap) => {
          plansList.push({ id: docSnap.id, ...docSnap.data() } as NutritionPlan);
        });
        setPlans(plansList);
      } catch (error) {
        toast.error('Не удалось загрузить планы');
      } finally {
        setLoading(false);
      }
    };
    loadPlans();
  }, [clientId]);

  const handleSavePlan = async (plan: Omit<NutritionPlan, 'id'>) => {
    try {
      if (editingPlan) {
        await updateDoc(doc(db, 'users', clientId, 'nutritionPlans', editingPlan.id), plan);
        setPlans(plans.map(p => p.id === editingPlan.id ? { ...plan, id: editingPlan.id } : p));
        toast.success('План питания обновлён');
      } else {
        const docRef = await addDoc(collection(db, 'users', clientId, 'nutritionPlans'), {
          ...plan,
          createdAt: new Date().toISOString(),
        });
        setPlans([{ ...plan, id: docRef.id }, ...plans]);
        toast.success('План питания создан');
      }
      setShowEditor(false);
      setEditingPlan(null);
    } catch (error) {
      toast.error('Ошибка сохранения');
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Удалить план питания?')) return;
    try {
      await deleteDoc(doc(db, 'users', clientId, 'nutritionPlans', planId));
      setPlans(plans.filter(p => p.id !== planId));
      toast.success('План удалён');
    } catch (error) {
      toast.error('Не удалось удалить');
    }
  };

  if (showEditor) {
    return (
      <NutritionPlanEditor
        plan={editingPlan}
        date={selectedDate}
        onSave={handleSavePlan}
        onCancel={() => { setShowEditor(false); setEditingPlan(null); }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Add Button */}
      <button
        onClick={() => setShowEditor(true)}
        className="w-full bg-emerald-600 text-white py-4 rounded-xl font-medium flex items-center justify-center gap-2"
      >
        <PlusIcon className="w-5 h-5" />
        Создать план питания
      </button>

      {/* Date Picker */}
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white"
      />

      {/* Plans List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-zinc-900 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-zinc-900 rounded-2xl p-8 text-center border border-zinc-800">
          <SparklesIcon className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500">Нет планов питания</p>
        </div>
      ) : (
        <div className="space-y-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-zinc-500 text-sm">{plan.date}</p>
                  <p className="text-white font-medium">
                    {plan.targetCalories ? `${plan.targetCalories} ккал` : 'План питания'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setEditingPlan(plan); setShowEditor(true); }}
                    className="p-2 bg-zinc-800 rounded-lg text-zinc-400"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePlan(plan.id)}
                    className="p-2 bg-zinc-800 rounded-lg text-red-400"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex gap-4 text-sm">
                <span className="text-zinc-500">Б: {plan.targetProtein || '—'}г</span>
                <span className="text-zinc-500">Ж: {plan.targetFat || '—'}г</span>
                <span className="text-zinc-500">У: {plan.targetCarbs || '—'}г</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Nutrition Plan Editor
// ============================================================================

interface NutritionPlanEditorProps {
  plan: NutritionPlan | null;
  date: string;
  onSave: (plan: Omit<NutritionPlan, 'id'>) => void;
  onCancel: () => void;
}

const NutritionPlanEditor: React.FC<NutritionPlanEditorProps> = ({ plan, date, onSave, onCancel }) => {
  const [planDate, setPlanDate] = useState(plan?.date || date);
  const [targetCalories, setTargetCalories] = useState(plan?.targetCalories?.toString() || '2000');
  const [targetProtein, setTargetProtein] = useState(plan?.targetProtein?.toString() || '150');
  const [targetCarbs, setTargetCarbs] = useState(plan?.targetCarbs?.toString() || '200');
  const [targetFat, setTargetFat] = useState(plan?.targetFat?.toString() || '70');
  const [meals, setMeals] = useState(plan?.meals || {
    breakfast: { name: '', description: '' },
    lunch: { name: '', description: '' },
    dinner: { name: '', description: '' },
  });

  const updateMeal = (mealKey: 'breakfast' | 'lunch' | 'dinner', updates: Partial<MealPlan>) => {
    setMeals({ ...meals, [mealKey]: { ...meals[mealKey], ...updates } });
  };

  const handleSave = () => {
    onSave({
      date: planDate,
      meals,
      targetCalories: parseInt(targetCalories) || 0,
      targetProtein: parseInt(targetProtein) || 0,
      targetCarbs: parseInt(targetCarbs) || 0,
      targetFat: parseInt(targetFat) || 0,
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold">
          {plan ? 'Редактировать план' : 'Новый план питания'}
        </h3>
        <button onClick={onCancel} className="text-zinc-500">
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Date */}
      <div>
        <label className="text-zinc-500 text-sm mb-1 block">Дата</label>
        <input
          type="date"
          value={planDate}
          onChange={(e) => setPlanDate(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white"
        />
      </div>

      {/* Macros */}
      <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
        <h4 className="text-white font-medium mb-3">Целевые КБЖУ</h4>
        <div className="grid grid-cols-4 gap-3">
          <div>
            <label className="text-zinc-600 text-xs">Ккал</label>
            <input
              type="number"
              value={targetCalories}
              onChange={(e) => setTargetCalories(e.target.value)}
              className="w-full bg-zinc-800 rounded-lg px-2 py-2 text-white text-center"
            />
          </div>
          <div>
            <label className="text-zinc-600 text-xs">Белки</label>
            <input
              type="number"
              value={targetProtein}
              onChange={(e) => setTargetProtein(e.target.value)}
              className="w-full bg-zinc-800 rounded-lg px-2 py-2 text-white text-center"
            />
          </div>
          <div>
            <label className="text-zinc-600 text-xs">Жиры</label>
            <input
              type="number"
              value={targetFat}
              onChange={(e) => setTargetFat(e.target.value)}
              className="w-full bg-zinc-800 rounded-lg px-2 py-2 text-white text-center"
            />
          </div>
          <div>
            <label className="text-zinc-600 text-xs">Углеводы</label>
            <input
              type="number"
              value={targetCarbs}
              onChange={(e) => setTargetCarbs(e.target.value)}
              className="w-full bg-zinc-800 rounded-lg px-2 py-2 text-white text-center"
            />
          </div>
        </div>
      </div>

      {/* Meals */}
      {(['breakfast', 'lunch', 'dinner'] as const).map((mealKey) => (
        <div key={mealKey} className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
          <h4 className="text-white font-medium mb-3">
            {mealKey === 'breakfast' ? '🍳 Завтрак' : mealKey === 'lunch' ? '🥗 Обед' : '🍽 Ужин'}
          </h4>
          <div className="space-y-3">
            <input
              type="text"
              value={meals[mealKey].name}
              onChange={(e) => updateMeal(mealKey, { name: e.target.value })}
              placeholder="Название блюда"
              className="w-full bg-zinc-800 rounded-lg px-4 py-3 text-white"
            />
            <textarea
              value={meals[mealKey].description || ''}
              onChange={(e) => updateMeal(mealKey, { description: e.target.value })}
              placeholder="Описание / состав"
              rows={2}
              className="w-full bg-zinc-800 rounded-lg px-4 py-3 text-white resize-none"
            />
          </div>
        </div>
      ))}

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={handleSave}
          className="flex-1 bg-emerald-600 text-white py-4 rounded-xl font-medium"
        >
          Сохранить
        </button>
        <button
          onClick={onCancel}
          className="flex-1 bg-zinc-800 text-zinc-400 py-4 rounded-xl font-medium"
        >
          Отмена
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// Body Tab
// ============================================================================

interface BodyTabProps {
  clientId: string;
}

const BodyTab: React.FC<BodyTabProps> = ({ clientId }) => {
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNote, setNewNote] = useState({ type: 'note', text: '' });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load measurements
        const measurementsRef = collection(db, 'users', clientId, 'measurements');
        const mSnapshot = await getDocs(query(measurementsRef, orderBy('date', 'desc')));
        const measurementsList: any[] = [];
        mSnapshot.forEach((doc) => {
          measurementsList.push({ id: doc.id, ...doc.data() });
        });
        setMeasurements(measurementsList);

        // Load health notes
        const notesRef = collection(db, 'users', clientId, 'healthNotes');
        const nSnapshot = await getDocs(query(notesRef, orderBy('createdAt', 'desc')));
        const notesList: any[] = [];
        nSnapshot.forEach((doc) => {
          notesList.push({ id: doc.id, ...doc.data() });
        });
        setNotes(notesList);
      } catch (error) {
        console.error('Failed to load body data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [clientId]);

  const handleAddNote = async () => {
    if (!newNote.text.trim()) return;
    try {
      const docRef = await addDoc(collection(db, 'users', clientId, 'healthNotes'), {
        ...newNote,
        createdAt: new Date().toISOString(),
      });
      setNotes([{ id: docRef.id, ...newNote, createdAt: new Date().toISOString() }, ...notes]);
      setNewNote({ type: 'note', text: '' });
      setShowAddNote(false);
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Удалить заметку?')) return;
    try {
      await deleteDoc(doc(db, 'users', clientId, 'healthNotes', noteId));
      setNotes(notes.filter(n => n.id !== noteId));
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-zinc-900 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Health Notes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Заметки о здоровье</h3>
          <button
            onClick={() => setShowAddNote(true)}
            className="text-blue-500 text-sm flex items-center gap-1"
          >
            <PlusIcon className="w-4 h-4" />
            Добавить
          </button>
        </div>

        {showAddNote && (
          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 mb-4">
            <select
              value={newNote.type}
              onChange={(e) => setNewNote({ ...newNote, type: e.target.value })}
              className="w-full bg-zinc-800 rounded-lg px-4 py-2 text-white mb-3"
            >
              <option value="note">📝 Заметка</option>
              <option value="injury">🩹 Травма</option>
              <option value="limitation">⚠️ Ограничение</option>
            </select>
            <textarea
              value={newNote.text}
              onChange={(e) => setNewNote({ ...newNote, text: e.target.value })}
              placeholder="Текст заметки..."
              rows={3}
              className="w-full bg-zinc-800 rounded-lg px-4 py-3 text-white resize-none mb-3"
            />
            <div className="flex gap-2">
              <button onClick={handleAddNote} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm">
                Сохранить
              </button>
              <button onClick={() => setShowAddNote(false)} className="flex-1 bg-zinc-800 text-zinc-400 py-2 rounded-lg text-sm">
                Отмена
              </button>
            </div>
          </div>
        )}

        {notes.length === 0 ? (
          <div className="bg-zinc-900 rounded-xl p-6 text-center border border-zinc-800">
            <HeartIcon className="w-10 h-10 text-zinc-700 mx-auto mb-2" />
            <p className="text-zinc-500 text-sm">Нет заметок</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notes.map((note) => (
              <div
                key={note.id}
                className={`p-4 rounded-xl border ${
                  note.type === 'injury'
                    ? 'bg-red-950/30 border-red-900/50'
                    : note.type === 'limitation'
                      ? 'bg-amber-950/30 border-amber-900/50'
                      : 'bg-zinc-900 border-zinc-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-white text-sm">{note.text}</p>
                    <p className="text-zinc-500 text-xs mt-1">
                      {new Date(note.createdAt).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  <button onClick={() => handleDeleteNote(note.id)} className="text-zinc-500 hover:text-red-400">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Measurements */}
      <div>
        <h3 className="text-white font-semibold mb-4">Измерения</h3>
        {measurements.length === 0 ? (
          <div className="bg-zinc-900 rounded-xl p-6 text-center border border-zinc-800">
            <ChartBarIcon className="w-10 h-10 text-zinc-700 mx-auto mb-2" />
            <p className="text-zinc-500 text-sm">Нет измерений</p>
          </div>
        ) : (
          <div className="space-y-2">
            {measurements.slice(0, 5).map((m) => (
              <div key={m.id} className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                <p className="text-zinc-500 text-sm mb-1">{m.date}</p>
                <div className="flex gap-4">
                  {m.weight && <span className="text-white">Вес: {m.weight} кг</span>}
                  {m.chest && <span className="text-zinc-400">Грудь: {m.chest}</span>}
                  {m.waist && <span className="text-zinc-400">Талия: {m.waist}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

const ClientDetailPageNew: React.FC = () => {
  const history = useHistory();
  const { clientId } = useParams<{ clientId: string }>();
  const [client, setClient] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  // Load client
  useEffect(() => {
    const loadClient = async () => {
      if (!clientId) return;
      try {
        const docRef = doc(db, 'users', clientId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setClient({ id: docSnap.id, ...docSnap.data() } as ClientData);
        }
      } catch (error) {
        // Failed to load client
      } finally {
        setLoading(false);
      }
    };
    loadClient();
  }, [clientId]);

  const handleUpdateClient = async (data: Partial<ClientData>) => {
    if (!clientId) return;
    try {
      await updateDoc(doc(db, 'users', clientId), {
        ...data,
        updatedAt: new Date().toISOString(),
      });
      setClient(prev => prev ? { ...prev, ...data } : null);
    } catch (error) {
      console.error('Failed to update client:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6">
        <UserIcon className="w-16 h-16 text-zinc-700 mb-4" />
        <p className="text-zinc-500">Клиент не найден</p>
        <button
          onClick={() => history.push('/coach/clients')}
          className="mt-4 text-blue-500"
        >
          Назад к списку
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Header */}
      <div className="bg-zinc-950 border-b border-zinc-800 px-4 py-4 safe-area-inset-top">
        <div className="flex items-center gap-3">
          <button
            onClick={() => history.push('/coach/clients')}
            className="p-2 rounded-xl bg-zinc-900 text-zinc-400"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-white">{client.name || 'Клиент'}</h1>
            <p className="text-zinc-500 text-sm">{client.phone}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 py-4">
        <div className="flex gap-2">
          <TabButton
            active={activeTab === 'overview'}
            icon={<UserIcon className="w-5 h-5" />}
            label="Профиль"
            onClick={() => setActiveTab('overview')}
          />
          <TabButton
            active={activeTab === 'workouts'}
            icon={<FireIcon className="w-5 h-5" />}
            label="Трен."
            onClick={() => setActiveTab('workouts')}
          />
          <TabButton
            active={activeTab === 'nutrition'}
            icon={<SparklesIcon className="w-5 h-5" />}
            label="Питание"
            onClick={() => setActiveTab('nutrition')}
          />
          <TabButton
            active={activeTab === 'body'}
            icon={<HeartIcon className="w-5 h-5" />}
            label="Тело"
            onClick={() => setActiveTab('body')}
          />
        </div>
      </div>

      {/* Content */}
      <div className="px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && (
              <OverviewTab client={client} onUpdate={handleUpdateClient} />
            )}
            {activeTab === 'workouts' && clientId && (
              <WorkoutsTab clientId={clientId} />
            )}
            {activeTab === 'nutrition' && clientId && (
              <NutritionTab clientId={clientId} />
            )}
            {activeTab === 'body' && clientId && (
              <BodyTab clientId={clientId} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ClientDetailPageNew;
