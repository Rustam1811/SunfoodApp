import React, { useEffect, useMemo, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { nanoid } from 'nanoid';
import { db } from '../firebase';
import { useAdminAuth } from '../auth/AdminAuthContext';
import { logAdminAction } from '../utils/adminActions';
import { StatusBadge } from '../components/StatusBadge';

type FlowStatus = 'draft' | 'active' | 'archived';
type StepType = 'info' | 'timer' | 'check' | 'media' | 'input';

type FlowStep = {
  id: string;
  type: StepType;
  title: string;
  content: string | Record<string, unknown>;
  order: number;
};

type Flow = {
  id: string;
  entityId: string;
  status: FlowStatus;
  steps: FlowStep[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

type EntityOption = {
  id: string;
  title: string;
  status: string;
};

type FlowDraft = {
  entityId: string;
  status: FlowStatus;
};

const emptyFlow: FlowDraft = {
  entityId: '',
  status: 'draft',
};

type NewStepDraft = {
  title: string;
  type: StepType;
  content: string;
};

const emptyStep: NewStepDraft = {
  title: '',
  type: 'info',
  content: '',
};

const stepTypeLabels: Record<StepType, string> = {
  info: 'Info',
  timer: 'Timer',
  check: 'Check',
  media: 'Media',
  input: 'Input',
};

function parseContent(raw: string): string | Record<string, unknown> {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'))
  ) {
    try {
      return JSON.parse(trimmed) as Record<string, unknown>;
    } catch (error) {
      return trimmed;
    }
  }
  return trimmed;
}

function toContentString(value: FlowStep['content']): string {
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return '';
  }
}

export const Flows: React.FC = () => {
  const { user } = useAdminAuth();
  const [flows, setFlows] = useState<Flow[]>([]);
  const [entities, setEntities] = useState<EntityOption[]>([]);
  const [newFlow, setNewFlow] = useState<FlowDraft>(emptyFlow);
  const [draggedStep, setDraggedStep] = useState<{ flowId: string; stepId: string } | null>(null);

  useEffect(() => {
    const flowsQuery = query(collection(db, 'flows'), orderBy('createdAt', 'desc'));
    return onSnapshot(flowsQuery, (snapshot) => {
      const data = snapshot.docs.map((docSnap) => {
        const raw = docSnap.data() as Omit<Flow, 'id'>;
        return {
          id: docSnap.id,
          ...raw,
          steps: raw.steps ? [...raw.steps].sort((a, b) => a.order - b.order) : [],
        };
      });
      setFlows(data);
    });
  }, []);

  useEffect(() => {
    const entitiesQuery = query(collection(db, 'entities'), orderBy('order', 'asc'));
    return onSnapshot(entitiesQuery, (snapshot) => {
      const data = snapshot.docs.map((docSnap) => {
        const raw = docSnap.data() as Omit<EntityOption, 'id'>;
        return { id: docSnap.id, ...raw };
      });
      setEntities(data);
    });
  }, []);

  const entityMap = useMemo(() => {
    const map = new Map<string, EntityOption>();
    entities.forEach((entity) => {
      map.set(entity.id, entity);
    });
    return map;
  }, [entities]);

  const handleCreateFlow = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newFlow.entityId) return;
    const payload = {
      entityId: newFlow.entityId,
      status: newFlow.status,
      steps: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const ref = await addDoc(collection(db, 'flows'), payload);
    await logAdminAction({
      actionType: 'create',
      collection: 'flows',
      targetId: ref.id,
      diff: { entityId: newFlow.entityId, status: newFlow.status },
      byUid: user?.uid,
    });
    setNewFlow(emptyFlow);
  };

  const handleDeleteFlow = async (flow: Flow) => {
    if (!window.confirm(`Delete flow for entity ${flow.entityId}? This cannot be undone.`)) return;
    await deleteDoc(doc(db, 'flows', flow.id));
    await logAdminAction({
      actionType: 'delete',
      collection: 'flows',
      targetId: flow.id,
      diff: { entityId: flow.entityId },
      byUid: user?.uid,
    });
  };

  const updateFlowMeta = async (flow: Flow, patch: Partial<Pick<Flow, 'entityId' | 'status'>>) => {
    await updateDoc(doc(db, 'flows', flow.id), {
      ...patch,
      updatedAt: serverTimestamp(),
    });
    await logAdminAction({
      actionType: 'update',
      collection: 'flows',
      targetId: flow.id,
      diff: patch,
      byUid: user?.uid,
    });
  };

  const updateFlowSteps = async (
    flow: Flow,
    steps: FlowStep[],
    actionType: 'update' | 'reorder',
    diff?: Record<string, unknown>
  ) => {
    await updateDoc(doc(db, 'flows', flow.id), {
      steps,
      updatedAt: serverTimestamp(),
    });
    await logAdminAction({
      actionType,
      collection: 'flows',
      targetId: flow.id,
      diff,
      byUid: user?.uid,
    });
  };

  const handleAddStep = async (flow: Flow, draft: NewStepDraft) => {
    const nextOrder = flow.steps.length ? Math.max(...flow.steps.map((step) => step.order)) + 1 : 1;
    const step = {
      id: nanoid(6),
      type: draft.type,
      title: draft.title,
      content: parseContent(draft.content),
      order: nextOrder,
    };
    const steps = [...flow.steps, step];
    await updateFlowSteps(flow, steps, 'update', {
      addedStep: { id: step.id, type: step.type, title: step.title },
    });
  };

  const handleStepUpdate = async (flow: Flow, stepId: string, patch: Partial<FlowStep>) => {
    const steps = flow.steps.map((step) => (step.id === stepId ? { ...step, ...patch } : step));
    await updateFlowSteps(flow, steps, 'update', { stepId, patch });
  };

  const handleReorder = async (flow: Flow, targetStepId: string) => {
    if (!draggedStep || draggedStep.flowId !== flow.id || draggedStep.stepId === targetStepId) {
      setDraggedStep(null);
      return;
    }
    const current = [...flow.steps];
    const fromIndex = current.findIndex((step) => step.id === draggedStep.stepId);
    const toIndex = current.findIndex((step) => step.id === targetStepId);
    if (fromIndex < 0 || toIndex < 0) return;
    const [moved] = current.splice(fromIndex, 1);
    current.splice(toIndex, 0, moved);
    const reordered = current.map((step, index) => ({ ...step, order: index + 1 }));
    setDraggedStep(null);
    await updateFlowSteps(flow, reordered, 'reorder', {
      movedId: moved.id,
      from: fromIndex + 1,
      to: toIndex + 1,
    });
  };

  return (
    <div className="space-y-6">
      <div className="admin-card rounded-3xl px-5 py-5">
        <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--admin-muted)]">
          Flow Logic
        </div>
        <div className="mt-2 font-display text-lg font-semibold">Configure flow steps by entity</div>
      </div>

      <form onSubmit={handleCreateFlow} className="admin-card rounded-3xl px-5 py-6">
        <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--admin-muted)]">
          New flow
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-[2fr_1fr_auto]">
          <select
            className="rounded-2xl border border-[color:var(--admin-border)] px-4 py-3 text-sm"
            value={newFlow.entityId}
            onChange={(event) => setNewFlow({ ...newFlow, entityId: event.target.value })}
            required
          >
            <option value="">Select entity</option>
            {entities.map((entity) => (
              <option key={entity.id} value={entity.id} disabled={entity.status === 'archived'}>
                {entity.title || entity.id}
              </option>
            ))}
          </select>
          <select
            className="rounded-2xl border border-[color:var(--admin-border)] px-4 py-3 text-sm"
            value={newFlow.status}
            onChange={(event) =>
              setNewFlow({ ...newFlow, status: event.target.value as FlowStatus })
            }
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
          <button
            type="submit"
            className="rounded-2xl bg-[color:var(--admin-accent)] px-4 py-3 text-sm font-semibold text-white"
          >
            Create flow
          </button>
        </div>
      </form>

      <div className="space-y-6">
        {flows.length === 0 ? (
          <div className="admin-card rounded-3xl px-6 py-10 text-center text-sm text-[color:var(--admin-muted)]">
            No flows created yet.
          </div>
        ) : (
          flows.map((flow) => {
            const entity = entityMap.get(flow.entityId);
            return (
              <div key={flow.id} className="admin-card rounded-3xl px-6 py-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-display text-lg font-semibold">
                      {entity?.title || flow.entityId}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-[color:var(--admin-muted)]">
                      <span>Flow ID: {flow.id}</span>
                      <StatusBadge value={flow.status} />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleDeleteFlow(flow)}
                    className="rounded-full border border-[#f2d1cc] px-3 py-2 text-xs font-semibold text-[color:var(--admin-warn)]"
                  >
                    Delete flow
                  </button>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <select
                    className="rounded-2xl border border-[color:var(--admin-border)] px-4 py-3 text-sm"
                    value={flow.entityId}
                    onChange={(event) =>
                      void updateFlowMeta(flow, { entityId: event.target.value })
                    }
                  >
                    {entities.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.title || option.id}
                      </option>
                    ))}
                  </select>
                  <select
                    className="rounded-2xl border border-[color:var(--admin-border)] px-4 py-3 text-sm"
                    value={flow.status}
                    onChange={(event) =>
                      void updateFlowMeta(flow, { status: event.target.value as FlowStatus })
                    }
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="mt-4 space-y-3">
                  {flow.steps.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-[color:var(--admin-border)] px-4 py-4 text-xs text-[color:var(--admin-muted)]">
                      No steps yet. Add the first step below.
                    </div>
                  ) : (
                    flow.steps.map((step) => (
                      <div
                        key={step.id}
                        draggable
                        onDragStart={() => setDraggedStep({ flowId: flow.id, stepId: step.id })}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={() => void handleReorder(flow, step.id)}
                        className="flex flex-col gap-4 rounded-2xl border border-[color:var(--admin-border)] bg-white px-4 py-4 text-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--admin-muted)]">
                            drag
                          </div>
                          <div className="text-xs text-[color:var(--admin-muted)]">Order {step.order}</div>
                        </div>
                        <div className="grid gap-3 md:grid-cols-[1fr_160px]">
                          <input
                            key={`${step.id}-${step.title}`}
                            className="rounded-xl border border-[color:var(--admin-border)] px-3 py-2 text-sm"
                            defaultValue={step.title}
                            onBlur={(event) => {
                              const next = event.target.value.trim();
                              if (next && next !== step.title) {
                                void handleStepUpdate(flow, step.id, { title: next });
                              }
                            }}
                          />
                          <select
                            className="rounded-xl border border-[color:var(--admin-border)] px-3 py-2 text-sm"
                            value={step.type}
                            onChange={(event) =>
                              void handleStepUpdate(flow, step.id, {
                                type: event.target.value as StepType,
                              })
                            }
                          >
                            {Object.entries(stepTypeLabels).map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <textarea
                          key={`${step.id}-${step.order}`}
                          className="min-h-[88px] rounded-xl border border-[color:var(--admin-border)] px-3 py-2 text-sm"
                          defaultValue={toContentString(step.content)}
                          onBlur={(event) => {
                            const next = event.target.value;
                            if (next !== toContentString(step.content)) {
                              void handleStepUpdate(flow, step.id, { content: parseContent(next) });
                            }
                          }}
                        />
                      </div>
                    ))
                  )}
                </div>

                <FlowAddStep
                  flow={flow}
                  onAdd={(draft) => void handleAddStep(flow, draft)}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const FlowAddStep: React.FC<{ flow: Flow; onAdd: (draft: NewStepDraft) => void }> = ({
  flow,
  onAdd,
}) => {
  const [draft, setDraft] = useState<NewStepDraft>(emptyStep);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.title.trim()) return;
    onAdd({ ...draft, title: draft.title.trim() });
    setDraft(emptyStep);
  };

  return (
    <form onSubmit={submit} className="mt-4 flex flex-col gap-3">
      <div className="grid gap-3 md:grid-cols-[1fr_180px]">
        <input
          className="rounded-2xl border border-[color:var(--admin-border)] px-4 py-3 text-sm"
          placeholder={`Add step to ${flow.entityId}`}
          value={draft.title}
          onChange={(event) => setDraft({ ...draft, title: event.target.value })}
        />
        <select
          className="rounded-2xl border border-[color:var(--admin-border)] px-4 py-3 text-sm"
          value={draft.type}
          onChange={(event) => setDraft({ ...draft, type: event.target.value as StepType })}
        >
          {Object.entries(stepTypeLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <textarea
        className="min-h-[90px] rounded-2xl border border-[color:var(--admin-border)] px-4 py-3 text-sm"
        placeholder="Step content (text or JSON)"
        value={draft.content}
        onChange={(event) => setDraft({ ...draft, content: event.target.value })}
      />
      <button
        type="submit"
        className="self-start rounded-2xl bg-[color:var(--admin-accent)] px-4 py-3 text-sm font-semibold text-white"
      >
        Add step
      </button>
    </form>
  );
};
