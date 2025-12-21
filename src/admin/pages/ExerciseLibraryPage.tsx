/**
 * Exercise Library Page - Manage exercises database
 * 
 * Features:
 * - List all exercises (global + tenant)
 * - Create/edit exercises
 * - Upload demo videos
 * - Filter by category
 * 
 * @module admin/pages/ExerciseLibrary
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  VideoCameraIcon,
  FunnelIcon,
  XMarkIcon,
  CloudArrowUpIcon,
  RectangleStackIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../auth/AuthContextV2';
import {
  getExercises,
  createExercise,
  updateExercise,
  deleteExercise,
  uploadExerciseVideo,
  type Exercise,
} from '../services/adminService';
import {
  exerciseSchema,
  exerciseCategorySchema,
  type ExerciseFormData,
} from '../schemas';
import {
  Input,
  Textarea,
  Select,
  MultiSelect,
  Toggle,
  Button,
  Card,
  EmptyState,
  LoadingState,
  FormField,
} from '../components/FormComponents';

// ============================================================================
// Constants
// ============================================================================

const CATEGORIES = exerciseCategorySchema.options.map(cat => ({
  value: cat,
  label: getCategoryLabel(cat),
}));

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    chest: 'Грудь',
    back: 'Спина',
    shoulders: 'Плечи',
    biceps: 'Бицепс',
    triceps: 'Трицепс',
    legs: 'Ноги',
    glutes: 'Ягодицы',
    core: 'Пресс',
    cardio: 'Кардио',
    stretching: 'Растяжка',
    compound: 'Базовые',
    functional: 'Функциональные',
  };
  return labels[category] || category;
}

const MUSCLE_GROUPS = [
  { value: 'chest', label: 'Грудные' },
  { value: 'back', label: 'Спина' },
  { value: 'shoulders', label: 'Дельты' },
  { value: 'biceps', label: 'Бицепс' },
  { value: 'triceps', label: 'Трицепс' },
  { value: 'forearms', label: 'Предплечья' },
  { value: 'quads', label: 'Квадрицепс' },
  { value: 'hamstrings', label: 'Бицепс бедра' },
  { value: 'glutes', label: 'Ягодичные' },
  { value: 'calves', label: 'Икры' },
  { value: 'core', label: 'Кор' },
  { value: 'abs', label: 'Пресс' },
];

const EQUIPMENT = [
  { value: 'barbell', label: 'Штанга' },
  { value: 'dumbbell', label: 'Гантели' },
  { value: 'kettlebell', label: 'Гиря' },
  { value: 'machine', label: 'Тренажёр' },
  { value: 'cable', label: 'Кабельный' },
  { value: 'pullup_bar', label: 'Турник' },
  { value: 'dip_bars', label: 'Брусья' },
  { value: 'resistance_band', label: 'Резинка' },
  { value: 'bench', label: 'Скамья' },
  { value: 'bodyweight', label: 'Свой вес' },
];

const DEFAULT_TENANT = 'default';

// ============================================================================
// Exercise Form Modal
// ============================================================================

interface ExerciseFormModalProps {
  exercise?: Exercise | null;
  onClose: () => void;
  onSave: (data: ExerciseFormData) => Promise<void>;
  isLoading: boolean;
}

const ExerciseFormModal: React.FC<ExerciseFormModalProps> = ({
  exercise,
  onClose,
  onSave,
  isLoading,
}) => {
  const { isAdmin } = useAuth();
  const [form, setForm] = useState<ExerciseFormData>({
    name: exercise?.name || '',
    category: (exercise?.category as ExerciseFormData['category']) || 'compound',
    description: exercise?.description || '',
    videoUrl: exercise?.videoUrl || '',
    thumbnailUrl: exercise?.thumbnailUrl || '',
    equipment: exercise?.equipment || [],
    muscleGroups: exercise?.muscleGroups || [],
    difficulty: (exercise?.difficulty as ExerciseFormData['difficulty']) || undefined,
    instructions: exercise?.instructions || [],
    isGlobal: exercise?.isGlobal || false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [instructionInput, setInstructionInput] = useState('');

  const updateField = <K extends keyof ExerciseFormData>(
    field: K,
    value: ExerciseFormData[K]
  ) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const addInstruction = () => {
    if (instructionInput.trim()) {
      updateField('instructions', [...(form.instructions || []), instructionInput.trim()]);
      setInstructionInput('');
    }
  };

  const removeInstruction = (index: number) => {
    updateField('instructions', (form.instructions || []).filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = exerciseSchema.safeParse(form);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach(err => {
        const path = err.path.join('.');
        newErrors[path] = err.message;
      });
      setErrors(newErrors);
      return;
    }
    
    await onSave(result.data);
  };

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
        className="bg-tr-card border border-tr-border rounded-tr-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-tr-border">
          <h2 className="text-lg font-semibold text-white">
            {exercise ? 'Редактировать упражнение' : 'Новое упражнение'}
          </h2>
          <button onClick={onClose} className="p-2 text-tr-text-muted hover:text-white">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto max-h-[calc(90vh-130px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Название"
              value={form.name}
              onChange={e => updateField('name', e.target.value)}
              error={errors.name}
              required
              placeholder="Жим штанги лёжа"
            />
            
            <Select
              label="Категория"
              value={form.category}
              onChange={v => updateField('category', v as ExerciseFormData['category'])}
              options={CATEGORIES}
              error={errors.category}
              required
            />
          </div>

          <Textarea
            label="Описание"
            value={form.description}
            onChange={e => updateField('description', e.target.value)}
            error={errors.description}
            required
            placeholder="Базовое упражнение для развития грудных мышц..."
            maxLength={500}
            showCount
          />

          <MultiSelect
            label="Целевые мышцы"
            value={form.muscleGroups}
            onChange={v => updateField('muscleGroups', v)}
            options={MUSCLE_GROUPS}
            error={errors.muscleGroups}
            required
            columns={3}
          />

          <MultiSelect
            label="Оборудование"
            value={form.equipment || []}
            onChange={v => updateField('equipment', v)}
            options={EQUIPMENT}
            columns={3}
          />

          <Select
            label="Сложность"
            value={form.difficulty || ''}
            onChange={v => updateField('difficulty', v as ExerciseFormData['difficulty'])}
            options={[
              { value: 'beginner', label: 'Начинающий' },
              { value: 'intermediate', label: 'Средний' },
              { value: 'advanced', label: 'Продвинутый' },
            ]}
            placeholder="Не указано"
          />

          {/* Instructions */}
          <FormField label="Инструкции">
            <div className="space-y-2">
              {(form.instructions || []).map((instruction, index) => (
                <div key={index} className="flex items-start gap-2 bg-tr-input border border-tr-border rounded-tr-sm p-2">
                  <span className="text-tr-accent font-medium">{index + 1}.</span>
                  <span className="flex-1 text-sm text-white">{instruction}</span>
                  <button
                    type="button"
                    onClick={() => removeInstruction(index)}
                    className="p-1 text-tr-text-muted hover:text-tr-error"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={instructionInput}
                  onChange={e => setInstructionInput(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addInstruction())}
                  placeholder="Добавить шаг..."
                  className="flex-1 bg-tr-input border border-tr-border rounded-tr-sm px-3 py-2 text-white placeholder-tr-text-disabled"
                />
                <Button type="button" variant="secondary" size="sm" onClick={addInstruction}>
                  Добавить
                </Button>
              </div>
            </div>
          </FormField>

          <Input
            label="URL видео"
            value={form.videoUrl || ''}
            onChange={e => updateField('videoUrl', e.target.value)}
            error={errors.videoUrl}
            placeholder="https://..."
            hint="Или загрузите видео после сохранения"
          />

          {isAdmin && (
            <Toggle
              label="Глобальное упражнение"
              checked={form.isGlobal}
              onChange={v => updateField('isGlobal', v)}
              description="Видно всем тренерам"
            />
          )}
        </form>

        <div className="flex justify-end gap-3 p-4 border-t border-tr-border">
          <Button variant="ghost" onClick={onClose}>Отмена</Button>
          <Button onClick={handleSubmit} loading={isLoading}>
            {exercise ? 'Сохранить' : 'Создать'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ============================================================================
// Video Upload Modal
// ============================================================================

interface VideoUploadModalProps {
  exercise: Exercise;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
  isLoading: boolean;
}

const VideoUploadModal: React.FC<VideoUploadModalProps> = ({
  exercise,
  onClose,
  onUpload,
  isLoading,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    // Validate
    if (!['video/mp4', 'video/webm', 'video/quicktime'].includes(selected.type)) {
      setError('Поддерживаются только MP4, WebM, MOV');
      return;
    }
    if (selected.size > 100 * 1024 * 1024) {
      setError('Максимальный размер 100MB');
      return;
    }

    setFile(selected);
    setError('');
    setPreview(URL.createObjectURL(selected));
  };

  const handleUpload = async () => {
    if (!file) return;
    await onUpload(file);
  };

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
        className="bg-tr-card border border-tr-border rounded-tr-xl w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-tr-border">
          <h2 className="text-lg font-semibold text-white">
            Загрузить видео: {exercise.name}
          </h2>
          <button onClick={onClose} className="p-2 text-tr-text-muted hover:text-white">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {preview ? (
            <div className="relative aspect-video bg-black rounded-tr-md overflow-hidden">
              <video src={preview} controls className="w-full h-full object-contain" />
              <button
                onClick={() => { setFile(null); setPreview(null); }}
                className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center aspect-video border-2 border-dashed border-tr-border rounded-tr-md cursor-pointer hover:border-tr-accent transition-colors">
              <CloudArrowUpIcon className="w-12 h-12 text-tr-text-muted mb-2" />
              <span className="text-tr-text-muted">Нажмите для выбора файла</span>
              <span className="text-xs text-tr-text-disabled mt-1">MP4, WebM, MOV до 100MB</span>
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}

          {error && (
            <p className="text-sm text-tr-error">{error}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 p-4 border-t border-tr-border">
          <Button variant="ghost" onClick={onClose}>Отмена</Button>
          <Button onClick={handleUpload} loading={isLoading} disabled={!file}>
            Загрузить
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ============================================================================
// Main Page Component
// ============================================================================

export const ExerciseLibraryPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [uploadingExercise, setUploadingExercise] = useState<Exercise | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const loadExercises = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getExercises(DEFAULT_TENANT, user?.id);
      setExercises(data);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadExercises();
  }, [loadExercises]);

  const handleSave = async (data: ExerciseFormData) => {
    setSaving(true);
    try {
      if (editingExercise) {
        await updateExercise(editingExercise.id, data, DEFAULT_TENANT, editingExercise.isGlobal);
      } else {
        await createExercise(data, user!.id, DEFAULT_TENANT);
      }
      await loadExercises();
      setShowForm(false);
      setEditingExercise(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (exercise: Exercise) => {
    if (!confirm(`Удалить упражнение "${exercise.name}"?`)) return;
    try {
      await deleteExercise(exercise.id, DEFAULT_TENANT, exercise.isGlobal);
      await loadExercises();
    } catch (error) {
      console.error('Error deleting exercise:', error);
    }
  };

  const handleVideoUpload = async (file: File) => {
    if (!uploadingExercise) return;
    setUploading(true);
    try {
      const videoUrl = await uploadExerciseVideo(uploadingExercise.id, file, DEFAULT_TENANT);
      await updateExercise(uploadingExercise.id, { videoUrl }, DEFAULT_TENANT, uploadingExercise.isGlobal);
      await loadExercises();
      setUploadingExercise(null);
    } finally {
      setUploading(false);
    }
  };

  // Filter exercises
  const filtered = exercises.filter(ex => {
    const matchesSearch = !search || 
      ex.name.toLowerCase().includes(search.toLowerCase()) ||
      ex.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !categoryFilter || ex.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <LoadingState message="Загрузка упражнений..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Библиотека упражнений</h1>
          <p className="text-tr-text-muted">{exercises.length} упражнений</p>
        </div>
        <Button icon={<PlusIcon className="w-5 h-5" />} onClick={() => setShowForm(true)}>
          Добавить упражнение
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tr-text-muted" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск по названию..."
              className="w-full bg-tr-input border border-tr-border rounded-tr-md pl-10 pr-4 py-2.5 text-white placeholder-tr-text-disabled"
            />
          </div>
          <div className="sm:w-48">
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full bg-tr-input border border-tr-border rounded-tr-md px-4 py-2.5 text-white"
            >
              <option value="">Все категории</option>
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Exercise List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<RectangleStackIcon className="w-8 h-8 text-tr-text-muted" />}
          title="Упражнения не найдены"
          description={search ? 'Попробуйте изменить поисковый запрос' : 'Добавьте первое упражнение'}
          action={
            !search && (
              <Button onClick={() => setShowForm(true)}>
                Добавить упражнение
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(exercise => (
            <motion.div
              key={exercise.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="h-full flex flex-col">
                {/* Thumbnail / Video */}
                <div className="relative aspect-video bg-tr-elevated rounded-tr-md overflow-hidden mb-3 -mx-4 -mt-4">
                  {exercise.videoUrl ? (
                    <video
                      src={exercise.videoUrl}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      onMouseEnter={e => (e.target as HTMLVideoElement).play()}
                      onMouseLeave={e => { (e.target as HTMLVideoElement).pause(); (e.target as HTMLVideoElement).currentTime = 0; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <VideoCameraIcon className="w-12 h-12 text-tr-text-disabled" />
                    </div>
                  )}
                  {exercise.isGlobal && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-tr-accent text-white text-xs rounded-full">
                      Глобальное
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">{exercise.name}</h3>
                  <p className="text-sm text-tr-text-muted line-clamp-2 mb-2">
                    {exercise.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    <span className="px-2 py-0.5 bg-tr-elevated text-tr-text-muted text-xs rounded-full">
                      {getCategoryLabel(exercise.category)}
                    </span>
                    {exercise.difficulty && (
                      <span className="px-2 py-0.5 bg-tr-elevated text-tr-text-muted text-xs rounded-full">
                        {exercise.difficulty === 'beginner' ? 'Начинающий' : 
                         exercise.difficulty === 'intermediate' ? 'Средний' : 'Продвинутый'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-tr-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<PencilIcon className="w-4 h-4" />}
                    onClick={() => { setEditingExercise(exercise); setShowForm(true); }}
                  >
                    Изменить
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<VideoCameraIcon className="w-4 h-4" />}
                    onClick={() => setUploadingExercise(exercise)}
                  >
                    Видео
                  </Button>
                  {(isAdmin || exercise.createdBy === user?.id) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<TrashIcon className="w-4 h-4" />}
                      onClick={() => handleDelete(exercise)}
                      className="ml-auto text-tr-error hover:text-tr-error"
                    />
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showForm && (
          <ExerciseFormModal
            exercise={editingExercise}
            onClose={() => { setShowForm(false); setEditingExercise(null); }}
            onSave={handleSave}
            isLoading={saving}
          />
        )}
        {uploadingExercise && (
          <VideoUploadModal
            exercise={uploadingExercise}
            onClose={() => setUploadingExercise(null)}
            onUpload={handleVideoUpload}
            isLoading={uploading}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExerciseLibraryPage;
