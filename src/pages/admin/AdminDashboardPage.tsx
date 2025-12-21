/**
 * Admin Dashboard - Trainer OS (Platform Admin)
 * 
 * Platform admin overview:
 * - Total users statistics
 * - Active coaches
 * - Support queue (future)
 * 
 * @module pages/admin/AdminDashboardPage
 */

import React from 'react';
import {
  UsersIcon,
  UserGroupIcon,
  ChartBarIcon,
  BellIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

// ============================================================================
// Stat Card
// ============================================================================

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend }) => (
  <div className="bg-tr-elevated rounded-2xl p-4">
    <div className="flex items-start justify-between mb-3">
      <div className="p-2 rounded-xl bg-tr-accent/10">
        {icon}
      </div>
      {trend && (
        <span
          className={`text-xs font-medium ${
            trend.isPositive ? 'text-green-500' : 'text-red-500'
          }`}
        >
          {trend.isPositive ? '+' : ''}{trend.value}%
        </span>
      )}
    </div>
    <p className="text-2xl font-bold text-tr-text">{value}</p>
    <p className="text-tr-text-muted text-sm">{title}</p>
  </div>
);

// ============================================================================
// Quick Action
// ============================================================================

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

const QuickAction: React.FC<QuickActionProps> = ({
  title,
  description,
  icon,
  onClick,
  disabled,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="w-full bg-tr-elevated rounded-2xl p-4 text-left transition-all hover:bg-tr-elevated/80 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-xl bg-tr-base">
        {icon}
      </div>
      <div>
        <p className="text-tr-text font-medium">{title}</p>
        <p className="text-tr-text-muted text-sm">{description}</p>
      </div>
    </div>
  </button>
);

// ============================================================================
// Main Component
// ============================================================================

const AdminDashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-tr-base safe-area-inset-top pb-24">
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <h1 className="text-2xl font-bold text-tr-text mb-1">Админ-панель</h1>
        <p className="text-tr-text-muted text-sm">Управление платформой</p>
      </div>

      {/* Stats Grid */}
      <div className="px-6 grid grid-cols-2 gap-4 mb-8">
        <StatCard
          title="Всего пользователей"
          value="—"
          icon={<UsersIcon className="w-5 h-5 text-tr-accent" />}
        />
        <StatCard
          title="Активных тренеров"
          value="—"
          icon={<UserGroupIcon className="w-5 h-5 text-tr-accent" />}
        />
        <StatCard
          title="Тренировок сегодня"
          value="—"
          icon={<ChartBarIcon className="w-5 h-5 text-tr-accent" />}
        />
        <StatCard
          title="Новых сигналов"
          value="—"
          icon={<BellIcon className="w-5 h-5 text-tr-accent" />}
        />
      </div>

      {/* Quick Actions */}
      <div className="px-6">
        <h2 className="text-tr-text font-semibold mb-4">Быстрые действия</h2>
        <div className="space-y-3">
          <QuickAction
            title="Управление пользователями"
            description="Просмотр и редактирование пользователей"
            icon={<UsersIcon className="w-5 h-5 text-tr-text-muted" />}
            onClick={() => {}}
            disabled
          />
          <QuickAction
            title="Управление тренерами"
            description="Одобрение и блокировка тренеров"
            icon={<UserGroupIcon className="w-5 h-5 text-tr-text-muted" />}
            onClick={() => {}}
            disabled
          />
          <QuickAction
            title="Аналитика"
            description="Статистика использования платформы"
            icon={<ChartBarIcon className="w-5 h-5 text-tr-text-muted" />}
            onClick={() => {}}
            disabled
          />
          <QuickAction
            title="Настройки"
            description="Конфигурация платформы"
            icon={<Cog6ToothIcon className="w-5 h-5 text-tr-text-muted" />}
            onClick={() => {}}
            disabled
          />
        </div>
      </div>

      {/* Coming Soon Notice */}
      <div className="px-6 mt-8">
        <div className="bg-tr-elevated/50 border border-dashed border-tr-text-muted/30 rounded-2xl p-6 text-center">
          <p className="text-tr-text-muted text-sm">
            🚧 Полный функционал админ-панели в разработке
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
