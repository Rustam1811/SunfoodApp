import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    CogIcon, 
    StarIcon, 
    CalculatorIcon,
    CurrencyDollarIcon,
    GiftIcon,
    PlusIcon,
    TrashIcon
} from '@heroicons/react/24/outline';

interface BonusSettings {
    baseRate: number; // Базовый процент начисления (например, 5%)
    multipliers: {
        morningBonus: number; // Множитель для утренних заказов
        eveningBonus: number; // Множитель для вечерних заказов
        weekendBonus: number; // Множитель для выходных
        vipBonus: number; // Множитель для VIP клиентов
    };
    categories: {
        [key: string]: number; // Множители для категорий товаров
    };
    rewards: Array<{
        id: string;
        name: string;
        description: string;
        cost: number; // Стоимость в бонусах
        discount: number; // Размер скидки в тенге или процентах
        type: 'fixed' | 'percentage'; // Тип скидки
        category?: string; // Категория товаров для скидки
        isActive: boolean;
    }>;
    levels: Array<{
        name: string;
        minOrders: number;
        bonusMultiplier: number;
        benefits: string[];
    }>;
}

const BonusManagement: React.FC = () => {
    const [settings, setSettings] = useState<BonusSettings>({
        baseRate: 5,
        multipliers: {
            morningBonus: 1.5,
            eveningBonus: 1.2,
            weekendBonus: 2.0,
            vipBonus: 1.5
        },
        categories: {
            'coffee': 1.0,
            'desserts': 1.2,
            'breakfast': 0.8,
            'special': 2.0
        },
        rewards: [
            {
                id: '1',
                name: 'Скидка 200₸',
                description: 'Скидка 200 тенге на любой заказ',
                cost: 100,
                discount: 200,
                type: 'fixed',
                isActive: true
            },
            {
                id: '2',
                name: 'Скидка 15% на кофе',
                description: 'Скидка 15% на все кофейные напитки',
                cost: 150,
                discount: 15,
                type: 'percentage',
                category: 'coffee',
                isActive: true
            }
        ],
        levels: [
            {
                name: 'Новичок',
                minOrders: 0,
                bonusMultiplier: 1.0,
                benefits: ['Базовые бонусы']
            },
            {
                name: 'Любитель',
                minOrders: 10,
                bonusMultiplier: 1.2,
                benefits: ['+20% к бонусам', 'Персональные предложения']
            },
            {
                name: 'Эксперт',
                minOrders: 50,
                bonusMultiplier: 1.5,
                benefits: ['+50% к бонусам', 'Раннее уведомление о новинках', 'Бесплатная доставка']
            },
            {
                name: 'VIP',
                minOrders: 100,
                bonusMultiplier: 2.0,
                benefits: ['+100% к бонусам', 'Персональный менеджер', 'Эксклюзивные предложения']
            }
        ]
    });

    const [activeTab, setActiveTab] = useState<'general' | 'rewards' | 'levels'>('general');
    const [loading, setLoading] = useState(false);

    // Загрузка настроек из API
    useEffect(() => {
        fetchBonusSettings();
    }, []);

    const fetchBonusSettings = async () => {
        try {
            const response = await fetch('/api/bonus-settings');
            if (response.ok) {
                const data = await response.json();
                setSettings(data);
            }
        } catch (error) {
            console.error('Ошибка загрузки настроек бонусов:', error);
        }
    };

    const saveBonusSettings = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/bonus-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });

            if (response.ok) {
                alert('Настройки сохранены!');
            } else {
                alert('Ошибка сохранения настроек');
            }
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            alert('Ошибка сохранения настроек');
        } finally {
            setLoading(false);
        }
    };

    const calculateBonus = (orderAmount: number, conditions: any = {}) => {
        let bonus = (orderAmount * settings.baseRate) / 100;

        // Применяем множители
        if (conditions.isMorning) bonus *= settings.multipliers.morningBonus;
        if (conditions.isEvening) bonus *= settings.multipliers.eveningBonus;
        if (conditions.isWeekend) bonus *= settings.multipliers.weekendBonus;
        if (conditions.isVip) bonus *= settings.multipliers.vipBonus;

        // Применяем множитель категории
        if (conditions.category && settings.categories[conditions.category]) {
            bonus *= settings.categories[conditions.category];
        }

        return Math.floor(bonus);
    };

    const addNewReward = () => {
        const newReward = {
            id: Date.now().toString(),
            name: 'Новая награда',
            description: 'Описание награды',
            cost: 100,
            discount: 10,
            type: 'percentage' as const,
            isActive: true
        };
        setSettings(prev => ({
            ...prev,
            rewards: [...prev.rewards, newReward]
        }));
    };

    const removeReward = (id: string) => {
        setSettings(prev => ({
            ...prev,
            rewards: prev.rewards.filter(r => r.id !== id)
        }));
    };

    return (
        <div className="p-6 bg-zinc-900 min-h-screen text-white">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <StarIcon className="w-6 h-6 text-yellow-500" />
                        Управление бонусной системой
                    </h1>
                    <button
                        onClick={saveBonusSettings}
                        disabled={loading}
                        className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Сохранение...' : 'Сохранить настройки'}
                    </button>
                </div>

                {/* Вкладки */}
                <div className="flex gap-4 mb-6">
                    {[
                        { id: 'general', name: 'Общие настройки', icon: CogIcon },
                        { id: 'rewards', name: 'Награды', icon: GiftIcon },
                        { id: 'levels', name: 'Уровни', icon: StarIcon }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                                activeTab === tab.id 
                                    ? 'bg-yellow-500 text-black' 
                                    : 'bg-zinc-800 text-white hover:bg-zinc-700'
                            }`}
                        >
                            <tab.icon className="w-5 h-5" />
                            {tab.name}
                        </button>
                    ))}
                </div>

                {/* Общие настройки */}
                {activeTab === 'general' && (
                    <div className="space-y-6">
                        <div className="bg-zinc-800 rounded-xl p-6">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <CalculatorIcon className="w-5 h-5" />
                                Формула начисления бонусов
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Базовый процент (%)</label>
                                    <input
                                        type="number"
                                        value={settings.baseRate}
                                        onChange={(e) => setSettings(prev => ({
                                            ...prev,
                                            baseRate: Number(e.target.value)
                                        }))}
                                        className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                    />
                                </div>
                            </div>

                            <h4 className="text-md font-semibold mt-6 mb-3">Множители</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {Object.entries(settings.multipliers).map(([key, value]) => (
                                    <div key={key}>
                                        <label className="block text-sm font-medium mb-2 capitalize">
                                            {key.replace('Bonus', ' бонус')}
                                        </label>
                                        <input
                                            type="number"
                                            value={value}
                                            onChange={(e) => setSettings(prev => ({
                                                ...prev,
                                                multipliers: {
                                                    ...prev.multipliers,
                                                    [key]: Number(e.target.value)
                                                }
                                            }))}
                                            className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white"
                                            min="0"
                                            step="0.1"
                                        />
                                    </div>
                                ))}
                            </div>

                            <h4 className="text-md font-semibold mt-6 mb-3">Множители по категориям</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {Object.entries(settings.categories).map(([category, multiplier]) => (
                                    <div key={category}>
                                        <label className="block text-sm font-medium mb-2 capitalize">
                                            {category}
                                        </label>
                                        <input
                                            type="number"
                                            value={multiplier}
                                            onChange={(e) => setSettings(prev => ({
                                                ...prev,
                                                categories: {
                                                    ...prev.categories,
                                                    [category]: Number(e.target.value)
                                                }
                                            }))}
                                            className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white"
                                            min="0"
                                            step="0.1"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Калькулятор бонусов */}
                        <div className="bg-zinc-800 rounded-xl p-6">
                            <h3 className="text-lg font-bold mb-4">Калькулятор бонусов</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Сумма заказа (₸)</label>
                                    <input
                                        type="number"
                                        placeholder="1000"
                                        className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white"
                                        id="order-amount"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Категория</label>
                                    <select className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white" id="category">
                                        {Object.keys(settings.categories).map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-end">
                                    <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 text-center">
                                        <div className="text-sm text-yellow-400">Бонусы к начислению</div>
                                        <div className="text-lg font-bold text-yellow-300">
                                            {(() => {
                                                const amount = Number((document.getElementById('order-amount') as HTMLInputElement)?.value || 1000);
                                                const category = (document.getElementById('category') as HTMLSelectElement)?.value || 'coffee';
                                                return calculateBonus(amount, { category });
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Награды */}
                {activeTab === 'rewards' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold">Доступные награды</h3>
                            <button
                                onClick={addNewReward}
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                            >
                                <PlusIcon className="w-4 h-4" />
                                Добавить награду
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {settings.rewards.map((reward) => (
                                <motion.div
                                    key={reward.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-zinc-800 rounded-xl p-4 border border-zinc-700"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <input
                                            type="text"
                                            value={reward.name}
                                            onChange={(e) => setSettings(prev => ({
                                                ...prev,
                                                rewards: prev.rewards.map(r => 
                                                    r.id === reward.id ? { ...r, name: e.target.value } : r
                                                )
                                            }))}
                                            className="font-bold bg-transparent border-none text-white text-lg"
                                        />
                                        <button
                                            onClick={() => removeReward(reward.id)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                    
                                    <textarea
                                        value={reward.description}
                                        onChange={(e) => setSettings(prev => ({
                                            ...prev,
                                            rewards: prev.rewards.map(r => 
                                                r.id === reward.id ? { ...r, description: e.target.value } : r
                                            )
                                        }))}
                                        className="w-full bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-sm text-zinc-300 mb-3"
                                        rows={2}
                                    />

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs text-zinc-400">Стоимость (бонусы)</label>
                                            <input
                                                type="number"
                                                value={reward.cost}
                                                onChange={(e) => setSettings(prev => ({
                                                    ...prev,
                                                    rewards: prev.rewards.map(r => 
                                                        r.id === reward.id ? { ...r, cost: Number(e.target.value) } : r
                                                    )
                                                }))}
                                                className="w-full bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-zinc-400">Скидка</label>
                                            <input
                                                type="number"
                                                value={reward.discount}
                                                onChange={(e) => setSettings(prev => ({
                                                    ...prev,
                                                    rewards: prev.rewards.map(r => 
                                                        r.id === reward.id ? { ...r, discount: Number(e.target.value) } : r
                                                    )
                                                }))}
                                                className="w-full bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-3 flex items-center gap-2">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={reward.isActive}
                                                onChange={(e) => setSettings(prev => ({
                                                    ...prev,
                                                    rewards: prev.rewards.map(r => 
                                                        r.id === reward.id ? { ...r, isActive: e.target.checked } : r
                                                    )
                                                }))}
                                                className="rounded"
                                            />
                                            <span className="text-sm">Активна</span>
                                        </label>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Уровни */}
                {activeTab === 'levels' && (
                    <div className="space-y-4">
                        {settings.levels.map((level, index) => (
                            <div key={index} className="bg-zinc-800 rounded-xl p-6">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Название уровня</label>
                                        <input
                                            type="text"
                                            value={level.name}
                                            onChange={(e) => setSettings(prev => ({
                                                ...prev,
                                                levels: prev.levels.map((l, i) => 
                                                    i === index ? { ...l, name: e.target.value } : l
                                                )
                                            }))}
                                            className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Мин. заказов</label>
                                        <input
                                            type="number"
                                            value={level.minOrders}
                                            onChange={(e) => setSettings(prev => ({
                                                ...prev,
                                                levels: prev.levels.map((l, i) => 
                                                    i === index ? { ...l, minOrders: Number(e.target.value) } : l
                                                )
                                            }))}
                                            className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Множитель бонусов</label>
                                        <input
                                            type="number"
                                            value={level.bonusMultiplier}
                                            onChange={(e) => setSettings(prev => ({
                                                ...prev,
                                                levels: prev.levels.map((l, i) => 
                                                    i === index ? { ...l, bonusMultiplier: Number(e.target.value) } : l
                                                )
                                            }))}
                                            className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white"
                                            step="0.1"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Преимущества</label>
                                        <textarea
                                            value={level.benefits.join('\n')}
                                            onChange={(e) => setSettings(prev => ({
                                                ...prev,
                                                levels: prev.levels.map((l, i) => 
                                                    i === index ? { ...l, benefits: e.target.value.split('\n').filter(b => b.trim()) } : l
                                                )
                                            }))}
                                            className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-white text-sm"
                                            rows={3}
                                            placeholder="Каждое преимущество с новой строки"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BonusManagement;
