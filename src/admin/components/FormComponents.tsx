/**
 * Admin Form Components - Reusable form inputs with Zod validation
 * 
 * @module admin/components/FormComponents
 */

import React from 'react';
import { motion } from 'framer-motion';

// ============================================================================
// Form Field Wrapper
// ============================================================================

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  required,
  children,
  hint,
}) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-tr-text-muted">
      {label}
      {required && <span className="text-tr-accent ml-1">*</span>}
    </label>
    {children}
    {hint && !error && (
      <p className="text-xs text-tr-text-disabled">{hint}</p>
    )}
    {error && (
      <motion.p
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xs text-tr-error"
      >
        {error}
      </motion.p>
    )}
  </div>
);

// ============================================================================
// Text Input
// ============================================================================

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string;
  error?: string;
  hint?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  required,
  className = '',
  ...props
}) => (
  <FormField label={label} error={error} required={required} hint={hint}>
    <input
      className={`
        w-full bg-tr-input border rounded-tr-md px-4 py-2.5 text-white
        placeholder-tr-text-disabled focus:outline-none focus:border-tr-accent transition-colors
        ${error ? 'border-tr-error' : 'border-tr-border'}
        ${className}
      `}
      {...props}
    />
  </FormField>
);

// ============================================================================
// Number Input
// ============================================================================

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  error?: string;
  hint?: string;
  required?: boolean;
  suffix?: string;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  error,
  hint,
  required,
  suffix,
}) => (
  <FormField label={label} error={error} required={required} hint={hint}>
    <div className="relative">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        min={min}
        max={max}
        step={step}
        className={`
          w-full bg-tr-input border rounded-tr-md px-4 py-2.5 text-white
          placeholder-tr-text-disabled focus:outline-none focus:border-tr-accent transition-colors
          ${error ? 'border-tr-error' : 'border-tr-border'}
          ${suffix ? 'pr-12' : ''}
        `}
      />
      {suffix && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-tr-text-muted text-sm">
          {suffix}
        </span>
      )}
    </div>
  </FormField>
);

// ============================================================================
// Textarea
// ============================================================================

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
  showCount?: boolean;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  hint,
  required,
  showCount,
  maxLength,
  value,
  className = '',
  ...props
}) => {
  const charCount = typeof value === 'string' ? value.length : 0;

  return (
    <FormField label={label} error={error} required={required} hint={hint}>
      <div className="relative">
        <textarea
          value={value}
          maxLength={maxLength}
          className={`
            w-full bg-tr-input border rounded-tr-md px-4 py-2.5 text-white
            placeholder-tr-text-disabled focus:outline-none focus:border-tr-accent transition-colors
            min-h-[100px] resize-y
            ${error ? 'border-tr-error' : 'border-tr-border'}
            ${className}
          `}
          {...props}
        />
        {showCount && maxLength && (
          <span className="absolute bottom-2 right-2 text-xs text-tr-text-disabled">
            {charCount}/{maxLength}
          </span>
        )}
      </div>
    </FormField>
  );
};

// ============================================================================
// Select
// ============================================================================

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  error?: string;
  hint?: string;
  required?: boolean;
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  value,
  onChange,
  options,
  error,
  hint,
  required,
  placeholder = 'Выберите...',
}) => (
  <FormField label={label} error={error} required={required} hint={hint}>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`
        w-full bg-tr-input border rounded-tr-md px-4 py-2.5 text-white
        focus:outline-none focus:border-tr-accent transition-colors appearance-none
        ${error ? 'border-tr-error' : 'border-tr-border'}
        ${!value ? 'text-tr-text-disabled' : ''}
      `}
    >
      <option value="" disabled>{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </FormField>
);

// ============================================================================
// Multi-Select (Checkbox Group)
// ============================================================================

interface MultiSelectProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  options: SelectOption[];
  error?: string;
  hint?: string;
  required?: boolean;
  columns?: 2 | 3 | 4;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  value,
  onChange,
  options,
  error,
  hint,
  required,
  columns = 2,
}) => {
  const toggleOption = (optValue: string) => {
    if (value.includes(optValue)) {
      onChange(value.filter(v => v !== optValue));
    } else {
      onChange([...value, optValue]);
    }
  };

  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  return (
    <FormField label={label} error={error} required={required} hint={hint}>
      <div className={`grid ${gridCols[columns]} gap-2`}>
        {options.map((opt) => (
          <label
            key={opt.value}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-tr-sm border cursor-pointer
              transition-colors
              ${value.includes(opt.value)
                ? 'bg-tr-accent/20 border-tr-accent text-white'
                : 'bg-tr-input border-tr-border text-tr-text-muted hover:border-tr-border-strong'
              }
            `}
          >
            <input
              type="checkbox"
              checked={value.includes(opt.value)}
              onChange={() => toggleOption(opt.value)}
              className="sr-only"
            />
            <div className={`
              w-4 h-4 rounded border flex items-center justify-center
              ${value.includes(opt.value) ? 'bg-tr-accent border-tr-accent' : 'border-tr-border'}
            `}>
              {value.includes(opt.value) && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className="text-sm">{opt.label}</span>
          </label>
        ))}
      </div>
    </FormField>
  );
};

// ============================================================================
// Toggle / Switch
// ============================================================================

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  label,
  checked,
  onChange,
  description,
}) => (
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-white">{label}</p>
      {description && (
        <p className="text-xs text-tr-text-muted">{description}</p>
      )}
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`
        relative w-12 h-6 rounded-full transition-colors
        ${checked ? 'bg-tr-accent' : 'bg-tr-input border border-tr-border'}
      `}
    >
      <motion.div
        animate={{ x: checked ? 24 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 w-4 h-4 rounded-full bg-white"
      />
    </button>
  </div>
);

// ============================================================================
// Range Slider
// ============================================================================

interface RangeInputProps {
  label: string;
  minValue: number;
  maxValue: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  error?: string;
  suffix?: string;
}

export const RangeInput: React.FC<RangeInputProps> = ({
  label,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  min,
  max,
  step = 1,
  error,
  suffix = '',
}) => (
  <FormField label={label} error={error}>
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={minValue}
        onChange={(e) => onMinChange(parseFloat(e.target.value) || 0)}
        min={min}
        max={maxValue}
        step={step}
        className="w-20 bg-tr-input border border-tr-border rounded-tr-sm px-2 py-1.5 text-white text-center"
      />
      <span className="text-tr-text-muted">—</span>
      <input
        type="number"
        value={maxValue}
        onChange={(e) => onMaxChange(parseFloat(e.target.value) || 0)}
        min={minValue}
        max={max}
        step={step}
        className="w-20 bg-tr-input border border-tr-border rounded-tr-sm px-2 py-1.5 text-white text-center"
      />
      {suffix && <span className="text-tr-text-muted text-sm">{suffix}</span>}
    </div>
  </FormField>
);

// ============================================================================
// Button
// ============================================================================

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  icon,
  disabled,
  className = '',
  ...props
}) => {
  const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-tr-accent text-white hover:bg-tr-accent-hover',
    secondary: 'bg-tr-card text-white border border-tr-border hover:bg-tr-hover',
    ghost: 'bg-transparent text-tr-text-muted hover:bg-tr-hover hover:text-white',
    danger: 'bg-tr-error text-white hover:bg-red-600',
  };

  const sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 font-medium rounded-tr-md
        transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon ? (
        icon
      ) : null}
      {children}
    </button>
  );
};

// ============================================================================
// Card
// ============================================================================

interface CardProps {
  children: React.ReactNode;
  title?: string;
  actions?: React.ReactNode;
  padding?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  actions,
  padding = 'md',
  className = '',
  onClick,
}) => {
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div
      className={`bg-tr-card rounded-tr-xl border border-tr-border ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {(title || actions) && (
        <div className={`flex items-center justify-between ${paddingClasses[padding]} border-b border-tr-border`}>
          {title && <h3 className="font-semibold text-white">{title}</h3>}
          {actions}
        </div>
      )}
      <div className={paddingClasses[padding]}>{children}</div>
    </div>
  );
};

// ============================================================================
// Empty State
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
  <div className="flex flex-col items-center justify-center py-12 text-center">
    {icon && (
      <div className="w-16 h-16 rounded-full bg-tr-elevated flex items-center justify-center mb-4">
        {icon}
      </div>
    )}
    <h3 className="text-lg font-medium text-white mb-1">{title}</h3>
    {description && (
      <p className="text-sm text-tr-text-muted mb-4 max-w-sm">{description}</p>
    )}
    {action}
  </div>
);

// ============================================================================
// Loading Spinner
// ============================================================================

export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`${sizeClasses[size]} border-2 border-tr-accent border-t-transparent rounded-full animate-spin`} />
  );
};

export const LoadingState: React.FC<{ message?: string }> = ({ message = 'Загрузка...' }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <Spinner size="lg" />
    <p className="mt-4 text-tr-text-muted">{message}</p>
  </div>
);
