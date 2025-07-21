import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  PhotoIcon, 
  VideoCameraIcon,
  TagIcon,
  SparklesIcon,
  HomeIcon,
  EyeIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';
import { useStoryPacks, usePromotions, useCuratedItems } from '../hooks/useHomePage';
import { StoryPack, Promotion, CuratedItem } from '../types/homePageTypes';

type TabType = 'stories' | 'promotions' | 'curated';

const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('stories');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const storyPacksHook = useStoryPacks();
  const promotionsHook = usePromotions();
  const curatedItemsHook = useCuratedItems();

  const tabs = [
    { 
      id: 'stories' as TabType, 
      name: 'Сторис', 
      icon: PhotoIcon,
      count: storyPacksHook.storyPacks.length 
    },
    { 
      id: 'promotions' as TabType, 
      name: 'Акции', 
      icon: TagIcon,
      count: promotionsHook.promotions.length 
    },
    { 
      id: 'curated' as TabType, 
      name: 'Рекомендации', 
      icon: SparklesIcon,
      count: curatedItemsHook.curatedItems.length 
    }
  ];

  const handleAddNew = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот элемент?')) return;

    try {
      switch (activeTab) {
        case 'stories':
          await storyPacksHook.remove(id);
          break;
        case 'promotions':
          await promotionsHook.remove(id);
          break;
        case 'curated':
          await curatedItemsHook.remove(id);
          break;
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'stories':
        return storyPacksHook.storyPacks;
      case 'promotions':
        return promotionsHook.promotions;
      case 'curated':
        return curatedItemsHook.curatedItems;
      default:
        return [];
    }
  };

  const isLoading = storyPacksHook.loading || promotionsHook.loading || curatedItemsHook.loading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HomeIcon className="h-8 w-8 text-amber-400" />
              <h1 className="text-2xl font-bold text-white">Управление главной страницей</h1>
            </div>
            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 bg-amber-500 text-black px-4 py-2 rounded-lg font-semibold hover:bg-amber-400 transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              Добавить {activeTab === 'stories' ? 'сторис' : activeTab === 'promotions' ? 'акцию' : 'товар'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all relative ${
                  activeTab === tab.id
                    ? 'bg-amber-500 text-black shadow-lg'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <Icon className="h-5 w-5" />
                {tab.name}
                {tab.count > 0 && (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    activeTab === tab.id ? 'bg-black/20' : 'bg-white/20'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {isLoading ? (
              <LoadingSkeleton />
            ) : (
              <ContentGrid
                items={getCurrentData()}
                type={activeTab}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

interface ContentGridProps {
  items: any[];
  type: TabType;
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
}

const ContentGrid: React.FC<ContentGridProps> = ({ items, type, onEdit, onDelete }) => {
  if (items.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-12 border border-white/20 text-center">
        <div className="text-gray-400 mb-4">
          {type === 'stories' && <PhotoIcon className="h-16 w-16 mx-auto mb-4" />}
          {type === 'promotions' && <TagIcon className="h-16 w-16 mx-auto mb-4" />}
          {type === 'curated' && <SparklesIcon className="h-16 w-16 mx-auto mb-4" />}
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Пока нет данных
        </h3>
        <p className="text-gray-300">
          Добавьте первый элемент, нажав кнопку "Добавить" выше
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          type={type}
          onEdit={() => onEdit(item)}
          onDelete={() => onDelete(item.id)}
        />
      ))}
    </div>
  );
};

interface ItemCardProps {
  item: StoryPack | Promotion | CuratedItem;
  type: TabType;
  onEdit: () => void;
  onDelete: () => void;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, type, onEdit, onDelete }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 hover:bg-white/15 transition-all duration-300"
    >
      {type === 'stories' && <StoryPackCard item={item as StoryPack} onEdit={onEdit} onDelete={onDelete} />}
      {type === 'promotions' && <PromotionCard item={item as Promotion} onEdit={onEdit} onDelete={onDelete} />}
      {type === 'curated' && <CuratedItemCard item={item as CuratedItem} onEdit={onEdit} onDelete={onDelete} />}
    </motion.div>
  );
};

const StoryPackCard: React.FC<{ item: StoryPack; onEdit: () => void; onDelete: () => void }> = ({ item, onEdit, onDelete }) => (
  <>
    <div className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <img 
          src={item.avatar} 
          alt={item.title}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <h3 className="font-semibold text-white">{item.title}</h3>
          <p className="text-sm text-gray-300">{item.stories.length} историй</p>
        </div>
        <div className={`ml-auto px-2 py-1 rounded-full text-xs font-semibold ${
          item.isActive ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'
        }`}>
          {item.isActive ? 'Активен' : 'Неактивен'}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {item.stories.slice(0, 3).map(story => (
          <div key={story.id} className="relative w-16 h-16 rounded-lg overflow-hidden">
            <img 
              src={story.url} 
              alt={story.header}
              className="w-full h-full object-cover"
            />
            {story.type === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <PlayIcon className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
        ))}
        {item.stories.length > 3 && (
          <div className="w-16 h-16 rounded-lg bg-white/20 flex items-center justify-center">
            <span className="text-sm text-white">+{item.stories.length - 3}</span>
          </div>
        )}
      </div>
    </div>

    <div className="px-6 pb-6 flex gap-2">
      <button 
        onClick={onEdit}
        className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-400 transition-colors flex items-center justify-center gap-2"
      >
        <PencilIcon className="h-4 w-4" />
        Редактировать
      </button>
      <button 
        onClick={onDelete}
        className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-400 transition-colors"
      >
        <TrashIcon className="h-4 w-4" />
      </button>
    </div>
  </>
);

const PromotionCard: React.FC<{ item: Promotion; onEdit: () => void; onDelete: () => void }> = ({ item, onEdit, onDelete }) => (
  <>
    <div className="h-48 relative">
      <img 
        src={item.image} 
        alt={item.title}
        className="w-full h-full object-cover"
      />
      {item.discountPercent && (
        <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full font-bold">
          -{item.discountPercent}%
        </div>
      )}
      <div className={`absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-semibold ${
        item.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
      }`}>
        {item.isActive ? 'Активна' : 'Неактивна'}
      </div>
    </div>

    <div className="p-6">
      <h3 className="font-bold text-white text-lg mb-2">{item.title}</h3>
      <p className="text-gray-300 mb-4 text-sm">{item.description}</p>
      <div className="text-xs text-gray-400 mb-4 space-y-1">
        <p>Действует до: {new Date(item.validUntil).toLocaleDateString('ru-RU')}</p>
        {item.usageLimit && (
          <p>Использовано: {item.currentUsage}/{item.usageLimit}</p>
        )}
      </div>

      <div className="flex gap-2">
        <button 
          onClick={onEdit}
          className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-400 transition-colors flex items-center justify-center gap-2"
        >
          <PencilIcon className="h-4 w-4" />
          Редактировать
        </button>
        <button 
          onClick={onDelete}
          className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-400 transition-colors"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  </>
);

const CuratedItemCard: React.FC<{ item: CuratedItem; onEdit: () => void; onDelete: () => void }> = ({ item, onEdit, onDelete }) => (
  <>
    <div className="h-48 relative">
      <img 
        src={item.image} 
        alt={item.name}
        className="w-full h-full object-cover"
      />
      {item.isRecommended && (
        <div className="absolute top-4 left-4 bg-amber-500 text-black px-3 py-1 rounded-full font-bold text-sm">
          Рекомендуем
        </div>
      )}
    </div>

    <div className="p-6">
      <h3 className="font-bold text-white text-lg mb-2">{item.name}</h3>
      <p className="text-gray-300 mb-4 text-sm">{item.description}</p>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-white">₸{item.price}</span>
          {item.originalPrice && (
            <span className="text-sm text-gray-400 line-through">₸{item.originalPrice}</span>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <button 
          onClick={onEdit}
          className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-400 transition-colors flex items-center justify-center gap-2"
        >
          <PencilIcon className="h-4 w-4" />
          Редактировать
        </button>
        <button 
          onClick={onDelete}
          className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-400 transition-colors"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  </>
);

const LoadingSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="bg-white/10 rounded-2xl p-6 animate-pulse">
        <div className="h-48 bg-white/20 rounded-lg mb-4"></div>
        <div className="h-4 bg-white/20 rounded mb-2"></div>
        <div className="h-3 bg-white/20 rounded mb-4 w-2/3"></div>
        <div className="flex gap-2">
          <div className="flex-1 h-8 bg-white/20 rounded"></div>
          <div className="w-8 h-8 bg-white/20 rounded"></div>
        </div>
      </div>
    ))}
  </div>
);

export default HomePage;
