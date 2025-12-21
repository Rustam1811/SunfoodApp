/**
 * Trainer OS UI Primitives
 * 
 * Reusable components for the graphite + wine design system.
 * Used across client & coach pages.
 * 
 * @module ui/primitives
 */

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

// ============================================================================
// Card
// ============================================================================

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  padding = 'md',
  className = '',
  ...props
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-5',
  };

  return (
    <div
      className={`bg-tr-card rounded-tr-xl border border-tr-border-subtle ${paddingClasses[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// ============================================================================
// Button
// ============================================================================

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  className = '',
  ...props
}) => {
  const baseClasses = 'font-semibold transition-colors flex items-center justify-center gap-2';
  
  const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-tr-accent text-white hover:bg-tr-accent-hover disabled:opacity-50',
    secondary: 'bg-tr-card text-white border border-tr-border hover:bg-tr-hover hover:border-tr-border-strong disabled:opacity-50',
    ghost: 'bg-transparent text-tr-text-secondary hover:bg-tr-elevated hover:text-white disabled:opacity-50',
  };

  const sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-3 py-2 text-sm rounded-tr-sm',
    md: 'px-4 py-3 text-sm rounded-tr-md',
    lg: 'px-6 py-4 text-base rounded-tr-lg',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        children
      )}
    </motion.button>
  );
};

// ============================================================================
// Input
// ============================================================================

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  ...props
}) => (
  <div className="space-y-2">
    {label && (
      <label className="block text-sm font-medium text-tr-text-muted">{label}</label>
    )}
    <input
      className={`w-full bg-tr-input border rounded-tr-md px-4 py-3 text-white placeholder-tr-text-disabled focus:outline-none focus:border-tr-accent transition-colors ${
        error ? 'border-tr-error' : 'border-tr-border'
      } ${className}`}
      {...props}
    />
    {error && <p className="text-sm text-tr-error">{error}</p>}
  </div>
);

// ============================================================================
// Textarea
// ============================================================================

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  maxLength?: number;
  showCount?: boolean;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  maxLength,
  showCount = false,
  value,
  className = '',
  ...props
}) => {
  const charCount = typeof value === 'string' ? value.length : 0;
  const isOverLimit = maxLength ? charCount > maxLength : false;

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-tr-text-muted">{label}</label>
      )}
      <textarea
        value={value}
        className={`w-full bg-tr-input border rounded-tr-md px-4 py-3 text-white placeholder-tr-text-disabled resize-none focus:outline-none transition-colors ${
          error || isOverLimit ? 'border-tr-error focus:border-tr-error' : 'border-tr-border focus:border-tr-accent'
        } ${className}`}
        {...props}
      />
      {(showCount && maxLength) && (
        <p className={`text-xs text-right ${isOverLimit ? 'text-tr-error' : 'text-tr-text-disabled'}`}>
          {charCount} / {maxLength}
        </p>
      )}
      {error && <p className="text-sm text-tr-error">{error}</p>}
    </div>
  );
};

// ============================================================================
// Tabs
// ============================================================================

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange }) => (
  <div className="flex border-b border-tr-border">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => onTabChange(tab.id)}
        className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
          activeTab === tab.id ? 'text-tr-accent' : 'text-tr-text-muted hover:text-tr-text-secondary'
        }`}
      >
        {tab.label}
        {activeTab === tab.id && (
          <motion.div
            layoutId="activeTab"
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-tr-accent"
          />
        )}
      </button>
    ))}
  </div>
);

// ============================================================================
// Badge
// ============================================================================

type BadgeVariant = 'default' | 'accent' | 'success' | 'warning' | 'error';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = '',
}) => {
  const variantClasses: Record<BadgeVariant, string> = {
    default: 'bg-tr-elevated text-tr-text-secondary',
    accent: 'bg-tr-accent-muted text-tr-accent',
    success: 'bg-green-500/15 text-tr-success',
    warning: 'bg-yellow-500/15 text-tr-warning',
    error: 'bg-red-500/15 text-tr-error',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-tr-sm ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

// ============================================================================
// StatusDot
// ============================================================================

type StatusDotStatus = 'active' | 'warning' | 'inactive';

interface StatusDotProps {
  status: StatusDotStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusDot: React.FC<StatusDotProps> = ({
  status,
  size = 'md',
  className = '',
}) => {
  const statusClasses: Record<StatusDotStatus, string> = {
    active: 'bg-tr-success',
    warning: 'bg-tr-warning',
    inactive: 'bg-tr-error',
  };

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
  };

  return (
    <span
      className={`rounded-full ${statusClasses[status]} ${sizeClasses[size]} ${className}`}
    />
  );
};

// ============================================================================
// Skeleton
// ============================================================================

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  rounded = 'sm',
}) => {
  const roundedClasses = {
    sm: 'rounded-tr-sm',
    md: 'rounded-tr-md',
    lg: 'rounded-tr-lg',
    full: 'rounded-full',
  };

  return (
    <div
      className={`tr-skeleton ${roundedClasses[rounded]} ${className}`}
      style={{ width, height }}
    />
  );
};

// ============================================================================
// Progress
// ============================================================================

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  className = '',
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={`h-2 bg-tr-base rounded-full overflow-hidden ${className}`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.3 }}
        className="h-full bg-tr-accent rounded-full"
      />
    </div>
  );
};

// ============================================================================
// SectionLabel
// ============================================================================

interface SectionLabelProps {
  children: React.ReactNode;
  className?: string;
}

export const SectionLabel: React.FC<SectionLabelProps> = ({
  children,
  className = '',
}) => (
  <h2 className={`text-sm font-medium text-tr-text-muted uppercase tracking-wide mb-3 ${className}`}>
    {children}
  </h2>
);

// ============================================================================
// LoadingSpinner
// ============================================================================

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  return (
    <div
      className={`${sizeClasses[size]} border-tr-accent border-t-transparent rounded-full animate-spin ${className}`}
    />
  );
};

// ============================================================================
// EmptyState
// ============================================================================

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => (
  <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
    {icon && (
      <div className="w-16 h-16 bg-tr-card rounded-full flex items-center justify-center mb-4">
        {icon}
      </div>
    )}
    <h2 className="text-xl font-semibold text-white mb-2">{title}</h2>
    {description && <p className="text-tr-text-muted mb-6">{description}</p>}
    {action}
  </div>
);

// ============================================================================
// Toast (for notifications)
// ============================================================================

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  onClose,
}) => {
  const typeClasses: Record<ToastType, string> = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-tr-card border border-tr-border',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className={`fixed bottom-32 left-4 right-4 p-4 rounded-tr-lg flex items-center gap-3 ${typeClasses[type]}`}
      onClick={onClose}
    >
      <span className="text-white font-medium">{message}</span>
    </motion.div>
  );
};
