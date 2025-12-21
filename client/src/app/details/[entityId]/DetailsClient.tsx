"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { type Entity, type Flow } from '@/lib/firestore';
import { useOnline } from '@/lib/useOnline';
import { GestureSurface } from '@/components/GestureSurface';
import { OfflineState } from '@/components/OfflineState';
import { SkeletonCard } from '@/components/SkeletonCard';
import { impact, softTap } from '@/lib/haptics';
import { collection, doc, limit, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function DetailsClient() {
  const router = useRouter();
  const params = useParams();
  const entityId = params?.entityId as string | undefined;
  const online = useOnline();
  const [entity, setEntity] = useState<Entity | null>(null);
  const [flow, setFlow] = useState<Flow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!entityId) return;
    setLoading(true);
    setError(null);
    const entityUnsub = onSnapshot(
      doc(db, 'entities', entityId),
      (snapshot) => {
        if (!snapshot.exists()) {
          setEntity(null);
        } else {
          setEntity({ id: snapshot.id, ...(snapshot.data() as Omit<Entity, 'id'>) });
        }
        setLoading(false);
      },
      (err) => {
        console.error('Details entity error:', err);
        setError('Failed to load details.');
        setLoading(false);
      }
    );

    const flowQuery = query(
      collection(db, 'flows'),
      where('entityId', '==', entityId),
      where('status', '==', 'active'),
      limit(1)
    );

    const flowUnsub = onSnapshot(
      flowQuery,
      (snapshot) => {
        if (snapshot.empty) {
          setFlow(null);
          return;
        }
        const docSnap = snapshot.docs[0];
        const raw = docSnap.data() as Omit<Flow, 'id'>;
        const steps = raw.steps ? [...raw.steps].sort((a, b) => a.order - b.order) : [];
        setFlow({ id: docSnap.id, ...raw, steps });
      },
      (err) => {
        console.error('Details flow error:', err);
      }
    );

    return () => {
      entityUnsub();
      flowUnsub();
    };
  }, [entityId]);

  if (!online && !loading && !entity) {
    return <OfflineState message="Reconnect to view details." />;
  }

  if (loading) {
    return <SkeletonCard />;
  }

  if (error || !entity || entity.status !== 'active') {
    return (
      <div className="card" style={{ padding: 28 }}>
        <div className="chip">Unavailable</div>
        <h2 className="title" style={{ marginTop: 16, fontSize: 28 }}>
          This entity is not active.
        </h2>
        <p style={{ marginTop: 12, color: 'var(--muted)' }}>Come back later.</p>
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
        router.push('/feed');
      }}
    >
      <GestureSurface
        className="card reveal"
        style={{ maxWidth: 520, margin: '0 auto' }}
        onSwipeDown={() => {
          softTap();
          router.push('/feed');
        }}
        onSwipeUp={() => {
          if (!flow) return;
          impact();
          router.push(`/exec/${flow.id}`);
        }}
      >
        <div
          style={{ padding: 28 }}
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <span className="chip">Focus</span>
          <h1 className="title" style={{ marginTop: 18, fontSize: 32 }}>
            {entity.title || 'Untitled'}
          </h1>
          <p style={{ marginTop: 10, color: 'var(--muted)' }}>{entity.description}</p>
          <div
            style={{
              marginTop: 18,
              borderRadius: 24,
              border: '1px solid var(--border)',
              overflow: 'hidden',
              height: 220,
              background: entity.image
                ? `center / cover no-repeat url(${entity.image})`
                : 'linear-gradient(120deg, #f8efe6, #f0dfcf)',
            }}
          />
          <div style={{ marginTop: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>
              {flow ? `${flow.steps.length} steps ready` : 'No active flow'}
            </div>
          </div>
        </div>
      </GestureSurface>
    </div>
  );
}
