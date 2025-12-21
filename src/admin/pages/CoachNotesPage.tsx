/**
 * Coach Notes Page - Daily/weekly notes for clients
 * 
 * Features:
 * - Create/edit/delete notes
 * - Note types: daily, weekly, workout, nutrition, general
 * - Priority levels
 * - Private notes (coach-only)
 * - Date filtering
 * 
 * @module admin/pages/CoachNotesPage
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeftIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  LockClosedIcon,
  FlagIcon,
  XMarkIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../auth/AuthContextV2';
import {
  getClient,
  getCoachNotes,
  createCoachNote,
  updateCoachNote,
  deleteCoachNote,
  type Client,
  type CoachNote,
} from '../services/adminService';
import {
  coachNoteSchema,
  coachNoteTypeSchema,
  type CoachNoteFormData,
} from '../schemas';
import {
  Input,
  Textarea,
  Select,
  Toggle,
  Button,
  Card,
  EmptyState,
  LoadingState,
} from '../components/FormComponents';

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_TENANT = 'default';

const NOTE_TYPES = [
  { value: 'daily', label: 'Дневная', icon: '📅' },
  { value: 'weekly', label: 'Недельная', icon: '📆' },
  { value: 'workout', label: 'Тренировка', icon: '💪' },
  { value: 'nutrition', label: 'Питание', icon: '🥗' },
  { value: 'general', label: 'Общая', icon: '📝' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Низкий', color: 'text-tr-text-muted' },
  { value: 'normal', label: 'Обычный', color: 'text-white' },
  { value: 'high', label: 'Высокий', color: 'text-tr-error' },
];

// ============================================================================
// Note Form Modal
// ============================================================================

interface NoteFormModalProps {
  note?: CoachNote | null;
  clientId: string;
  coachId: string;
  onClose: () => void;
  onSave: (data: CoachNoteFormData) => Promise<void>;
  isLoading: boolean;
}

const NoteFormModal: React.FC<NoteFormModalProps> = ({
  note,
  clientId,
  coachId,
  onClose,
  onSave,
  isLoading,
}) => {
  const [form, setForm] = useState<CoachNoteFormData>({
    clientId,
    coachId,
    tenantId: DEFAULT_TENANT,
    type: (note?.type as CoachNoteFormData['type']) || 'general',
    date: note?.date || new Date().toISOString().split('T')[0],
    weekStartDate: note?.weekStartDate,
    title: note?.title || '',
    content: note?.content || '',
    isPrivate: note?.isPrivate || false,
    priority: (note?.priority as CoachNoteFormData['priority']) || 'normal',
    attachments: note?.attachments || [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = <K extends keyof CoachNoteFormData>(
    field: K,
    value: CoachNoteFormData[K]
  ) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = coachNoteSchema.safeParse(form);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach(err => {
        newErrors[err.path.join('.')] = err.message;
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
        className="bg-tr-card border border-tr-border rounded-tr-xl w-full max-w-lg max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-tr-border">
          <h2 className="text-lg font-semibold text-white">
            {note ? 'Редактировать заметку' : 'Новая заметка'}
          </h2>
          <button onClick={onClose} className="p-2 text-tr-text-muted hover:text-white">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto max-h-[calc(90vh-130px)]">
          {/* Type selector */}
          <div>
            <label className="block text-sm font-medium text-tr-text-muted mb-2">
              Тип заметки
            </label>
            <div className="flex flex-wrap gap-2">
              {NOTE_TYPES.map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => updateField('type', type.value as CoachNoteFormData['type'])}
                  className={`flex items-center gap-2 px-3 py-2 rounded-tr-md transition-colors ${
                    form.type === type.value
                      ? 'bg-tr-accent text-white'
                      : 'bg-tr-input border border-tr-border text-tr-text-muted hover:text-white'
                  }`}
                >
                  <span>{type.icon}</span>
                  <span className="text-sm">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Заголовок"
            value={form.title}
            onChange={e => updateField('title', e.target.value)}
            error={errors.title}
            required
            placeholder="Краткий заголовок..."
          />

          {(form.type === 'daily' || form.type === 'workout' || form.type === 'nutrition') && (
            <Input
              label="Дата"
              type="date"
              value={form.date || ''}
              onChange={e => updateField('date', e.target.value)}
              error={errors.date}
            />
          )}

          <Textarea
            label="Содержание"
            value={form.content}
            onChange={e => updateField('content', e.target.value)}
            error={errors.content}
            required
            placeholder="Текст заметки..."
            rows={5}
            maxLength={5000}
            showCount
          />

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-tr-text-muted mb-2">
              Приоритет
            </label>
            <div className="flex gap-2">
              {PRIORITY_OPTIONS.map(priority => (
                <button
                  key={priority.value}
                  type="button"
                  onClick={() => updateField('priority', priority.value as CoachNoteFormData['priority'])}
                  className={`flex items-center gap-2 px-4 py-2 rounded-tr-md transition-colors ${
                    form.priority === priority.value
                      ? 'bg-tr-accent text-white'
                      : 'bg-tr-input border border-tr-border text-tr-text-muted hover:text-white'
                  }`}
                >
                  {priority.value === 'high' && <FlagIcon className="w-4 h-4 text-tr-error" />}
                  <span className="text-sm">{priority.label}</span>
                </button>
              ))}
            </div>
          </div>

          <Toggle
            label="Приватная заметка"
            checked={form.isPrivate}
            onChange={v => updateField('isPrivate', v)}
            description="Видна только тренеру, не клиенту"
          />
        </form>

        <div className="flex justify-end gap-3 p-4 border-t border-tr-border">
          <Button variant="ghost" onClick={onClose}>Отмена</Button>
          <Button onClick={handleSubmit} loading={isLoading}>
            {note ? 'Сохранить' : 'Создать'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ============================================================================
// Note Card Component
// ============================================================================

interface NoteCardProps {
  note: CoachNote;
  onEdit: () => void;
  onDelete: () => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onEdit, onDelete }) => {
  const noteType = NOTE_TYPES.find(t => t.value === note.type);
  const priorityOption = PRIORITY_OPTIONS.find(p => p.value === note.priority);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      layout
    >
      <Card className={note.priority === 'high' ? 'border-tr-error/50' : ''}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{noteType?.icon}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              note.isPrivate ? 'bg-tr-error/20 text-tr-error' : 'bg-tr-elevated text-tr-text-muted'
            }`}>
              {noteType?.label}
              {note.isPrivate && (
                <LockClosedIcon className="w-3 h-3 inline ml-1" />
              )}
            </span>
            {note.priority === 'high' && (
              <FlagIcon className="w-4 h-4 text-tr-error" />
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onEdit}
              className="p-1.5 text-tr-text-muted hover:text-white rounded-tr-sm hover:bg-tr-hover"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 text-tr-text-muted hover:text-tr-error rounded-tr-sm hover:bg-tr-hover"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        <h3 className="font-semibold text-white mt-3 mb-2">{note.title}</h3>
        <p className="text-sm text-tr-text-muted whitespace-pre-wrap line-clamp-4">
          {note.content}
        </p>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-tr-border text-xs text-tr-text-disabled">
          {note.date && (
            <span className="flex items-center gap-1">
              <CalendarIcon className="w-3 h-3" />
              {formatDate(note.date)}
            </span>
          )}
          <span>
            {formatDate(note.createdAt)}
          </span>
        </div>
      </Card>
    </motion.div>
  );
};

// ============================================================================
// Main Page Component
// ============================================================================

export const CoachNotesPage: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const history = useHistory();
  const { user } = useAuth();

  const [client, setClient] = useState<Client | null>(null);
  const [notes, setNotes] = useState<CoachNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('');

  // Modal state
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<CoachNote | null>(null);

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [clientData, notesData] = await Promise.all([
        getClient(clientId, DEFAULT_TENANT),
        getCoachNotes(clientId, DEFAULT_TENANT, typeFilter as CoachNote['type'] || undefined),
      ]);
      setClient(clientData);
      setNotes(notesData);
    } finally {
      setLoading(false);
    }
  }, [clientId, typeFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async (data: CoachNoteFormData) => {
    setSaving(true);
    try {
      if (editingNote) {
        await updateCoachNote(clientId, editingNote.id, data, DEFAULT_TENANT);
      } else {
        await createCoachNote(data, DEFAULT_TENANT);
      }
      await loadData();
      setShowForm(false);
      setEditingNote(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (note: CoachNote) => {
    if (!confirm(`Удалить заметку "${note.title}"?`)) return;
    try {
      await deleteCoachNote(clientId, note.id, DEFAULT_TENANT);
      await loadData();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  if (loading) {
    return <LoadingState message="Загрузка заметок..." />;
  }

  if (!client) {
    return (
      <EmptyState
        title="Клиент не найден"
        action={<Button onClick={() => history.push('/admin/clients')}>К списку клиентов</Button>}
      />
    );
  }

  // Group notes by date
  const groupedNotes: Record<string, CoachNote[]> = {};
  notes.forEach(note => {
    const dateKey = note.date || note.createdAt.split('T')[0];
    if (!groupedNotes[dateKey]) {
      groupedNotes[dateKey] = [];
    }
    groupedNotes[dateKey].push(note);
  });

  const sortedDates = Object.keys(groupedNotes).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

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
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{client.name}</h1>
          <p className="text-tr-text-muted">Заметки тренера</p>
        </div>
        <Button
          icon={<PlusIcon className="w-5 h-5" />}
          onClick={() => setShowForm(true)}
        >
          Новая заметка
        </Button>
      </div>

      {/* Tabs / Quick Links */}
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => history.push(`/admin/clients/${clientId}/plan`)}
        >
          Тренировки
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => history.push(`/admin/clients/${clientId}/nutrition`)}
        >
          Питание
        </Button>
        <Button variant="secondary" size="sm">
          Заметки
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setTypeFilter('')}
            className={`px-3 py-1.5 text-sm rounded-tr-md transition-colors ${
              !typeFilter ? 'bg-tr-accent text-white' : 'bg-tr-elevated text-tr-text-muted hover:text-white'
            }`}
          >
            Все
          </button>
          {NOTE_TYPES.map(type => (
            <button
              key={type.value}
              onClick={() => setTypeFilter(type.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-tr-md transition-colors ${
                typeFilter === type.value 
                  ? 'bg-tr-accent text-white' 
                  : 'bg-tr-elevated text-tr-text-muted hover:text-white'
              }`}
            >
              <span>{type.icon}</span>
              <span>{type.label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Notes List */}
      {notes.length === 0 ? (
        <EmptyState
          icon={<span className="text-4xl">📝</span>}
          title="Заметок пока нет"
          description="Создайте первую заметку для клиента"
          action={
            <Button onClick={() => setShowForm(true)}>
              Создать заметку
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {sortedDates.map(date => (
            <div key={date}>
              <h3 className="text-sm font-medium text-tr-text-muted mb-3">
                {new Date(date).toLocaleDateString('ru-RU', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </h3>
              <div className="space-y-3">
                {groupedNotes[date].map(note => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={() => { setEditingNote(note); setShowForm(true); }}
                    onDelete={() => handleDelete(note)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <NoteFormModal
            note={editingNote}
            clientId={clientId}
            coachId={user?.id || ''}
            onClose={() => { setShowForm(false); setEditingNote(null); }}
            onSave={handleSave}
            isLoading={saving}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CoachNotesPage;
