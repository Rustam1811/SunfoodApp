/**
 * ProfilePage - Left Swipe Page
 *
 * Profile, check-in history, and coach notes.
 *
 * @module pages/swipe/ProfilePage
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UserCircleIcon, 
  ScaleIcon, 
  CameraIcon, 
  ChatBubbleLeftRightIcon,
  ChevronRightIcon,
  BellIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/solid';
import { SwipePage } from '../../components/shell/SwipeShell';
import { GlassCard, GlassPanel, IconButton, SecondaryButton, GlassDivider } from '../../ui/premium';
import { useAuth } from '../../auth/AuthContextV2';

// ============================================================================
// Types
// ============================================================================

interface CheckIn {
  id: string;
  date: Date;
  weight: number;
  hasPhotos: boolean;
}

interface CoachNote {
  id: string;
  message: string;
  createdAt: Date;
  read: boolean;
}

// ============================================================================
// Avatar Component
// ============================================================================

interface AvatarProps {
  url?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

const Avatar: React.FC<AvatarProps> = ({ url, name, size = 'md' }) => {
  const sizes = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-16 h-16 text-lg',
    lg: 'w-24 h-24 text-2xl',
  };

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className={`${sizes[size]} rounded-full object-cover border-2 border-white/10`}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center font-semibold text-white`}
    >
      {initials}
    </div>
  );
};

// ============================================================================
// Stats Row
// ============================================================================

interface StatItemProps {
  label: string;
  value: string | number;
  unit?: string;
}

const StatItem: React.FC<StatItemProps> = ({ label, value, unit }) => (
  <div className="text-center">
    <p className="text-2xl font-semibold tabular-nums text-white">
      {value}
      {unit && <span className="text-sm text-white/50 ml-0.5">{unit}</span>}
    </p>
    <p className="text-xs text-white/40 mt-0.5">{label}</p>
  </div>
);

// ============================================================================
// Menu Item
// ============================================================================

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  badge?: number;
  onClick?: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, subtitle, badge, onClick }) => (
  <motion.button
    onClick={onClick}
    whileTap={{ scale: 0.98 }}
    className="w-full flex items-center gap-3 p-4 text-left"
  >
    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-medium text-white">{label}</p>
      {subtitle && <p className="text-xs text-white/40 truncate">{subtitle}</p>}
    </div>
    <div className="flex items-center gap-2">
      {badge !== undefined && badge > 0 && (
        <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-xs font-medium text-white flex items-center justify-center">
          {badge}
        </span>
      )}
      <ChevronRightIcon className="w-4 h-4 text-white/30" />
    </div>
  </motion.button>
);

// ============================================================================
// Coach Note Card
// ============================================================================

interface CoachNoteCardProps {
  note: CoachNote;
}

const CoachNoteCard: React.FC<CoachNoteCardProps> = ({ note }) => (
  <GlassCard depth="raised" padding="md" className="mx-4">
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
        <ChatBubbleLeftRightIcon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-medium text-white">Coach Note</p>
          <p className="text-xs text-white/40">
            {note.createdAt.toLocaleDateString()}
          </p>
        </div>
        <p className="text-sm text-white/70 line-clamp-2">{note.message}</p>
      </div>
    </div>
  </GlassCard>
);

// ============================================================================
// Main Component
// ============================================================================

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const [coachNote] = useState<CoachNote | null>({
    id: '1',
    message: 'Great progress this week! Keep up the intensity on your upper body days. Remember to focus on the eccentric phase.',
    createdAt: new Date(),
    read: false,
  });

  // Mock stats (use user stats when available)
  const stats = {
    workouts: user?.totalWorkouts ?? 24,
    streak: user?.streak ?? 7,
    weight: user?.weight ?? 78.5,
  };

  const handleSignOut = () => {
    logout();
  };

  return (
    <SwipePage withBottomPadding>
      {/* Header with profile */}
      <div className="px-4 pt-safe">
        <div className="pt-4 pb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar
              url={user?.avatar || undefined}
              name={user?.name || 'User'}
              size="lg"
            />
            <div>
              <h1 className="text-xl font-semibold text-white">
                {user?.name || 'User'}
              </h1>
              <p className="text-sm text-white/50">{user?.phone}</p>
            </div>
          </div>
          <IconButton
            icon={<Cog6ToothIcon className="w-5 h-5" />}
            size="md"
            variant="glass"
            aria-label="Settings"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 pb-6">
        <GlassCard depth="raised" padding="md">
          <div className="flex items-center justify-around py-2">
            <StatItem label="Workouts" value={stats.workouts} />
            <div className="w-px h-10 bg-white/10" />
            <StatItem label="Streak" value={stats.streak} unit="days" />
            <div className="w-px h-10 bg-white/10" />
            <StatItem label="Weight" value={stats.weight} unit="kg" />
          </div>
        </GlassCard>
      </div>

      {/* Coach note (if any) */}
      {coachNote && (
        <div className="pb-4">
          <CoachNoteCard note={coachNote} />
        </div>
      )}

      {/* Menu */}
      <div className="px-4">
        <GlassPanel className="overflow-hidden">
          <MenuItem
            icon={<ScaleIcon className="w-5 h-5" />}
            label="Weekly Check-in"
            subtitle="Log weight & photos"
            onClick={() => {}}
          />
          <GlassDivider />
          <MenuItem
            icon={<ChatBubbleLeftRightIcon className="w-5 h-5" />}
            label="Coach Messages"
            subtitle="View conversation"
            badge={coachNote && !coachNote.read ? 1 : 0}
            onClick={() => {}}
          />
          <GlassDivider />
          <MenuItem
            icon={<BellIcon className="w-5 h-5" />}
            label="Notifications"
            subtitle="Reminders & alerts"
            onClick={() => {}}
          />
        </GlassPanel>
      </div>

      {/* Sign out */}
      <div className="px-4 pt-6">
        <SecondaryButton fullWidth onClick={handleSignOut}>
          Sign Out
        </SecondaryButton>
      </div>
    </SwipePage>
  );
};

export default ProfilePage;
