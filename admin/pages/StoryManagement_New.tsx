import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  ArchiveBoxIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  ClockIcon,
  PhotoIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  CalendarIcon,
  LinkIcon
} from '@heroicons/react/24/outline';
import { ApiService } from '../../src/services/apiConfig';
import { StoryFileUploader } from '../../src/components/StoryFileUploader';
import { TextSlideEditor } from '../../src/components/TextSlideEditor';
import { Story, StoryContentType, StoryFilter, STORY_LIMITS } from '../../src/types/story';

interface StoryFormData {
  title: string;
  contentType: StoryContentType | null;
  mediaUrl?: string;
  textContent?: string;
  background?: { type: 'color' | 'gradient'; value: string };
  duration: number;
  link?: string;
  linkText?: string;
  publishAt?: string;
  fileSize?: number;
  originalFileName?: string;
}

export const StoryManagement: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [filter, setFilter] = useState<StoryFilter>('active');
  const [selectedFile, setSelectedFile] = useState<{ file: File; url: string } | null>(null);
  
  const [formData, setFormData] = useState<StoryFormData>({
    title: '',
    contentType: null,
    duration: 5000,
    background: { type: 'color', value: '#FF6B6B' }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      setLoading(true);
      const response = await ApiService.stories.getAll();
      setStories(response || []);
    } catch (error) {
      console.error('Ошибка загрузки stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Заголовок обязателен';
    } else if (formData.title.length > STORY_LIMITS.TEXT.TITLE_MAX_LENGTH) {
      newErrors.title = `Заголовок не должен превышать ${STORY_LIMITS.TEXT.TITLE_MAX_LENGTH} символов`;
    }

    if (!formData.contentType) {
      newErrors.contentType = 'Выберите тип контента';
    }

    if (formData.contentType === 'text') {
      if (!formData.textContent?.trim()) {
        newErrors.textContent = 'Текст слайда обязателен';
      } else if (formData.textContent.length > STORY_LIMITS.TEXT.MAX_LENGTH) {
        newErrors.textContent = `Текст не должен превышать ${STORY_LIMITS.TEXT.MAX_LENGTH} символов`;
      }
    }

    if ((formData.contentType === 'image' || formData.contentType === 'video') && !formData.mediaUrl && !selectedFile) {
      newErrors.media = 'Загрузите файл';
    }

    if (formData.duration < 1000 || formData.duration > 30000) {
      newErrors.duration = 'Длительность должна быть от 1 до 30 секунд';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const submitData = {
        ...formData,
        mediaUrl: selectedFile?.url || formData.mediaUrl,
        fileSize: selectedFile?.file.size,
        originalFileName: selectedFile?.file.name
      };

      if (editingStory) {
        await ApiService.stories.update(editingStory.id, submitData);
      } else {
        await ApiService.stories.create(submitData);
      }

      await loadStories();
      resetForm();
    } catch (error: any) {
      console.error('Ошибка сохранения story:', error);
      alert(`Ошибка: ${error.message || 'Не удалось сохранить story'}`);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      contentType: null,
      duration: 5000,
      background: { type: 'color', value: '#FF6B6B' }
    });
    setSelectedFile(null);
    setErrors({});
    setShowForm(false);
    setEditingStory(null);
  };

  const handleEdit = (story: Story) => {
    setEditingStory(story);
    setFormData({
      title: story.title,
      contentType: story.contentType,
      mediaUrl: story.mediaUrl,
      textContent: story.textContent || '',
      background: story.background || { type: 'color', value: '#FF6B6B' },
      duration: story.duration,
      link: story.link || '',
      linkText: story.linkText || '',
      publishAt: story.publishAt ? new Date(story.publishAt).toISOString().slice(0, 16) : ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить эту story?')) return;
    
    try {
      await ApiService.stories.delete(id);
      await loadStories();
    } catch (error) {
      console.error('Ошибка удаления:', error);
      alert('Ошибка удаления story');
    }
  };

  const handleClone = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/stories/${id}/clone`, {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error('Ошибка клонирования');
      
      await loadStories();
      alert('Story успешно клонирована');
    } catch (error) {
      console.error('Ошибка клонирования:', error);
      alert('Ошибка клонирования story');
    }
  };

  const handleFileUpload = (file: File, url: string) => {
    setSelectedFile({ file, url });
    setFormData(prev => ({ ...prev, mediaUrl: url }));
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    setFormData(prev => ({ ...prev, mediaUrl: '' }));
  };

  const getFilteredStories = () => {
    const now = new Date();
    
    return stories.filter(story => {
      const expiresAt = new Date(story.expiresAt);
      const isExpired = expiresAt < now;
      
      switch (filter) {
        case 'active':
          return story.isActive && !isExpired;
        case 'archived':
          return !story.isActive || isExpired;
        case 'scheduled':
          return story.publishAt && new Date(story.publishAt) > now;
        default:
          return true;
      }
    });
  };

  const getContentTypeIcon = (type: StoryContentType) => {
    switch (type) {
      case 'image': return <PhotoIcon className="w-5 h-5" />;
      case 'video': return <VideoCameraIcon className="w-5 h-5" />;
      case 'text': return <DocumentTextIcon className="w-5 h-5" />;
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'Не указано';
    return new Date(date).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (story: Story) => {
    return new Date(story.expiresAt) < new Date();
  };

  const getTimeLeft = (expiresAt: any) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) return 'Истекла';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours > 0) return `${hours}ч`;
    
    const minutes = Math.floor(diff / (1000 * 60));
    return `${minutes}м`;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Управление Stories</h1>
          <p className="text-gray-600 mt-2">Instagram-подобные истории для вашего приложения</p>
        </div>
        
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Создать Story</span>
        </button>
      </div>

      {/* Фильтры */}
      <div className="flex space-x-2 mb-6">
        {[
          { key: 'active', label: 'Активные', count: stories.filter(s => s.isActive && !isExpired(s)).length },
          { key: 'archived', label: 'Архив', count: stories.filter(s => !s.isActive || isExpired(s)).length },
          { key: 'scheduled', label: 'Запланированные', count: stories.filter(s => s.publishAt && new Date(s.publishAt) > new Date()).length },
          { key: 'all', label: 'Все', count: stories.length }
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key as StoryFilter)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === key
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {/* Список Stories */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {getFilteredStories().map((story) => (
            <div key={story.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Предпросмотр контента */}
              <div className="relative h-48 bg-gray-100">
                {story.contentType === 'image' && story.mediaUrl && (
                  <img src={story.mediaUrl} alt={story.title} className="w-full h-full object-cover" />
                )}
                {story.contentType === 'video' && story.mediaUrl && (
                  <video src={story.mediaUrl} className="w-full h-full object-cover" />
                )}
                {story.contentType === 'text' && (
                  <div 
                    className="w-full h-full flex items-center justify-center p-4 text-white"
                    style={
                      story.background?.type === 'gradient' 
                        ? { background: story.background.value }
                        : { backgroundColor: story.background?.value || '#FF6B6B' }
                    }
                  >
                    <p className="text-center font-medium">{story.textContent}</p>
                  </div>
                )}
                
                {/* Статус и тип */}
                <div className="absolute top-2 left-2 flex space-x-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    isExpired(story) 
                      ? 'bg-red-500 text-white' 
                      : story.isActive 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-500 text-white'
                  }`}>
                    {isExpired(story) ? 'Истекла' : story.isActive ? 'Активна' : 'Неактивна'}
                  </span>
                  <span className="bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
                    {getContentTypeIcon(story.contentType)}
                    <span>{story.contentType}</span>
                  </span>
                </div>

                {/* Время до истечения */}
                <div className="absolute top-2 right-2">
                  <span className="bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
                    <ClockIcon className="w-3 h-3" />
                    <span>{getTimeLeft(story.expiresAt)}</span>
                  </span>
                </div>
              </div>

              {/* Информация */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 truncate">{story.title}</h3>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-1">
                      <EyeIcon className="w-4 h-4" />
                      <span>{story.viewCount} просмотров</span>
                    </span>
                    <span>{(story.duration / 1000).toFixed(1)}с</span>
                  </div>
                  
                  {story.link && (
                    <div className="flex items-center space-x-1 text-blue-600">
                      <LinkIcon className="w-4 h-4" />
                      <span className="truncate">{story.linkText || 'Ссылка'}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-1">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{formatDate(story.createdAt)}</span>
                  </div>
                </div>

                {/* Кнопки действий */}
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={() => handleEdit(story)}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded flex items-center justify-center space-x-1 transition-colors"
                  >
                    <PencilIcon className="w-4 h-4" />
                    <span>Изменить</span>
                  </button>
                  
                  <button
                    onClick={() => handleClone(story.id)}
                    className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-3 rounded transition-colors"
                    title="Клонировать"
                  >
                    <DocumentDuplicateIcon className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => handleDelete(story.id)}
                    className="bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded transition-colors"
                    title="Удалить"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Форма создания/редактирования */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingStory ? 'Редактировать Story' : 'Создать новую Story'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Заголовок */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Заголовок*
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Введите заголовок..."
                    maxLength={STORY_LIMITS.TEXT.TITLE_MAX_LENGTH}
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>{errors.title && <span className="text-red-500">{errors.title}</span>}</span>
                    <span>{formData.title.length}/{STORY_LIMITS.TEXT.TITLE_MAX_LENGTH}</span>
                  </div>
                </div>

                {/* Тип контента */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Тип контента*
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { type: 'image' as const, icon: PhotoIcon, label: 'Фото', desc: 'JPG, PNG, WebP до 5 МБ' },
                      { type: 'video' as const, icon: VideoCameraIcon, label: 'Видео', desc: 'MP4, WebM до 30 МБ, 30с' },
                      { type: 'text' as const, icon: DocumentTextIcon, label: 'Текст', desc: 'Текстовый слайд с фоном' }
                    ].map(({ type, icon: Icon, label, desc }) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, contentType: type }))}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          formData.contentType === type
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <Icon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                        <div className="text-sm font-medium">{label}</div>
                        <div className="text-xs text-gray-500 mt-1">{desc}</div>
                      </button>
                    ))}
                  </div>
                  {errors.contentType && <p className="text-red-500 text-sm mt-1">{errors.contentType}</p>}
                </div>

                {/* Контент в зависимости от типа */}
                {formData.contentType === 'text' && (
                  <TextSlideEditor
                    text={formData.textContent || ''}
                    background={formData.background || { type: 'color', value: '#FF6B6B' }}
                    onTextChange={(text) => setFormData(prev => ({ ...prev, textContent: text }))}
                    onBackgroundChange={(background) => setFormData(prev => ({ ...prev, background }))}
                  />
                )}

                {(formData.contentType === 'image' || formData.contentType === 'video') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Файл*
                    </label>
                    <StoryFileUploader
                      contentType={formData.contentType}
                      onUpload={handleFileUpload}
                      onRemove={handleFileRemove}
                      currentFile={selectedFile ? { url: selectedFile.url, name: selectedFile.file.name } : undefined}
                    />
                    {errors.media && <p className="text-red-500 text-sm mt-1">{errors.media}</p>}
                  </div>
                )}

                {/* Настройки */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Длительность */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Длительность (секунды)*
                    </label>
                    <input
                      type="number"
                      value={formData.duration / 1000}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: parseFloat(e.target.value) * 1000 }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="1"
                      max="30"
                      step="0.5"
                    />
                    {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
                  </div>

                  {/* Отложенная публикация */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Опубликовать в (опционально)
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.publishAt || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, publishAt: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Ссылка */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ссылка (опционально)
                    </label>
                    <input
                      type="url"
                      value={formData.link || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Текст кнопки
                    </label>
                    <input
                      type="text"
                      value={formData.linkText || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, linkText: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Подробнее"
                    />
                  </div>
                </div>

                {/* Кнопки */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                  >
                    {editingStory ? 'Обновить' : 'Создать'} Story
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Отмена
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryManagement;
