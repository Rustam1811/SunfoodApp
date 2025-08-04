import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PhotoIcon, 
  VideoCameraIcon, 
  CloudArrowUpIcon, 
  XMarkIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface FileUploaderProps {
  onFileUpload: (url: string) => void;
  currentUrl?: string;
  acceptedTypes?: string;
  maxSize?: number; // в MB
  label?: string;
  description?: string;
  allowVideo?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFileUpload,
  currentUrl = '',
  acceptedTypes = "image/*",
  maxSize = 5,
  label = "Изображение",
  description = "Перетащите файл или нажмите для выбора",
  allowVideo = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentUrl);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptTypes = allowVideo ? "image/*,video/*" : "image/*";

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'sunfood_uploads'); // Нужно создать в Cloudinary
    formData.append('cloud_name', 'your-cloud-name'); // Замените на ваше имя

    try {
      const response = await fetch(
        'https://api.cloudinary.com/v1_1/your-cloud-name/auto/upload', // Замените на ваше имя
        {
          method: 'POST',
          body: formData,
          onUploadProgress: (progressEvent: any) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        }
      );

      if (!response.ok) {
        throw new Error('Ошибка загрузки файла');
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Ошибка загрузки в Cloudinary:', error);
      throw error;
    }
  };

  const uploadToFirebase = async (file: File): Promise<string> => {
    try {
      // Импортируем Firebase Storage функции
      const { getStorage, ref, uploadBytesResumable, getDownloadURL } = await import('firebase/storage');
      
      const storage = getStorage();
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const storageRef = ref(storage, `uploads/${fileName}`);
      
      return new Promise((resolve, reject) => {
        const uploadTask = uploadBytesResumable(storageRef, file);
        
        uploadTask.on('state_changed',
          (snapshot) => {
            // Отслеживаем прогресс загрузки
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(Math.round(progress));
          },
          (error) => {
            console.error('Ошибка загрузки:', error);
            reject(error);
          },
          async () => {
            // Загрузка завершена
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            } catch (error) {
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      console.error('Ошибка загрузки в Firebase:', error);
      throw error;
    }
  };

  const handleFileSelect = async (file: File) => {
    if (file.size > maxSize * 1024 * 1024) {
      alert(`Файл слишком большой. Максимальный размер: ${maxSize}MB`);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Создаем локальный preview
      const localUrl = URL.createObjectURL(file);
      setPreviewUrl(localUrl);

      // Загружаем файл (используем Firebase как более простой вариант)
      const downloadUrl = await uploadToFirebase(file);
      
      setPreviewUrl(downloadUrl);
      onFileUpload(downloadUrl);
      
    } catch (error) {
      console.error('Ошибка загрузки файла:', error);
      alert('Ошибка загрузки файла. Попробуйте еще раз.');
      setPreviewUrl(currentUrl);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
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
    onFileUpload('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isVideo = previewUrl && (previewUrl.includes('.mp4') || previewUrl.includes('.webm') || previewUrl.includes('.mov'));

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      {/* Область загрузки */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver 
            ? 'border-red-500 bg-red-50' 
            : uploading 
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
      >
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
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-3"
            >
              <ArrowPathIcon className="w-8 h-8 mx-auto text-blue-500 animate-spin" />
              <p className="text-sm text-blue-600">Загрузка файла...</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </motion.div>
          ) : previewUrl ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-3"
            >
              <div className="relative inline-block">
                {isVideo ? (
                  <video
                    src={previewUrl}
                    className="w-32 h-32 object-cover rounded-lg mx-auto"
                    controls
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg mx-auto"
                  />
                )}
                <button
                  onClick={removeFile}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-600">
                Файл загружен. Нажмите для изменения.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-3 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex justify-center space-x-2">
                <PhotoIcon className="w-8 h-8 text-gray-400" />
                {allowVideo && <VideoCameraIcon className="w-8 h-8 text-gray-400" />}
              </div>
              <CloudArrowUpIcon className="w-12 h-12 mx-auto text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">{description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {allowVideo ? 'PNG, JPG, MP4, WebM' : 'PNG, JPG'} до {maxSize}MB
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
