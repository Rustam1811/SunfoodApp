import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    TagIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    CalendarIcon,
    CheckCircleIcon,
    PhotoIcon
} from '@heroicons/react/24/outline';

interface Promotion {
    id: string;
    title: string;
    description: string;
    image: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    startDate: string;
    endDate: string;
    category: string;
    minOrderAmount: number;
    isActive: boolean;
    usageCount: number;
    createdAt?: string;
}

const PromotionManagement: React.FC = () => {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image: '',
        discountType: 'percentage' as 'percentage' | 'fixed',
        discountValue: 0,
        startDate: '',
        endDate: '',
        category: 'all',
        minOrderAmount: 0,
        isActive: true
    });

    const categories = [
        { value: 'all', label: 'Все категории' },
        { value: 'coffee', label: 'Кофе' },
        { value: 'drinks', label: 'Напитки' },
        { value: 'desserts', label: 'Десерты' },
        { value: 'breakfast', label: 'Завтраки' }
    ];

    useEffect(() => {
        fetchPromotions();
    }, []);

    const fetchPromotions = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://us-central1-coffeeaddict-c9d70.cloudfunctions.net/promotions');
            if (response.ok) {
                const data = await response.json();
                setPromotions(data);
            }
        } catch (error) {
            console.error('Ошибка загрузки акций:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = 'https://us-central1-coffeeaddict-c9d70.cloudfunctions.net/promotions';
            const method = editingPromotion ? 'PUT' : 'POST';
            const body = editingPromotion 
                ? { id: editingPromotion.id, ...formData }
                : formData;

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                await fetchPromotions();
                setShowModal(false);
                setEditingPromotion(null);
                resetForm();
            }
        } catch (error) {
            console.error('Ошибка сохранения акции:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            image: '',
            discountType: 'percentage',
            discountValue: 0,
            startDate: '',
            endDate: '',
            category: 'all',
            minOrderAmount: 0,
            isActive: true
        });
    };

    const handleEdit = (promotion: Promotion) => {
        setEditingPromotion(promotion);
        setFormData({
            title: promotion.title,
            description: promotion.description,
            image: promotion.image,
            discountType: promotion.discountType,
            discountValue: promotion.discountValue,
            startDate: promotion.startDate ? promotion.startDate.split('T')[0] : '',
            endDate: promotion.endDate ? promotion.endDate.split('T')[0] : '',
            category: promotion.category,
            minOrderAmount: promotion.minOrderAmount,
            isActive: promotion.isActive
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Удалить эту акцию?')) return;

        setLoading(true);
        try {
            const response = await fetch('https://us-central1-coffeeaddict-c9d70.cloudfunctions.net/promotions', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });

            if (response.ok) {
                await fetchPromotions();
            }
        } catch (error) {
            console.error('Ошибка удаления акции:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ru-RU');
    };

    const isPromotionActive = (promotion: Promotion) => {
        if (!promotion.isActive) return false;
        const now = new Date();
        const start = new Date(promotion.startDate);
        const end = new Date(promotion.endDate);
        return now >= start && now <= end;
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center space-x-3">
                    <TagIcon className="w-8 h-8 text-red-500" />
                    <h1 className="text-3xl font-bold text-gray-900">Управление акциями</h1>
                </div>
                
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>Добавить акцию</span>
                </button>
            </div>

            {/* Список акций */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {promotions.map((promotion) => (
                    <motion.div
                        key={promotion.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
                    >
                        {promotion.image && (
                            <div className="h-48 bg-gray-200 relative">
                                <img 
                                    src={promotion.image} 
                                    alt={promotion.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-3 right-3 flex space-x-2">
                                    <button
                                        onClick={() => handleEdit(promotion)}
                                        className="bg-white text-blue-600 hover:text-blue-800 p-2 rounded-full shadow-md"
                                    >
                                        <PencilIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(promotion.id)}
                                        className="bg-white text-red-600 hover:text-red-800 p-2 rounded-full shadow-md"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-xl text-gray-900 mb-2">{promotion.title}</h3>
                                    <p className="text-gray-600 text-sm mb-3">{promotion.description}</p>
                                </div>
                                {!promotion.image && (
                                    <div className="flex space-x-2 ml-4">
                                        <button
                                            onClick={() => handleEdit(promotion)}
                                            className="text-blue-600 hover:text-blue-800 p-1"
                                        >
                                            <PencilIcon className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(promotion.id)}
                                            className="text-red-600 hover:text-red-800 p-1"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Скидка */}
                            <div className="bg-red-50 rounded-lg p-4 mb-4">
                                <div className="text-center">
                                    <span className="text-3xl font-bold text-red-600">
                                        {promotion.discountType === 'percentage' 
                                            ? `${promotion.discountValue}%` 
                                            : `${promotion.discountValue}₸`}
                                    </span>
                                    <p className="text-sm text-red-700 mt-1">
                                        {promotion.discountType === 'percentage' ? 'скидка' : 'фиксированная скидка'}
                                    </p>
                                </div>
                            </div>

                            {/* Детали акции */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Период действия:</span>
                                    <div className="flex items-center space-x-1 text-gray-900">
                                        <CalendarIcon className="w-4 h-4" />
                                        <span>{formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Категория:</span>
                                    <span className="text-gray-900 capitalize">{promotion.category}</span>
                                </div>

                                {promotion.minOrderAmount > 0 && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Мин. сумма заказа:</span>
                                        <span className="text-gray-900">{promotion.minOrderAmount}₸</span>
                                    </div>
                                )}

                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Использований:</span>
                                    <span className="text-gray-900">{promotion.usageCount}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Статус:</span>
                                    <div className="flex items-center space-x-2">
                                        {isPromotionActive(promotion) ? (
                                            <>
                                                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                                <span className="text-green-600 text-sm font-medium">Активна</span>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-4 h-4 rounded-full bg-gray-300" />
                                                <span className="text-gray-500 text-sm">Неактивна</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Модальное окно создания/редактирования */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                    >
                        <h2 className="text-2xl font-bold mb-6">
                            {editingPromotion ? 'Редактировать акцию' : 'Новая акция'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Название акции
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Описание
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    rows={3}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    URL изображения
                                </label>
                                <input
                                    type="url"
                                    value={formData.image}
                                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Тип скидки
                                    </label>
                                    <select
                                        value={formData.discountType}
                                        onChange={(e) => setFormData({...formData, discountType: e.target.value as 'percentage' | 'fixed'})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    >
                                        <option value="percentage">Процент (%)</option>
                                        <option value="fixed">Фиксированная сумма (₸)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Размер скидки
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.discountValue}
                                        onChange={(e) => setFormData({...formData, discountValue: parseFloat(e.target.value) || 0})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        min="0"
                                        step={formData.discountType === 'percentage' ? '1' : '0.01'}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Дата начала
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Дата окончания
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Категория
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Минимальная сумма заказа (₸)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.minOrderAmount}
                                        onChange={(e) => setFormData({...formData, minOrderAmount: parseInt(e.target.value) || 0})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="isActivePromotion"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                                    className="mr-2"
                                />
                                <label htmlFor="isActivePromotion" className="text-sm text-gray-700">
                                    Активна
                                </label>
                            </div>

                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingPromotion(null);
                                        resetForm();
                                    }}
                                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Отмена
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Сохранение...' : 'Сохранить'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default PromotionManagement;
