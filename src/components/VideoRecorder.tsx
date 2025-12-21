/**
 * Video Recorder Component - Trainer OS
 * 
 * In-app video recording for client exercise videos.
 * No gallery picking - direct recording only.
 * 
 * @module components/VideoRecorder
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  VideoCameraIcon, 
  StopIcon, 
  XMarkIcon,
  ArrowPathIcon,
  CheckIcon 
} from '@heroicons/react/24/solid';

// ============================================================================
// Types
// ============================================================================

interface VideoRecorderProps {
  onRecordingComplete: (blob: Blob, duration: number) => Promise<void>;
  onClose: () => void;
  maxDuration?: number; // seconds, default 60
}

type RecordingState = 'idle' | 'preparing' | 'recording' | 'preview' | 'uploading';

// ============================================================================
// Component
// ============================================================================

const VideoRecorder: React.FC<VideoRecorderProps> = ({
  onRecordingComplete,
  onClose,
  maxDuration = 60,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  const [state, setState] = useState<RecordingState>('idle');
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const timerRef = useRef<number | null>(null);

  // Start camera
  const startCamera = useCallback(async () => {
    setState('preparing');
    setError(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user', // Front camera by default
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: true,
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      
      setState('idle');
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Не удалось получить доступ к камере');
      setState('idle');
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Start recording
  const startRecording = useCallback(() => {
    if (!streamRef.current) return;
    
    chunksRef.current = [];
    setRecordingDuration(0);
    
    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: 'video/webm;codecs=vp9',
    });
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setRecordedBlob(blob);
      setState('preview');
      
      // Set preview video
      if (previewRef.current) {
        previewRef.current.src = URL.createObjectURL(blob);
      }
    };
    
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start(100); // Collect data every 100ms
    setState('recording');
    
    // Timer
    timerRef.current = window.setInterval(() => {
      setRecordingDuration(prev => {
        const newDuration = prev + 1;
        if (newDuration >= maxDuration) {
          stopRecording();
        }
        return newDuration;
      });
    }, 1000);
  }, [maxDuration]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    stopCamera();
  }, [stopCamera]);

  // Retry recording
  const retryRecording = useCallback(() => {
    setRecordedBlob(null);
    setRecordingDuration(0);
    setState('idle');
    startCamera();
  }, [startCamera]);

  // Submit video
  const submitVideo = useCallback(async () => {
    if (!recordedBlob) return;
    
    setState('uploading');
    
    try {
      await onRecordingComplete(recordedBlob, recordingDuration);
      onClose();
    } catch (err) {
      console.error('Upload error:', err);
      setError('Ошибка загрузки видео');
      setState('preview');
    }
  }, [recordedBlob, recordingDuration, onRecordingComplete, onClose]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Initialize camera on mount
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [startCamera, stopCamera]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 safe-area-inset-top">
        <button
          onClick={onClose}
          className="p-2 -ml-2 text-white/80"
          aria-label="Закрыть"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
        
        <span className="text-white/80 text-sm">
          {state === 'recording' && (
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              {formatTime(recordingDuration)}
            </span>
          )}
        </span>
        
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Video view */}
      <div className="flex-1 relative">
        {/* Camera preview */}
        {(state === 'idle' || state === 'preparing' || state === 'recording') && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }} // Mirror for selfie cam
          />
        )}
        
        {/* Recorded preview */}
        {(state === 'preview' || state === 'uploading') && (
          <video
            ref={previewRef}
            controls
            playsInline
            className="absolute inset-0 w-full h-full object-contain bg-black"
          />
        )}

        {/* Preparing overlay */}
        {state === 'preparing' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-white text-center">
              <ArrowPathIcon className="w-8 h-8 mx-auto animate-spin mb-2" />
              <span>Подготовка камеры...</span>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="absolute inset-x-0 top-4 px-4">
            <div className="bg-red-500/90 text-white px-4 py-2 rounded-lg text-sm text-center">
              {error}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-6 safe-area-inset-bottom">
        <AnimatePresence mode="wait">
          {/* Idle - Start button */}
          {state === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex justify-center"
            >
              <button
                onClick={startRecording}
                className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center shadow-lg"
                aria-label="Начать запись"
              >
                <VideoCameraIcon className="w-8 h-8 text-white" />
              </button>
            </motion.div>
          )}

          {/* Recording - Stop button */}
          {state === 'recording' && (
            <motion.div
              key="recording"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex justify-center"
            >
              <button
                onClick={stopRecording}
                className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center shadow-lg animate-pulse"
                aria-label="Остановить запись"
              >
                <StopIcon className="w-8 h-8 text-white" />
              </button>
            </motion.div>
          )}

          {/* Preview - Retry or Submit */}
          {state === 'preview' && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-center justify-center gap-8"
            >
              <button
                onClick={retryRecording}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                  <ArrowPathIcon className="w-6 h-6 text-white" />
                </div>
                <span className="text-white/70 text-xs">Ещё раз</span>
              </button>
              
              <button
                onClick={submitVideo}
                className="flex flex-col items-center gap-2"
              >
                <div 
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #A64D55 0%, #8B3A42 100%)' }}
                >
                  <CheckIcon className="w-6 h-6 text-white" />
                </div>
                <span className="text-white/70 text-xs">Отправить</span>
              </button>
            </motion.div>
          )}

          {/* Uploading */}
          {state === 'uploading' && (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex justify-center"
            >
              <div className="text-white text-center">
                <ArrowPathIcon className="w-8 h-8 mx-auto animate-spin mb-2" />
                <span>Загрузка...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default VideoRecorder;
