/**
 * Body Page - Trainer OS (Client)
 * 
 * Shows:
 * - Personal records
 * - Measurement history (if exists)
 * - Health notes (read-only)
 * 
 * No "hospital-like" charts. Simple, clean data.
 * 
 * @module pages/BodyPage
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrophyIcon, ScaleIcon, HeartIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../auth/AuthContextV2';
import {
  getBodySummary,
  getLatestRecords,
  formatWeight,
  formatWeightChange,
  getWeightChangeColor,
  type BodySummary,
  type PersonalRecord,
} from '../services/bodyService';
import {
  getActiveHealthNotes,
  getNoteTypeIcon,
  type HealthNote,
} from '../services/healthNotesService';

// ============================================================================
// Personal Record Card
// ============================================================================

interface RecordCardProps {
  record: PersonalRecord;
}

const RecordCard: React.FC<RecordCardProps> = ({ record }) => (
  <div className="bg-tr-elevated rounded-xl p-4">
    <div className="flex items-start justify-between mb-2">
      <p className="text-tr-text font-medium">{record.exerciseName}</p>
      <TrophyIcon className="w-5 h-5 text-yellow-500" />
    </div>
    <p className="text-2xl font-bold text-tr-text">
      {record.weight} <span className="text-base font-normal text-tr-text-muted">кг</span>
    </p>
    <p className="text-tr-text-muted text-sm">
      {record.reps} повторений
    </p>
    {record.previousRecord && (
      <p className="text-tr-success text-xs mt-2">
        +{(record.weight - record.previousRecord.weight).toFixed(1)} кг от предыдущего
      </p>
    )}
  </div>
);

// ============================================================================
// Health Note Card
// ============================================================================

interface HealthNoteCardProps {
  note: HealthNote;
}

const HealthNoteCard: React.FC<HealthNoteCardProps> = ({ note }) => (
  <div className="flex items-start gap-3 p-4 bg-tr-elevated rounded-xl">
    <span className="text-xl">{getNoteTypeIcon(note.type)}</span>
    <div className="flex-1 min-w-0">
      <p className="text-tr-text font-medium">{note.title}</p>
      <p className="text-tr-text-muted text-sm mt-1 line-clamp-2">
        {note.content}
      </p>
    </div>
  </div>
);

// ============================================================================
// Stats Card
// ============================================================================

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
  subValueClass?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  icon,
  label,
  value,
  subValue,
  subValueClass = 'text-tr-text-muted',
}) => (
  <div className="bg-tr-elevated rounded-xl p-4 flex items-center gap-4">
    <div className="w-12 h-12 rounded-full bg-tr-accent/10 flex items-center justify-center flex-shrink-0">
      {icon}
    </div>
    <div>
      <p className="text-tr-text-muted text-xs uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-xl font-bold text-tr-text">{value}</p>
      {subValue && (
        <p className={`text-sm ${subValueClass}`}>{subValue}</p>
      )}
    </div>
  </div>
);

// ============================================================================
// Loading Skeleton
// ============================================================================

const LoadingSkeleton: React.FC = () => (
  <div className="px-6 pt-8 animate-pulse">
    <div className="h-6 w-24 bg-tr-elevated rounded mb-8" />
    <div className="grid grid-cols-2 gap-4 mb-8">
      <div className="h-24 bg-tr-elevated rounded-xl" />
      <div className="h-24 bg-tr-elevated rounded-xl" />
    </div>
    <div className="h-5 w-32 bg-tr-elevated rounded mb-4" />
    <div className="space-y-3">
      {[1, 2].map((i) => (
        <div key={i} className="h-24 bg-tr-elevated rounded-xl" />
      ))}
    </div>
  </div>
);

// ============================================================================
// Empty State
// ============================================================================

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="text-center py-8">
    <p className="text-tr-text-muted text-sm">{message}</p>
  </div>
);

// ============================================================================
// Main Component
// ============================================================================

const BodyPage: React.FC = () => {
  const { user } = useAuth();
  
  const [summary, setSummary] = useState<BodySummary | null>(null);
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [healthNotes, setHealthNotes] = useState<HealthNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const loadData = async () => {
      try {
        const [bodySummary, personalRecords, notes] = await Promise.all([
          getBodySummary(user.id),
          getLatestRecords(user.id),
          getActiveHealthNotes(user.id),
        ]);
        
        setSummary(bodySummary);
        setRecords(personalRecords);
        setHealthNotes(notes);
      } catch (error) {
        console.error('Failed to load body data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-tr-base safe-area-inset-top">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tr-base safe-area-inset-top pb-24">
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <h1 className="text-2xl font-bold text-tr-text">Тело</h1>
      </div>

      {/* Stats */}
      <div className="px-6 mb-8">
        <div className="grid grid-cols-2 gap-4">
          <StatsCard
            icon={<ScaleIcon className="w-6 h-6 text-tr-accent" />}
            label="Вес"
            value={formatWeight(summary?.currentWeight)}
            subValue={formatWeightChange(summary?.weightChange)}
            subValueClass={getWeightChangeColor(summary?.weightChange)}
          />
          <StatsCard
            icon={<TrophyIcon className="w-6 h-6 text-yellow-500" />}
            label="Рекорды"
            value={String(summary?.personalRecordsCount || 0)}
          />
        </div>
      </div>

      {/* Personal Records */}
      <div className="px-6 mb-8">
        <h2 className="text-lg font-semibold text-tr-text mb-4">
          Личные рекорды
        </h2>
        
        {records.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 gap-3"
          >
            {records.slice(0, 4).map((record) => (
              <RecordCard key={record.id} record={record} />
            ))}
          </motion.div>
        ) : (
          <EmptyState message="Пока нет личных рекордов" />
        )}
      </div>

      {/* Health Notes */}
      {healthNotes.length > 0 && (
        <div className="px-6">
          <h2 className="text-lg font-semibold text-tr-text mb-4 flex items-center gap-2">
            <HeartIcon className="w-5 h-5 text-red-400" />
            Заметки о здоровье
          </h2>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {healthNotes.map((note) => (
              <HealthNoteCard key={note.id} note={note} />
            ))}
          </motion.div>
        </div>
      )}

      {/* Measurements summary */}
      {summary?.latestMeasurements && (
        <div className="px-6 mt-8">
          <h2 className="text-lg font-semibold text-tr-text mb-4">
            Замеры
          </h2>
          
          <div className="bg-tr-elevated rounded-xl p-4">
            <p className="text-tr-text-muted text-xs mb-3">
              Последние замеры: {summary.measurementsDate}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {summary.latestMeasurements.chest && (
                <div>
                  <p className="text-tr-text-muted text-xs">Грудь</p>
                  <p className="text-tr-text font-medium">{summary.latestMeasurements.chest} см</p>
                </div>
              )}
              {summary.latestMeasurements.waist && (
                <div>
                  <p className="text-tr-text-muted text-xs">Талия</p>
                  <p className="text-tr-text font-medium">{summary.latestMeasurements.waist} см</p>
                </div>
              )}
              {summary.latestMeasurements.hips && (
                <div>
                  <p className="text-tr-text-muted text-xs">Бёдра</p>
                  <p className="text-tr-text font-medium">{summary.latestMeasurements.hips} см</p>
                </div>
              )}
              {summary.latestMeasurements.biceps && (
                <div>
                  <p className="text-tr-text-muted text-xs">Бицепс</p>
                  <p className="text-tr-text font-medium">{summary.latestMeasurements.biceps} см</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BodyPage;
