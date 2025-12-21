/**
 * AddMealSheet - Bottom Sheet for Adding Meal Entry
 *
 * Features:
 * - Photo capture/upload
 * - Manual macro input (kcal, protein, fat, carbs)
 * - Notes field
 * - Upload progress indicator
 *
 * @module ui/nutrition/AddMealSheet
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  CameraIcon,
  PhotoIcon,
  MinusIcon,
  PlusIcon,
  CheckIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/solid';
import type { MealType, MealMacros } from '../../services/nutritionV2Service';

// ============================================================================
// Types
// ============================================================================

interface AddMealSheetProps {
  isOpen: boolean;
  mealType: MealType;
  mealLabel: string;
  suggestedKcal: number;
  onSave: (data: {
    macros: MealMacros;
    photoFile?: File;
    notes?: string;
  }) => Promise<void>;
  onClose: () => void;
}

// ============================================================================
// Haptic Feedback
// ============================================================================

const triggerHaptic = (type: 'light' | 'medium' = 'light') => {
  if ('vibrate' in navigator) {
    navigator.vibrate(type === 'light' ? 10 : 25);
  }
};

// ============================================================================
// Stepper Component
// ============================================================================

interface StepperProps {
  label: string;
  value: number;
  step: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  unit?: string;
  color?: string;
  compact?: boolean;
}

const Stepper: React.FC<StepperProps> = ({
  label,
  value,
  step,
  min,
  max,
  onChange,
  unit,
  color = 'text-white',
  compact = false,
}) => {
  const holdRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleDecrement = useCallback(() => {
    const newValue = Math.max(min, value - step);
    onChange(newValue);
    triggerHaptic('light');
  }, [value, step, min, onChange]);

  const handleIncrement = useCallback(() => {
    const newValue = Math.min(max, value + step);
    onChange(newValue);
    triggerHaptic('light');
  }, [value, step, max, onChange]);

  const startHold = useCallback(
    (direction: 'inc' | 'dec', currentValue: number) => {
      let count = 0;
      let val = currentValue;
      holdRef.current = setInterval(() => {
        count++;
        const currentStep = count > 5 ? step * 2 : step;
        if (direction === 'inc') {
          val = Math.min(max, val + currentStep);
        } else {
          val = Math.max(min, val - currentStep);
        }
        onChange(val);
        triggerHaptic('light');
      }, 100);
    },
    [step, min, max, onChange]
  );

  const stopHold = useCallback(() => {
    if (holdRef.current) {
      clearInterval(holdRef.current);
      holdRef.current = null;
    }
  }, []);

  const buttonSize = compact ? 'w-8 h-8' : 'w-10 h-10';
  const iconSize = compact ? 'w-3 h-3' : 'w-4 h-4';
  const valueSize = compact ? 'text-lg sm:text-xl' : 'text-2xl';
  const minWidth = compact ? 'min-w-[45px] sm:min-w-[60px]' : 'min-w-[70px]';

  return (
    <div className="flex flex-col items-center">
      <p className={`text-xs text-white/40 ${compact ? 'mb-1' : 'mb-2'}`}>{label}</p>
      <div className="flex items-center gap-1 sm:gap-2">
        <motion.button
          onClick={handleDecrement}
          onMouseDown={() => startHold('dec', value)}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          onTouchStart={() => startHold('dec', value)}
          onTouchEnd={stopHold}
          whileTap={{ scale: 0.9 }}
          disabled={value <= min}
          className={`
            ${buttonSize} rounded-full
            bg-white/10 border border-white/10
            flex items-center justify-center
            text-white disabled:opacity-30
          `}
        >
          <MinusIcon className={iconSize} />
        </motion.button>

        <div className={`${minWidth} text-center`}>
          <motion.span
            key={value}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className={`${valueSize} font-semibold tabular-nums ${color}`}
          >
            {value}
          </motion.span>
          {unit && <span className={`${compact ? 'text-xs' : 'text-sm'} text-white/40 ml-0.5 sm:ml-1`}>{unit}</span>}
        </div>

        <motion.button
          onClick={handleIncrement}
          onMouseDown={() => startHold('inc', value)}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          onTouchStart={() => startHold('inc', value)}
          onTouchEnd={stopHold}
          whileTap={{ scale: 0.9 }}
          disabled={value >= max}
          className={`
            ${buttonSize} rounded-full
            bg-white/10 border border-white/10
            flex items-center justify-center
            text-white disabled:opacity-30
          `}
        >
          <PlusIcon className={iconSize} />
        </motion.button>
      </div>
    </div>
  );
};

// ============================================================================
// Photo Picker
// ============================================================================

interface PhotoPickerProps {
  photo: File | null;
  photoPreview: string | null;
  onCapture: () => void;
  onSelect: () => void;
  onClear: () => void;
  uploading: boolean;
  uploadProgress: number;
}

const PhotoPicker: React.FC<PhotoPickerProps> = ({
  photo,
  photoPreview,
  onCapture,
  onSelect,
  onClear,
  uploading,
  uploadProgress,
}) => {
  if (photoPreview) {
    return (
      <div className="relative">
        <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
          <img
            src={photoPreview}
            alt="Meal"
            className="w-full h-full object-cover"
          />

          {/* Upload progress overlay */}
          {uploading && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <div className="flex flex-col items-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <ArrowPathIcon className="w-8 h-8 text-white" />
                </motion.div>
                <p className="text-sm text-white mt-2">{Math.round(uploadProgress)}%</p>
              </div>
            </div>
          )}
        </div>

        {/* Clear button */}
        {!uploading && (
          <motion.button
            onClick={onClear}
            whileTap={{ scale: 0.9 }}
            className="
              absolute -top-2 -right-2
              w-8 h-8 rounded-full
              bg-red-500 border-2 border-zinc-900
              flex items-center justify-center
              text-white
            "
          >
            <XMarkIcon className="w-4 h-4" />
          </motion.button>
        )}
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <motion.button
        onClick={onCapture}
        whileTap={{ scale: 0.95 }}
        className="
          flex-1 h-16
          rounded-xl
          bg-white/5 border border-white/10
          flex flex-col items-center justify-center gap-1
          text-white/60 hover:text-white hover:bg-white/10
          transition-colors
        "
      >
        <CameraIcon className="w-5 h-5" />
        <span className="text-xs">Камера</span>
      </motion.button>

      <motion.button
        onClick={onSelect}
        whileTap={{ scale: 0.95 }}
        className="
          flex-1 h-16
          rounded-xl
          bg-white/5 border border-white/10
          flex flex-col items-center justify-center gap-1
          text-white/60 hover:text-white hover:bg-white/10
          transition-colors
        "
      >
        <PhotoIcon className="w-5 h-5" />
        <span className="text-xs">Галерея</span>
      </motion.button>
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export const AddMealSheet: React.FC<AddMealSheetProps> = ({
  isOpen,
  mealType,
  mealLabel,
  suggestedKcal,
  onSave,
  onClose,
}) => {
  const [kcal, setKcal] = useState(suggestedKcal);
  const [protein, setProtein] = useState(0);
  const [fat, setFat] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setKcal(suggestedKcal);
      setProtein(Math.round(suggestedKcal * 0.25 / 4)); // ~25% from protein
      setFat(Math.round(suggestedKcal * 0.3 / 9)); // ~30% from fat
      setCarbs(Math.round(suggestedKcal * 0.45 / 4)); // ~45% from carbs
      setNotes('');
      setPhoto(null);
      setPhotoPreview(null);
      setSaving(false);
      setUploadProgress(0);
    }
  }, [isOpen, suggestedKcal]);

  // Handle photo selection
  const handlePhotoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPhotoPreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleClearPhoto = useCallback(() => {
    setPhoto(null);
    setPhotoPreview(null);
  }, []);

  // Handle save
  const handleSave = useCallback(async () => {
    triggerHaptic('medium');
    setSaving(true);

    try {
      await onSave({
        macros: { kcal, protein, fat, carbs },
        photoFile: photo || undefined,
        notes: notes.trim() || undefined,
      });
    } finally {
      setSaving(false);
    }
  }, [kcal, protein, fat, carbs, notes, photo, onSave]);

  // Use portal to render at document body level
  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - Premium blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100]"
            style={{
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(10px)',
            }}
          />

          {/* Sheet - Premium glass */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="
              fixed bottom-0 inset-x-0 z-[100]
              mx-auto max-w-md
              max-h-[85vh] overflow-y-auto
              rounded-t-3xl
              pb-safe
            "
            style={{
              background: 'linear-gradient(180deg, #1a1a1e 0%, #0f0f11 100%)',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 -10px 40px rgba(0,0,0,0.5)',
            }}
          >
            {/* Drag Handle - Premium */}
            <div className="sticky top-0 flex justify-center pt-3 pb-2" style={{ background: 'linear-gradient(180deg, #1a1a1e 0%, transparent 100%)' }}>
              <div className="w-12 h-1 rounded-full bg-white/15" />
            </div>

            {/* Header - Premium */}
            <div className="px-4 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">{mealLabel}</h2>
                <p className="text-xs text-white/40 mt-0.5">Добавить приём пищи</p>
              </div>
              <motion.button
                onClick={onClose}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <XMarkIcon className="w-5 h-5 text-white/60" />
              </motion.button>
            </div>

            {/* Photo Section - Premium card */}
            <div className="px-4 pb-4">
              <p className="text-[10px] uppercase tracking-[0.15em] text-white/30 mb-2 font-medium">Фото</p>
              <PhotoPicker
                photo={photo}
                photoPreview={photoPreview}
                onCapture={() => cameraInputRef.current?.click()}
                onSelect={() => fileInputRef.current?.click()}
                onClear={handleClearPhoto}
                uploading={saving && !!photo}
                uploadProgress={uploadProgress}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>

            {/* Macros Section - Premium */}
            <div className="px-4 pb-4">
              <p className="text-[10px] uppercase tracking-[0.15em] text-white/30 mb-3 font-medium">Макронутриенты</p>

              {/* Kcal - Premium full width */}
              <div 
                className="mb-3 p-4 rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)',
                  border: '1px solid rgba(6, 182, 212, 0.2)',
                  boxShadow: '0 0 20px rgba(6, 182, 212, 0.1), inset 0 1px 0 rgba(255,255,255,0.05)',
                }}
              >
                <Stepper
                  label="Калории"
                  value={kcal}
                  step={50}
                  min={0}
                  max={3000}
                  onChange={setKcal}
                  unit="kcal"
                  color="text-cyan-400"
                />
              </div>

              {/* P/F/C Grid - Premium cards */}
              <div className="grid grid-cols-3 gap-2">
                <div 
                  className="p-2 rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.03) 100%)',
                    border: '1px solid rgba(34, 197, 94, 0.2)',
                  }}
                >
                  <Stepper
                    label="Белки"
                    value={protein}
                    step={5}
                    min={0}
                    max={200}
                    onChange={setProtein}
                    unit="g"
                    color="text-emerald-400"
                    compact
                  />
                </div>
                <div 
                  className="p-2 rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.03) 100%)',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                  }}
                >
                  <Stepper
                    label="Жиры"
                    value={fat}
                    step={5}
                    min={0}
                    max={150}
                    onChange={setFat}
                    unit="g"
                    color="text-amber-400"
                    compact
                  />
                </div>
                <div 
                  className="p-2 rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0.03) 100%)',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                  }}
                >
                  <Stepper
                    label="Углеводы"
                    value={carbs}
                    step={5}
                    min={0}
                    max={300}
                    onChange={setCarbs}
                    unit="g"
                    color="text-violet-400"
                    compact
                  />
                </div>
              </div>
            </div>

            {/* Notes - Premium */}
            <div className="px-4 pb-4">
              <p className="text-[10px] uppercase tracking-[0.15em] text-white/30 mb-2 font-medium">Заметки</p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Что вы съели?"
                className="
                  w-full h-16
                  px-4 py-3
                  rounded-xl
                  text-white text-sm placeholder-white/25
                  resize-none
                  focus:outline-none transition-all
                "
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              />
            </div>

            {/* Save Button - POWERFUL CTA */}
            <div className="px-4 pb-6">
              <motion.button
                onClick={handleSave}
                disabled={saving}
                whileTap={{ scale: 0.97 }}
                className="relative w-full h-14 rounded-xl text-white font-bold flex items-center justify-center gap-2 overflow-hidden disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)',
                  boxShadow: '0 0 30px rgba(99, 102, 241, 0.3), 0 4px 20px rgba(0,0,0,0.3)',
                }}
              >
                {/* Shine effect */}
                {!saving && (
                  <motion.div
                    className="absolute inset-0"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                    }}
                  />
                )}
                
                {saving ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <ArrowPathIcon className="w-5 h-5" />
                    </motion.div>
                    <span>Сохранение...</span>
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-5 h-5" />
                    <span>Сохранить</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // Render via portal to escape SwipeShell container
  return createPortal(modalContent, document.body);
};

export default AddMealSheet;
