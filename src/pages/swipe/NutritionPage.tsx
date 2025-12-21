/**
 * NutritionPage - Right Swipe Page
 *
 * Daily nutrition tracking with macros, meals, and water.
 * Uses real Firebase data via nutritionV2Service.
 *
 * @module pages/swipe/NutritionPage
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { SwipePage } from '../../components/shell/SwipeShell';
import { useAuth } from '../../auth/AuthContextV2';
import { MacroProgress, MealCard, AddMealSheet, WaterWidget } from '../../ui/nutrition';
import {
  type DailyNutritionState,
  type MealType,
  type MealMacros,
  subscribeToDailyState,
  logMeal,
  addWaterCup,
  removeWaterCup,
} from '../../services/nutritionV2Service';

// ============================================================================
// Loading Skeleton
// ============================================================================

const NutritionSkeleton: React.FC = () => (
  <div className="animate-pulse px-4 space-y-6">
    <div className="h-48 rounded-2xl bg-white/5" />
    <div className="h-32 rounded-2xl bg-white/5" />
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-20 rounded-2xl bg-white/5" />
      ))}
    </div>
  </div>
);

// ============================================================================
// Day Summary
// ============================================================================

interface DaySummaryProps {
  state: DailyNutritionState;
}

const DaySummary: React.FC<DaySummaryProps> = ({ state }) => {
  const { macroProgress, meals } = state;
  const loggedMeals = meals.filter((m) => m.isLogged).length;
  const totalMeals = meals.length;
  const kcalRemaining = macroProgress.kcal.target - macroProgress.kcal.current;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-4"
    >
      <p className="text-sm text-white/50">
        {loggedMeals === totalMeals ? (
          <span className="text-emerald-400">✓ All meals logged!</span>
        ) : (
          <>
            {kcalRemaining > 0 ? (
              <>
                <span className="text-white font-medium">{kcalRemaining}</span> kcal remaining
              </>
            ) : (
              <span className="text-amber-400">Target reached</span>
            )}
            {' · '}
            {loggedMeals}/{totalMeals} meals
          </>
        )}
      </p>
    </motion.div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export const NutritionPage: React.FC = () => {
  const { user } = useAuth();
  const [state, setState] = useState<DailyNutritionState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Add meal sheet state
  const [addMealOpen, setAddMealOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('breakfast');

  // Subscribe to daily nutrition state
  useEffect(() => {
    if (!user?.id) return;

    const today = new Date().toISOString().split('T')[0];
    const unsubscribe = subscribeToDailyState(
      user.id,
      today,
      (newState) => {
        setState(newState);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Nutrition subscription error:', err);
        setError('Failed to load nutrition data');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.id]);

  // Handle meal log click
  const handleMealClick = useCallback((mealType: MealType) => {
    setSelectedMealType(mealType);
    setAddMealOpen(true);
  }, []);

  // Handle meal save
  const handleSaveMeal = useCallback(
    async (data: { macros: MealMacros; photoFile?: File; notes?: string }) => {
      if (!user?.id) return;

      const today = new Date().toISOString().split('T')[0];
      await logMeal(user.id, today, selectedMealType, data.macros, data.photoFile);
      setAddMealOpen(false);
    },
    [user?.id, selectedMealType]
  );

  // Handle water add
  const handleAddWater = useCallback(async () => {
    if (!user?.id) return;
    const today = new Date().toISOString().split('T')[0];
    await addWaterCup(user.id, today);
  }, [user?.id]);

  // Handle water remove
  const handleRemoveWater = useCallback(async () => {
    if (!user?.id) return;
    const today = new Date().toISOString().split('T')[0];
    await removeWaterCup(user.id, today);
  }, [user?.id]);

  // Loading state
  if (loading) {
    return (
      <SwipePage withBottomPadding>
        <div className="px-4 pt-safe">
          <div className="pt-4 pb-2">
            <h1 className="text-2xl font-semibold text-white">Nutrition</h1>
            <p className="text-sm text-white/40">Track your daily intake</p>
          </div>
        </div>
        <NutritionSkeleton />
      </SwipePage>
    );
  }

  // Error state
  if (error || !state) {
    return (
      <SwipePage withBottomPadding>
        <div className="px-4 pt-safe">
          <div className="pt-4 pb-2">
            <h1 className="text-2xl font-semibold text-white">Nutrition</h1>
          </div>
        </div>
        <div className="px-4 flex items-center justify-center min-h-[300px]">
          <p className="text-white/50">{error || 'Unable to load nutrition data'}</p>
        </div>
      </SwipePage>
    );
  }

  const { macroProgress, waterProgress, meals } = state;

  return (
    <SwipePage withBottomPadding>
      {/* Header */}
      <div className="px-4 pt-safe">
        <div className="pt-4 pb-2">
          <h1 className="text-2xl font-semibold text-white">Nutrition</h1>
          <p className="text-sm text-white/40">Track your daily intake</p>
        </div>
      </div>

      {/* Day Summary */}
      <div className="px-4">
        <DaySummary state={state} />
      </div>

      {/* Macro summary */}
      <div className="px-4 py-4">
        <MacroProgress
          kcal={{ current: macroProgress.kcal.current, target: macroProgress.kcal.target }}
          protein={{ current: macroProgress.protein.current, target: macroProgress.protein.target }}
          fat={{ current: macroProgress.fat.current, target: macroProgress.fat.target }}
          carbs={{ current: macroProgress.carbs.current, target: macroProgress.carbs.target }}
        />
      </div>

      {/* Water widget */}
      <div className="px-4 pb-4">
        <WaterWidget
          cupsConsumed={waterProgress.cupsConsumed}
          cupsTarget={waterProgress.cupsTarget}
          cupSizeMl={waterProgress.cupSizeMl}
          onAddCup={handleAddWater}
          onRemoveCup={handleRemoveWater}
        />
      </div>

      {/* Meals */}
      <div className="px-4">
        <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-3">
          Meals
        </h2>
        <div className="space-y-3">
          {meals.map((meal) => (
            <MealCard
              key={meal.mealType}
              meal={meal}
              onAddMeal={handleMealClick}
              onEditMeal={handleMealClick}
            />
          ))}
        </div>
      </div>

      {/* Add Meal Sheet */}
      <AddMealSheet
        isOpen={addMealOpen}
        onClose={() => setAddMealOpen(false)}
        mealType={selectedMealType}
        mealLabel={
          meals.find((m) => m.mealType === selectedMealType)?.label || 'Meal'
        }
        suggestedKcal={
          meals.find((m) => m.mealType === selectedMealType)?.adjustedKcal ||
          meals.find((m) => m.mealType === selectedMealType)?.plannedKcal ||
          500
        }
        onSave={handleSaveMeal}
      />
    </SwipePage>
  );
};

export default NutritionPage;
