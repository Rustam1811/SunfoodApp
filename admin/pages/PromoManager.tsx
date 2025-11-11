import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { Promo, PromoCondition, PromoReward } from '../types/promo';
import { 
  getAllPromos, 
  createPromo, 
  updatePromo, 
  deletePromo 
} from '../services/promoService';

interface PromoFormData {
  title: string;
  description: string;
  conditions: PromoCondition[];
  rewards: PromoReward[];
  isActive: boolean;
  startDate: string;
  endDate: string;
  priority: number;
  stackable: boolean;
  showOnHome: boolean;
  badge?: string;
  imageUrl?: string;
}

const PromoManager: React.FC = () => {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promo | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Загрузка акций
  useEffect(() => {
    loadPromos();
  }, []);

  const loadPromos = async () => {
    setLoading(true);
    try {
      const data = await getAllPromos();
      setPromos(data);
    } catch (error) {
      console.error('Ошибка загрузки акций:', error);
      alert('Не удалось загрузить акции');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту акцию?')) return;
    
    try {
      await deletePromo(id);
      await loadPromos();
    } catch (error) {
      console.error('Ошибка удаления:', error);
      alert('Не удалось удалить акцию');
    }
  };

  const handleEdit = (promo: Promo) => {
    setEditingPromo(promo);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPromo(null);
  };

  const filteredPromos = promos.filter(promo => {
    if (filter === 'active') return promo.isActive;
    if (filter === 'inactive') return !promo.isActive;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Заголовок */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <SparklesIcon className="w-8 h-8 text-yellow-500" />
              Управление акциями
            </h1>
            <p className="text-gray-600 mt-1">
              Создавайте и управляйте промо-акциями для ваших клиентов
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors shadow-lg"
          >
            <PlusIcon className="w-5 h-5" />
            Создать акцию
          </button>
        </div>

        {/* Фильтры */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-gray-900 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Все ({promos.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'active' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Активные ({promos.filter(p => p.isActive).length})
          </button>
          <button
            onClick={() => setFilter('inactive')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'inactive' 
                ? 'bg-gray-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Неактивные ({promos.filter(p => !p.isActive).length})
          </button>
        </div>
      </div>

      {/* Список акций */}
      {filteredPromos.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl">
          <SparklesIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {filter === 'all' 
              ? 'Пока нет акций. Создайте первую!' 
              : `Нет ${filter === 'active' ? 'активных' : 'неактивных'} акций`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPromos.map((promo) => (
            <PromoCard
              key={promo.id}
              promo={promo}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Модальное окно */}
      {showModal && (
        <PromoFormModal
          promo={editingPromo}
          onClose={handleCloseModal}
          onSave={() => {
            loadPromos();
            handleCloseModal();
          }}
        />
      )}
    </div>
  );
};

// Карточка акции
interface PromoCardProps {
  promo: Promo;
  onEdit: (promo: Promo) => void;
  onDelete: (id: string) => void;
}

const PromoCard: React.FC<PromoCardProps> = ({ promo, onEdit, onDelete }) => {
  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('ru-RU', { 
      day: '2-digit', 
      month: 'short' 
    });
  };

  const getConditionLabel = (condition: PromoCondition): string => {
    switch (condition.type) {
      case 'time_range':
        return `⏰ ${condition.timeRange?.start} - ${condition.timeRange?.end}`;
      case 'product_quantity':
        return `📦 Минимум ${condition.minQuantity} шт.`;
      case 'min_cart_value':
        return `💰 От ${condition.minValue}₸`;
      case 'day_of_week': {
        const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
        return `📅 ${condition.daysOfWeek?.map(d => days[d]).join(', ')}`;
      }
      default:
        return condition.type;
    }
  };

  const getRewardLabel = (reward: PromoReward): string => {
    switch (reward.type) {
      case 'percentage_discount':
        return `🎁 Скидка ${reward.value}%`;
      case 'fixed_discount':
        return `🎁 Скидка ${reward.value}₸`;
      case 'free_product':
        return `🎁 Бесплатный товар`;
      case 'buy_x_get_y':
        return `🎁 ${reward.buyXGetY?.buyQuantity}+${reward.buyXGetY?.getQuantity}`;
      case 'bonus_points':
        return `⭐ +${reward.value} баллов`;
      default:
        return reward.type;
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-lg overflow-hidden border-2 transition-all hover:shadow-xl ${
      promo.isActive ? 'border-green-500' : 'border-gray-200'
    }`}>
      {/* Бейдж статуса */}
      <div className={`px-4 py-2 text-sm font-semibold text-white ${
        promo.isActive ? 'bg-green-600' : 'bg-gray-400'
      }`}>
        {promo.isActive ? '✓ Активна' : '○ Неактивна'}
        {promo.badge && (
          <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
            {promo.badge}
          </span>
        )}
      </div>

      <div className="p-5">
        {/* Заголовок */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">{promo.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{promo.description}</p>

        {/* Даты */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <span>{formatDate(promo.startDate)}</span>
          <span>→</span>
          <span>{formatDate(promo.endDate)}</span>
        </div>

        {/* Условия */}
        <div className="space-y-1 mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase">Условия:</p>
          {promo.conditions.slice(0, 2).map((condition, idx) => (
            <div key={idx} className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-lg">
              {getConditionLabel(condition)}
            </div>
          ))}
          {promo.conditions.length > 2 && (
            <p className="text-xs text-gray-400">
              +{promo.conditions.length - 2} ещё
            </p>
          )}
        </div>

        {/* Награды */}
        <div className="space-y-1 mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase">Награды:</p>
          {promo.rewards.slice(0, 2).map((reward, idx) => (
            <div key={idx} className="text-sm bg-yellow-50 text-yellow-700 px-3 py-1 rounded-lg font-medium">
              {getRewardLabel(reward)}
            </div>
          ))}
        </div>

        {/* Статистика */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4 pb-4 border-b">
          <span>Приоритет: {promo.priority}</span>
          <span>Использовано: {promo.usageCount || 0}</span>
        </div>

        {/* Действия */}
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(promo)}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PencilIcon className="w-4 h-4" />
            Ред.
          </button>
          <button
            onClick={() => onDelete(promo.id)}
            className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <TrashIcon className="w-4 h-4" />
            Удал.
          </button>
        </div>
      </div>
    </div>
  );
};

// Форма создания/редактирования акции
interface PromoFormModalProps {
  promo: Promo | null;
  onClose: () => void;
  onSave: () => void;
}

const PromoFormModal: React.FC<PromoFormModalProps> = ({ promo, onClose, onSave }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<PromoFormData>({
    title: promo?.title || '',
    description: promo?.description || '',
    conditions: promo?.conditions || [],
    rewards: promo?.rewards || [],
    isActive: promo?.isActive ?? true,
    startDate: promo?.startDate 
      ? new Date(promo.startDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    endDate: promo?.endDate 
      ? new Date(promo.endDate).toISOString().split('T')[0]
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: promo?.priority || 1,
    stackable: promo?.stackable ?? false,
    showOnHome: promo?.showOnHome ?? false,
    badge: promo?.badge || '',
    imageUrl: promo?.imageUrl || ''
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.conditions.length === 0) {
      alert('Добавьте хотя бы одно условие');
      return;
    }
    
    if (formData.rewards.length === 0) {
      alert('Добавьте хотя бы одну награду');
      return;
    }

    setSaving(true);
    try {
      if (promo) {
        await updatePromo(promo.id, formData);
      } else {
        await createPromo(formData);
      }
      onSave();
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      alert('Не удалось сохранить акцию');
    } finally {
      setSaving(false);
    }
  };

  const addCondition = (type: PromoCondition['type']) => {
    const newCondition: PromoCondition = { type, value: null };
    
    // Установим дефолтные значения
    if (type === 'time_range') {
      newCondition.timeRange = { start: '08:00', end: '12:00' };
    } else if (type === 'product_quantity') {
      newCondition.minQuantity = 2;
      newCondition.productId = 101;
    } else if (type === 'min_cart_value') {
      newCondition.minValue = 2000;
    } else if (type === 'day_of_week') {
      newCondition.daysOfWeek = [1, 2, 3, 4, 5]; // Пн-Пт
    }
    
    setFormData({
      ...formData,
      conditions: [...formData.conditions, newCondition]
    });
  };

  const removeCondition = (index: number) => {
    setFormData({
      ...formData,
      conditions: formData.conditions.filter((_, i) => i !== index)
    });
  };

  const addReward = (type: PromoReward['type']) => {
    const newReward: PromoReward = { type, value: 0, applyTo: 'cart' };
    
    if (type === 'percentage_discount') {
      newReward.value = 10;
    } else if (type === 'fixed_discount') {
      newReward.value = 500;
    } else if (type === 'buy_x_get_y') {
      newReward.buyXGetY = { buyQuantity: 2, getQuantity: 1 };
    } else if (type === 'bonus_points') {
      newReward.value = 50;
    }
    
    setFormData({
      ...formData,
      rewards: [...formData.rewards, newReward]
    });
  };

  const removeReward = (index: number) => {
    setFormData({
      ...formData,
      rewards: formData.rewards.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Заголовок */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {promo ? 'Редактировать акцию' : 'Создать акцию'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Шаг 1: Основная информация */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Основная информация</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Название акции *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Например: Утренний кофе"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Описание *</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    rows={3}
                    placeholder="Купи средний латте до 12:00 и получи второй бесплатно!"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Дата начала *</label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Дата окончания *</label>
                    <input
                      type="date"
                      required
                      value={formData.endDate}
                      onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Приоритет</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.priority}
                      onChange={e => setFormData({ ...formData, priority: Number(e.target.value) })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Чем выше, тем раньше применяется</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Бейдж</label>
                    <input
                      type="text"
                      value={formData.badge}
                      onChange={e => setFormData({ ...formData, badge: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="ХИТ"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-5 h-5 text-green-600"
                    />
                    <span className="font-medium">Активна</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.stackable}
                      onChange={e => setFormData({ ...formData, stackable: e.target.checked })}
                      className="w-5 h-5 text-green-600"
                    />
                    <span className="font-medium">Можно комбинировать с другими акциями</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.showOnHome}
                      onChange={e => setFormData({ ...formData, showOnHome: e.target.checked })}
                      className="w-5 h-5 text-green-600"
                    />
                    <span className="font-medium">Показывать на главной странице</span>
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700"
                >
                  Далее: Условия →
                </button>
              </div>
            )}

            {/* Шаг 2: Условия */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Условия акции</h3>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    ← Назад
                  </button>
                </div>

                <p className="text-sm text-gray-600">
                  Акция применится, если все условия выполнены
                </p>

                {/* Список условий */}
                <div className="space-y-3">
                  {formData.conditions.map((condition, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-semibold text-gray-700">
                          Условие {index + 1}: {condition.type}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeCondition(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          ✕
                        </button>
                      </div>
                      
                      {/* Редактирование условия */}
                      {condition.type === 'time_range' && (
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="time"
                            value={condition.timeRange?.start || ''}
                            onChange={e => {
                              const newConditions = [...formData.conditions];
                              newConditions[index].timeRange = {
                                ...newConditions[index].timeRange!,
                                start: e.target.value
                              };
                              setFormData({ ...formData, conditions: newConditions });
                            }}
                            className="px-3 py-2 border rounded"
                          />
                          <input
                            type="time"
                            value={condition.timeRange?.end || ''}
                            onChange={e => {
                              const newConditions = [...formData.conditions];
                              newConditions[index].timeRange = {
                                ...newConditions[index].timeRange!,
                                end: e.target.value
                              };
                              setFormData({ ...formData, conditions: newConditions });
                            }}
                            className="px-3 py-2 border rounded"
                          />
                        </div>
                      )}

                      {condition.type === 'product_quantity' && (
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            placeholder="ID товара"
                            value={condition.productId || ''}
                            onChange={e => {
                              const newConditions = [...formData.conditions];
                              newConditions[index].productId = Number(e.target.value);
                              setFormData({ ...formData, conditions: newConditions });
                            }}
                            className="px-3 py-2 border rounded"
                          />
                          <input
                            type="number"
                            placeholder="Минимум штук"
                            min="1"
                            value={condition.minQuantity || 1}
                            onChange={e => {
                              const newConditions = [...formData.conditions];
                              newConditions[index].minQuantity = Number(e.target.value);
                              setFormData({ ...formData, conditions: newConditions });
                            }}
                            className="px-3 py-2 border rounded"
                          />
                        </div>
                      )}

                      {condition.type === 'min_cart_value' && (
                        <input
                          type="number"
                          placeholder="Минимальная сумма"
                          min="0"
                          value={condition.minValue || 0}
                          onChange={e => {
                            const newConditions = [...formData.conditions];
                            newConditions[index].minValue = Number(e.target.value);
                            setFormData({ ...formData, conditions: newConditions });
                          }}
                          className="w-full px-3 py-2 border rounded"
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Кнопки добавления условий */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => addCondition('time_range')}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                  >
                    + Время
                  </button>
                  <button
                    type="button"
                    onClick={() => addCondition('product_quantity')}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                  >
                    + Товар
                  </button>
                  <button
                    type="button"
                    onClick={() => addCondition('min_cart_value')}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                  >
                    + Сумма
                  </button>
                  <button
                    type="button"
                    onClick={() => addCondition('day_of_week')}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                  >
                    + День недели
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700"
                  disabled={formData.conditions.length === 0}
                >
                  Далее: Награды →
                </button>
              </div>
            )}

            {/* Шаг 3: Награды */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Награды</h3>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    ← Назад
                  </button>
                </div>

                <p className="text-sm text-gray-600">
                  Что получит клиент при выполнении условий
                </p>

                {/* Список наград */}
                <div className="space-y-3">
                  {formData.rewards.map((reward, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-semibold text-gray-700">
                          Награда {index + 1}: {reward.type}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeReward(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          ✕
                        </button>
                      </div>

                      {reward.type === 'percentage_discount' && (
                        <input
                          type="number"
                          placeholder="Процент скидки"
                          min="1"
                          max="100"
                          value={reward.value}
                          onChange={e => {
                            const newRewards = [...formData.rewards];
                            newRewards[index].value = Number(e.target.value);
                            setFormData({ ...formData, rewards: newRewards });
                          }}
                          className="w-full px-3 py-2 border rounded"
                        />
                      )}

                      {reward.type === 'fixed_discount' && (
                        <input
                          type="number"
                          placeholder="Сумма скидки"
                          min="0"
                          value={reward.value}
                          onChange={e => {
                            const newRewards = [...formData.rewards];
                            newRewards[index].value = Number(e.target.value);
                            setFormData({ ...formData, rewards: newRewards });
                          }}
                          className="w-full px-3 py-2 border rounded"
                        />
                      )}

                      {reward.type === 'buy_x_get_y' && (
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="number"
                            placeholder="Купи"
                            min="1"
                            value={reward.buyXGetY?.buyQuantity || 2}
                            onChange={e => {
                              const newRewards = [...formData.rewards];
                              newRewards[index].buyXGetY = {
                                ...newRewards[index].buyXGetY!,
                                buyQuantity: Number(e.target.value)
                              };
                              setFormData({ ...formData, rewards: newRewards });
                            }}
                            className="px-3 py-2 border rounded"
                          />
                          <input
                            type="number"
                            placeholder="Получи"
                            min="1"
                            value={reward.buyXGetY?.getQuantity || 1}
                            onChange={e => {
                              const newRewards = [...formData.rewards];
                              newRewards[index].buyXGetY = {
                                ...newRewards[index].buyXGetY!,
                                getQuantity: Number(e.target.value)
                              };
                              setFormData({ ...formData, rewards: newRewards });
                            }}
                            className="px-3 py-2 border rounded"
                          />
                          <input
                            type="number"
                            placeholder="ID товара"
                            value={reward.buyXGetY?.productId || ''}
                            onChange={e => {
                              const newRewards = [...formData.rewards];
                              newRewards[index].buyXGetY = {
                                ...newRewards[index].buyXGetY!,
                                productId: Number(e.target.value)
                              };
                              setFormData({ ...formData, rewards: newRewards });
                            }}
                            className="px-3 py-2 border rounded"
                          />
                        </div>
                      )}

                      {reward.type === 'bonus_points' && (
                        <input
                          type="number"
                          placeholder="Бонусные баллы"
                          min="0"
                          value={reward.value}
                          onChange={e => {
                            const newRewards = [...formData.rewards];
                            newRewards[index].value = Number(e.target.value);
                            setFormData({ ...formData, rewards: newRewards });
                          }}
                          className="w-full px-3 py-2 border rounded"
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Кнопки добавления наград */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => addReward('percentage_discount')}
                    className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200"
                  >
                    + Скидка %
                  </button>
                  <button
                    type="button"
                    onClick={() => addReward('fixed_discount')}
                    className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200"
                  >
                    + Скидка ₸
                  </button>
                  <button
                    type="button"
                    onClick={() => addReward('buy_x_get_y')}
                    className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200"
                  >
                    + Купи X получи Y
                  </button>
                  <button
                    type="button"
                    onClick={() => addReward('bonus_points')}
                    className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200"
                  >
                    + Бонусы
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={saving || formData.rewards.length === 0}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400"
                >
                  {saving ? 'Сохранение...' : promo ? 'Сохранить изменения' : 'Создать акцию'}
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PromoManager;
