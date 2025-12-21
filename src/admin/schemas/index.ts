/**
 * Admin Panel Zod Schemas
 * 
 * Validation schemas for coach/admin forms.
 * Multi-tenant ready with tenantId scoping.
 * 
 * @module admin/schemas
 */

import { z } from 'zod';

// ============================================================================
// Base Schemas
// ============================================================================

export const tenantIdSchema = z.string().min(1, 'Tenant ID обязателен');
export const userIdSchema = z.string().min(1, 'User ID обязателен');
export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Формат: YYYY-MM-DD');

// ============================================================================
// Exercise Schemas
// ============================================================================

export const exerciseCategorySchema = z.enum([
  'chest',
  'back',
  'shoulders',
  'biceps',
  'triceps',
  'legs',
  'glutes',
  'core',
  'cardio',
  'stretching',
  'compound',
  'functional',
]);

export const difficultySchema = z.enum(['beginner', 'intermediate', 'advanced']);

export const exerciseSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Название минимум 2 символа').max(100),
  category: exerciseCategorySchema,
  description: z.string().min(10, 'Описание минимум 10 символов').max(500),
  videoUrl: z.string().url().optional().or(z.literal('')),
  thumbnailUrl: z.string().url().optional().or(z.literal('')),
  equipment: z.array(z.string()).default([]),
  muscleGroups: z.array(z.string()).min(1, 'Укажите хотя бы одну группу мышц'),
  difficulty: difficultySchema.optional(),
  instructions: z.array(z.string()).default([]),
  createdBy: z.string().optional(),
  isGlobal: z.boolean().default(false),
  tenantId: tenantIdSchema.optional(),
});

export type ExerciseFormData = z.infer<typeof exerciseSchema>;

// ============================================================================
// Planned Set Schema
// ============================================================================

export const plannedSetSchema = z.object({
  setNumber: z.number().int().positive(),
  targetRepsMin: z.number().int().min(1, 'Минимум 1 повторение'),
  targetRepsMax: z.number().int().min(1, 'Минимум 1 повторение'),
  targetWeight: z.number().min(0, 'Вес не может быть отрицательным'),
  restSeconds: z.number().int().min(0).max(600, 'Отдых максимум 10 минут'),
});

export type PlannedSetFormData = z.infer<typeof plannedSetSchema>;

// ============================================================================
// Planned Exercise Schema
// ============================================================================

export const plannedExerciseSchema = z.object({
  id: z.string().optional(),
  exerciseId: z.string().min(1, 'Выберите упражнение'),
  name: z.string().min(1),
  description: z.string().optional(),
  coachVideoUrl: z.string().url().optional().or(z.literal('')),
  thumbnailUrl: z.string().url().optional().or(z.literal('')),
  targetMuscles: z.array(z.string()).default([]),
  equipment: z.string().optional(),
  sets: z.array(plannedSetSchema).min(1, 'Добавьте хотя бы один подход'),
  notes: z.string().max(500).optional(),
  order: z.number().int().min(0),
});

export type PlannedExerciseFormData = z.infer<typeof plannedExerciseSchema>;

// ============================================================================
// Workout Plan Schema
// ============================================================================

export const workoutPlanSchema = z.object({
  id: z.string().optional(),
  clientId: userIdSchema,
  trainerId: userIdSchema,
  tenantId: tenantIdSchema,
  date: dateSchema,
  title: z.string().min(2, 'Название минимум 2 символа').max(100),
  description: z.string().max(500).optional(),
  exercises: z.array(plannedExerciseSchema).min(1, 'Добавьте хотя бы одно упражнение'),
  estimatedDuration: z.number().int().min(5, 'Минимум 5 минут').max(180, 'Максимум 3 часа'),
  difficulty: z.enum(['easy', 'moderate', 'hard']),
  tags: z.array(z.string()).default([]),
});

export type WorkoutPlanFormData = z.infer<typeof workoutPlanSchema>;

// ============================================================================
// Week Schedule Schema
// ============================================================================

export const dayOfWeekSchema = z.enum([
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]);

export type DayOfWeek = z.infer<typeof dayOfWeekSchema>;

export const weekScheduleSchema = z.object({
  clientId: userIdSchema,
  tenantId: tenantIdSchema,
  weekStartDate: dateSchema,
  days: z.record(dayOfWeekSchema, z.object({
    isRestDay: z.boolean().default(false),
    planId: z.string().optional(),
    title: z.string().optional(),
  })),
});

export type WeekScheduleFormData = z.infer<typeof weekScheduleSchema>;

// ============================================================================
// Macros Schema
// ============================================================================

export const macrosSchema = z.object({
  calories: z.number().int().min(800, 'Минимум 800 ккал').max(10000, 'Максимум 10000 ккал'),
  protein: z.number().int().min(0).max(500, 'Максимум 500г белка'),
  carbs: z.number().int().min(0).max(1000, 'Максимум 1000г углеводов'),
  fat: z.number().int().min(0).max(500, 'Максимум 500г жиров'),
});

export type MacrosFormData = z.infer<typeof macrosSchema>;

// ============================================================================
// Meal Distribution Schema
// ============================================================================

export const mealDistributionSchema = z.object({
  breakfast: z.number().min(0).max(100),
  lunch: z.number().min(0).max(100),
  dinner: z.number().min(0).max(100),
  snacks: z.number().min(0).max(100),
}).refine(
  (data) => data.breakfast + data.lunch + data.dinner + data.snacks === 100,
  { message: 'Сумма должна быть равна 100%' }
);

export type MealDistributionFormData = z.infer<typeof mealDistributionSchema>;

// ============================================================================
// Nutrition Targets Schema
// ============================================================================

export const nutritionTargetsSchema = z.object({
  id: z.string().optional(),
  clientId: userIdSchema,
  coachId: userIdSchema,
  tenantId: tenantIdSchema,
  dailyMacros: macrosSchema,
  mealDistribution: mealDistributionSchema,
  notes: z.string().max(1000).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type NutritionTargetsFormData = z.infer<typeof nutritionTargetsSchema>;

// ============================================================================
// Water Target Schema
// ============================================================================

export const waterTargetSchema = z.object({
  id: z.string().optional(),
  clientId: userIdSchema,
  coachId: userIdSchema,
  tenantId: tenantIdSchema,
  dailyLiters: z.number().min(0.5, 'Минимум 0.5л').max(10, 'Максимум 10л'),
  cupSizeMl: z.number().int().min(100, 'Минимум 100мл').max(1000, 'Максимум 1000мл'),
  remindersEnabled: z.boolean().default(true),
  reminderIntervalMinutes: z.number().int().min(30).max(240).optional(),
});

export type WaterTargetFormData = z.infer<typeof waterTargetSchema>;

// ============================================================================
// Coach Notes Schema
// ============================================================================

export const coachNoteTypeSchema = z.enum(['daily', 'weekly', 'workout', 'nutrition', 'general']);

export const coachNoteSchema = z.object({
  id: z.string().optional(),
  clientId: userIdSchema,
  coachId: userIdSchema,
  tenantId: tenantIdSchema,
  type: coachNoteTypeSchema,
  date: dateSchema.optional(), // For daily notes
  weekStartDate: dateSchema.optional(), // For weekly notes
  title: z.string().min(2, 'Заголовок минимум 2 символа').max(100),
  content: z.string().min(1, 'Содержание обязательно').max(5000),
  isPrivate: z.boolean().default(false), // Private = coach-only, not visible to client
  priority: z.enum(['low', 'normal', 'high']).default('normal'),
  attachments: z.array(z.object({
    type: z.enum(['image', 'video', 'document']),
    url: z.string().url(),
    name: z.string(),
  })).default([]),
});

export type CoachNoteFormData = z.infer<typeof coachNoteSchema>;

// ============================================================================
// Client Profile Schema (for admin view)
// ============================================================================

export const clientProfileSchema = z.object({
  id: userIdSchema,
  phone: z.string().min(10),
  name: z.string().min(2).max(100),
  email: z.string().email().optional().or(z.literal('')),
  tenantId: tenantIdSchema,
  trainerId: userIdSchema.optional(),
  role: z.enum(['client', 'coach', 'admin']),
  onboardingCompleted: z.boolean(),
  height: z.number().int().min(100).max(250).optional(),
  weight: z.number().min(30).max(300).optional(),
  goal: z.enum(['lose_weight', 'gain_muscle', 'maintain', 'improve_health']).optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  createdAt: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type ClientProfileFormData = z.infer<typeof clientProfileSchema>;

// ============================================================================
// Video Upload Schema
// ============================================================================

export const videoUploadSchema = z.object({
  exerciseId: z.string().min(1, 'ID упражнения обязателен'),
  file: z.instanceof(File).refine(
    (file) => file.size <= 100 * 1024 * 1024,
    'Максимальный размер 100MB'
  ).refine(
    (file) => ['video/mp4', 'video/webm', 'video/quicktime'].includes(file.type),
    'Поддерживаются только MP4, WebM, MOV'
  ),
});

export type VideoUploadFormData = z.infer<typeof videoUploadSchema>;
