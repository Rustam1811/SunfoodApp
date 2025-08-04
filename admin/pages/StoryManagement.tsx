// ✅ Продакшн-готовый StoryManagement с Firebase Functions
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  PhotoIcon, 
  VideoCameraIcon,
  EyeIcon,
  ClockIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import { SimpleFileUploader } from '../components/SimpleFileUploader';
import { ApiService } from '../../src/services/apiConfig';

interface Story {
  id: string;
  title: string;
  content: {
    type: 'image' | 'video' | 'text';
    url?: string;
    text?: string;
    backgroundColor?: string;
  };
  duration: number;
  linkUrl?: string;
  linkText?: string;
  isActive: boolean;
  viewCount: number;
  createdAt: any;
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
    type: 'text' as 'image' | 'video' | 'text',
    duration: 5,
    linkUrl: '',
    linkText: '',
    isActive: true
  });

  const storyTypes = [
    { value: 'text', label: 'Текст', icon: PencilIcon },
    { value: 'image', label: 'Фото', icon: PhotoIcon },
    { value: 'video', label: 'Видео', icon: VideoCameraIcon }
  ];

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    setLoading(true);
    try {
      const data = await ApiService.stories.getAll();
      setStories(data);
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
      const body = {
        ...formData,
        content: {
          type: formData.type,
          url: formData.type === 'image' ? formData.image : 
               formData.type === 'video' ? formData.video : undefined,
          text: formData.content,
          backgroundColor: '#6366F1'
        }
      };

      if (editingStory) {
        await ApiService.stories.update(editingStory.id, body);
      } else {
        await ApiService.stories.create(body);
      }

      await fetchStories();
      reset();
    } catch (error) {
      console.error('Ошибка сохранения сториса:', error);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFormData({ 
      title: '', 
      content: '', 
      image: '', 
      video: '', 
      type: 'text', 
      duration: 5, 
      linkUrl: '', 
      linkText: '', 
      isActive: true 
    });
    setEditingStory(null);
    setShowModal(false);
  };

  const handleEdit = (story: Story) => {
    setEditingStory(story);
    setFormData({
      title: story.title,
      content: story.content.text || '',
      image: story.content.type === 'image' ? story.content.url || '' : '',
      video: story.content.type === 'video' ? story.content.url || '' : '',
      type: story.content.type,
      duration: story.duration,
      linkUrl: story.linkUrl || '',
      linkText: story.linkText || '',
      isActive: story.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить сторис?')) return;
    
    setLoading(true);
    try {
      await ApiService.stories.delete(id);
      await fetchStories();
    } catch (error) {
      console.error('Ошибка удаления сториса:', error);
    } finally {
      setLoading(false);
    }
  };

  const isStoryActive = (story: Story) => {
    if (!story.isActive) return false;
    // Проверяем, не истёк ли срок действия (24 часа)
    const createdAt = new Date(story.createdAt);
    const now = new Date();
    const hoursPassed = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    return hoursPassed < 24;
  };

  const getTimeLeft = (story: Story) => {
    const createdAt = new Date(story.createdAt);
    const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    
    if (diff <= 0) return 'Истёк';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}ч ${minutes}м`;
    return `${minutes}м`;
  };

  const formatDate = (timestamp: any) => {
    const date = new Date(timestamp);
    return date.toLocaleString('ru-RU');
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Управление сторисами</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowModal(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-purple-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Новый сторис</span>
        </motion.button>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {!loading && stories.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">Нет созданных сторисов</div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Создать первый сторис
          </button>
        </div>
      )}

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
              {story.content.type === 'image' && story.content.url ? (
                <img 
                  src={story.content.url} 
                  alt={story.title}
                  className="w-full h-full object-cover"
                />
              ) : story.content.type === 'video' && story.content.url ? (
                <video 
                  src={story.content.url}
                  className="w-full h-full object-cover"
                  muted
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-500">
                  <div className="text-center text-white p-4">
                    <h3 className="font-bold text-lg mb-2">{story.title}</h3>
                    <p className="text-sm opacity-90">{story.content.text}</p>
                  </div>
                </div>
              )}

              {/* Кнопки управления */}
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
                {story.content.type === 'image' && <PhotoIcon className="w-6 h-6 text-white" />}
                {story.content.type === 'video' && <VideoCameraIcon className="w-6 h-6 text-white" />}
                {story.content.type === 'text' && <PencilIcon className="w-6 h-6 text-white" />}
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
                    {getTimeLeft(story)}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
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
                <SimpleFileUploader
                  onFileUpload={(url) => setFormData({...formData, image: url})}
                  currentUrl={formData.image}
                  label="Изображение истории"
                  maxSize={5}
                  allowVideo={false}
                />
              )}

              {formData.type === 'video' && (
                <SimpleFileUploader
                  onFileUpload={(url) => setFormData({...formData, video: url})}
                  currentUrl={formData.video}
                  label="Видео истории"
                  maxSize={50}
                  allowVideo={true}
                />
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
                  onClick={reset}
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
