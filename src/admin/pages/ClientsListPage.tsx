/**
 * Clients List Page - View and manage coach clients
 * 
 * Features:
 * - List all assigned clients
 * - Search/filter clients
 * - Quick actions (view plan, nutrition, notes)
 * - Client status indicators
 * 
 * @module admin/pages/ClientsListPage
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  UserIcon,
  ChevronRightIcon,
  ClipboardDocumentListIcon,
  BeakerIcon,
  ChatBubbleBottomCenterTextIcon,
  PhoneIcon,
  CalendarIcon,
  ScaleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../auth/AuthContextV2';
import {
  getClients,
  subscribeToClients,
  type Client,
} from '../services/adminService';
import {
  Input,
  Button,
  Card,
  EmptyState,
  LoadingState,
} from '../components/FormComponents';

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_TENANT = 'default';

const GOAL_LABELS: Record<string, string> = {
  lose_weight: 'Похудение',
  gain_muscle: 'Набор массы',
  maintain: 'Поддержание',
  improve_health: 'Здоровье',
};

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Начинающий',
  intermediate: 'Средний',
  advanced: 'Продвинутый',
};

// ============================================================================
// Client Card Component
// ============================================================================

interface ClientCardProps {
  client: Client;
}

const ClientCard: React.FC<ClientCardProps> = ({ client }) => {
  const history = useHistory();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="cursor-pointer"
      onClick={() => history.push(`/admin/clients/${client.id}/plan`)}
    >
      <Card className="hover:border-tr-accent transition-colors">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          {client.avatarUrl ? (
            <img
              src={client.avatarUrl}
              alt={client.name}
              className="w-14 h-14 rounded-full object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-tr-accent flex items-center justify-center text-white text-lg font-semibold">
              {getInitials(client.name)}
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white truncate">{client.name}</h3>
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                client.isActive 
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-tr-elevated text-tr-text-muted'
              }`}>
                {client.isActive ? 'Активен' : 'Неактивен'}
              </span>
            </div>
            
            <div className="flex items-center gap-2 mt-1 text-sm text-tr-text-muted">
              <PhoneIcon className="w-4 h-4" />
              <span>{client.phone}</span>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {client.goal && (
                <span className="px-2 py-0.5 bg-tr-elevated text-tr-text-muted text-xs rounded-full">
                  {GOAL_LABELS[client.goal] || client.goal}
                </span>
              )}
              {client.level && (
                <span className="px-2 py-0.5 bg-tr-elevated text-tr-text-muted text-xs rounded-full">
                  {LEVEL_LABELS[client.level] || client.level}
                </span>
              )}
              {client.weight && (
                <span className="px-2 py-0.5 bg-tr-elevated text-tr-text-muted text-xs rounded-full flex items-center gap-1">
                  <ScaleIcon className="w-3 h-3" />
                  {client.weight} кг
                </span>
              )}
            </div>
          </div>

          <ChevronRightIcon className="w-5 h-5 text-tr-text-muted" />
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 mt-4 pt-3 border-t border-tr-border">
          <Link
            to={`/admin/clients/${client.id}/plan`}
            onClick={e => e.stopPropagation()}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-tr-elevated hover:bg-tr-hover rounded-tr-sm text-sm text-tr-text-muted hover:text-white transition-colors"
          >
            <ClipboardDocumentListIcon className="w-4 h-4" />
            Тренировки
          </Link>
          <Link
            to={`/admin/clients/${client.id}/nutrition`}
            onClick={e => e.stopPropagation()}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-tr-elevated hover:bg-tr-hover rounded-tr-sm text-sm text-tr-text-muted hover:text-white transition-colors"
          >
            <BeakerIcon className="w-4 h-4" />
            Питание
          </Link>
          <Link
            to={`/admin/clients/${client.id}/notes`}
            onClick={e => e.stopPropagation()}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-tr-elevated hover:bg-tr-hover rounded-tr-sm text-sm text-tr-text-muted hover:text-white transition-colors"
          >
            <ChatBubbleBottomCenterTextIcon className="w-4 h-4" />
          </Link>
        </div>
      </Card>
    </motion.div>
  );
};

// ============================================================================
// Main Page Component
// ============================================================================

export const ClientsListPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    // Subscribe to real-time updates
    const trainerId = isAdmin ? undefined : user?.id;
    const unsubscribe = subscribeToClients(
      (data) => {
        setClients(data);
        setLoading(false);
      },
      DEFAULT_TENANT,
      trainerId
    );

    return () => unsubscribe();
  }, [user?.id, isAdmin]);

  // Filter clients
  const filtered = clients.filter(client => {
    const matchesSearch = !search || 
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      client.phone.includes(search);
    
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'active' && client.isActive) ||
      (filter === 'inactive' && !client.isActive);

    return matchesSearch && matchesFilter;
  });

  // Stats
  const activeCount = clients.filter(c => c.isActive).length;
  const inactiveCount = clients.filter(c => !c.isActive).length;

  if (loading) {
    return <LoadingState message="Загрузка клиентов..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Мои клиенты</h1>
          <p className="text-tr-text-muted">
            {clients.length} клиентов • {activeCount} активных
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card
          className={`cursor-pointer ${filter === 'all' ? 'border-tr-accent' : ''}`}
          onClick={() => setFilter('all')}
        >
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{clients.length}</p>
            <p className="text-sm text-tr-text-muted">Всего</p>
          </div>
        </Card>
        <Card
          className={`cursor-pointer ${filter === 'active' ? 'border-tr-accent' : ''}`}
          onClick={() => setFilter('active')}
        >
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">{activeCount}</p>
            <p className="text-sm text-tr-text-muted">Активных</p>
          </div>
        </Card>
        <Card
          className={`cursor-pointer ${filter === 'inactive' ? 'border-tr-accent' : ''}`}
          onClick={() => setFilter('inactive')}
        >
          <div className="text-center">
            <p className="text-2xl font-bold text-tr-text-disabled">{inactiveCount}</p>
            <p className="text-sm text-tr-text-muted">Неактивных</p>
          </div>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tr-text-muted" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Поиск по имени или телефону..."
          className="w-full bg-tr-card border border-tr-border rounded-tr-md pl-10 pr-4 py-3 text-white placeholder-tr-text-disabled"
        />
      </div>

      {/* Client List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<UserIcon className="w-8 h-8 text-tr-text-muted" />}
          title="Клиенты не найдены"
          description={
            search 
              ? 'Попробуйте изменить поисковый запрос'
              : 'У вас пока нет назначенных клиентов'
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(client => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientsListPage;
