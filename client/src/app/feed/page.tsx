"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { type Entity } from '@/lib/firestore';
import { useOnline } from '@/lib/useOnline';
import { SkeletonCard } from '@/components/SkeletonCard';
import { OfflineState } from '@/components/OfflineState';
import { impact, softTap } from '@/lib/haptics';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function FeedPage() {
  const router = useRouter();
  const online = useOnline();
  const [entities, setEntities] = useState<Entity[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dragX, setDragX] = useState(0);
  const [pressed, setPressed] = useState(false);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const metricsRef = useRef({ width: 0, cardWidth: 0, gap: 18, step: 0, offset: 0 });
  const dragRef = useRef({ startX: 0, lastX: 0, lastTime: 0, velocity: 0 });
  const dragValueRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const updateDragX = (value: number) => {
    dragValueRef.current = value;
    if (rafRef.current) return;
    rafRef.current = window.requestAnimationFrame(() => {
      setDragX(value);
      rafRef.current = null;
    });
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    const entitiesQuery = query(
      collection(db, 'entities'),
      where('status', '==', 'active'),
      orderBy('order', 'asc')
    );
    const unsubscribe = onSnapshot(
      entitiesQuery,
      (snapshot) => {
        const data = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<Entity, 'id'>),
        }));
        setEntities(data);
        setIndex((prev) => Math.min(prev, Math.max(data.length - 1, 0)));
        setLoading(false);
      },
      (err) => {
        console.error('Feed load error:', err);
        setError('Failed to load entities.');
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const updateMetrics = () => {
      const width = containerRef.current?.clientWidth ?? 0;
      const cardWidth = Math.max(Math.min(width * 0.78, 360), 260);
      const gap = Math.max(width * 0.06, 16);
      const step = cardWidth + gap;
      const offset = (width - cardWidth) / 2;
      metricsRef.current = { width, cardWidth, gap, step, offset };
    };
    updateMetrics();
    window.addEventListener('resize', updateMetrics);
    return () => window.removeEventListener('resize', updateMetrics);
  }, []);

  useEffect(() => {
    setDragX(0);
  }, [index]);

  const current = entities[index];
  const progress = metricsRef.current.step ? dragX / metricsRef.current.step : 0;

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!current) return;
    setPressed(true);
    setDragging(true);
    dragRef.current = {
      startX: event.clientX,
      lastX: event.clientX,
      lastTime: Date.now(),
      velocity: 0,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const { startX, lastX, lastTime } = dragRef.current;
    const dx = event.clientX - startX;
    const now = Date.now();
    const deltaX = event.clientX - lastX;
    const deltaTime = Math.max(now - lastTime, 1);
    const velocity = deltaX / deltaTime;

    dragRef.current = {
      startX,
      lastX: event.clientX,
      lastTime: now,
      velocity,
    };

    const { step } = metricsRef.current;
    if (!step) return;

    let resisted = dx;
    if ((index === 0 && dx > 0) || (index === entities.length - 1 && dx < 0)) {
      resisted = dx * 0.35;
    }

    if (Math.abs(dx) > 6) {
      setPressed(false);
    }

    updateDragX(resisted);
  };

  const springToZero = (fromValue: number) => {
    let value = fromValue;
    let velocity = dragRef.current.velocity * 14;
    const stiffness = 0.16;
    const damping = 0.82;

    const step = () => {
      const force = -stiffness * value;
      velocity = velocity * damping + force;
      value += velocity;
      updateDragX(value);

      if (Math.abs(value) > 0.5 || Math.abs(velocity) > 0.5) {
        window.requestAnimationFrame(step);
      } else {
        setDragX(0);
        dragValueRef.current = 0;
      }
    };

    window.requestAnimationFrame(step);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setDragging(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
    const { startX, velocity } = dragRef.current;
    const dx = event.clientX - startX;
    const threshold = metricsRef.current.step * 0.25 || 80;
    const flick = Math.abs(velocity) > 0.55;

    if (Math.abs(dx) < 8) {
      setPressed(false);
      softTap();
      router.push(`/details/${current?.id}`);
      setDragX(0);
      dragValueRef.current = 0;
      return;
    }

    let nextIndex = index;
    if (dx < -threshold || (flick && velocity < 0)) {
      nextIndex = Math.min(index + 1, entities.length - 1);
    } else if (dx > threshold || (flick && velocity > 0)) {
      nextIndex = Math.max(index - 1, 0);
    }

    if (nextIndex !== index) {
      setIndex(nextIndex);
      impact();
    }

    setPressed(false);
    springToZero(dragValueRef.current);
  };

  if (!online && !loading && entities.length === 0) {
    return <OfflineState />;
  }

  if (loading) {
    return <SkeletonCard />;
  }

  if (error || entities.length === 0 || !current) {
    return (
      <div className="card" style={{ padding: 28 }}>
        <div className="chip">No Content</div>
        <h2 className="title" style={{ marginTop: 16, fontSize: 28 }}>
          Nothing active yet.
        </h2>
        <p style={{ marginTop: 12, color: 'var(--muted)' }}>
          Admin has not published any active entities.
        </p>
      </div>
    );
  }

  return (
    <div className="feed-shell" ref={containerRef}>
      <div className={`pressable${pressed ? ' pressed' : ''}`}>
        <div
          className="feed-track"
          style={{
            transform: `translateX(${metricsRef.current.offset - index * metricsRef.current.step + dragX}px)`,
            transition: dragging ? 'none' : 'transform 0.45s cubic-bezier(0.18, 0.76, 0.2, 1)',
            ['--track-gap' as string]: `${metricsRef.current.gap}px`,
            touchAction: 'none',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {entities.map((entity, idx) => {
            const position = idx - index + progress;
            const distance = Math.min(Math.abs(position), 2);
            const scale = 1 - distance * 0.08;
            const blur = distance * 6;
            const opacity = 1 - distance * 0.3;

            return (
              <div
                key={entity.id}
                className="feed-card"
                style={{
                  width: metricsRef.current.cardWidth,
                  transform: `translateY(${distance * 8}px) scale(${scale})`,
                  filter: `blur(${blur}px)`,
                  opacity,
                }}
              >
                <div className="feed-card-inner">
                  <span className="chip">Active</span>
                  <h1 className="title" style={{ marginTop: 18, fontSize: 32 }}>
                    {entity.title || 'Untitled'}
                  </h1>
                  <p style={{ marginTop: 10, color: 'var(--muted)' }}>{entity.description}</p>
                  <div
                    className="feed-image"
                    style={{
                      background: entity.image
                        ? `center / cover no-repeat url(${entity.image})`
                        : 'linear-gradient(120deg, #f8efe6, #f0dfcf)',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
