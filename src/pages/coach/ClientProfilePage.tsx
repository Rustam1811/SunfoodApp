/**
 * Client Profile Page - Trainer OS (Coach)
 * 
 * Tabs:
 * - Body: injuries, limitations, notes, measurements
 * - Workouts: today, history, templates
 * - Nutrition: macros, menu, checkmarks
 * - Video: client videos with timecode comments
 * 
 * @module pages/coach/ClientProfilePage
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useHistory } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  UserIcon,
  HeartIcon,
  FireIcon,
  SparklesIcon,
  VideoCameraIcon,
  PlusIcon,
  PencilIcon,
  ChatBubbleLeftIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';
import { getClientById, type Client } from '../../services/clientService';
import { getClientHealthNotes, type HealthNote } from '../../services/healthNotesService';
import { getClientMeasurements, getClientPersonalRecords, type BodyMetric, type PersonalRecord } from '../../services/bodyService';
import { getClientVideos, type ClientVideo } from '../../services/videoService';

// ============================================================================
// Types
// ============================================================================

type TabKey = 'body' | 'workouts' | 'nutrition' | 'video';

interface Tab {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
}

// ============================================================================
// Tab Navigation
// ============================================================================

interface TabNavigationProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs: Tab[] = [
    { key: 'body', label: 'Тело', icon: <HeartIcon className="w-5 h-5" /> },
    { key: 'workouts', label: 'Тренировки', icon: <FireIcon className="w-5 h-5" /> },
    { key: 'nutrition', label: 'Питание', icon: <SparklesIcon className="w-5 h-5" /> },
    { key: 'video', label: 'Видео', icon: <VideoCameraIcon className="w-5 h-5" /> },
  ];

  return (
    <div className="flex bg-tr-elevated rounded-2xl p-1">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`flex-1 flex flex-col items-center gap-1 py-2 px-2 rounded-xl transition-all ${
            activeTab === tab.key
              ? 'bg-tr-accent text-white'
              : 'text-tr-text-muted'
          }`}
        >
          {tab.icon}
          <span className="text-xs">{tab.label}</span>
        </button>
      ))}
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
  const history = useHistory();
  const [healthNotes, setHealthNotes] = useState<HealthNote[]>([]);
  const [measurements, setMeasurements] = useState<BodyMetric[]>([]);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [notes, measures, records] = await Promise.all([
          getClientHealthNotes(clientId),
          getClientMeasurements(clientId, 1),
          getClientPersonalRecords(clientId),
        ]);
        setHealthNotes(notes);
        setMeasurements(measures);
        setPersonalRecords(records);
      } catch (error) {
        console.error('Failed to load body data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [clientId]);

  if (loading) {
    return <div className="animate-pulse space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-20 bg-tr-elevated rounded-xl" />)}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Health Notes */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-tr-text font-semibold">Здоровье</h3>
          <button
            onClick={() => history.push(`/coach/client/${clientId}/health-note/new`)}
            className="text-tr-accent text-sm flex items-center gap-1"
          >
            <PlusIcon className="w-4 h-4" />
            Добавить
          </button>
        </div>
        {healthNotes.length === 0 ? (
          <div className="bg-tr-elevated rounded-xl p-4 text-center text-tr-text-muted text-sm">
            Нет записей о здоровье
          </div>
        ) : (
          <div className="space-y-2">
            {healthNotes.map((note) => (
              <div
                key={note.id}
                className={`p-3 rounded-xl ${
                  note.type === 'injury'
                    ? 'bg-red-500/10 border border-red-500/20'
                    : note.type === 'limitation'
                      ? 'bg-yellow-500/10 border border-yellow-500/20'
                      : 'bg-tr-elevated'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs text-tr-text-muted">
                      {note.type === 'injury' ? '🩹 Травма' : note.type === 'limitation' ? '⚠️ Ограничение' : '📝 Заметка'}
                    </span>
                    <p className="text-tr-text font-medium mt-1">{note.title}</p>
                    <p className="text-tr-text-secondary text-sm mt-1">{note.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Measurements */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-tr-text font-semibold">Замеры</h3>
          <button
            onClick={() => history.push(`/coach/client/${clientId}/measurements`)}
            className="text-tr-accent text-sm"
          >
            История
          </button>
        </div>
        {measurements.length === 0 ? (
          <div className="bg-tr-elevated rounded-xl p-4 text-center text-tr-text-muted text-sm">
            Нет замеров
          </div>
        ) : (
          <div className="bg-tr-elevated rounded-xl p-4">
            <div className="grid grid-cols-3 gap-4">
              {measurements[0]?.weight && (
                <div className="text-center">
                  <p className="text-tr-text font-semibold">{measurements[0].weight} кг</p>
                  <p className="text-tr-text-muted text-xs">Вес</p>
                </div>
              )}
              {measurements[0]?.measurements?.chest && (
                <div className="text-center">
                  <p className="text-tr-text font-semibold">{measurements[0].measurements.chest} см</p>
                  <p className="text-tr-text-muted text-xs">Грудь</p>
                </div>
              )}
              {measurements[0]?.measurements?.waist && (
                <div className="text-center">
                  <p className="text-tr-text font-semibold">{measurements[0].measurements.waist} см</p>
                  <p className="text-tr-text-muted text-xs">Талия</p>
                </div>
              )}
              {measurements[0]?.measurements?.hips && (
                <div className="text-center">
                  <p className="text-tr-text font-semibold">{measurements[0].measurements.hips} см</p>
                  <p className="text-tr-text-muted text-xs">Бёдра</p>
                </div>
              )}
              {measurements[0]?.measurements?.biceps && (
                <div className="text-center">
                  <p className="text-tr-text font-semibold">{measurements[0].measurements.biceps} см</p>
                  <p className="text-tr-text-muted text-xs">Бицепс</p>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Personal Records */}
      <section>
        <h3 className="text-tr-text font-semibold mb-3">Личные рекорды</h3>
        {personalRecords.length === 0 ? (
          <div className="bg-tr-elevated rounded-xl p-4 text-center text-tr-text-muted text-sm">
            Нет записей PR
          </div>
        ) : (
          <div className="space-y-2">
            {personalRecords.map((pr) => (
              <div key={pr.id} className="bg-tr-elevated rounded-xl p-3 flex items-center justify-between">
                <span className="text-tr-text text-sm">{pr.exerciseName}</span>
                <span className="text-tr-accent font-semibold">{pr.weight} кг × {pr.reps}</span>
              </div>
            ))}
          </div>
        )}
      </section>
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
  const history = useHistory();
  
  return (
    <div className="space-y-6">
      {/* Today's workout */}
      <section>
        <h3 className="text-tr-text font-semibold mb-3">Сегодня</h3>
        <div className="bg-tr-elevated rounded-xl p-4">
          <p className="text-tr-text-muted text-sm text-center">
            Тренировка не назначена
          </p>
          <button
            onClick={() => history.push(`/coach/client/${clientId}/workout/assign`)}
            className="w-full mt-3 py-2 bg-tr-accent rounded-lg text-white text-sm font-medium"
          >
            Назначить тренировку
          </button>
        </div>
      </section>

      {/* Templates */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-tr-text font-semibold">Шаблоны</h3>
          <button
            onClick={() => history.push(`/coach/workout-builder?clientId=${clientId}`)}
            className="text-tr-accent text-sm flex items-center gap-1"
          >
            <PlusIcon className="w-4 h-4" />
            Создать
          </button>
        </div>
        <div className="bg-tr-elevated rounded-xl p-4 text-center text-tr-text-muted text-sm">
          Нет сохранённых шаблонов
        </div>
      </section>

      {/* History */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-tr-text font-semibold">История</h3>
          <button
            onClick={() => history.push(`/coach/client/${clientId}/workout-history`)}
            className="text-tr-accent text-sm"
          >
            Все
          </button>
        </div>
        <div className="bg-tr-elevated rounded-xl p-4 text-center text-tr-text-muted text-sm">
          Нет завершённых тренировок
        </div>
      </section>
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
  const history = useHistory();
  
  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-tr-text font-semibold">Текущий план</h3>
          <button
            onClick={() => history.push(`/coach/client/${clientId}/nutrition/edit`)}
            className="text-tr-accent text-sm flex items-center gap-1"
          >
            <PencilIcon className="w-4 h-4" />
            Редактировать
          </button>
        </div>
        <div className="bg-tr-elevated rounded-xl p-4 text-center text-tr-text-muted text-sm">
          План питания не создан
        </div>
      </section>

      {/* Macros */}
      <section>
        <h3 className="text-tr-text font-semibold mb-3">Макронутриенты</h3>
        <div className="bg-tr-elevated rounded-xl p-4">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-tr-text font-semibold">—</p>
              <p className="text-tr-text-muted text-xs">Калории</p>
            </div>
            <div>
              <p className="text-tr-text font-semibold">—</p>
              <p className="text-tr-text-muted text-xs">Белки</p>
            </div>
            <div>
              <p className="text-tr-text font-semibold">—</p>
              <p className="text-tr-text-muted text-xs">Жиры</p>
            </div>
            <div>
              <p className="text-tr-text font-semibold">—</p>
              <p className="text-tr-text-muted text-xs">Углеводы</p>
            </div>
          </div>
        </div>
      </section>

      {/* Week adherence */}
      <section>
        <h3 className="text-tr-text font-semibold mb-3">Выполнение за неделю</h3>
        <div className="flex justify-between">
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, i) => (
            <div key={day} className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 rounded-full bg-tr-elevated flex items-center justify-center text-tr-text-muted">
                —
              </div>
              <span className="text-xs text-tr-text-muted">{day}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

// ============================================================================
// Video Tab
// ============================================================================

interface VideoTabProps {
  clientId: string;
}

const VideoTab: React.FC<VideoTabProps> = ({ clientId }) => {
  const history = useHistory();
  const [videos, setVideos] = useState<ClientVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVideos = async () => {
      try {
        const data = await getClientVideos(clientId);
        setVideos(data);
      } catch (error) {
        console.error('Failed to load videos:', error);
      } finally {
        setLoading(false);
      }
    };
    loadVideos();
  }, [clientId]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="aspect-video bg-tr-elevated rounded-xl" />
        ))}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-tr-elevated flex items-center justify-center mb-4">
          <VideoCameraIcon className="w-8 h-8 text-tr-text-muted" />
        </div>
        <h3 className="text-tr-text font-semibold mb-2">Нет видео</h3>
        <p className="text-tr-text-muted text-sm">
          Клиент пока не записал ни одного видео
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {videos.map((video) => (
          <div
            key={video.id}
            onClick={() => history.push(`/coach/client/${clientId}/video/${video.id}`)}
            className="relative aspect-video bg-tr-elevated rounded-xl overflow-hidden cursor-pointer"
          >
            {video.thumbnailUrl ? (
              <img
                src={video.thumbnailUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <PlayIcon className="w-10 h-10 text-tr-text-muted" />
              </div>
            )}
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            
            {/* Info */}
            <div className="absolute bottom-2 left-2 right-2">
              <p className="text-white text-xs truncate">
                {video.exerciseName || new Date(video.uploadedAt).toLocaleDateString('ru-RU')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

const ClientProfilePage: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const history = useHistory();
  
  const [client, setClient] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('body');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadClient = async () => {
      if (!clientId) return;
      try {
        const data = await getClientById(clientId);
        setClient(data);
      } catch (error) {
        console.error('Failed to load client:', error);
      } finally {
        setLoading(false);
      }
    };
    loadClient();
  }, [clientId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-tr-base safe-area-inset-top animate-pulse">
        <div className="px-6 pt-8">
          <div className="h-6 w-6 bg-tr-elevated rounded mb-8" />
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-tr-elevated" />
            <div className="space-y-2">
              <div className="h-5 w-32 bg-tr-elevated rounded" />
              <div className="h-4 w-24 bg-tr-elevated rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-tr-base flex items-center justify-center">
        <p className="text-tr-text-muted">Клиент не найден</p>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'body':
        return <BodyTab clientId={clientId!} />;
      case 'workouts':
        return <WorkoutsTab clientId={clientId!} />;
      case 'nutrition':
        return <NutritionTab clientId={clientId!} />;
      case 'video':
        return <VideoTab clientId={clientId!} />;
    }
  };

  return (
    <div className="min-h-screen bg-tr-base safe-area-inset-top pb-24">
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <button
          onClick={() => history.goBack()}
          className="w-10 h-10 -ml-2 flex items-center justify-center mb-4"
        >
          <ArrowLeftIcon className="w-6 h-6 text-tr-text" />
        </button>

        {/* Client Info */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-tr-elevated flex items-center justify-center flex-shrink-0">
            {client.avatarUrl ? (
              <img
                src={client.avatarUrl}
                alt={client.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <UserIcon className="w-8 h-8 text-tr-text-muted" />
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-tr-text">
              {client.name || 'Без имени'}
            </h1>
            <p className="text-tr-text-muted text-sm">{client.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Tab Content */}
      <div className="px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ClientProfilePage;
