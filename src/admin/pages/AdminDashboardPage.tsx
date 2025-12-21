/**
 * Admin Dashboard Page - Coach/Admin home page
 * 
 * Features:
 * - Quick stats
 * - Recent activity
 * - Quick links
 * 
 * @module admin/pages/AdminDashboard
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UserGroupIcon,
  ClipboardDocumentListIcon,
  CubeIcon,
  CalendarIcon,
  ChartBarIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../auth/AuthContextV2';
import { getClients, getExercises, type Client } from '../services/adminService';
import { Card, LoadingState } from '../components/FormComponents';

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_TENANT = 'default';

// ============================================================================
// Stats Card
// ============================================================================

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  link?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color, link }) => {
  const content = (
    <Card className={`hover:border-${color} transition-colors cursor-pointer`}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-tr-lg bg-${color}/20 flex items-center justify-center`}>
          <div className={`text-${color}`}>{icon}</div>
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-sm text-tr-text-muted">{title}</p>
        </div>
      </div>
    </Card>
  );

  if (link) {
    return <Link to={link}>{content}</Link>;
  }
  return content;
};

// ============================================================================
// Quick Action Card
// ============================================================================

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
}

const QuickAction: React.FC<QuickActionProps> = ({ title, description, icon, link }) => (
  <Link to={link}>
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="flex items-center gap-4 p-4 bg-tr-card border border-tr-border rounded-tr-xl hover:border-tr-accent transition-colors"
    >
      <div className="w-10 h-10 rounded-tr-md bg-tr-elevated flex items-center justify-center text-tr-text-muted">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="font-medium text-white">{title}</h3>
        <p className="text-sm text-tr-text-muted">{description}</p>
      </div>
      <ArrowRightIcon className="w-5 h-5 text-tr-text-muted" />
    </motion.div>
  </Link>
);

// ============================================================================
// Client Preview
// ============================================================================

interface ClientPreviewProps {
  client: Client;
}

const ClientPreview: React.FC<ClientPreviewProps> = ({ client }) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Link
      to={`/admin/clients/${client.id}/plan`}
      className="flex items-center gap-3 p-3 rounded-tr-md hover:bg-tr-hover transition-colors"
    >
      {client.avatarUrl ? (
        <img src={client.avatarUrl} alt={client.name} className="w-10 h-10 rounded-full object-cover" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-tr-accent flex items-center justify-center text-white text-sm font-semibold">
          {getInitials(client.name)}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white truncate">{client.name}</p>
        <p className="text-xs text-tr-text-muted">{client.phone}</p>
      </div>
      <span className={`w-2 h-2 rounded-full ${client.isActive ? 'bg-green-400' : 'bg-tr-text-disabled'}`} />
    </Link>
  );
};

// ============================================================================
// Main Dashboard Component
// ============================================================================

export const AdminDashboardPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [exerciseCount, setExerciseCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const trainerId = isAdmin ? undefined : user?.id;
        const [clientsData, exercisesData] = await Promise.all([
          getClients(DEFAULT_TENANT, trainerId),
          getExercises(DEFAULT_TENANT, user?.id),
        ]);
        setClients(clientsData);
        setExerciseCount(exercisesData.length);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id, isAdmin]);

  if (loading) {
    return <LoadingState message="Загрузка..." />;
  }

  const activeClients = clients.filter(c => c.isActive);
  const today = new Date().toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Привет, {user?.name?.split(' ')[0] || 'Тренер'}! 👋
        </h1>
        <p className="text-tr-text-muted capitalize">{today}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Клиентов"
          value={clients.length}
          icon={<UserGroupIcon className="w-6 h-6" />}
          color="tr-accent"
          link="/admin/clients"
        />
        <StatsCard
          title="Активных"
          value={activeClients.length}
          icon={<ChartBarIcon className="w-6 h-6" />}
          color="green-400"
          link="/admin/clients"
        />
        <StatsCard
          title="Упражнений"
          value={exerciseCount}
          icon={<CubeIcon className="w-6 h-6" />}
          color="blue-400"
          link="/admin/library/exercises"
        />
        <StatsCard
          title="Роль"
          value={isAdmin ? 'Админ' : 'Тренер'}
          icon={<ClipboardDocumentListIcon className="w-6 h-6" />}
          color="purple-400"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Быстрые действия</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuickAction
            title="Управление клиентами"
            description="Просмотр и редактирование профилей"
            icon={<UserGroupIcon className="w-5 h-5" />}
            link="/admin/clients"
          />
          <QuickAction
            title="Библиотека упражнений"
            description="Добавить или изменить упражнения"
            icon={<CubeIcon className="w-5 h-5" />}
            link="/admin/library/exercises"
          />
        </div>
      </div>

      {/* Recent Clients */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Недавние клиенты</h2>
          <Link to="/admin/clients" className="text-sm text-tr-accent hover:underline">
            Все клиенты →
          </Link>
        </div>
        <Card padding="sm">
          {clients.length === 0 ? (
            <p className="text-center text-tr-text-muted py-8">
              У вас пока нет клиентов
            </p>
          ) : (
            <div className="divide-y divide-tr-border">
              {clients.slice(0, 5).map(client => (
                <ClientPreview key={client.id} client={client} />
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
