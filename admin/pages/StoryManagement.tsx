import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    PlayIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon,
    ClockIcon,
    PhotoIcon,
    VideoCameraIcon
} from '@heroicons/react/24/outline';

interface Story {
    id: string;
    title: string;
    content: string;
    image: string;
    video: string;
    type: 'image' | 'video' | 'text';
    duration: number;
    linkUrl: string;
    linkText: string;
    isActive: boolean;
    viewCount: number;
    createdAt: string;
    expiresAt: string;
}

const StoryManagement: React.FC = () => {
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingStory, setEditingStory] = useState<Story | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        image: '',
        video: '',
        type: 'image' as 'image' | 'video' | 'text',
        duration: 5,
        linkUrl: '',
        linkText: '',
        isActive: true
    });

    const storyTypes = [
        { value: 'image', label: 'Изображение', icon: PhotoIcon },
        { value: 'video', label: 'Видео', icon: VideoCameraIcon },
        { value: 'text', label: 'Текст', icon: PencilIcon }
    ];

    useEffect(() => {
        fetchStories();
    }, []);

    const fetchStories = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://us-central1-coffeeaddict-c9d70.cloudfunctions.net/stories');
            if (response.ok) {
                const data = await response.json();
                setStories(data);
            }
        } catch (error) {
            console.error('Ошибка загрузки сторисов:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = 'https://us-central1-coffeeaddict-c9d70.cloudfunctions.net/stories';
            const method = editingStory ? 'PUT' : 'POST';
            const body = editingStory 
                ? { id: editingStory.id, ...formData }
                : formData;

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                await fetchStories();
                setShowModal(false);
                setEditingStory(null);
                resetForm();
            }
        } catch (error) {
            console.error('Ошибка сохранения сториса:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            content: '',
            image: '',
            video: '',
            type: 'image',
            duration: 5,
            linkUrl: '',
            linkText: '',
            isActive: true
        });
    };

    const handleEdit = (story: Story) => {
        setEditingStory(story);
        setFormData({
            title: story.title,
            content: story.content,
            image: story.image,
            video: story.video,
            type: story.type,
            duration: story.duration,
            linkUrl: story.linkUrl,
            linkText: story.linkText,
            isActive: story.isActive
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Удалить этот сторис?')) return;

        setLoading(true);
        try {
            const response = await fetch('https://us-central1-coffeeaddict-c9d70.cloudfunctions.net/stories', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });

            if (response.ok) {
                await fetchStories();
            }
        } catch (error) {
            console.error('Ошибка удаления сториса:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('ru-RU');
    };

    const isStoryActive = (story: Story) => {
        if (!story.isActive) return false;
        const now = new Date();
        const expires = new Date(story.expiresAt);
        return now <= expires;
    };

    const getTimeRemaining = (expiresAt: string) => {
        const now = new Date();
        const expires = new Date(expiresAt);
        const diff = expires.getTime() - now.getTime();
        
        if (diff <= 0) return 'Истек';
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours > 0) {
            return `${hours}ч ${minutes}м`;
        }
        return `${minutes}м`;
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center space-x-3">
                    <PlayIcon className="w-8 h-8 text-purple-500" />
                    <h1 className="text-3xl font-bold text-gray-900">Управление сторисами</h1>
                </div>
                
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>Добавить сторис</span>
                </button>
            </div>

            {/* Список сторисов */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {stories.map((story) => (
                    <motion.div
                        key={story.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
                    >
                        {/* Превью */}
                        <div className="h-64 bg-gray-200 relative">
                            {story.type === 'image' && story.image ? (
                                <img 
                                    src={story.image} 
                                    alt={story.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : story.type === 'video' && story.video ? (
                                <video 
                                    src={story.video}
                                    className="w-full h-full object-cover"
                                    muted
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-500">
                                    <div className="text-center text-white p-4">
                                        <h3 className="font-bold text-lg mb-2">{story.title}</h3>
                                        <p className="text-sm opacity-90">{story.content}</p>
                                    </div>
                                </div>
                            )}

                            {/* Оверлей с кнопками */}
                            <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleEdit(story)}
                                        className="bg-white text-blue-600 hover:text-blue-800 p-2 rounded-full shadow-md"
                                    >
                                        <PencilIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(story.id)}
                                        className="bg-white text-red-600 hover:text-red-800 p-2 rounded-full shadow-md"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Статус */}
                            <div className="absolute top-3 left-3">
                                {isStoryActive(story) ? (
                                    <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                        Активен
                                    </span>
                                ) : (
                                    <span className="bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                        Неактивен
                                    </span>
                                )}
                            </div>

                            {/* Тип контента */}
                            <div className="absolute top-3 right-3">
                                {story.type === 'image' && <PhotoIcon className="w-6 h-6 text-white" />}
                                {story.type === 'video' && <VideoCameraIcon className="w-6 h-6 text-white" />}
                                {story.type === 'text' && <PencilIcon className="w-6 h-6 text-white" />}
                            </div>
                        </div>

                        {/* Информация */}
                        <div className="p-4">
                            <h3 className="font-semibold text-lg text-gray-900 mb-2 truncate">{story.title}</h3>
                            
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Просмотры:</span>
                                    <div className="flex items-center space-x-1">
                                        <EyeIcon className="w-4 h-4 text-gray-500" />
                                        <span className="text-gray-900">{story.viewCount}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Длительность:</span>
                                    <div className="flex items-center space-x-1">
                                        <ClockIcon className="w-4 h-4 text-gray-500" />
                                        <span className="text-gray-900">{story.duration}с</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Осталось:</span>
                                    <span className={`font-medium ${
                                        isStoryActive(story) ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                        {getTimeRemaining(story.expiresAt)}
                                    </span>
                                </div>

                                <div className="pt-2 border-t border-gray-100">
                                    <span className="text-xs text-gray-500">
                                        Создан: {formatDate(story.createdAt)}
                                    </span>
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
                            {editingStory ? 'Редактировать сторис' : 'Новый сторис'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Заголовок
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Тип контента
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {storyTypes.map((type) => (
                                        <button
                                            key={type.value}
                                            type="button"
                                            onClick={() => setFormData({...formData, type: type.value as "image" | "video" | "text"})}
                                            className={`p-3 rounded-lg border-2 transition-colors flex flex-col items-center space-y-2 ${
                                                formData.type === type.value
                                                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                                                    : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                        >
                                            <type.icon className="w-6 h-6" />
                                            <span className="text-sm font-medium">{type.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Контент
                                </label>
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    rows={3}
                                    required
                                />
                            </div>

                            {formData.type === 'image' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        URL изображения
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.image}
                                        onChange={(e) => setFormData({...formData, image: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>
                            )}

                            {formData.type === 'video' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        URL видео
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.video}
                                        onChange={(e) => setFormData({...formData, video: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="https://example.com/video.mp4"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Длительность показа (секунды)
                                </label>
                                <input
                                    type="number"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || 5})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    min="1"
                                    max="30"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ссылка для перехода
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.linkUrl}
                                        onChange={(e) => setFormData({...formData, linkUrl: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="https://example.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Текст кнопки
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.linkText}
                                        onChange={(e) => setFormData({...formData, linkText: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="Подробнее"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="isActiveStory"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                                    className="mr-2"
                                />
                                <label htmlFor="isActiveStory" className="text-sm text-gray-700">
                                    Активен (автоматически истекает через 24 часа)
                                </label>
                            </div>

                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingStory(null);
                                        resetForm();
                                    }}
                                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Отмена
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
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

export default StoryManagement;
