import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PhotoIcon, 
  VideoCameraIcon, 
  CloudArrowUpIcon, 
  XMarkIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

interface SimpleFileUploaderProps {
  onFileUpload: (url: string) => void;
  currentUrl?: string;
  allowVideo?: boolean;
  maxSize?: number; // в MB
  label?: string;
}

export const SimpleFileUploader: React.FC<SimpleFileUploaderProps> = ({
  onFileUpload,
  currentUrl = '',
  allowVideo = false,
  maxSize = 5,
  label = "Файл"
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(currentUrl);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptTypes = allowVideo ? "image/*,video/*" : "image/*";

  const handleFileSelect = async (file: File) => {
    if (file.size > maxSize * 1024 * 1024) {
      setError(`Файл слишком большой. Максимальный размер: ${maxSize}MB`);
      return;
    }

    setUploading(true);
    setError('');
    setProgress(0);

    try {
      // Создаем локальный preview сразу
      const localUrl = URL.createObjectURL(file);
      setPreviewUrl(localUrl);

      // Загружаем в Firebase Storage
      const storage = getStorage();
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const storageRef = ref(storage, `uploads/${fileName}`);

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progressPercent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(Math.round(progressPercent));
        },
        (error) => {
          console.error('Upload error:', error);
          setError('Ошибка загрузки: ' + error.message);
          setUploading(false);
          setPreviewUrl(currentUrl);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setPreviewUrl(downloadURL);
            onFileUpload(downloadURL);
            setUploading(false);
          } catch (error: any) {
            console.error('Error getting download URL:', error);
            setError('Ошибка получения URL: ' + error.message);
            setUploading(false);
          }
        }
      );
    } catch (error: any) {
      console.error('Upload error:', error);
      setError('Ошибка: ' + error.message);
      setUploading(false);
      setPreviewUrl(currentUrl);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const removeFile = () => {
    setPreviewUrl('');
    setError('');
    onFileUpload('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isVideo = previewUrl && (
    previewUrl.includes('.mp4') || 
    previewUrl.includes('.webm') || 
    previewUrl.includes('.mov') ||
    previewUrl.includes('video')
  );

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptTypes}
          onChange={handleFileInputChange}
          className="hidden"
        />

        <AnimatePresence mode="wait">
          {uploading ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-2"
            >
              <ArrowPathIcon className="w-8 h-8 mx-auto text-blue-500 animate-spin" />
              <p className="text-sm text-blue-600">Загрузка... {progress}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </motion.div>
          ) : previewUrl ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-2"
            >
              <div className="relative inline-block">
                {isVideo ? (
                  <video
                    src={previewUrl}
                    className="w-24 h-24 object-cover rounded-lg mx-auto"
                    controls
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-24 h-24 object-cover rounded-lg mx-auto"
                  />
                )}
                <button
                  onClick={removeFile}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </div>
              <p className="text-xs text-gray-600">Нажмите для изменения</p>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-2 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex justify-center space-x-1">
                <PhotoIcon className="w-6 h-6 text-gray-400" />
                {allowVideo && <VideoCameraIcon className="w-6 h-6 text-gray-400" />}
              </div>
              <CloudArrowUpIcon className="w-8 h-8 mx-auto text-gray-400" />
              <p className="text-xs text-gray-600">
                Нажмите для выбора файла
              </p>
              <p className="text-xs text-gray-500">
                {allowVideo ? 'PNG, JPG, MP4' : 'PNG, JPG'} до {maxSize}MB
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="mt-2 text-sm text-red-600 text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};
