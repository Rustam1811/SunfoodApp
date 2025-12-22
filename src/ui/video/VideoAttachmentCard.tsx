/**
 * VideoAttachmentCard - Premium Video Upload/Display Component
 * 
 * States:
 * - Empty: Upload button
 * - Uploading: Progress bar with percentage
 * - Processing: Spinner with "Обработка..."
 * - Ready: Video preview with play button
 * - Error: Error message with retry
 * 
 * Supports:
 * - File upload (MP4, MOV, WEBM)
 * - YouTube URLs
 * - Drag & drop
 * 
 * @module ui/video/VideoAttachmentCard
 */

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CloudArrowUpIcon,
  PlayCircleIcon,
  XMarkIcon,
  ArrowPathIcon,
  LinkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  VideoCameraIcon,
} from '@heroicons/react/24/solid';
import {
  uploadVideoFile,
  saveYouTubeVideo,
  parseYouTubeUrl,
  getYouTubeThumbnail,
  getYouTubeEmbedUrl,
  validateVideoFile,
  type VideoMetadata,
  type UploadProgress,
} from '../../services/videoUploadService';

// ============================================================================
// Types
// ============================================================================

interface VideoAttachmentCardProps {
  userId: string;
  entityType?: 'exercise' | 'workout' | 'client';
  entityId?: string;
  initialVideo?: VideoMetadata | null;
  onVideoChange?: (video: VideoMetadata | null) => void;
  disabled?: boolean;
  className?: string;
}

type CardState = 'empty' | 'uploading' | 'processing' | 'ready' | 'error' | 'youtube-input';

// ============================================================================
// Styles
// ============================================================================

const cardStyles = {
  base: `
    relative overflow-hidden rounded-2xl 
    border-2 border-dashed border-white/10
    bg-gradient-to-b from-white/5 to-transparent
    transition-all duration-300
  `,
  hover: 'hover:border-white/20 hover:bg-white/5',
  dragOver: 'border-violet-500/50 bg-violet-500/10',
};

// ============================================================================
// Sub-components
// ============================================================================

const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => (
  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
    <motion.div
      className="h-full bg-gradient-to-r from-violet-500 to-indigo-500"
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      transition={{ duration: 0.3 }}
    />
  </div>
);

const Spinner: React.FC = () => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    className="w-8 h-8 border-2 border-white/20 border-t-violet-500 rounded-full"
  />
);

// ============================================================================
// Main Component
// ============================================================================

export const VideoAttachmentCard: React.FC<VideoAttachmentCardProps> = ({
  userId,
  entityType,
  entityId,
  initialVideo,
  onVideoChange,
  disabled = false,
  className = '',
}) => {
  const [state, setState] = useState<CardState>(
    initialVideo?.status === 'ready' ? 'ready' : 
    initialVideo?.status === 'processing' ? 'processing' :
    initialVideo?.status === 'error' ? 'error' : 'empty'
  );
  const [video, setVideo] = useState<VideoMetadata | null>(initialVideo || null);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleFileSelect = useCallback(async (file: File) => {
    const validation = validateVideoFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Ошибка валидации');
      setState('error');
      return;
    }

    setState('uploading');
    setError(null);

    const result = await uploadVideoFile(file, userId, {
      entityType,
      entityId,
      onProgress: (p) => setProgress(p),
    });

    if (result.success && result.metadata) {
      setVideo(result.metadata);
      setState(result.metadata.status === 'ready' ? 'ready' : 'processing');
      onVideoChange?.(result.metadata);
      
      // Poll for processing completion
      if (result.metadata.status === 'processing') {
        pollForReady(result.videoId!);
      }
    } else {
      setError(result.error || 'Ошибка загрузки');
      setState('error');
    }
  }, [userId, entityType, entityId, onVideoChange]);

  const pollForReady = useCallback(async (videoId: string) => {
    const checkStatus = async () => {
      try {
        const { getVideo } = await import('../../services/videoUploadService');
        const updated = await getVideo(videoId);
        if (updated) {
          if (updated.status === 'ready') {
            setVideo(updated);
            setState('ready');
            onVideoChange?.(updated);
          } else if (updated.status === 'error') {
            setError(updated.errorMessage || 'Ошибка обработки');
            setState('error');
          } else {
            // Still processing, check again
            setTimeout(checkStatus, 2000);
          }
        }
      } catch {
        // Ignore polling errors
      }
    };
    setTimeout(checkStatus, 2000);
  }, [onVideoChange]);

  const handleYouTubeSubmit = useCallback(async () => {
    const parsed = parseYouTubeUrl(youtubeUrl);
    if (!parsed.valid) {
      setError(parsed.error || 'Некорректная ссылка');
      return;
    }

    setState('processing');
    
    const result = await saveYouTubeVideo(youtubeUrl, userId, {
      entityType,
      entityId,
    });

    if (result.success && result.metadata) {
      setVideo(result.metadata);
      setState('ready');
      onVideoChange?.(result.metadata);
    } else {
      setError(result.error || 'Ошибка сохранения');
      setState('error');
    }
  }, [youtubeUrl, userId, entityType, entityId, onVideoChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleRemove = useCallback(() => {
    setVideo(null);
    setState('empty');
    setError(null);
    setProgress(null);
    onVideoChange?.(null);
  }, [onVideoChange]);

  const handleRetry = useCallback(() => {
    setState('empty');
    setError(null);
    setProgress(null);
  }, []);

  // ============================================================================
  // Render States
  // ============================================================================

  const renderEmpty = () => (
    <div
      className={`
        flex flex-col items-center justify-center p-8 cursor-pointer
        ${cardStyles.base} ${!disabled && cardStyles.hover}
        ${isDragOver ? cardStyles.dragOver : ''}
      `}
      onClick={() => !disabled && fileInputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center"
      >
        <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <CloudArrowUpIcon className="w-7 h-7 text-white/40" />
        </div>
        <p className="text-white/70 text-sm font-medium mb-1">
          Загрузить видео
        </p>
        <p className="text-white/40 text-xs">
          MP4, MOV, WEBM • до 150MB
        </p>
        
        <div className="flex items-center gap-3 mt-4">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setState('youtube-input'); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-white/60 text-xs hover:bg-white/10 transition-colors"
          >
            <LinkIcon className="w-3.5 h-3.5" />
            YouTube
          </button>
        </div>
      </motion.div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
        disabled={disabled}
      />
    </div>
  );

  const renderYouTubeInput = () => (
    <div className={`p-6 ${cardStyles.base}`}>
      <div className="flex items-center gap-2 mb-4">
        <LinkIcon className="w-5 h-5 text-red-500" />
        <span className="text-white/80 text-sm font-medium">YouTube видео</span>
      </div>
      
      <input
        type="url"
        value={youtubeUrl}
        onChange={(e) => setYoutubeUrl(e.target.value)}
        placeholder="https://youtube.com/watch?v=..."
        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-violet-500/50 transition-colors"
        autoFocus
      />
      
      {error && (
        <p className="text-red-400 text-xs mt-2">{error}</p>
      )}
      
      <div className="flex gap-2 mt-4">
        <button
          type="button"
          onClick={() => { setState('empty'); setError(null); setYoutubeUrl(''); }}
          className="flex-1 py-2 rounded-lg bg-white/5 text-white/60 text-sm hover:bg-white/10 transition-colors"
        >
          Отмена
        </button>
        <button
          type="button"
          onClick={handleYouTubeSubmit}
          disabled={!youtubeUrl.trim()}
          className="flex-1 py-2 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Добавить
        </button>
      </div>
    </div>
  );

  const renderUploading = () => (
    <div className={`p-6 ${cardStyles.base}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">
          <CloudArrowUpIcon className="w-5 h-5 text-violet-400" />
        </div>
        <div className="flex-1">
          <p className="text-white/80 text-sm font-medium">Загрузка...</p>
          <p className="text-white/40 text-xs">{progress?.percentage || 0}%</p>
        </div>
      </div>
      <ProgressBar progress={progress?.percentage || 0} />
    </div>
  );

  const renderProcessing = () => (
    <div className={`p-6 ${cardStyles.base} flex flex-col items-center justify-center`}>
      <Spinner />
      <p className="text-white/60 text-sm mt-4">Обработка видео...</p>
      <p className="text-white/30 text-xs mt-1">Это может занять несколько секунд</p>
    </div>
  );

  const renderError = () => (
    <div className={`p-6 ${cardStyles.base}`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
          <ExclamationCircleIcon className="w-5 h-5 text-red-400" />
        </div>
        <div className="flex-1">
          <p className="text-white/80 text-sm font-medium">Ошибка</p>
          <p className="text-red-400/80 text-xs">{error}</p>
        </div>
      </div>
      
      <div className="flex gap-2 mt-4">
        <button
          type="button"
          onClick={handleRetry}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 text-white/60 text-sm hover:bg-white/10 transition-colors"
        >
          <ArrowPathIcon className="w-4 h-4" />
          Попробовать снова
        </button>
      </div>
    </div>
  );

  const renderReady = () => {
    if (!video) return renderEmpty();
    
    const isYouTube = video.type === 'youtube';
    const thumbnailUrl = isYouTube && video.youtubeId 
      ? getYouTubeThumbnail(video.youtubeId) 
      : video.previewUrl;
    const videoUrl = isYouTube && video.youtubeId
      ? getYouTubeEmbedUrl(video.youtubeId)
      : video.processedUrl || video.originalUrl;

    return (
      <div className={`relative ${cardStyles.base} border-0 aspect-video`}>
        {/* Remove button */}
        {!disabled && (
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 z-20 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
          >
            <XMarkIcon className="w-4 h-4 text-white" />
          </button>
        )}
        
        {/* Status badge */}
        <div className="absolute top-2 left-2 z-20 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm">
          {isYouTube ? (
            <LinkIcon className="w-3 h-3 text-red-400" />
          ) : (
            <CheckCircleIcon className="w-3 h-3 text-green-400" />
          )}
          <span className="text-white/80 text-xs">
            {isYouTube ? 'YouTube' : 'Загружено'}
          </span>
        </div>
        
        {/* Video/Preview */}
        {isPlaying && isYouTube && video.youtubeId ? (
          <iframe
            src={`${videoUrl}?autoplay=1`}
            className="w-full h-full"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        ) : isPlaying && !isYouTube && videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-cover"
            controls
            autoPlay
          />
        ) : (
          <div 
            className="relative w-full h-full cursor-pointer group"
            onClick={() => setIsPlaying(true)}
          >
            {thumbnailUrl ? (
              <img 
                src={thumbnailUrl} 
                alt="Video thumbnail"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-b from-white/5 to-white/0 flex items-center justify-center">
                <VideoCameraIcon className="w-12 h-12 text-white/20" />
              </div>
            )}
            
            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
              >
                <PlayCircleIcon className="w-10 h-10 text-white" />
              </motion.div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ============================================================================
  // Main Render
  // ============================================================================

  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        <motion.div
          key={state}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {state === 'empty' && renderEmpty()}
          {state === 'youtube-input' && renderYouTubeInput()}
          {state === 'uploading' && renderUploading()}
          {state === 'processing' && renderProcessing()}
          {state === 'error' && renderError()}
          {state === 'ready' && renderReady()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default VideoAttachmentCard;
