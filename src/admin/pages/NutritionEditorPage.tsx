/**
 * Nutrition Editor Page - Configure client nutrition targets
 * 
 * Features:
 * - Daily macros (calories, protein, carbs, fat)
 * - Meal distribution (%)
 * - Water target (liters, cup size)
 * - Nutrition notes
 * 
 * @module admin/pages/NutritionEditorPage
 */

import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeftIcon,
  FireIcon,
  BeakerIcon,
  CalculatorIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../auth/AuthContextV2';
import {
  getClient,
  getNutritionTargets,
  saveNutritionTargets,
  getWaterTarget,
  saveWaterTarget,
  type Client,
  type NutritionTargets,
  type WaterTarget,
} from '../services/adminService';
import {
  nutritionTargetsSchema,
  waterTargetSchema,
  type NutritionTargetsFormData,
  type WaterTargetFormData,
  type MacrosFormData,
  type MealDistributionFormData,
} from '../schemas';
import {
  Input,
  NumberInput,
  Textarea,
  Button,
  Card,
  Toggle,
  EmptyState,
  LoadingState,
  FormField,
} from '../components/FormComponents';

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_TENANT = 'default';

const MACRO_COLORS = {
  calories: 'text-orange-400',
  protein: 'text-red-400',
  carbs: 'text-yellow-400',
  fat: 'text-blue-400',
};

// ============================================================================
// Macro Calculator Component
// ============================================================================

interface MacroCalculatorProps {
  client: Client;
  onCalculate: (macros: MacrosFormData) => void;
}

const MacroCalculator: React.FC<MacroCalculatorProps> = ({ client, onCalculate }) => {
  const [activityLevel, setActivityLevel] = useState<number>(1.55);
  const [goal, setGoal] = useState<'lose' | 'maintain' | 'gain'>('maintain');

  const activityLevels = [
    { value: 1.2, label: 'Минимум (сидячая работа)' },
    { value: 1.375, label: 'Низкий (1-2 тренировки)' },
    { value: 1.55, label: 'Средний (3-4 тренировки)' },
    { value: 1.725, label: 'Высокий (5-6 тренировок)' },
    { value: 1.9, label: 'Очень высокий (спорт)' },
  ];

  const calculateMacros = () => {
    const weight = client.weight || 70;
    const height = client.height || 170;
    const age = 30; // Default age if not available

    // Mifflin-St Jeor formula
    let bmr: number;
    if (client.goal === 'gain_muscle') {
      // Assume male for muscle gain
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      // Assume average
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    let tdee = bmr * activityLevel;

    // Adjust for goal
    if (goal === 'lose') {
      tdee *= 0.8; // 20% deficit
    } else if (goal === 'gain') {
      tdee *= 1.15; // 15% surplus
    }

    const calories = Math.round(tdee);
    
    // Protein: 2g per kg for fitness
    const protein = Math.round(weight * 2);
    
    // Fat: 0.8g per kg
    const fat = Math.round(weight * 0.8);
    
    // Remaining calories from carbs
    const carbCalories = calories - (protein * 4) - (fat * 9);
    const carbs = Math.round(carbCalories / 4);

    onCalculate({ calories, protein, carbs, fat });
  };

  return (
    <Card title="Калькулятор макросов" padding="lg">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-tr-text-muted mb-2">
            Уровень активности
          </label>
          <select
            value={activityLevel}
            onChange={e => setActivityLevel(parseFloat(e.target.value))}
            className="w-full bg-tr-input border border-tr-border rounded-tr-md px-4 py-2.5 text-white"
          >
            {activityLevels.map(level => (
              <option key={level.value} value={level.value}>{level.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-tr-text-muted mb-2">
            Цель
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'lose', label: 'Похудение' },
              { value: 'maintain', label: 'Поддержание' },
              { value: 'gain', label: 'Набор массы' },
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setGoal(opt.value as typeof goal)}
                className={`px-3 py-2 text-sm rounded-tr-md transition-colors ${
                  goal === opt.value
                    ? 'bg-tr-accent text-white'
                    : 'bg-tr-input border border-tr-border text-tr-text-muted hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="text-sm text-tr-text-muted">
          <p>Вес клиента: {client.weight || 70} кг</p>
          <p>Рост: {client.height || 170} см</p>
        </div>

        <Button
          variant="secondary"
          icon={<CalculatorIcon className="w-5 h-5" />}
          onClick={calculateMacros}
          fullWidth
        >
          Рассчитать
        </Button>
      </div>
    </Card>
  );
};

// ============================================================================
// Macros Editor Component
// ============================================================================

interface MacrosEditorProps {
  macros: MacrosFormData;
  onChange: (macros: MacrosFormData) => void;
  errors?: Record<string, string>;
}

const MacrosEditor: React.FC<MacrosEditorProps> = ({ macros, onChange, errors }) => {
  const updateField = (field: keyof MacrosFormData, value: number) => {
    onChange({ ...macros, [field]: value });
  };

  // Calculate percentages
  const totalCals = macros.protein * 4 + macros.carbs * 4 + macros.fat * 9;
  const proteinPct = totalCals > 0 ? Math.round((macros.protein * 4 / totalCals) * 100) : 0;
  const carbsPct = totalCals > 0 ? Math.round((macros.carbs * 4 / totalCals) * 100) : 0;
  const fatPct = totalCals > 0 ? Math.round((macros.fat * 9 / totalCals) * 100) : 0;

  return (
    <Card title="Дневные макросы" padding="lg">
      <div className="space-y-4">
        <NumberInput
          label="Калории"
          value={macros.calories}
          onChange={v => updateField('calories', v)}
          min={800}
          max={10000}
          step={50}
          suffix="ккал"
          error={errors?.['dailyMacros.calories']}
          required
        />

        <div className="grid grid-cols-3 gap-4">
          <NumberInput
            label="Белки"
            value={macros.protein}
            onChange={v => updateField('protein', v)}
            min={0}
            max={500}
            suffix="г"
            error={errors?.['dailyMacros.protein']}
            required
          />
          <NumberInput
            label="Углеводы"
            value={macros.carbs}
            onChange={v => updateField('carbs', v)}
            min={0}
            max={1000}
            suffix="г"
            error={errors?.['dailyMacros.carbs']}
            required
          />
          <NumberInput
            label="Жиры"
            value={macros.fat}
            onChange={v => updateField('fat', v)}
            min={0}
            max={500}
            suffix="г"
            error={errors?.['dailyMacros.fat']}
            required
          />
        </div>

        {/* Visual breakdown */}
        <div className="pt-4 border-t border-tr-border">
          <p className="text-sm text-tr-text-muted mb-2">Распределение БЖУ</p>
          <div className="flex h-4 rounded-full overflow-hidden bg-tr-elevated">
            <div
              className="bg-red-400 transition-all"
              style={{ width: `${proteinPct}%` }}
              title={`Белки: ${proteinPct}%`}
            />
            <div
              className="bg-yellow-400 transition-all"
              style={{ width: `${carbsPct}%` }}
              title={`Углеводы: ${carbsPct}%`}
            />
            <div
              className="bg-blue-400 transition-all"
              style={{ width: `${fatPct}%` }}
              title={`Жиры: ${fatPct}%`}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-tr-text-muted">
            <span className="text-red-400">Б: {proteinPct}%</span>
            <span className="text-yellow-400">У: {carbsPct}%</span>
            <span className="text-blue-400">Ж: {fatPct}%</span>
          </div>
        </div>

        {/* Calculated calories */}
        <div className="text-sm text-tr-text-muted">
          <p>Расчётные калории из БЖУ: <span className="text-white">{totalCals} ккал</span></p>
          {Math.abs(totalCals - macros.calories) > 50 && (
            <p className="text-tr-error mt-1">
              ⚠️ Несоответствие с указанными калориями
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

// ============================================================================
// Meal Distribution Editor
// ============================================================================

interface MealDistributionEditorProps {
  distribution: MealDistributionFormData;
  onChange: (distribution: MealDistributionFormData) => void;
  error?: string;
}

const MealDistributionEditor: React.FC<MealDistributionEditorProps> = ({
  distribution,
  onChange,
  error,
}) => {
  const meals: { key: keyof MealDistributionFormData; label: string; icon: string }[] = [
    { key: 'breakfast', label: 'Завтрак', icon: '🌅' },
    { key: 'lunch', label: 'Обед', icon: '☀️' },
    { key: 'dinner', label: 'Ужин', icon: '🌙' },
    { key: 'snacks', label: 'Перекусы', icon: '🍎' },
  ];

  const total = distribution.breakfast + distribution.lunch + distribution.dinner + distribution.snacks;

  const updateMeal = (meal: keyof MealDistributionFormData, value: number) => {
    onChange({ ...distribution, [meal]: value });
  };

  return (
    <Card title="Распределение по приёмам пищи" padding="lg">
      <div className="space-y-4">
        {meals.map(meal => (
          <div key={meal.key}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-tr-text-muted">
                {meal.icon} {meal.label}
              </span>
              <span className="text-sm font-medium text-white">
                {distribution[meal.key]}%
              </span>
            </div>
            <input
              type="range"
              value={distribution[meal.key]}
              onChange={e => updateMeal(meal.key, parseInt(e.target.value))}
              min={0}
              max={60}
              step={5}
              className="w-full accent-tr-accent"
            />
          </div>
        ))}

        <div className={`text-center py-2 rounded-tr-md ${
          total === 100 ? 'bg-green-500/20 text-green-400' : 'bg-tr-error/20 text-tr-error'
        }`}>
          Итого: {total}% {total !== 100 && '(должно быть 100%)'}
        </div>

        {error && <p className="text-sm text-tr-error">{error}</p>}
      </div>
    </Card>
  );
};

// ============================================================================
// Water Target Editor
// ============================================================================

interface WaterTargetEditorProps {
  target: WaterTargetFormData;
  onChange: (target: WaterTargetFormData) => void;
  errors?: Record<string, string>;
}

const WaterTargetEditor: React.FC<WaterTargetEditorProps> = ({ target, onChange, errors }) => {
  const cupsNeeded = Math.ceil((target.dailyLiters * 1000) / target.cupSizeMl);

  return (
    <Card title="Цель по воде" padding="lg">
      <div className="space-y-4">
        <NumberInput
          label="Дневная норма"
          value={target.dailyLiters}
          onChange={v => onChange({ ...target, dailyLiters: v })}
          min={0.5}
          max={10}
          step={0.5}
          suffix="л"
          error={errors?.dailyLiters}
          required
        />

        <NumberInput
          label="Размер стакана"
          value={target.cupSizeMl}
          onChange={v => onChange({ ...target, cupSizeMl: v })}
          min={100}
          max={1000}
          step={50}
          suffix="мл"
          error={errors?.cupSizeMl}
          required
        />

        <div className="py-3 px-4 bg-tr-elevated rounded-tr-md">
          <p className="text-sm text-tr-text-muted">
            💧 Нужно выпить: <span className="text-white font-medium">{cupsNeeded} стаканов</span> в день
          </p>
        </div>

        <Toggle
          label="Напоминания"
          checked={target.remindersEnabled}
          onChange={v => onChange({ ...target, remindersEnabled: v })}
          description="Отправлять напоминания о воде"
        />

        {target.remindersEnabled && (
          <NumberInput
            label="Интервал напоминаний"
            value={target.reminderIntervalMinutes || 60}
            onChange={v => onChange({ ...target, reminderIntervalMinutes: v })}
            min={30}
            max={240}
            step={30}
            suffix="мин"
          />
        )}
      </div>
    </Card>
  );
};

// ============================================================================
// Main Page Component
// ============================================================================

export const NutritionEditorPage: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const history = useHistory();
  const { user } = useAuth();

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [macros, setMacros] = useState<MacrosFormData>({
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 70,
  });
  const [distribution, setDistribution] = useState<MealDistributionFormData>({
    breakfast: 25,
    lunch: 35,
    dinner: 30,
    snacks: 10,
  });
  const [waterTarget, setWaterTarget] = useState<WaterTargetFormData>({
    clientId,
    coachId: user?.id || '',
    tenantId: DEFAULT_TENANT,
    dailyLiters: 2.5,
    cupSizeMl: 250,
    remindersEnabled: true,
    reminderIntervalMinutes: 60,
  });
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load data
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [clientData, nutritionData, waterData] = await Promise.all([
          getClient(clientId, DEFAULT_TENANT),
          getNutritionTargets(clientId, DEFAULT_TENANT),
          getWaterTarget(clientId, DEFAULT_TENANT),
        ]);

        setClient(clientData);

        if (nutritionData) {
          setMacros(nutritionData.dailyMacros);
          setDistribution(nutritionData.mealDistribution);
          setNotes(nutritionData.notes || '');
        }

        if (waterData) {
          setWaterTarget({
            ...waterData,
            clientId,
            coachId: user?.id || '',
            tenantId: DEFAULT_TENANT,
          });
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [clientId, user?.id]);

  const handleSave = async () => {
    const nutritionForm: NutritionTargetsFormData = {
      clientId,
      coachId: user?.id || '',
      tenantId: DEFAULT_TENANT,
      dailyMacros: macros,
      mealDistribution: distribution,
      notes,
    };

    const nutritionResult = nutritionTargetsSchema.safeParse(nutritionForm);
    const waterResult = waterTargetSchema.safeParse(waterTarget);

    const newErrors: Record<string, string> = {};

    if (!nutritionResult.success) {
      nutritionResult.error.issues.forEach(err => {
        newErrors[err.path.join('.')] = err.message;
      });
    }

    if (!waterResult.success) {
      waterResult.error.issues.forEach(err => {
        newErrors[err.path.join('.')] = err.message;
      });
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      await Promise.all([
        saveNutritionTargets(nutritionResult.data!, DEFAULT_TENANT),
        saveWaterTarget(waterResult.data!, DEFAULT_TENANT),
      ]);
      setErrors({});
      // Show success feedback (could use toast)
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState message="Загрузка данных..." />;
  }

  if (!client) {
    return (
      <EmptyState
        title="Клиент не найден"
        action={<Button onClick={() => history.push('/admin/clients')}>К списку клиентов</Button>}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => history.push('/admin/clients')}
          className="p-2 text-tr-text-muted hover:text-white"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">{client.name}</h1>
          <p className="text-tr-text-muted">Настройки питания</p>
        </div>
      </div>

      {/* Tabs / Quick Links */}
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => history.push(`/admin/clients/${clientId}/plan`)}
        >
          Тренировки
        </Button>
        <Button variant="secondary" size="sm">
          Питание
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => history.push(`/admin/clients/${clientId}/notes`)}
        >
          Заметки
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <MacrosEditor
            macros={macros}
            onChange={setMacros}
            errors={errors}
          />
          <MealDistributionEditor
            distribution={distribution}
            onChange={setDistribution}
            error={errors.mealDistribution}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <MacroCalculator
            client={client}
            onCalculate={setMacros}
          />
          <WaterTargetEditor
            target={waterTarget}
            onChange={setWaterTarget}
            errors={errors}
          />
          <Card title="Заметки по питанию" padding="lg">
            <Textarea
              label=""
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Рекомендации, ограничения, аллергии..."
              rows={4}
              maxLength={1000}
              showCount
            />
          </Card>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-tr-border">
        <div className="flex-1" />
        <Button variant="secondary" onClick={() => history.push('/admin/clients')}>
          Отмена
        </Button>
        <Button onClick={handleSave} loading={saving}>
          Сохранить
        </Button>
      </div>
    </div>
  );
};

export default NutritionEditorPage;
