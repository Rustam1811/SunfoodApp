import React, { useState } from 'react';
import { StoryBackground } from '../types/story';

interface TextSlideEditorProps {
  text: string;
  background: StoryBackground;
  onTextChange: (text: string) => void;
  onBackgroundChange: (background: StoryBackground) => void;
  className?: string;
}

const PRESET_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
  '#FF9FF3', '#A8E6CF', '#FFD93D', '#6C5CE7', '#FD79A8'
];

const PRESET_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)'
];

export const TextSlideEditor: React.FC<TextSlideEditorProps> = ({
  text,
  background,
  onTextChange,
  onBackgroundChange,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'color' | 'gradient'>('color');

  const handleColorSelect = (color: string) => {
    onBackgroundChange({ type: 'color', value: color });
  };

  const handleGradientSelect = (gradient: string) => {
    onBackgroundChange({ type: 'gradient', value: gradient });
  };

  const getPreviewStyle = () => {
    if (background.type === 'gradient') {
      return { background: background.value };
    }
    return { backgroundColor: background.value };
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Предпросмотр */}
      <div className="relative">
        <div 
          className="w-full h-64 rounded-lg flex items-center justify-center p-6 text-white shadow-lg"
          style={getPreviewStyle()}
        >
          <div className="text-center">
            <p className="text-xl font-bold leading-relaxed break-words">
              {text || 'Введите текст для слайда...'}
            </p>
          </div>
        </div>
        
        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          Предпросмотр
        </div>
      </div>

      {/* Редактор текста */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Текст слайда (1-3 предложения)
        </label>
        <textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Введите текст для слайда..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          rows={3}
          maxLength={150}
        />
        <div className="text-right text-sm text-gray-500 mt-1">
          {text.length}/150 символов
        </div>
      </div>

      {/* Выбор фона */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Фон слайда
        </label>
        
        {/* Табы */}
        <div className="flex space-x-1 mb-4">
          <button
            onClick={() => setActiveTab('color')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'color'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Цвет
          </button>
          <button
            onClick={() => setActiveTab('gradient')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'gradient'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Градиент
          </button>
        </div>

        {/* Выбор цвета */}
        {activeTab === 'color' && (
          <div className="grid grid-cols-5 gap-3">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => handleColorSelect(color)}
                className={`w-12 h-12 rounded-lg border-2 transition-all hover:scale-110 ${
                  background.type === 'color' && background.value === color
                    ? 'border-gray-800 shadow-lg'
                    : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        )}

        {/* Выбор градиента */}
        {activeTab === 'gradient' && (
          <div className="grid grid-cols-4 gap-3">
            {PRESET_GRADIENTS.map((gradient, index) => (
              <button
                key={index}
                onClick={() => handleGradientSelect(gradient)}
                className={`w-16 h-12 rounded-lg border-2 transition-all hover:scale-105 ${
                  background.type === 'gradient' && background.value === gradient
                    ? 'border-gray-800 shadow-lg'
                    : 'border-gray-300'
                }`}
                style={{ background: gradient }}
                title={`Градиент ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Кастомный цвет */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Или выберите свой цвет:
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={background.type === 'color' ? background.value : '#FF6B6B'}
              onChange={(e) => handleColorSelect(e.target.value)}
              className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <span className="text-sm text-gray-500">
              {background.type === 'color' ? background.value : '#FF6B6B'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
