/**
 * CoachClients - Client List for Trainers (Trainer OS)
 * 
 * Main screen for trainers. Shows list of their clients.
 * Tap client → go to client detail with workouts.
 * + button → add new client.
 * 
 * Design: Graphite + Wine
 * 
 * @module pages/coach/CoachClients
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  UserIcon,
  PhoneIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';
import { useAuth } from '../../auth/AuthContextV2';
import {
  subscribeToTrainerClients,
  createClient,
  generatePassword,
  isPhoneRegistered,
  type ClientInfo,
  type CreateClientData,
} from '../../services/clientService';

// ============================================================================
// Client Card
// ============================================================================

interface ClientCardProps {
  client: ClientInfo;
  onClick: () => void;
}

const ClientCard: React.FC<ClientCardProps> = ({ client, onClick }) => {
  const initials = client.name
    ? client.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className="w-full bg-tr-elevated rounded-2xl p-4 text-left"
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-tr-accent/20 flex items-center justify-center flex-shrink-0">
          {client.avatar ? (
            <img src={client.avatar} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            <span className="text-tr-accent font-semibold text-sm">{initials}</span>
          )}
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-tr-text font-medium truncate">
            {client.name || 'Без имени'}
          </p>
          <p className="text-tr-text-muted text-sm flex items-center gap-1.5">
            <PhoneIcon className="w-3.5 h-3.5" />
            {client.phone}
          </p>
        </div>
        
        {/* Stats */}
        <div className="text-right flex-shrink-0">
          <p className="text-tr-text font-semibold">{client.totalWorkouts}</p>
          <p className="text-tr-text-muted text-xs">тренировок</p>
        </div>
      </div>
      
      {/* Credentials row - visible to trainer */}
      <div className="mt-3 pt-3 border-t border-tr-border-subtle flex items-center gap-4 text-xs">
        <div className="flex-1">
          <span className="text-tr-text-muted">Пароль: </span>
          <span className="text-tr-text font-mono">{client.password}</span>
        </div>
        {client.streak > 0 && (
          <div className="flex items-center gap-1 text-tr-accent">
            <span>🔥</span>
            <span>{client.streak} дн.</span>
          </div>
        )}
      </div>
    </motion.button>
  );
};

// ============================================================================
// Add Client Modal
// ============================================================================

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: CreateClientData) => Promise<void>;
  trainerId: string;
}

const AddClientModal: React.FC<AddClientModalProps> = ({ isOpen, onClose, onAdd, trainerId }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState(() => generatePassword());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim() || !phone.trim()) {
      setError('Заполните все поля');
      return;
    }
    
    setLoading(true);
    try {
      // Check if phone exists
      const exists = await isPhoneRegistered(phone);
      if (exists) {
        setError('Этот номер уже зарегистрирован');
        setLoading(false);
        return;
      }
      
      await onAdd({
        name: name.trim(),
        phone: phone.trim(),
        password,
        trainerId,
      });
      
      // Reset form
      setName('');
      setPhone('');
      setPassword(generatePassword());
      onClose();
    } catch {
      setError('Ошибка создания клиента');
    } finally {
      setLoading(false);
    }
  };

  const regeneratePassword = () => {
    setPassword(generatePassword());
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-tr-base rounded-t-3xl p-6 pb-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-tr-text">Новый клиент</h2>
          <button onClick={onClose} className="p-2 -mr-2">
            <XMarkIcon className="w-6 h-6 text-tr-text-muted" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-tr-text-secondary text-sm mb-2">Имя</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Иван Иванов"
              className="w-full bg-tr-input border border-tr-border rounded-xl px-4 py-3 text-tr-text placeholder-tr-text-disabled focus:outline-none focus:border-tr-accent"
            />
          </div>
          
          {/* Phone */}
          <div>
            <label className="block text-tr-text-secondary text-sm mb-2">Телефон</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+7 777 123 4567"
              className="w-full bg-tr-input border border-tr-border rounded-xl px-4 py-3 text-tr-text placeholder-tr-text-disabled focus:outline-none focus:border-tr-accent"
            />
          </div>
          
          {/* Password */}
          <div>
            <label className="block text-tr-text-secondary text-sm mb-2">Пароль (для клиента)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 bg-tr-input border border-tr-border rounded-xl px-4 py-3 text-tr-text font-mono focus:outline-none focus:border-tr-accent"
              />
              <button
                type="button"
                onClick={regeneratePassword}
                className="px-4 py-3 bg-tr-elevated border border-tr-border rounded-xl text-tr-text-secondary text-sm"
              >
                🎲
              </button>
            </div>
          </div>
          
          {error && (
            <p className="text-tr-error text-sm">{error}</p>
          )}
          
          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 rounded-xl font-semibold text-white disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #A64D55 0%, #8B3A42 100%)',
            }}
          >
            {loading ? 'Создаю...' : 'Добавить клиента'}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
};

// ============================================================================
// Empty State
// ============================================================================

const EmptyState: React.FC<{ onAdd: () => void }> = ({ onAdd }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
    <div className="w-20 h-20 rounded-full bg-tr-elevated flex items-center justify-center mb-6">
      <UserIcon className="w-10 h-10 text-tr-text-muted" />
    </div>
    <h2 className="text-xl font-semibold text-tr-text mb-2">
      Пока нет клиентов
    </h2>
    <p className="text-tr-text-secondary text-sm mb-6 max-w-xs">
      Добавьте первого клиента, чтобы начать создавать тренировки
    </p>
    <motion.button
      onClick={onAdd}
      whileTap={{ scale: 0.98 }}
      className="px-6 py-3 rounded-xl font-semibold text-white"
      style={{
        background: 'linear-gradient(135deg, #A64D55 0%, #8B3A42 100%)',
      }}
    >
      Добавить клиента
    </motion.button>
  </div>
);

// ============================================================================
// Loading State
// ============================================================================

const LoadingState: React.FC = () => (
  <div className="px-5 pt-6">
    <div className="animate-pulse space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-tr-elevated rounded-2xl p-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-tr-base" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-tr-base rounded" />
              <div className="h-3 w-24 bg-tr-base rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ============================================================================
// Main Component
// ============================================================================

const CoachClients: React.FC = () => {
  const { user } = useAuth();
  const history = useHistory();
  const [clients, setClients] = useState<ClientInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Subscribe to clients
  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = subscribeToTrainerClients(user.id, (newClients) => {
      setClients(newClients);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.id]);

  const handleAddClient = useCallback(async (data: CreateClientData) => {
    await createClient(data);
  }, []);

  const handleClientClick = useCallback((clientId: string) => {
    history.push(`/coach/clients/${clientId}`);
  }, [history]);

  if (loading) {
    return (
      <div className="min-h-screen bg-tr-base safe-area-inset-top">
        <div className="px-5 pt-6 pb-4">
          <h1 className="text-2xl font-bold text-tr-text">Клиенты</h1>
        </div>
        <LoadingState />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tr-base safe-area-inset-top">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-tr-text">Клиенты</h1>
          <p className="text-tr-text-muted text-sm">{clients.length} человек</p>
        </div>
        
        <motion.button
          onClick={() => setShowAddModal(true)}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #A64D55 0%, #8B3A42 100%)',
          }}
        >
          <PlusIcon className="w-5 h-5 text-white" />
        </motion.button>
      </div>

      {/* Content */}
      {clients.length === 0 ? (
        <EmptyState onAdd={() => setShowAddModal(true)} />
      ) : (
        <div className="px-5 pb-24 space-y-3">
          {clients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onClick={() => handleClientClick(client.id)}
            />
          ))}
        </div>
      )}

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && user && (
          <AddClientModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onAdd={handleAddClient}
            trainerId={user.id}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CoachClients;
