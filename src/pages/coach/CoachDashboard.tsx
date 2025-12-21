/**
 * Coach Dashboard - Main Coach/Admin Interface
 * 
 * Features:
 * - Client list with status
 * - Quick stats
 * - Navigation to client details
 * 
 * @module pages/coach/CoachDashboard
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useHistory } from 'react-router-dom';
import { 
  MagnifyingGlassIcon,
  PlusIcon,
  UserIcon,
  ChevronRightIcon,
  UsersIcon,
  FireIcon,
  CalendarIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../auth/AuthContextV2';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy,
  onSnapshot,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';

// ============================================================================
// Types
// ============================================================================

interface ClientData {
  id: string;
  name: string;
  phone: string;
  avatarUrl?: string;
  role: string;
  lastLoginAt?: string;
  lastWorkoutAt?: string;
  totalWorkouts?: number;
  isActive?: boolean;
  createdAt?: string;
}

type ActivityStatus = 'active' | 'moderate' | 'inactive';

// ============================================================================
// Helpers
// ============================================================================

const getActivityStatus = (lastWorkout?: string): ActivityStatus => {
  if (!lastWorkout) return 'inactive';
  const diffDays = Math.floor((Date.now() - new Date(lastWorkout).getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 3) return 'active';
  if (diffDays <= 7) return 'moderate';
  return 'inactive';
};

const getStatusColor = (status: ActivityStatus) => {
  switch (status) {
    case 'active': return 'bg-emerald-500';
    case 'moderate': return 'bg-amber-500';
    case 'inactive': return 'bg-red-500';
  }
};

const formatLastActive = (date?: string): string => {
  if (!date) return 'Нет данных';
  const diffDays = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Сегодня';
  if (diffDays === 1) return 'Вчера';
  if (diffDays < 7) return `${diffDays} дн. назад`;
  return new Date(date).toLocaleDateString('ru-RU');
};

// ============================================================================
// Stats Card
// ============================================================================

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
    <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
      {icon}
    </div>
    <p className="text-2xl font-bold text-white">{value}</p>
    <p className="text-zinc-500 text-sm">{title}</p>
  </div>
);

// ============================================================================
// Client Card
// ============================================================================

interface ClientCardProps {
  client: ClientData;
  onClick: () => void;
}

const ClientCard: React.FC<ClientCardProps> = ({ client, onClick }) => {
  const status = getActivityStatus(client.lastWorkoutAt || client.lastLoginAt);
  const statusColor = getStatusColor(status);
  
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-zinc-900 rounded-2xl p-4 cursor-pointer border border-zinc-800 hover:border-zinc-700 transition-colors"
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
            {client.avatarUrl ? (
              <img src={client.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              <UserIcon className="w-6 h-6 text-zinc-500" />
            )}
          </div>
          <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ${statusColor} border-2 border-zinc-900`} />
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-medium truncate">{client.name || 'Без имени'}</h3>
          <p className="text-zinc-500 text-sm truncate">{client.phone}</p>
        </div>
        
        {/* Meta */}
        <div className="text-right">
          <p className="text-zinc-400 text-sm">{formatLastActive(client.lastWorkoutAt || client.lastLoginAt)}</p>
          <p className="text-zinc-600 text-xs">{client.totalWorkouts || 0} тренировок</p>
        </div>
        
        <ChevronRightIcon className="w-5 h-5 text-zinc-600" />
      </div>
    </motion.div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

const CoachDashboard: React.FC = () => {
  const history = useHistory();
  const { user, logout } = useAuth();
  const [clients, setClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ total: 0, active: 0, workoutsToday: 0 });

  // Load clients
  useEffect(() => {
    const loadClients = async () => {
      try {
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);
        
        const clientsList: ClientData[] = [];
        
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          // Include users with role 'client' or no role (default to client)
          if (data.role === 'client' || !data.role) {
            clientsList.push({ id: docSnap.id, ...data } as ClientData);
          }
        });
        
        // Sort by lastLoginAt descending
        clientsList.sort((a, b) => {
          const dateA = a.lastLoginAt ? new Date(a.lastLoginAt).getTime() : 0;
          const dateB = b.lastLoginAt ? new Date(b.lastLoginAt).getTime() : 0;
          return dateB - dateA;
        });
        
        setClients(clientsList);
        
        // Calculate stats
        const activeCount = clientsList.filter(c => {
          const lastActive = c.lastWorkoutAt || c.lastLoginAt;
          if (!lastActive) return false;
          const diffDays = Math.floor((Date.now() - new Date(lastActive).getTime()) / (1000 * 60 * 60 * 24));
          return diffDays <= 7;
        }).length;
        
        setStats({
          total: clientsList.length,
          active: activeCount,
          workoutsToday: 0,
        });
      } catch (error) {
        // Silent fail - show empty list
      } finally {
        setLoading(false);
      }
    };
    
    loadClients();
  }, []);

  // Filter clients
  const filteredClients = clients.filter(c => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      c.name?.toLowerCase().includes(query) ||
      c.phone?.toLowerCase().includes(query)
    );
  });

  const handleLogout = async () => {
    await logout();
    history.push('/login');
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-zinc-950 border-b border-zinc-800 px-6 py-4 safe-area-inset-top">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">
              {user?.role === 'admin' ? 'Админ-панель' : 'Тренерская'}
            </h1>
            <p className="text-zinc-500 text-sm">{user?.name || user?.phone}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
          >
            <Cog6ToothIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            title="Клиентов"
            value={stats.total}
            icon={<UsersIcon className="w-5 h-5 text-white" />}
            color="bg-blue-600"
          />
          <StatCard
            title="Активных"
            value={stats.active}
            icon={<FireIcon className="w-5 h-5 text-white" />}
            color="bg-emerald-600"
          />
          <StatCard
            title="Сегодня"
            value={stats.workoutsToday}
            icon={<CalendarIcon className="w-5 h-5 text-white" />}
            color="bg-purple-600"
          />
        </div>

        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск клиентов..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
          />
        </div>

        {/* Clients List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Клиенты</h2>
            <button
              onClick={() => history.push('/coach/client/new')}
              className="flex items-center gap-1 text-blue-500 text-sm font-medium"
            >
              <PlusIcon className="w-4 h-4" />
              Добавить
            </button>
          </div>
          
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-zinc-900 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="bg-zinc-900 rounded-2xl p-8 text-center">
              <UserIcon className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500">
                {searchQuery ? 'Клиенты не найдены' : 'Нет клиентов'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredClients.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  onClick={() => history.push(`/coach/client/${client.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoachDashboard;
