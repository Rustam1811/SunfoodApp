import React, { useState, useRef } from 'react';
import { CloudArrowUpIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { STORY_LIMITS } from '../types/story';

interface StoryFileUploaderProps {
  onUpload: (file: File, url: string) => void;
  onRemove: () => void;
  contentType: 'image' | 'video' | null;
  currentFile?: { url: string; name: string };
  className?: string;
}

export const StoryFileUploader: React.FC<StoryFileUploaderProps> = ({
  onUpload,
  onRemove,
  contentType,
  currentFile,
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File) => {
    if (!contentType) {
      throw new Error('Сначала выберите тип контента');
    }

    if (contentType === 'image') {
      if (!STORY_LIMITS.IMAGE.FORMATS.includes(file.type)) {
        throw new Error('Поддерживаются только JPG, PNG, WebP');
      }
      if (file.size > STORY_LIMITS.IMAGE.MAX_SIZE) {
        throw new Error('Размер изображения не должен превышать 5 МБ');
      }
    } else if (contentType === 'video') {
      if (!STORY_LIMITS.VIDEO.FORMATS.includes(file.type)) {
        throw new Error('Поддерживаются только MP4, WebM');
      }
      if (file.size > STORY_LIMITS.VIDEO.MAX_SIZE) {
        throw new Error('Размер видео не должен превышать 30 МБ');
      }
    }
  };

  const processFile = async (file: File) => {
    try {
      setError('');
      setUploading(true);

      validateFile(file);

      // Для видео проверяем длительность
      if (contentType === 'video') {
        const duration = await getVideoDuration(file);
        if (duration > STORY_LIMITS.VIDEO.MAX_DURATION) {
          throw new Error('Длительность видео не должна превышать 30 секунд');
        }
      }

      // Создаем URL для предпросмотра
      const url = URL.createObjectURL(file);
      onUpload(file, url);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };
      
      video.onerror = () => {
        reject(new Error('Не удалось загрузить видео'));
      };
      
      video.src = URL.createObjectURL(file);
    });
  };

  const handleFiles = (files: FileList | null) => {
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemove = () => {
    setError('');
    onRemove();
  };

  const getAcceptedTypes = () => {
    if (contentType === 'image') {
      return STORY_LIMITS.IMAGE.FORMATS.join(',');
    } else if (contentType === 'video') {
      return STORY_LIMITS.VIDEO.FORMATS.join(',');
    }
    return '';
  };

  const getMaxSize = () => {
    if (contentType === 'image') {
      return '5 МБ';
    } else if (contentType === 'video') {
      return '30 МБ, до 30 сек';
    }
    return '';
  };

  return (
    <div className={`w-full ${className}`}>
      {currentFile ? (
        // Предпросмотр загруженного файла
        <div className="relative bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="w-8 h-8 text-green-500" />
              <div>
                <p className="font-medium text-gray-900">{currentFile.name}</p>
                <p className="text-sm text-gray-500">Файл загружен</p>
              </div>
            </div>
            <button
              onClick={handleRemove}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          
          {/* Предпросмотр */}
          <div className="mt-4 flex justify-center">
            {contentType === 'image' ? (
              <img 
                src={currentFile.url} 
                alt="Preview" 
                className="max-h-40 rounded-lg object-cover"
              />
            ) : (
              <video 
                src={currentFile.url} 
                className="max-h-40 rounded-lg"
                controls
                muted
              />
            )}
          </div>
        </div>
      ) : (
        // Зона загрузки
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          } ${!contentType ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={contentType ? handleFileSelect : undefined}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={getAcceptedTypes()}
            onChange={(e) => handleFiles(e.target.files)}
            disabled={!contentType}
          />
          
          <div className="space-y-4">
            <CloudArrowUpIcon className={`mx-auto w-12 h-12 ${
              dragActive ? 'text-blue-500' : 'text-gray-400'
            }`} />
            
            <div>
              <p className="text-lg font-medium text-gray-900">
                {uploading ? 'Загрузка...' : 'Загрузите файл'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {contentType ? (
                  <>
                    Перетащите файл сюда или нажмите для выбора<br/>
                    Максимальный размер: {getMaxSize()}
                  </>
                ) : (
                  'Сначала выберите тип контента'
                )}
              </p>
            </div>
          </div>
          
          {uploading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
      )}
      
      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};
