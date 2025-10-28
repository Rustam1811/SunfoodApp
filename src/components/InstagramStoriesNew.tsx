<<<<<<< HEAD
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Eye, Volume2, VolumeX, Play } from 'lucide-react';
=======
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { X, Heart, Eye } from 'lucide-react';
>>>>>>> 248862203ee85c67a5644dffe59762c6166a1e01
import { StoriesService, Story } from '../services/stories';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

type StoryWithProgress = Story & { viewed: boolean };

interface StoriesRingProps {
  story: StoryWithProgress;
  onOpen: () => void;
}

// Helpers
const GRADIENTS: Record<string, string> = {
  sunset: 'linear-gradient(135deg,#FF7A59 0%,#FFD166 50%,#FF8C42 100%)',
  ocean: 'linear-gradient(135deg,#5B8DEF 0%,#6A5ACD 100%)',
  forest: 'linear-gradient(135deg,#34D399 0%,#065F46 100%)',
  purple: 'linear-gradient(135deg,#A855F7 0%,#EC4899 100%)',
};
const getGradient = (name?: string) => GRADIENTS[name || 'sunset'] || GRADIENTS.sunset;

const initials = (s?: string) =>
  (s || 'ST')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || 'ST';

const timeAgo = (d?: string | number | Date) => {
  if (!d) return 'now';
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.round(diff / 60000);
  if (m <= 0) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  const days = Math.round(h / 24);
  return `${days}d`;
};

// Stories ring (увеличил размер + убрал blur)
const StoriesRing: React.FC<StoriesRingProps> = ({ story, onOpen }) => {
<<<<<<< HEAD
  const isImage = story.contentType?.startsWith("image/") || story.contentType === "image";
  const isVideo = story.contentType?.startsWith("video/") || story.contentType === "video";

  const content = (() => {
    if (isImage && story.mediaUrl) {
      return (
        <div className="w-full h-full rounded-full overflow-hidden">
          <img src={story.mediaUrl} alt={story.author} className="w-full h-full object-cover" />
        </div>
      );
    }

    if (isVideo) {
      return story.mediaUrl ? (
        <div className="w-full h-full rounded-full overflow-hidden relative">
          <video 
            src={story.mediaUrl} 
            className="w-full h-full object-cover" 
            muted 
            preload="metadata"
            playsInline
          />
          {/* Иконка видео вместо Play */}
          <div className="absolute bottom-1 right-1 bg-black/60 rounded-full p-1">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          </div>
        </div>
      ) : (
        <div
          className="w-full h-full rounded-full flex items-center justify-center bg-black/75 text-white"
          style={{ background: getGradient(story.gradient) }}
        >
          <Play size={24} className="opacity-80" />
        </div>
      );
    }

    if (story.contentType === "text/plain" && story.text) {
      return (
        <div
          className="w-full h-full rounded-full flex items-center justify-center text-white text-[11px] font-bold text-center px-2 leading-tight"
          style={{ background: getGradient(story.gradient) }}
        >
          {story.text.slice(0, 18)}
          {story.text.length > 18 ? "�" : ""}
        </div>
      );
    }

    return (
=======
  // DEBUG: выводим mediaUrl для проверки
  console.log('🖼️ Story Ring:', story.id, 'mediaUrl:', story.mediaUrl, 'contentType:', story.contentType);
  
  // Проверяем что это изображение (может быть "image" или "image/jpeg" и т.д.)
  const isImage = story.contentType?.startsWith('image/') || story.contentType === 'image';
  
  const content =
    isImage && story.mediaUrl ? (
      <div className="w-full h-full rounded-full overflow-hidden">
        <img 
          src={story.mediaUrl} 
          alt={story.author}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            console.error('❌ Image load error for story:', story.id, 'URL:', story.mediaUrl);
            console.error('Error details:', e);
          }}
          onLoad={() => {
            console.log('✅ Image loaded successfully:', story.id);
          }}
        />
      </div>
    ) : story.contentType === 'text/plain' && story.text ? (
      <div
        className="w-full h-full rounded-full flex items-center justify-center text-white text-[11px] font-bold text-center px-2 leading-tight"
        style={{ background: getGradient(story.gradient) }}
      >
        {story.text.slice(0, 18)}
        {story.text.length > 18 ? '…' : ''}
      </div>
    ) : (
>>>>>>> 248862203ee85c67a5644dffe59762c6166a1e01
      <div
        className="w-full h-full rounded-full flex items-center justify-center text-white text-xs font-bold"
        style={{ background: getGradient(story.gradient) }}
      >
        {initials(story.author)}
      </div>
    );
  })();

  const isCloseFriends = story.audience === "close-friends";

  return (
    <button
      type="button"
      onClick={onOpen}
<<<<<<< HEAD
      aria-label={`Open stories by ${story.author || "Anonymous"}`}
      className={`group flex-shrink-0 rounded-full active:scale-95 transition ${
        story.viewed ? "opacity-60" : "opacity-100"
=======
      aria-label={`Open stories by ${story.author || 'Anonymous'}`}
      className={`group flex-shrink-0 rounded-full active:scale-95 transition-transform duration-100 ${
        story.viewed ? 'opacity-60' : 'opacity-100'
>>>>>>> 248862203ee85c67a5644dffe59762c6166a1e01
      }`}
      style={{ contain: 'layout style paint' }}
    >
      <span
        className="block w-[88px] h-[88px] rounded-full p-[3px] bg-transparent"
        style={
          story.viewed
            ? {
                outline: '2px solid #e5e7eb',
                outlineOffset: '0px',
                borderRadius: '50%',
                background: 'transparent',
              }
            : isCloseFriends
              ? {
                  outline: '2px solid #22c55e',
                  outlineOffset: '0px',
                  borderRadius: '50%',
                  background: 'transparent',
                }
              : {
                  outline: '3px solid transparent',
                  outlineOffset: '0px',
                  borderRadius: '50%',
                  background: 'conic-gradient(from 225deg at 50% 50%, #ff9800 0%, #ff9800 40%, #ff5e62 100%, #ff9800 100%)',
                  padding: '3px',
                }
        }
      >
        <span className="block w-full h-full rounded-full overflow-hidden bg-white">
          {content}
        </span>
      </span>

      <p className="text-[11px] text-center mt-1 truncate w-[84px] text-slate-800">
        {story.author || "Anonymous"}
      </p>
    </button>
  );
};
// Viewer
interface StoryViewerProps {
  stories: StoryWithProgress[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onStoryView: (storyId: string) => void;
}

const StoryViewer: React.FC<StoryViewerProps> = ({
  stories,
  currentIndex,
  onClose,
  onNext,
  onPrevious,
  onStoryView,
}) => {
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [isMuted, setIsMuted] = useState(false); // ЗВУК ВКЛЮЧЁН ПО УМОЛЧАНИЮ
  const videoRef = useRef<HTMLVideoElement>(null);

  const current = stories[currentIndex];

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    if (!current || paused) return;
    
    // Для видео используем реальное время воспроизведения
    if (videoRef.current && (current.contentType?.startsWith('video/') || current.contentType === 'video')) {
      const video = videoRef.current;
      
      const updateProgress = () => {
        if (video.duration) {
          const percent = (video.currentTime / video.duration) * 100;
          setProgress(percent);
        }
      };
      
      video.addEventListener('timeupdate', updateProgress);
      return () => video.removeEventListener('timeupdate', updateProgress);
    }
    
    // Для изображений и текста используем таймер
    const dur = (current.duration || 5) * 1000;
    const step = 50;
    const inc = (step / dur) * 100;
    const t = setInterval(() => {
      setProgress((p) => {
        const n = p + inc;
        if (n >= 100) {
          onNext();
          return 0;
        }
        return n;
      });
    }, step);
    return () => clearInterval(t);
  }, [current, paused, onNext]);

  useEffect(() => {
    if (!current) return;
    setProgress(0);
    onStoryView(current.id);
    
    // Автоплей видео при смене сторис
    const playVideo = async () => {
      if (!videoRef.current) return;
      
      const video = videoRef.current;
      video.currentTime = 0;
      
      try {
        // Попытка 1: Играть со звуком
        await video.play();
      } catch (error) {
        // Попытка 2: Если браузер блокирует - играть без звука, но пользователь может включить
        console.warn('Autoplay with sound blocked, trying muted:', error);
        setIsMuted(true);
        video.muted = true;
        
        try {
          await video.play();
        } catch (mutedError) {
          console.error('Autoplay failed even when muted:', mutedError);
        }
      }
    };
    
    playVideo();
  }, [current?.id]); // eslint-disable-line

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    setTouchStart({ x: t.clientX, y: t.clientY });
    setPaused(true);
    
    // Пауза видео
    if (videoRef.current) {
      videoRef.current.pause();
    }
    
    navigator.vibrate?.(8);
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const t = e.changedTouches[0];
    const dx = t.clientX - (touchStart?.x ?? 0);
    const dy = t.clientY - (touchStart?.y ?? 0);
    if (Math.abs(dx) > 50 && Math.abs(dy) < 120) {
      if (dx > 0) {
        onPrevious();
      } else {
        onNext();
      }
    } else if (Math.abs(dx) < 40 && Math.abs(dy) < 40) {
      const { width, left } = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = t.clientX - left;
      if (x < width / 2) {
        onPrevious();
      } else {
        onNext();
      }
    }
    setTouchStart(null);
    setPaused(false);
    
    // Возобновление видео
    if (videoRef.current) {
      videoRef.current.play().catch(console.error);
    }
  };
  const onMouseDown = () => {
    setPaused(true);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };
  const onMouseUp = (e: React.MouseEvent) => {
    const { width, left } = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - left;
    if (x < width / 2) {
      onPrevious();
    } else {
      onNext();
    }
    setPaused(false);
    
    // Возобновление видео
    if (videoRef.current) {
      videoRef.current.play().catch(console.error);
    }
  };

  useEffect(() => {
    const handler = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') onClose();
      if (ev.key === 'ArrowLeft') onPrevious();
      if (ev.key === 'ArrowRight' || ev.key === ' ') {
        ev.preventDefault();
        onNext();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose, onNext, onPrevious]);

  if (!current) return null;

  // Проверяем что это изображение (может быть "image" или "image/jpeg" и т.д.)
  const isImage = current.contentType?.startsWith('image/') || current.contentType === 'image';
  const isVideo = current.contentType?.startsWith('video/') || current.contentType === 'video';

  const content =
    isImage && current.mediaUrl ? (
      <img 
        src={current.mediaUrl} 
        alt="" 
        className="w-full h-full object-cover" 
        loading="eager"
      />
    ) : isVideo && current.mediaUrl ? (
      <div className="relative w-full h-full">
        <video 
          ref={videoRef}
          src={current.mediaUrl} 
          className="w-full h-full object-cover" 
          autoPlay
          muted={isMuted}
          playsInline
          loop={false}
          preload="auto"
          onEnded={onNext}
          onVolumeChange={(e) => {
            // Синхронизируем состояние isMuted с реальным состоянием видео
            const video = e.currentTarget;
            setIsMuted(video.muted);
          }}
        />
        {/* Кнопка звука - показываем только если звук выключен */}
        {isMuted && (
          <button
            onClick={async () => {
              if (!videoRef.current) return;
              
              const video = videoRef.current;
              video.muted = false;
              setIsMuted(false);
              
              // Если видео на паузе из-за отсутствия взаимодействия, запускаем
              if (video.paused) {
                try {
                  await video.play();
                } catch (error) {
                  console.error('Failed to play video:', error);
                }
              }
            }}
            className="absolute top-4 right-4 w-12 h-12 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors z-10 animate-pulse"
            aria-label="Включить звук"
          >
            <VolumeX size={24} />
          </button>
        )}
        
        {/* Индикатор звука когда звук включён */}
        {!isMuted && (
          <button
            onClick={() => {
              if (!videoRef.current) return;
              videoRef.current.muted = true;
              setIsMuted(true);
            }}
            className="absolute top-4 right-4 w-10 h-10 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/50 transition-colors z-10"
            aria-label="Выключить звук"
          >
            <Volume2 size={20} />
          </button>
        )}
      </div>
    ) : current.contentType === 'text/plain' && current.text ? (
      <div className="w-full h-full flex items-center justify-center p-8" style={{ background: getGradient(current.gradient) }}>
        <div className="text-2xl md:text-3xl font-bold text-white text-center leading-snug drop-shadow">
          {current.text}
        </div>
      </div>
    ) : (
      <div className="w-full h-full" style={{ background: getGradient(current.gradient) }} />
    );

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Stories viewer"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
    >
      <div className="absolute inset-0 bg-transparent" />
      <div className="absolute top-4 left-4 right-4 z-10 flex gap-1">
        {stories.map((_, i) => (
          <div key={i} className="flex-1 h-1.5 bg-white/25 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-100"
              style={{
                width: i < currentIndex ? '100%' : i === currentIndex ? `${progress}%` : '0%',
              }}
            />
          </div>
        ))}
      </div>

      <div className="absolute top-6 left-4 right-4 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3 text-white">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shadow-[0_8px_24px_-10px_rgba(0,0,0,0.6)]"
            style={{ background: getGradient(current.gradient) }}
          >
            {initials(current.author)}
          </div>
          <div className="text-sm font-semibold">{current.author || 'Anonymous'}</div>
          <div className="text-xs text-white/70">{timeAgo(current.createdAt)}</div>
        </div>

        <button
          onClick={onClose}
          aria-label="Close stories"
          className="text-white/90 hover:text-white active:scale-95 transition w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shadow-[0_8px_24px_-10px_rgba(0,0,0,0.6)]"
        >
          <X size={18} />
        </button>
      </div>

      <div className="relative z-0 flex-1 flex items-center justify-center select-none">{content}</div>

      <div className="absolute bottom-6 left-4 right-4 z-10 flex items-center justify-between text-white">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Heart size={18} />
            <span className="text-sm">{current.likes || 0}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Eye size={18} />
            <span className="text-sm">{current.views || 0}</span>
          </div>
        </div>
        <span className="text-xs text-white/70">tap • swipe • esc</span>
      </div>
    </div>
  );
};

// Main
export const InstagramStoriesNew: React.FC = () => {
  const [stories, setStories] = useState<StoryWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorIdx, setAuthorIdx] = useState(0);
  const [storyIdx, setStoryIdx] = useState(0);
  const [open, setOpen] = useState(false);
  const [isCloseFriend, setIsCloseFriend] = useState<boolean | null>(null); // null = ещё не проверили

  // Получить ID пользователя из localStorage
  const getUserId = useCallback(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const u = JSON.parse(userData);
        return u.phone || u.id || u.userId || '';
      }
    } catch {
      // ignore
    }
    return '';
  }, []);

  // Проверить статус близкого друга
  useEffect(() => {
    const checkCloseFriendStatus = async () => {
      try {
        const userId = getUserId();
        if (!userId) {
          console.log('⚠️ User ID не найден в localStorage');
          setIsCloseFriend(false); // если нет ID - точно не близкий друг
          return;
        }

        console.log('🔍 Проверяем статус близкого друга для:', userId);
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          const closeFriendStatus = userData.isCloseFriend === true;
          console.log('✅ Статус близкого друга:', closeFriendStatus);
          setIsCloseFriend(closeFriendStatus);
        } else {
          console.log('⚠️ Документ пользователя не найден в Firestore');
          setIsCloseFriend(false); // если документа нет - не близкий друг
        }
      } catch (err) {
        console.error('❌ Ошибка проверки статуса близкого друга:', err);
        setIsCloseFriend(false); // при ошибке - не близкий друг
      }
    };

    checkCloseFriendStatus();
  }, [getUserId]);

  const loadStories = useCallback(async () => {
    // НЕ загружаем stories пока не проверили статус!
    if (isCloseFriend === null) {
      console.log('⏳ Ждём проверки статуса близкого друга...');
      return;
    }

    try {
      setLoading(true);
      const all = await StoriesService.getAll();
      
      console.log('📚 Всего stories загружено:', all.length);
      console.log('👤 Статус близкого друга:', isCloseFriend);
      
      // Фильтруем stories: если пользователь НЕ близкий друг - скрываем close-friends stories
      const filtered = all.filter(story => {
        console.log(`📖 Story "${story.text?.slice(0, 30) || 'без текста'}" - аудитория: ${story.audience || 'everyone'}`);
        
        if (story.audience === 'close-friends') {
          const show = isCloseFriend === true;
          console.log(`🔐 Story для избранных - показываем: ${show} (isCloseFriend: ${isCloseFriend})`);
          return show;
        }
        console.log(`✅ Story для всех - показываем: true`);
        return true; // обычные stories видят все
      });
      
      console.log('✅ После фильтрации stories:', filtered.length);
      
      const withFlags: StoryWithProgress[] = filtered.map((s) => ({ ...s, viewed: false }));
      setStories(withFlags);
    } catch (e) {
      console.error('Failed to load stories', e);
    } finally {
      setLoading(false);
    }
  }, [isCloseFriend]);

  // Загружаем stories ТОЛЬКО когда статус проверен
  useEffect(() => {
    if (isCloseFriend !== null) {
      console.log('🚀 Статус проверен, загружаем stories');
      loadStories();
    }
  }, [isCloseFriend, loadStories]);

  const groups = useMemo(() => {
    const g: Record<string, StoryWithProgress[]> = {};
    for (const s of stories) {
      const a = s.author || 'Anonymous';
      (g[a] ||= []).push(s);
    }
    Object.values(g).forEach((arr) =>
      arr.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    );
    return g;
  }, [stories]);

  const authors = useMemo(() => Object.keys(groups), [groups]);
  const currentAuthor = authors[authorIdx];

  const openStory = (aIndex: number, sIndex = 0) => {
    setAuthorIdx(aIndex);
    setStoryIdx(sIndex);
    setOpen(true);
  };
  const closeViewer = () => setOpen(false);

  const next = useCallback(() => {
    const arr = currentAuthor ? groups[currentAuthor] : [];
    if (storyIdx < arr.length - 1) {
      setStoryIdx((i) => i + 1);
    } else if (authorIdx < authors.length - 1) {
      setAuthorIdx((i) => i + 1);
      setStoryIdx(0);
    } else {
      setOpen(false);
    }
  }, [authorIdx, authors.length, currentAuthor, groups, storyIdx]);

  const prev = useCallback(() => {
    if (storyIdx > 0) {
      setStoryIdx((i) => i - 1);
    } else if (authorIdx > 0) {
      const prevA = authorIdx - 1;
      const arr = groups[authors[prevA]];
      setAuthorIdx(prevA);
      setStoryIdx(arr.length - 1);
    }
  }, [authorIdx, authors, groups, storyIdx]);

  const markViewed = async (id: string) => {
    try {
      setStories((prev) => prev.map((s) => (s.id === id ? { ...s, viewed: true } : s)));
      const s = stories.find((v) => v.id === id);
      if (s) await StoriesService.update(id, { views: (s.views || 0) + 1 });
    } catch (e) {
      console.error('Failed to mark viewed', e);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-5 w-28 bg-black/5 rounded animate-pulse" />
          <div className="h-5 w-16 bg-black/5 rounded animate-pulse" />
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex-shrink-0">
              <div className="w-[84px] h-[84px] rounded-full bg-black/5 animate-pulse" />
              <div className="w-[84px] h-2 rounded bg-black/5 mt-1 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="p-4">
        <div className="text-sm text-slate-500">No active stories</div>
      </div>
    );
  }

  return (
    <div className="py-2 bg-[#F6F7FB]">
      {/* Убрали надпись Stories - оставили только ленту */}
      
      {/* Кнопка обновления статуса и stories */}
      <div className="flex justify-end mb-2 px-4">
        <button
          onClick={() => {
            console.log('🔄 Принудительное обновление stories и статуса');
            window.location.reload();
          }}
          className="text-xs text-slate-500 hover:text-slate-800 active:scale-95 transition"
          aria-label="Обновить stories"
        >
          ⟳ Обновить
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar bg-[#F6F7FB]">
        {authors.map((author, i) => {
          const arr = groups[author];
          const anyUnviewed = arr.some((s) => !s.viewed);
          const latest = arr.reduce((a, b) =>
            new Date(a.createdAt || 0).getTime() > new Date(b.createdAt || 0).getTime() ? a : b
          );
          return (
            <StoriesRing
              key={author}
              story={{ ...latest, viewed: !anyUnviewed }}
              onOpen={() => openStory(i, 0)}
            />
          );
        })}
      </div>

      {open && currentAuthor && (
        <StoryViewer
          stories={groups[currentAuthor]}
          currentIndex={storyIdx}
          onClose={closeViewer}
          onNext={next}
          onPrevious={prev}
          onStoryView={markViewed}
        />
      )}
    </div>
  );
};

