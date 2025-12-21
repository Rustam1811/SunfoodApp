/**
 * Coach Page - Trainer OS (Client)
 * 
 * Messages from coach:
 * - Pinned instructions
 * - Feedback
 * - Video comments
 * 
 * NO chats, NO voice, NO flood — only "to the point" communication.
 * 
 * @module pages/CoachPage
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChatBubbleLeftIcon, 
  VideoCameraIcon,
  CheckIcon 
} from '@heroicons/react/24/outline';
import { useAuth } from '../auth/AuthContextV2';
import {
  subscribeClientMessages,
  markAsRead,
  markAllAsRead,
  getMessageTypeIcon,
  formatTimecode,
  type CoachMessage,
  type MessageType,
} from '../services/coachMessagesService';

// ============================================================================
// Message Card
// ============================================================================

interface MessageCardProps {
  message: CoachMessage;
  onMarkRead: () => void;
}

const MessageCard: React.FC<MessageCardProps> = ({ message, onMarkRead }) => {
  const getIcon = () => {
    switch (message.type) {
      case 'instruction':
        return <span className="text-lg">📌</span>;
      case 'feedback':
        return <ChatBubbleLeftIcon className="w-5 h-5 text-tr-accent" />;
      case 'video_comment':
        return <VideoCameraIcon className="w-5 h-5 text-blue-400" />;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Вчера';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('ru-RU', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => !message.read && onMarkRead()}
      className={`p-4 rounded-xl transition-all ${
        message.pinned
          ? 'bg-tr-accent/10 border border-tr-accent/20'
          : message.read
            ? 'bg-tr-elevated/50'
            : 'bg-tr-elevated'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          {getIcon()}
          <span className="text-tr-text font-medium text-sm">
            {message.coachName || 'Тренер'}
          </span>
          {message.pinned && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-tr-accent/20 text-tr-accent">
              Важно
            </span>
          )}
        </div>
        <span className="text-tr-text-muted text-xs flex-shrink-0">
          {formatDate(message.createdAt)}
        </span>
      </div>

      {/* Content */}
      <p className={`text-sm leading-relaxed ${message.read ? 'text-tr-text-secondary' : 'text-tr-text'}`}>
        {message.content}
      </p>

      {/* Video timecode link */}
      {message.type === 'video_comment' && message.timecode !== undefined && (
        <div className="mt-2">
          <span className="text-blue-400 text-xs">
            ⏱ {formatTimecode(message.timecode)}
          </span>
        </div>
      )}

      {/* Unread indicator */}
      {!message.read && (
        <div className="absolute right-4 top-4">
          <div className="w-2 h-2 rounded-full bg-tr-accent" />
        </div>
      )}
    </motion.div>
  );
};

// ============================================================================
// Pinned Section
// ============================================================================

interface PinnedSectionProps {
  messages: CoachMessage[];
  onMarkRead: (id: string) => void;
}

const PinnedSection: React.FC<PinnedSectionProps> = ({ messages, onMarkRead }) => {
  if (messages.length === 0) return null;

  return (
    <div className="mb-6">
      <h2 className="text-tr-text-muted text-xs uppercase tracking-wider mb-3 px-1">
        Закреплённые
      </h2>
      <div className="space-y-3">
        {messages.map((msg) => (
          <MessageCard
            key={msg.id}
            message={msg}
            onMarkRead={() => onMarkRead(msg.id)}
          />
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// Loading Skeleton
// ============================================================================

const LoadingSkeleton: React.FC = () => (
  <div className="px-6 pt-8 animate-pulse">
    <div className="h-6 w-24 bg-tr-elevated rounded mb-8" />
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-24 bg-tr-elevated rounded-xl" />
      ))}
    </div>
  </div>
);

// ============================================================================
// Empty State
// ============================================================================

const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] px-8 text-center">
    <div className="w-16 h-16 rounded-full bg-tr-elevated flex items-center justify-center mb-4">
      <ChatBubbleLeftIcon className="w-8 h-8 text-tr-text-muted" />
    </div>
    <h2 className="text-lg font-semibold text-tr-text mb-2">
      Пока нет сообщений
    </h2>
    <p className="text-tr-text-muted text-sm">
      Здесь будут инструкции и обратная связь от тренера
    </p>
  </div>
);

// ============================================================================
// Main Component
// ============================================================================

const CoachPage: React.FC = () => {
  const { user } = useAuth();
  
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to messages
  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = subscribeClientMessages(user.id, (data) => {
      setMessages(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.id]);

  // Mark single message as read
  const handleMarkRead = async (messageId: string) => {
    try {
      await markAsRead(messageId);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    if (!user?.id) return;
    try {
      await markAllAsRead(user.id);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  // Split pinned and regular messages
  const pinnedMessages = messages.filter((m) => m.pinned);
  const regularMessages = messages.filter((m) => !m.pinned);
  const unreadCount = messages.filter((m) => !m.read).length;

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
      <div className="px-6 pt-8 pb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-tr-text">Тренер</h1>
        
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-tr-accent text-sm flex items-center gap-1"
          >
            <CheckIcon className="w-4 h-4" />
            Прочитать все
          </button>
        )}
      </div>

      {messages.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="px-6">
          {/* Pinned messages */}
          <PinnedSection
            messages={pinnedMessages}
            onMarkRead={handleMarkRead}
          />

          {/* Regular messages */}
          {regularMessages.length > 0 && (
            <div>
              <h2 className="text-tr-text-muted text-xs uppercase tracking-wider mb-3 px-1">
                Сообщения
              </h2>
              <div className="space-y-3">
                <AnimatePresence>
                  {regularMessages.map((msg) => (
                    <MessageCard
                      key={msg.id}
                      message={msg}
                      onMarkRead={() => handleMarkRead(msg.id)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CoachPage;
