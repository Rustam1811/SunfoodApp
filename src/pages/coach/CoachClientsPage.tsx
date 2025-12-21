/**
 * Coach Clients Page - Trainer OS (Coach)
 * 
 * Card-based list of all clients with:
 * - Name
 * - Activity status (🟢🟡🔴)
 * - Last login / Last workout
 * - Button: Open
 * 
 * @module pages/coach/CoachClientsPage
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useHistory } from 'react-router-dom';
import { 
  MagnifyingGlassIcon,
  PlusIcon,
  UserIcon,
  ChevronRightIcon,
  BellAlertIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../auth/AuthContextV2';
import { getCoachClients, type Client } from '../../services/clientService';
import { getClientSignals } from '../../services/signalsService';

// ============================================================================
// Types
// ============================================================================

type ActivityStatus = 'active' | 'moderate' | 'inactive';

interface EnrichedClient extends Client {
  activityStatus: ActivityStatus;
  lastActivityText: string;
  hasActiveSignals: boolean;
}

// ============================================================================
// Activity Status Helpers
// ============================================================================

const getActivityStatus = (lastWorkout?: Date | string): ActivityStatus => {
  if (!lastWorkout) return 'inactive';
  
  const lastDate = typeof lastWorkout === 'string' ? new Date(lastWorkout) : lastWorkout;
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 3) return 'active';
  if (diffDays <= 7) return 'moderate';
  return 'inactive';
};

const getStatusConfig = (status: ActivityStatus) => {
  switch (status) {
    case 'active':
      return { color: 'bg-green-500', label: 'Активен' };
    case 'moderate':
      return { color: 'bg-yellow-500', label: 'Средняя активность' };
    case 'inactive':
      return { color: 'bg-red-500', label: 'Неактивен' };
  }
};

const formatLastActivity = (lastWorkout?: Date | string): string => {
  if (!lastWorkout) return 'Нет тренировок';
  
  const lastDate = typeof lastWorkout === 'string' ? new Date(lastWorkout) : lastWorkout;
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Сегодня';
  if (diffDays === 1) return 'Вчера';
  if (diffDays < 7) return `${diffDays} дн. назад`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} нед. назад`;
  return `${Math.floor(diffDays / 30)} мес. назад`;
};

// ============================================================================
// Client Card
// ============================================================================

interface ClientCardProps {
  client: EnrichedClient;
  onClick: () => void;
}

const ClientCard: React.FC<ClientCardProps> = ({ client, onClick }) => {
  const status = getStatusConfig(client.activityStatus);
  
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-tr-elevated rounded-2xl p-4 cursor-pointer relative overflow-hidden"
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-tr-base flex items-center justify-center flex-shrink-0">
          {client.avatarUrl ? (
            <img
              src={client.avatarUrl}
              alt={client.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <UserIcon className="w-6 h-6 text-tr-text-muted" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-tr-text truncate">
              {client.name || client.email || 'Без имени'}
            </h3>
            {client.hasActiveSignals && (
              <BellAlertIcon className="w-4 h-4 text-tr-accent flex-shrink-0" />
            )}
          </div>
          
          <div className="flex items-center gap-2 mt-1">
            <div className={`w-2 h-2 rounded-full ${status.color}`} />
            <span className="text-tr-text-muted text-xs">
              {client.lastActivityText}
            </span>
          </div>
        </div>

        {/* Arrow */}
        <ChevronRightIcon className="w-5 h-5 text-tr-text-muted flex-shrink-0" />
      </div>
    </motion.div>
  );
};

// ============================================================================
// Search Bar
// ============================================================================

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => (
  <div className="relative">
    <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-tr-text-muted" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Поиск клиентов..."
      className="w-full bg-tr-elevated rounded-xl py-3 pl-12 pr-4 text-tr-text placeholder:text-tr-text-muted outline-none focus:ring-2 focus:ring-tr-accent"
    />
  </div>
);

// ============================================================================
// Status Filter
// ============================================================================

interface StatusFilterProps {
  selected: ActivityStatus | 'all';
  onChange: (status: ActivityStatus | 'all') => void;
  counts: { all: number; active: number; moderate: number; inactive: number };
}

const StatusFilter: React.FC<StatusFilterProps> = ({ selected, onChange, counts }) => {
  const filters: Array<{ key: ActivityStatus | 'all'; label: string; color?: string }> = [
    { key: 'all', label: `Все (${counts.all})` },
    { key: 'active', label: `${counts.active}`, color: 'bg-green-500' },
    { key: 'moderate', label: `${counts.moderate}`, color: 'bg-yellow-500' },
    { key: 'inactive', label: `${counts.inactive}`, color: 'bg-red-500' },
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
          {f.color && <div className={`w-2 h-2 rounded-full ${f.color}`} />}
          <span>{f.label}</span>
        </button>
      ))}
    </div>
  );
};

// ============================================================================
// Empty State
// ============================================================================

const EmptyState: React.FC<{ hasFilters: boolean; onAddClient: () => void }> = ({
  hasFilters,
  onAddClient,
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
    <div className="w-16 h-16 rounded-full bg-tr-elevated flex items-center justify-center mb-4">
      <UserIcon className="w-8 h-8 text-tr-text-muted" />
    </div>
    <h2 className="text-lg font-semibold text-tr-text mb-2">
      {hasFilters ? 'Клиенты не найдены' : 'Нет клиентов'}
    </h2>
    <p className="text-tr-text-muted text-sm mb-6">
      {hasFilters
        ? 'Попробуйте изменить параметры поиска'
        : 'Добавьте первого клиента для начала работы'}
    </p>
    {!hasFilters && (
      <button
        onClick={onAddClient}
        className="flex items-center gap-2 px-6 py-3 bg-tr-accent rounded-xl text-white font-medium"
      >
        <PlusIcon className="w-5 h-5" />
        Добавить клиента
      </button>
    )}
  </div>
);

// ============================================================================
// Loading
// ============================================================================

const LoadingSkeleton: React.FC = () => (
  <div className="px-6 pt-8 animate-pulse">
    <div className="h-8 w-40 bg-tr-elevated rounded mb-6" />
    <div className="h-12 bg-tr-elevated rounded-xl mb-4" />
    <div className="flex gap-2 mb-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-10 w-20 bg-tr-elevated rounded-full" />
      ))}
    </div>
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-20 bg-tr-elevated rounded-2xl" />
      ))}
    </div>
  </div>
);

// ============================================================================
// Main Component
// ============================================================================

const CoachClientsPage: React.FC = () => {
  const history = useHistory();
  const { user } = useAuth();
  
  const [clients, setClients] = useState<EnrichedClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ActivityStatus | 'all'>('all');

  // Load clients
  useEffect(() => {
    const loadClients = async () => {
      if (!user?.id) return;
      
      try {
        const data = await getCoachClients(user.id);
        
        // Enrich clients with activity info and signals
        const enriched: EnrichedClient[] = await Promise.all(
          data.map(async (client) => {
            // Load active signals for this client
            const signals = await getClientSignals(client.id, 5);
            const hasActiveSignals = signals.some(s => !s.acknowledged);
            
            return {
              ...client,
              activityStatus: getActivityStatus(client.lastWorkout),
              lastActivityText: formatLastActivity(client.lastWorkout),
              hasActiveSignals,
            };
          })
        );
        
        setClients(enriched);
      } catch (error) {
        // Fallback to loading without signals
        const data = await getCoachClients(user.id);
        const enriched: EnrichedClient[] = data.map((client) => ({
          ...client,
          activityStatus: getActivityStatus(client.lastWorkout),
          lastActivityText: formatLastActivity(client.lastWorkout),
          hasActiveSignals: false,
        }));
        setClients(enriched);
      } finally {
        setLoading(false);
      }
    };

    loadClients();
  }, [user?.id]);

  // Filter clients
  const filteredClients = clients.filter((client) => {
    // Search filter
    const searchMatch =
      !searchQuery ||
      (client.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    
    // Status filter
    const statusMatch =
      statusFilter === 'all' || client.activityStatus === statusFilter;
    
    return searchMatch && statusMatch;
  });

  // Calculate counts
  const counts = {
    all: clients.length,
    active: clients.filter((c) => c.activityStatus === 'active').length,
    moderate: clients.filter((c) => c.activityStatus === 'moderate').length,
    inactive: clients.filter((c) => c.activityStatus === 'inactive').length,
  };

  // Handlers
  const handleClientClick = (clientId: string) => {
    history.push(`/coach/client/${clientId}`);
  };

  const handleAddClient = () => {
    history.push('/coach/add-client');
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
          <h1 className="text-2xl font-bold text-tr-text">Клиенты</h1>
          <button
            onClick={handleAddClient}
            className="w-10 h-10 bg-tr-accent rounded-xl flex items-center justify-center"
          >
            <PlusIcon className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Search */}
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>

      {/* Filters */}
      <div className="px-6 mb-4">
        <StatusFilter
          selected={statusFilter}
          onChange={setStatusFilter}
          counts={counts}
        />
      </div>

      {/* Client List */}
      <div className="px-6">
        {filteredClients.length === 0 ? (
          <EmptyState
            hasFilters={!!searchQuery || statusFilter !== 'all'}
            onAddClient={handleAddClient}
          />
        ) : (
          <div className="space-y-3">
            {filteredClients.map((client, index) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ClientCard
                  client={client}
                  onClick={() => handleClientClick(client.id)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoachClientsPage;
