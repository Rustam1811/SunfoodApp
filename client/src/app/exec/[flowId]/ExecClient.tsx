"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { type Flow, type FlowStep } from '@/lib/firestore';
import { useOnline } from '@/lib/useOnline';
import { GestureSurface } from '@/components/GestureSurface';
import { OfflineState } from '@/components/OfflineState';
import { ProgressDots } from '@/components/ProgressDots';
import { SkeletonCard } from '@/components/SkeletonCard';
import { impact, softTap } from '@/lib/haptics';
import { subscribeFlowSession, updateFlowSession } from '@/lib/session';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

function getTimerSeconds(step: FlowStep): number {
  if (typeof step.content === 'string') {
    const parsed = Number(step.content);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  const content = step.content as { seconds?: number; duration?: number };
  return content.seconds ?? content.duration ?? 0;
}

const StepContent: React.FC<{ step: FlowStep }> = ({ step }) => {
  if (step.type === 'timer') {
    const seconds = getTimerSeconds(step);
    return <TimerStep seconds={seconds} />;
  }

  if (step.type === 'check') {
    const list =
      typeof step.content === 'string'
        ? step.content.split('\n')
        : ((step.content as { items?: string[] }).items ?? []);
    return <CheckList items={list.filter(Boolean)} />;
  }

  if (step.type === 'media') {
    const url =
      typeof step.content === 'string'
        ? step.content
        : (step.content as { url?: string }).url || '';
    if (!url) {
      return <p style={{ color: 'var(--muted)' }}>No media linked.</p>;
    }
    return (
      <div
        style={{
          marginTop: 12,
          height: 220,
          borderRadius: 24,
          border: '1px solid var(--border)',
          background: `center / cover no-repeat url(${url})`,
        }}
      />
    );
  }

  if (step.type === 'input') {
    return (
      <textarea
        placeholder="Add your notes here..."
        style={{
          marginTop: 12,
          minHeight: 120,
          width: '100%',
          borderRadius: 20,
          border: '1px solid var(--border)',
          padding: 14,
          fontFamily: 'inherit',
        }}
      />
    );
  }

  const content = typeof step.content === 'string' ? step.content : JSON.stringify(step.content);
  return <p style={{ marginTop: 12, color: 'var(--muted)' }}>{content}</p>;
};

const CheckList: React.FC<{ items: string[] }> = ({ items }) => {
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  return (
    <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
      {items.map((item, idx) => {
        const active = checked[idx];
        return (
          <div
            key={idx}
            role="button"
            tabIndex={0}
            onClick={() => setChecked((prev) => ({ ...prev, [idx]: !prev[idx] }))}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                setChecked((prev) => ({ ...prev, [idx]: !prev[idx] }));
              }
            }}
            onPointerUp={() => softTap()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '14px 16px',
              borderRadius: 20,
              border: '1px solid var(--border)',
              background: active ? 'rgba(196, 106, 60, 0.08)' : '#fffaf6',
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: 999,
                border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                background: active ? 'var(--accent)' : 'transparent',
                boxShadow: active ? '0 0 0 4px rgba(196, 106, 60, 0.12)' : 'none',
              }}
            />
            <span style={{ fontSize: 15 }}>{item}</span>
          </div>
        );
      })}
    </div>
  );
};

const TimerStep: React.FC<{ seconds: number }> = ({ seconds }) => {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (remaining <= 0) return;
    const timer = window.setTimeout(() => {
      setRemaining((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [remaining]);

  return (
    <div
      style={{
        marginTop: 12,
        padding: 18,
        borderRadius: 20,
        border: '1px solid var(--border)',
        background: '#fff8f2',
        textAlign: 'center',
        fontWeight: 600,
      }}
    >
      {remaining > 0 ? `${remaining}s remaining` : 'Timer complete'}
    </div>
  );
};

export default function ExecClient() {
  const router = useRouter();
  const params = useParams();
  const flowId = params?.flowId as string | undefined;
  const online = useOnline();
  const [flow, setFlow] = useState<Flow | null>(null);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const visitedRef = useRef<string[]>([]);
  const hydratedRef = useRef(false);
  const prevIndexRef = useRef(0);

  useEffect(() => {
    if (!flowId) return;
    setLoading(true);
    setError(null);
    const flowUnsub = onSnapshot(
      doc(db, 'flows', flowId),
      (snapshot) => {
        if (!snapshot.exists()) {
          setFlow(null);
          setLoading(false);
          return;
        }
        const raw = snapshot.data() as Omit<Flow, 'id'>;
        const steps = raw.steps ? [...raw.steps].sort((a, b) => a.order - b.order) : [];
        setFlow({ id: snapshot.id, ...raw, steps });
        setLoading(false);
      },
      (err) => {
        console.error('Flow load error:', err);
        setError('Failed to load flow.');
        setLoading(false);
      }
    );

    const sessionUnsub = subscribeFlowSession(flowId, (session) => {
      if (!session || hydratedRef.current) return;
      if (typeof session.stepIndex === 'number') {
        setIndex(session.stepIndex);
        prevIndexRef.current = session.stepIndex;
      }
      if (Array.isArray(session.visitedStepIds)) {
        visitedRef.current = session.visitedStepIds;
      }
      hydratedRef.current = true;
    });

    return () => {
      flowUnsub();
      sessionUnsub();
    };
  }, [flowId]);

  const steps = useMemo(
    () => (flow?.steps ? [...flow.steps].sort((a, b) => a.order - b.order) : []),
    [flow]
  );
  const current = steps[index];

  useEffect(() => {
    if (!flowId || !current) return;
    const nextVisited = visitedRef.current.includes(current.id)
      ? visitedRef.current
      : [...visitedRef.current, current.id];
    visitedRef.current = nextVisited;
    updateFlowSession(flowId, {
      stepIndex: index,
      stepId: current.id,
      visitedStepIds: nextVisited,
    }).catch((err) => console.warn('Session update failed:', err));
  }, [flowId, current?.id, index]);

  useEffect(() => {
    if (index === prevIndexRef.current) return;
    prevIndexRef.current = index;
    impact();
  }, [index]);

  if (!online && !loading && !flow) {
    return <OfflineState message="Reconnect to continue the flow." />;
  }

  if (loading) {
    return <SkeletonCard />;
  }

  if (error || !flow || flow.status !== 'active') {
    return (
      <div className="card" style={{ padding: 28 }}>
        <div className="chip">Flow paused</div>
        <h2 className="title" style={{ marginTop: 16, fontSize: 28 }}>
          This flow is not available.
        </h2>
        <p style={{ marginTop: 12, color: 'var(--muted)' }}>Come back later.</p>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="card" style={{ padding: 28 }}>
        <div className="chip">No steps</div>
        <h2 className="title" style={{ marginTop: 16, fontSize: 28 }}>
          This flow has no steps.
        </h2>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        position: 'relative',
        padding: 12,
        background: 'linear-gradient(160deg, rgba(255,248,240,0.85), rgba(246,236,225,0.75))',
        borderRadius: 32,
      }}
      onClick={() => {
        softTap();
        router.back();
      }}
    >
      <GestureSurface
        className="card reveal"
        style={{ maxWidth: 520, margin: '0 auto' }}
        onSwipeLeft={() => setIndex((prev) => Math.min(prev + 1, steps.length - 1))}
        onSwipeRight={() => setIndex((prev) => Math.max(prev - 1, 0))}
        onSwipeDown={() => {
          softTap();
          router.back();
        }}
      >
        <div
          style={{ padding: 28 }}
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <div key={current.id} className="reveal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="chip">{current.type}</span>
              <span
                style={{
                  fontSize: 12,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'var(--muted)',
                }}
              >
                {index + 1} / {steps.length}
              </span>
            </div>
            <h1 className="title" style={{ marginTop: 18, fontSize: 32 }}>
              {current.title}
            </h1>
            <StepContent step={current} />
          </div>
          <div style={{ marginTop: 24 }}>
            <ProgressDots count={steps.length} activeIndex={index} />
          </div>
        </div>
      </GestureSurface>
    </div>
  );
}
