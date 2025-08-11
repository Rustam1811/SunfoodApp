import { useCallback, useEffect, useRef, useState } from 'react';
import type { StoryItem } from '../types/story';

interface UseStoryPlayerOptions {
  stories: StoryItem[];
  defaultDurationMs?: number;
  autoPlay?: boolean;
  onStoryStart?: (story: StoryItem) => void;
  onStoryEnd?: (story: StoryItem) => void;
  onSequenceEnd?: () => void;
}

export function useStoryPlayer({
  stories,
  defaultDurationMs = 5000,
  autoPlay = true,
  onStoryStart,
  onStoryEnd,
  onSequenceEnd
}: UseStoryPlayerOptions) {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(!autoPlay);
  const timerRef = useRef<number | null>(null);

  const current = stories[index];

  const clearTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const goNext = useCallback(() => {
    if (!current) return;
    onStoryEnd?.(current);
    setProgress(0);
    if (index < stories.length - 1) {
      const nextIndex = index + 1;
      setIndex(nextIndex);
      onStoryStart?.(stories[nextIndex]);
    } else {
      onSequenceEnd?.();
    }
  }, [current, index, stories, onStoryEnd, onStoryStart, onSequenceEnd]);

  const goPrev = useCallback(() => {
    if (index > 0) {
      const prevIndex = index - 1;
      setIndex(prevIndex);
      setProgress(0);
      onStoryStart?.(stories[prevIndex]);
    }
  }, [index, stories, onStoryStart]);

  useEffect(() => {
    clearTimer();
    if (paused || !current) return;
    const duration = current.durationMs || defaultDurationMs;
    const step = 50;
    const inc = (step / duration) * 100;
    timerRef.current = window.setInterval(() => {
      setProgress(p => {
        const np = p + inc;
        if (np >= 100) {
          goNext();
          return 0;
        }
        return np;
      });
    }, step);
    return clearTimer;
  }, [paused, current, defaultDurationMs, goNext]);

  const pause = () => setPaused(true);
  const resume = () => setPaused(false);
  const toggle = () => setPaused(p => !p);

  return {
    index,
    current,
    progress,
    paused,
    goNext,
    goPrev,
    pause,
    resume,
    toggle,
    setIndex,
    setProgress
  };
}
