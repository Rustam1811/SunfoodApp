/**
 * Signals Page - Trainer OS (Coach)
 * 
 * Shows all client alerts and signals:
 * - Skipped workouts (2+ days)
 * - High HR anomalies
 * - Weekly summaries needing attention
 * - Client inactivity
 * 
 * @module pages/coach/SignalsPage
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHistory } from 'react-router-dom';
import {
  BellAlertIcon,
  ExclamationTriangleIcon,
  HeartIcon,
  CalendarIcon,
  ChartBarIcon,
  CheckIcon,
  ChevronRightIcon,
  UserIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../auth/AuthContextV2';
import {
  getCoachSignals,
  dismissSignal,
  type Signal,
  type SignalType,
} from '../../services/signalsService';

// ============================================================================
// Signal Card
// ============================================================================

interface SignalCardProps {
  signal: Signal;
  onDismiss: () => void;
  onClick: () => void;
}

const getSignalConfig = (type: SignalType) => {
  switch (type) {
    case 'skip_workout':
      return {
        icon: <CalendarIcon className="w-5 h-5" />,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/20',
        label: 'Пропуск тренировки',
      };
    case 'high_heart_rate':
      return {
        icon: <HeartIcon className="w-5 h-5" />,
        color: 'text-red-500',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/20',
        label: 'Аномалия пульса',
      };
    case 'low_adherence':
      return {
        icon: <ChartBarIcon className="w-5 h-5" />,
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/20',
        label: 'Низкая активность',
      };
    case 'no_login':
      return {
        icon: <ClockIcon className="w-5 h-5" />,
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/20',
        label: 'Неактивность',
      };
    default:
      return {
        icon: <BellAlertIcon className="w-5 h-5" />,
        color: 'text-tr-text-muted',
        bgColor: 'bg-tr-elevated',
        borderColor: 'border-tr-elevated',
        label: 'Уведомление',
      };
  }
};

const SignalCard: React.FC<SignalCardProps> = ({ signal, onDismiss, onClick }) => {
  const config = getSignalConfig(signal.type);
  
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    if (diffDays < 7) return `${diffDays} дн назад`;
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={`relative overflow-hidden rounded-2xl border ${config.borderColor} ${config.bgColor}`}
    >
      <div
        onClick={onClick}
        className="p-4 cursor-pointer"
      >
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-xl ${config.bgColor} ${config.color}`}>
            {config.icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-medium ${config.color}`}>
                {config.label}
              </span>
              <span className="text-tr-text-muted text-xs">
                {formatTime(signal.createdAt)}
              </span>
            </div>
            
            <p className="text-tr-text font-medium">{signal.clientName}</p>
            <p className="text-tr-text-secondary text-sm mt-1">
              {signal.message}
            </p>
          </div>

          <ChevronRightIcon className="w-5 h-5 text-tr-text-muted flex-shrink-0" />
        </div>

        {/* Priority indicator for alerts */}
        {signal.severity === 'alert' && (
          <div className="absolute top-0 right-0 w-0 h-0 border-t-[24px] border-t-red-500 border-l-[24px] border-l-transparent" />
        )}
      </div>

      {/* Dismiss button */}
      <div className="border-t border-white/5 px-4 py-2 flex justify-end">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="flex items-center gap-1 text-tr-text-muted text-sm hover:text-tr-text"
        >
          <CheckIcon className="w-4 h-4" />
          Прочитано
        </button>
      </div>
    </motion.div>
  );
};

// ============================================================================
// Filter Tabs
// ============================================================================

interface FilterTabsProps {
  selected: SignalType | 'all';
  onChange: (filter: SignalType | 'all') => void;
  counts: Record<string, number>;
}

const FilterTabs: React.FC<FilterTabsProps> = ({ selected, onChange, counts }) => {
  const filters: Array<{ key: SignalType | 'all'; label: string; icon: React.ReactNode }> = [
    { key: 'all', label: `Все (${counts.all || 0})`, icon: <BellAlertIcon className="w-4 h-4" /> },
    { key: 'skip_workout', label: `${counts.skip_workout || 0}`, icon: <CalendarIcon className="w-4 h-4" /> },
    { key: 'high_heart_rate', label: `${counts.high_heart_rate || 0}`, icon: <HeartIcon className="w-4 h-4" /> },
    { key: 'no_login', label: `${counts.no_login || 0}`, icon: <ChartBarIcon className="w-4 h-4" /> },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6">
      {filters.map((f) => (
        <button
          key={f.key}
          onClick={() => onChange(f.key)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
            selected === f.key
              ? 'bg-tr-accent text-white'
              : 'bg-tr-elevated text-tr-text-secondary'
          }`}
        >
          {f.icon}
          <span>{f.label}</span>
        </button>
      ))}
    </div>
  );
};

// ============================================================================
// Empty State
// ============================================================================

const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
    <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
      <CheckIcon className="w-8 h-8 text-green-500" />
    </div>
    <h2 className="text-lg font-semibold text-tr-text mb-2">
      Всё под контролем!
    </h2>
    <p className="text-tr-text-muted text-sm">
      Нет активных сигналов, требующих внимания
    </p>
  </div>
);

// ============================================================================
// Loading
// ============================================================================

const LoadingSkeleton: React.FC = () => (
  <div className="px-6 pt-8 animate-pulse">
    <div className="h-8 w-32 bg-tr-elevated rounded mb-6" />
    <div className="flex gap-2 mb-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-10 w-20 bg-tr-elevated rounded-full" />
      ))}
    </div>
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-32 bg-tr-elevated rounded-2xl" />
      ))}
    </div>
  </div>
);

// ============================================================================
// Main Component
// ============================================================================

const SignalsPage: React.FC = () => {
  const history = useHistory();
  const { user } = useAuth();
  
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<SignalType | 'all'>('all');

  // Load signals
  useEffect(() => {
    const loadSignals = async () => {
      if (!user?.id) return;
      
      try {
        const data = await getCoachSignals(user.id);
        setSignals(data);
      } catch (error) {
        console.error('Failed to load signals:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSignals();
  }, [user?.id]);

  // Dismiss signal
  const handleDismiss = async (signalId: string) => {
    try {
      await dismissSignal(signalId);
      setSignals((prev) => prev.filter((s) => s.id !== signalId));
    } catch (error) {
      console.error('Failed to dismiss signal:', error);
    }
  };

  // Navigate to client
  const handleSignalClick = (signal: Signal) => {
    history.push(`/coach/client/${signal.clientId}`);
  };

  // Filter signals
  const filteredSignals = signals.filter(
    (s) => filter === 'all' || s.type === filter
  );

  // Calculate counts
  const counts = {
    all: signals.length,
    skip_workout: signals.filter((s) => s.type === 'skip_workout').length,
    high_heart_rate: signals.filter((s) => s.type === 'high_heart_rate').length,
    no_login: signals.filter((s) => s.type === 'no_login').length,
  };

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
      <div className="px-6 pt-8 pb-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-tr-text">Сигналы</h1>
          {signals.length > 0 && (
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-tr-accent/20">
              <BellAlertIcon className="w-4 h-4 text-tr-accent" />
              <span className="text-tr-accent text-sm font-medium">{signals.length}</span>
            </div>
          )}
        </div>

        {/* Filters */}
        {signals.length > 0 && (
          <FilterTabs
            selected={filter}
            onChange={setFilter}
            counts={counts}
          />
        )}
      </div>

      {/* Signals List */}
      <div className="px-6">
        {filteredSignals.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredSignals.map((signal) => (
                <SignalCard
                  key={signal.id}
                  signal={signal}
                  onDismiss={() => handleDismiss(signal.id)}
                  onClick={() => handleSignalClick(signal)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignalsPage;
