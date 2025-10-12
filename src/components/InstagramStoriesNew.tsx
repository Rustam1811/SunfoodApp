import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { X, Heart, Eye } from 'lucide-react';
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
      <div
        className="w-full h-full rounded-full flex items-center justify-center text-white text-xs font-bold"
        style={{ background: getGradient(story.gradient) }}
      >
        {initials(story.author)}
      </div>
    );

  const isCloseFriends = story.audience === 'close-friends';
  
  return (
    <button
      onClick={onOpen}
      aria-label={`Open stories by ${story.author || 'Anonymous'}`}
      className={`group flex-shrink-0 rounded-full active:scale-95 transition-transform duration-100 ${
        story.viewed ? 'opacity-60' : 'opacity-100'
      }`}
      style={{ contain: 'layout style paint' }}
    >
      <span className={`ring2 relative block ${isCloseFriends ? 'close-friends' : ''}`}>
        {/* внутренняя часть: БЕЗ серого фона */}
        <span className="ring2-inner absolute rounded-full overflow-hidden">
          {content}
        </span>
      </span>

      <p className="text-xs text-center mt-0.5 truncate w-[72px] text-slate-900 font-medium">
        {story.author || 'Anonymous'}
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
  }, [current?.id]); // eslint-disable-line

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    setTouchStart({ x: t.clientX, y: t.clientY });
    setPaused(true);
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
  };
  const onMouseDown = () => setPaused(true);
  const onMouseUp = (e: React.MouseEvent) => {
    const { width, left } = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - left;
    if (x < width / 2) {
      onPrevious();
    } else {
      onNext();
    }
    setPaused(false);
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

  const content =
    isImage && current.mediaUrl ? (
      <img 
        src={current.mediaUrl} 
        alt="" 
        className="w-full h-full object-cover" 
        loading="eager"
      />
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
      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_-10%,rgba(8,8,8,0.85),rgba(0,0,0,0.95))]" />
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
    <div className="py-2">
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

      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar px-1">
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
