/**
 * CoachVideoPlayer - Collapsible Coach Video Player
 *
 * Premium video player with glass styling, collapsible state,
 * and video controls. Shows coach demonstration video for exercises.
 *
 * @module ui/workout/CoachVideoPlayer
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlayIcon,
  PauseIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/solid';

// ============================================================================
// Types
// ============================================================================

interface CoachVideoPlayerProps {
  videoUrl: string;
  thumbnailUrl?: string;
  exerciseName: string;
  isCollapsed?: boolean;
  onToggleCollapse?: (collapsed: boolean) => void;
}

// ============================================================================
// Haptic Feedback
// ============================================================================

const triggerHaptic = (type: 'light' | 'medium' = 'light') => {
  if ('vibrate' in navigator) {
    navigator.vibrate(type === 'light' ? 10 : 25);
  }
};

// ============================================================================
// Video Control Button
// ============================================================================

interface ControlButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  size?: 'sm' | 'md';
}

const ControlButton: React.FC<ControlButtonProps> = ({
  onClick,
  icon,
  label,
  size = 'md',
}) => (
  <motion.button
    onClick={onClick}
    whileTap={{ scale: 0.92 }}
    className={`
      ${size === 'sm' ? 'w-10 h-10' : 'w-12 h-12'}
      rounded-full
      bg-black/40
      backdrop-blur-sm
      border border-white/10
      flex items-center justify-center
      text-white
      transition-colors
      hover:bg-black/60
      active:bg-black/70
    `}
    aria-label={label}
  >
    {icon}
  </motion.button>
);

// ============================================================================
// Main Component
// ============================================================================

export const CoachVideoPlayer: React.FC<CoachVideoPlayerProps> = ({
  videoUrl,
  thumbnailUrl,
  exerciseName,
  isCollapsed: controlledCollapsed,
  onToggleCollapse,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [internalCollapsed, setInternalCollapsed] = useState(false);

  // Validate URLs
  const validVideoUrl = videoUrl && videoUrl.startsWith('http') && !videoUrl.includes('youtube_thumb');
  const validThumbnail = thumbnailUrl && thumbnailUrl.startsWith('http') && !thumbnailUrl.includes('youtube_thumb');

  // Use controlled or internal state
  const isCollapsed = controlledCollapsed ?? internalCollapsed;
  const setCollapsed = onToggleCollapse ?? setInternalCollapsed;

  // Handle play/pause
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    triggerHaptic('light');

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  // Handle mute/unmute
  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    triggerHaptic('light');
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  // Handle collapse toggle
  const handleToggleCollapse = useCallback(() => {
    triggerHaptic('light');
    const newState = !isCollapsed;
    setCollapsed(newState);

    // Pause video when collapsing
    if (newState && videoRef.current && isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isCollapsed, setCollapsed, isPlaying]);

  // Handle replay
  const handleReplay = useCallback(() => {
    if (!videoRef.current) return;
    triggerHaptic('light');
    videoRef.current.currentTime = 0;
    videoRef.current.play();
    setIsPlaying(true);
  }, []);

  // Update progress
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const prog = (video.currentTime / video.duration) * 100;
      setProgress(prog || 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(100);
    };

    const handleLoadedData = () => {
      setIsLoading(false);
    };

    const handleError = () => {
      setHasError(true);
      setIsLoading(false);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <motion.div
      layout
      className="rounded-2xl overflow-hidden bg-black/30 border border-white/10"
    >
      {/* Collapsed Header */}
      <motion.button
        onClick={handleToggleCollapse}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
            <PlayIcon className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Coach Demo</p>
            <p className="text-xs text-white/40 truncate max-w-[180px]">
              {exerciseName}
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isCollapsed ? 0 : 180 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDownIcon className="w-5 h-5 text-white/40" />
        </motion.div>
      </motion.button>

      {/* Expanded Video */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="relative aspect-video bg-black">
              {/* Video */}
              {validVideoUrl ? (
                <video
                  ref={videoRef}
                  src={videoUrl}
                  poster={validThumbnail ? thumbnailUrl : undefined}
                  muted={isMuted}
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/50">
                  Видео не загружено
                </div>
              )}

              {/* Loading Overlay */}
              <AnimatePresence>
                {isLoading && !hasError && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/60"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <ArrowPathIcon className="w-8 h-8 text-white/60" />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error Overlay */}
              {hasError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <p className="text-sm text-white/60">Video unavailable</p>
                </div>
              )}

              {/* Controls Overlay */}
              {!isLoading && !hasError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Center Play Button (when paused) */}
                  <AnimatePresence>
                    {!isPlaying && (
                      <motion.button
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        onClick={togglePlay}
                        className="
                          w-16 h-16
                          rounded-full
                          bg-white/20
                          backdrop-blur-md
                          border border-white/20
                          flex items-center justify-center
                          transition-transform
                          hover:scale-105
                          active:scale-95
                        "
                      >
                        <PlayIcon className="w-8 h-8 text-white ml-1" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Bottom Controls Bar */}
              {!hasError && (
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  {/* Progress Bar */}
                  <div className="h-1 bg-white/20 rounded-full mb-3 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  {/* Control Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ControlButton
                        onClick={togglePlay}
                        icon={
                          isPlaying ? (
                            <PauseIcon className="w-5 h-5" />
                          ) : (
                            <PlayIcon className="w-5 h-5 ml-0.5" />
                          )
                        }
                        label={isPlaying ? 'Pause' : 'Play'}
                        size="sm"
                      />
                      <ControlButton
                        onClick={handleReplay}
                        icon={<ArrowPathIcon className="w-4 h-4" />}
                        label="Replay"
                        size="sm"
                      />
                    </div>

                    <ControlButton
                      onClick={toggleMute}
                      icon={
                        isMuted ? (
                          <SpeakerXMarkIcon className="w-5 h-5" />
                        ) : (
                          <SpeakerWaveIcon className="w-5 h-5" />
                        )
                      }
                      label={isMuted ? 'Unmute' : 'Mute'}
                      size="sm"
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CoachVideoPlayer;
