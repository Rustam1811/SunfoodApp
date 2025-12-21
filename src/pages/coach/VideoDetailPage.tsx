/**
 * Video Detail Page - Trainer OS (Coach)
 * 
 * Video player with timecode comments:
 * - Play/pause video
 * - Coach can add comments at specific timecodes
 * - Click on comment to jump to that time
 * 
 * @module pages/coach/VideoDetailPage
 */

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useHistory } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PlayIcon,
  PauseIcon,
  PlusIcon,
  ChatBubbleLeftIcon,
  ClockIcon,
  PaperAirplaneIcon,
  XMarkIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../auth/AuthContextV2';
import {
  getVideoById,
  getVideoComments,
  addVideoComment,
  formatTimecode,
  parseTimecode,
  type ClientVideo,
  type VideoComment,
} from '../../services/videoService';

// ============================================================================
// Video Player
// ============================================================================

interface VideoPlayerProps {
  videoUrl: string;
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  onSeek: (time: number) => void;
  videoRef: React.RefObject<HTMLVideoElement>;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  currentTime,
  onTimeUpdate,
  onSeek,
  videoRef,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    onTimeUpdate(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const handleSeekBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const time = percent * duration;
    onSeek(time);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="relative aspect-video bg-black rounded-2xl overflow-hidden">
      <video
        ref={videoRef}
        src={videoUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="w-full h-full object-contain"
        playsInline
      />

      {/* Play/Pause Overlay */}
      <button
        onClick={togglePlay}
        className="absolute inset-0 flex items-center justify-center bg-black/20"
      >
        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
          {isPlaying ? (
            <PauseIcon className="w-8 h-8 text-white" />
          ) : (
            <PlayIcon className="w-8 h-8 text-white ml-1" />
          )}
        </div>
      </button>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div
          onClick={handleSeekBarClick}
          className="h-1 bg-white/30 rounded-full cursor-pointer"
        >
          <div
            className="h-full bg-tr-accent rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-white/70">
          <span>{formatTimecode(currentTime)}</span>
          <span>{formatTimecode(duration)}</span>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Comment Item
// ============================================================================

interface CommentItemProps {
  comment: VideoComment;
  onTimecodeClick: () => void;
  isCurrentTime: boolean;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onTimecodeClick,
  isCurrentTime,
}) => {
  const getTypeIcon = () => {
    switch (comment.type) {
      case 'correction':
        return <ExclamationCircleIcon className="w-4 h-4 text-yellow-500" />;
      case 'praise':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      default:
        return <ChatBubbleLeftIcon className="w-4 h-4 text-tr-text-muted" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-3 rounded-xl transition-all ${
        isCurrentTime
          ? 'bg-tr-accent/10 border border-tr-accent/30'
          : 'bg-tr-elevated'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Timecode button */}
        <button
          onClick={onTimecodeClick}
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-tr-base text-tr-accent text-xs font-mono hover:bg-tr-accent/20"
        >
          <ClockIcon className="w-3 h-3" />
          {formatTimecode(comment.timecode)}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {getTypeIcon()}
            <span className="text-tr-text-muted text-xs">
              {new Date(comment.createdAt).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <p className="text-tr-text text-sm">{comment.comment}</p>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// Add Comment Form
// ============================================================================

interface AddCommentFormProps {
  currentTime: number;
  onSubmit: (content: string, type: VideoComment['type']) => void;
  onCancel: () => void;
}

const AddCommentForm: React.FC<AddCommentFormProps> = ({
  currentTime,
  onSubmit,
  onCancel,
}) => {
  const [content, setContent] = useState('');
  const [type, setType] = useState<VideoComment['type']>('comment');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSubmit(content.trim(), type);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      onSubmit={handleSubmit}
      className="bg-tr-elevated rounded-2xl p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ClockIcon className="w-4 h-4 text-tr-accent" />
          <span className="text-tr-accent font-mono text-sm">
            {formatTimecode(currentTime)}
          </span>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="p-1 text-tr-text-muted"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Type selector */}
      <div className="flex gap-2 mb-3">
        {[
          { key: 'comment', label: 'Комментарий' },
          { key: 'correction', label: 'Исправление' },
          { key: 'praise', label: 'Похвала' },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setType(t.key as VideoComment['type'])}
            className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
              type === t.key
                ? 'bg-tr-accent text-white'
                : 'bg-tr-base text-tr-text-secondary'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <textarea
        ref={inputRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Напишите комментарий к этому моменту..."
        rows={3}
        className="w-full bg-tr-base rounded-xl p-3 text-tr-text text-sm outline-none resize-none placeholder:text-tr-text-muted"
      />

      <div className="flex justify-end mt-3">
        <button
          type="submit"
          disabled={!content.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-tr-accent rounded-xl text-white text-sm font-medium disabled:opacity-50"
        >
          <PaperAirplaneIcon className="w-4 h-4" />
          Отправить
        </button>
      </div>
    </motion.form>
  );
};

// ============================================================================
// Main Component
// ============================================================================

const VideoDetailPage: React.FC = () => {
  const { clientId, videoId } = useParams<{ clientId: string; videoId: string }>();
  const history = useHistory();
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [video, setVideo] = useState<ClientVideo | null>(null);
  const [comments, setComments] = useState<VideoComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [isAddingComment, setIsAddingComment] = useState(false);

  // Load video and comments
  useEffect(() => {
    const loadData = async () => {
      if (!videoId) return;

      try {
        const [videoData, commentsData] = await Promise.all([
          getVideoById(videoId),
          getVideoComments(videoId),
        ]);
        setVideo(videoData);
        setComments(commentsData);
      } catch (error) {
        console.error('Failed to load video:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [videoId]);

  // Seek to timecode
  const handleTimecodeClick = (timecode: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = timecode;
    videoRef.current.play();
  };

  // Add new comment
  const handleAddComment = async (content: string, commentType: VideoComment['type']) => {
    if (!videoId || !user?.id) return;

    try {
      // Pause video
      videoRef.current?.pause();

      await addVideoComment(
        videoId,
        user.id,
        user.name || 'Тренер',
        currentTime,
        content
      );

      // Reload comments
      const updatedComments = await getVideoComments(videoId);
      setComments(updatedComments);
      setIsAddingComment(false);
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  // Start adding comment (pause video first)
  const handleStartAddComment = () => {
    videoRef.current?.pause();
    setIsAddingComment(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-tr-base safe-area-inset-top animate-pulse">
        <div className="px-6 pt-8">
          <div className="h-6 w-6 bg-tr-elevated rounded mb-6" />
          <div className="aspect-video bg-tr-elevated rounded-2xl mb-6" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-tr-elevated rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-tr-base flex items-center justify-center">
        <p className="text-tr-text-muted">Видео не найдено</p>
      </div>
    );
  }

  // Sort comments by timecode
  const sortedComments = [...comments].sort((a, b) => a.timecode - b.timecode);

  return (
    <div className="min-h-screen bg-tr-base safe-area-inset-top pb-32">
      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <button
          onClick={() => history.goBack()}
          className="w-10 h-10 -ml-2 flex items-center justify-center mb-4"
        >
          <ArrowLeftIcon className="w-6 h-6 text-tr-text" />
        </button>

        <h1 className="text-xl font-bold text-tr-text mb-1">
          {video.exerciseName || 'Видео клиента'}
        </h1>
        <p className="text-tr-text-muted text-sm">
          {new Date(video.uploadedAt).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      {/* Video Player */}
      <div className="px-6 mb-6">
        <VideoPlayer
          videoUrl={video.videoUrl}
          currentTime={currentTime}
          onTimeUpdate={setCurrentTime}
          onSeek={handleTimecodeClick}
          videoRef={videoRef}
        />
      </div>

      {/* Comments Section */}
      <div className="px-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-tr-text font-semibold">
            Комментарии ({comments.length})
          </h2>
          {!isAddingComment && (
            <button
              onClick={handleStartAddComment}
              className="flex items-center gap-1 text-tr-accent text-sm"
            >
              <PlusIcon className="w-4 h-4" />
              Добавить
            </button>
          )}
        </div>

        {/* Add comment form */}
        <AnimatePresence>
          {isAddingComment && (
            <div className="mb-4">
              <AddCommentForm
                currentTime={currentTime}
                onSubmit={handleAddComment}
                onCancel={() => setIsAddingComment(false)}
              />
            </div>
          )}
        </AnimatePresence>

        {/* Comments list */}
        {sortedComments.length === 0 ? (
          <div className="bg-tr-elevated rounded-xl p-6 text-center">
            <ChatBubbleLeftIcon className="w-8 h-8 text-tr-text-muted mx-auto mb-2" />
            <p className="text-tr-text-muted text-sm">
              Пока нет комментариев.
              <br />
              Посмотрите видео и добавьте обратную связь.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedComments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onTimecodeClick={() => handleTimecodeClick(comment.timecode)}
                isCurrentTime={
                  Math.abs(currentTime - comment.timecode) < 2
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoDetailPage;
