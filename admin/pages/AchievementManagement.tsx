import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    TrophyIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    StarIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    condition: string;
    reward: number;
    category: string;
    isActive: boolean;
    createdAt?: string;
}

const AchievementManagement: React.FC = () => {
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        icon: '🏆',
        condition: '',
        reward: 0,
        category: 'general',
        isActive: true
    });

    const categories = [
        { value: 'general', label: 'Общие' },
        { value: 'orders', label: 'Заказы' },
        { value: 'bonus', label: 'Бонусы' },
        { value: 'loyalty', label: 'Лояльность' },
        { value: 'social', label: 'Социальные' }
    ];

    const conditionTypes = [
        'orders_count_5', 'orders_count_10', 'orders_count_25', 'orders_count_50',
        'bonus_earned_1000', 'bonus_earned_5000', 'bonus_earned_10000',
        'first_order', 'weekend_order', 'morning_order', 'evening_order',
        'large_order_5000', 'large_order_10000'
    ];

    useEffect(() => {
        fetchAchievements();
    }, []);

    const fetchAchievements = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://us-central1-coffeeaddict-c9d70.cloudfunctions.net/achievements');
            if (response.ok) {
                const data = await response.json();
                setAchievements(data);
            }
        } catch (error) {
            console.error('Ошибка загрузки достижений:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = 'https://us-central1-coffeeaddict-c9d70.cloudfunctions.net/achievements';
            const method = editingAchievement ? 'PUT' : 'POST';
            const body = editingAchievement 
                ? { id: editingAchievement.id, ...formData }
                : formData;

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                await fetchAchievements();
                setShowModal(false);
                setEditingAchievement(null);
                setFormData({
                    title: '',
                    description: '',
                    icon: '🏆',
                    condition: '',
                    reward: 0,
                    category: 'general',
                    isActive: true
                });
            }
        } catch (error) {
            console.error('Ошибка сохранения достижения:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (achievement: Achievement) => {
        setEditingAchievement(achievement);
        setFormData({
            title: achievement.title,
            description: achievement.description,
            icon: achievement.icon,
            condition: achievement.condition,
            reward: achievement.reward,
            category: achievement.category,
            isActive: achievement.isActive
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Удалить это достижение?')) return;

        setLoading(true);
        try {
            const response = await fetch('https://us-central1-coffeeaddict-c9d70.cloudfunctions.net/achievements', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });

            if (response.ok) {
                await fetchAchievements();
            }
        } catch (error) {
            console.error('Ошибка удаления достижения:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center space-x-3">
                    <TrophyIcon className="w-8 h-8 text-yellow-500" />
                    <h1 className="text-3xl font-bold text-gray-900">Управление достижениями</h1>
                </div>
                
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>Добавить достижение</span>
                </button>
            </div>

            {/* Список достижений */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.map((achievement) => (
                    <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <span className="text-3xl">{achievement.icon}</span>
                                <div>
                                    <h3 className="font-semibold text-lg text-gray-900">{achievement.title}</h3>
                                    <span className="text-sm text-gray-500 capitalize">{achievement.category}</span>
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleEdit(achievement)}
                                    className="text-blue-600 hover:text-blue-800 p-1"
                                >
                                    <PencilIcon className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(achievement.id)}
                                    className="text-red-600 hover:text-red-800 p-1"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <p className="text-gray-600 text-sm mb-4">{achievement.description}</p>

                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2">
                                <StarIcon className="w-4 h-4 text-yellow-500" />
                                <span className="text-gray-600">+{achievement.reward} бонусов</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                {achievement.isActive ? (
                                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                ) : (
                                    <div className="w-4 h-4 rounded-full bg-gray-300" />
                                )}
                                <span className={achievement.isActive ? "text-green-600" : "text-gray-500"}>
                                    {achievement.isActive ? "Активно" : "Неактивно"}
                                </span>
                            </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-100">
                            <span className="text-xs text-gray-500">Условие: {achievement.condition}</span>
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
                        className="bg-white rounded-xl p-6 w-full max-w-md"
                    >
                        <h2 className="text-2xl font-bold mb-6">
                            {editingAchievement ? 'Редактировать достижение' : 'Новое достижение'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Название
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    rows={3}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Иконка
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.icon}
                                        onChange={(e) => setFormData({...formData, icon: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="🏆"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Награда (бонусы)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.reward}
                                        onChange={(e) => setFormData({...formData, reward: parseInt(e.target.value) || 0})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Категория
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    {categories.map(cat => (
                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Условие
                                </label>
                                <select
                                    value={formData.condition}
                                    onChange={(e) => setFormData({...formData, condition: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Выберите условие</option>
                                    {conditionTypes.map(condition => (
                                        <option key={condition} value={condition}>{condition}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                                    className="mr-2"
                                />
                                <label htmlFor="isActive" className="text-sm text-gray-700">
                                    Активно
                                </label>
                            </div>

                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingAchievement(null);
                                    }}
                                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Отмена
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
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

export default AchievementManagement;
