import React, { useEffect, useMemo, useState } from 'react';
import {
  collection,
  getCountFromServer,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../firebase';

type ActionLog = {
  id: string;
  actionType: string;
  collection: string;
  targetId: string;
  byUid?: string;
  createdAt?: { toDate: () => Date };
  diff?: Record<string, unknown>;
};

type EntitySummary = {
  active: number;
  flows: number;
};

export const Dashboard: React.FC = () => {
  const [counts, setCounts] = useState<EntitySummary>({
    active: 0,
    flows: 0,
  });
  const [recentActions, setRecentActions] = useState<ActionLog[]>([]);

  useEffect(() => {
    const loadCounts = async () => {
      try {
        const activeEntitiesQuery = query(
          collection(db, 'entities'),
          where('status', '==', 'active')
        );
        const flowsQuery = collection(db, 'flows');
        const [activeEntitiesCount, flowsCount] = await Promise.all([
          getCountFromServer(activeEntitiesQuery),
          getCountFromServer(flowsQuery),
        ]);
        setCounts({
          active: activeEntitiesCount.data().count,
          flows: flowsCount.data().count,
        });
      } catch (err) {
        console.error('[Admin] Failed to load counts:', err);
      }
    };

    loadCounts();
  }, []);

  useEffect(() => {
    const actionsQuery = query(
      collection(db, 'admin_actions'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    return onSnapshot(actionsQuery, (snapshot) => {
      const actions = snapshot.docs.map((doc) => {
        const data = doc.data() as ActionLog;
        return { ...data, id: doc.id };
      });
      setRecentActions(actions);
    });
  }, []);

  const actionsPreview = useMemo(() => {
    return recentActions.map((action) => {
      const timestamp = action.createdAt?.toDate ? action.createdAt.toDate().toLocaleString() : 'Just now';
      const fallbackAction = (action as unknown as { action?: string }).action;
      const fallbackCollection = (action as unknown as { entityType?: string }).entityType;
      const fallbackTarget = (action as unknown as { entityId?: string }).entityId;
      return {
        ...action,
        actionType: action.actionType || fallbackAction || 'update',
        collection: action.collection || fallbackCollection || 'entities',
        targetId: action.targetId || fallbackTarget || 'unknown',
        timestamp,
      };
    });
  }, [recentActions]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="admin-card rounded-3xl px-5 py-5">
          <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--admin-muted)]">
            Active Entities
          </div>
          <div className="mt-4 font-display text-3xl font-semibold">
            {counts.active}
          </div>
          <div className="mt-2 text-xs text-[color:var(--admin-muted)]">
            Visible to client apps.
          </div>
        </div>
        <div className="admin-card rounded-3xl px-5 py-5">
          <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--admin-muted)]">
            Flows
          </div>
          <div className="mt-4 font-display text-3xl font-semibold">{counts.flows}</div>
          <div className="mt-2 text-xs text-[color:var(--admin-muted)]">Total flow definitions.</div>
        </div>
        <div className="admin-card rounded-3xl px-5 py-5">
          <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--admin-muted)]">
            Data Discipline
          </div>
          <div className="mt-4 text-sm font-semibold text-[color:var(--admin-ink)]">
            Admin is the single source of truth.
          </div>
          <p className="mt-2 text-xs text-[color:var(--admin-muted)]">
            Create, update, and govern states here. Client apps read and execute.
          </p>
        </div>
      </div>

      <div className="admin-card rounded-3xl px-5 py-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--admin-muted)]">
              Recent Actions
            </div>
            <div className="mt-2 font-display text-lg font-semibold">Latest CRUD activity</div>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {actionsPreview.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[color:var(--admin-border)] px-4 py-4 text-xs text-[color:var(--admin-muted)]">
              No recent admin actions yet.
            </div>
          ) : (
            actionsPreview.map((action) => (
              <div
                key={action.id}
                className="flex items-center justify-between rounded-2xl border border-[color:var(--admin-border)] bg-white px-4 py-3 text-xs"
              >
                <div>
                  <div className="font-semibold text-[color:var(--admin-ink)]">
                    {action.actionType} {action.collection} {action.targetId}
                  </div>
                  <div className="mt-1 text-[color:var(--admin-muted)]">
                    {action.byUid ? `by ${action.byUid}` : 'by admin'}
                  </div>
                </div>
                <div className="text-[color:var(--admin-muted)]">
                  {action.timestamp}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
