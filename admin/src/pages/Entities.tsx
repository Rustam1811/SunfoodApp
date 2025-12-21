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
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAdminAuth } from '../auth/AdminAuthContext';
import { logAdminAction } from '../utils/adminActions';
import { StatusBadge } from '../components/StatusBadge';

type EntityStatus = 'draft' | 'active' | 'archived';
type Entity = {
  id: string;
  title: string;
  description: string;
  image: string;
  status: EntityStatus;
  order: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

type EntityForm = {
  title: string;
  description: string;
  image: string;
  status: EntityStatus;
};

const emptyForm: EntityForm = {
  title: '',
  description: '',
  image: '',
  status: 'draft',
};

export const Entities: React.FC = () => {
  const { user } = useAdminAuth();
  const [entities, setEntities] = useState<Entity[]>([]);
  const [createForm, setCreateForm] = useState<EntityForm>(emptyForm);
  const [editing, setEditing] = useState<Entity | null>(null);
  const [editForm, setEditForm] = useState<EntityForm>(emptyForm);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  useEffect(() => {
    const entitiesQuery = query(
      collection(db, 'entities'),
      orderBy('order', 'asc')
    );
    return onSnapshot(entitiesQuery, (snapshot) => {
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Entity, 'id'>),
      }));
      setEntities(data);
    });
  }, []);

  const lastOrder = useMemo(() => (entities.length ? entities[entities.length - 1].order : 0), [entities]);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload = {
      ...createForm,
      order: lastOrder + 1,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const ref = await addDoc(collection(db, 'entities'), payload);
    await logAdminAction({
      actionType: 'create',
      collection: 'entities',
      targetId: ref.id,
      diff: { title: createForm.title, status: createForm.status, order: lastOrder + 1 },
      byUid: user?.uid,
    });
    setCreateForm(emptyForm);
  };

  const openEdit = (entity: Entity) => {
    setEditing(entity);
    setEditForm({
      title: entity.title,
      description: entity.description,
      image: entity.image,
      status: entity.status,
    });
  };

  const handleEditSave = async () => {
    if (!editing) return;
    const ref = doc(db, 'entities', editing.id);
    await updateDoc(ref, {
      ...editForm,
      updatedAt: serverTimestamp(),
    });
    await logAdminAction({
      actionType: 'update',
      collection: 'entities',
      targetId: editing.id,
      diff: {
        title: { from: editing.title, to: editForm.title },
        description: { from: editing.description, to: editForm.description },
        image: { from: editing.image, to: editForm.image },
        status: { from: editing.status, to: editForm.status },
      },
      byUid: user?.uid,
    });
    setEditing(null);
  };

  const handleStatusChange = async (entity: Entity, status: EntityStatus) => {
    const ref = doc(db, 'entities', entity.id);
    await updateDoc(ref, { status, updatedAt: serverTimestamp() });
    await logAdminAction({
      actionType: 'update',
      collection: 'entities',
      targetId: entity.id,
      diff: { status: { from: entity.status, to: status } },
      byUid: user?.uid,
    });
  };

  const handleArchive = async (entity: Entity) => {
    if (!window.confirm(`Archive ${entity.title}?`)) return;
    const ref = doc(db, 'entities', entity.id);
    await updateDoc(ref, { status: 'archived', updatedAt: serverTimestamp() });
    await logAdminAction({
      actionType: 'update',
      collection: 'entities',
      targetId: entity.id,
      diff: { status: { from: entity.status, to: 'archived' } },
      byUid: user?.uid,
    });
  };

  const handleDelete = async (entity: Entity) => {
    if (!window.confirm(`Delete ${entity.title}? This cannot be undone.`)) return;
    await deleteDoc(doc(db, 'entities', entity.id));
    await logAdminAction({
      actionType: 'delete',
      collection: 'entities',
      targetId: entity.id,
      diff: { title: entity.title },
      byUid: user?.uid,
    });
  };

  const reorderEntities = async (next: Entity[]) => {
    const batch = writeBatch(db);
    next.forEach((entity, index) => {
      const ref = doc(db, 'entities', entity.id);
      batch.update(ref, { order: index + 1, updatedAt: serverTimestamp() });
    });
    await batch.commit();
  };

  const handleDrop = async (targetId: string) => {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      return;
    }
    const current = [...entities];
    const fromIndex = current.findIndex((item) => item.id === draggedId);
    const toIndex = current.findIndex((item) => item.id === targetId);
    if (fromIndex < 0 || toIndex < 0) return;
    const [moved] = current.splice(fromIndex, 1);
    current.splice(toIndex, 0, moved);
    setDraggedId(null);
    await reorderEntities(current);
    await logAdminAction({
      actionType: 'reorder',
      collection: 'entities',
      targetId: moved.id,
      diff: { from: fromIndex + 1, to: toIndex + 1 },
      byUid: user?.uid,
    });
  };

  return (
    <div className="space-y-6">
      <div className="admin-card rounded-3xl px-5 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--admin-muted)]">
              Entities
            </div>
            <div className="mt-2 font-display text-lg font-semibold">Manage content blocks</div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <form onSubmit={handleCreate} className="admin-card rounded-3xl px-5 py-6">
          <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--admin-muted)]">
            New entity
          </div>
          <div className="mt-4 space-y-4">
            <input
              className="w-full rounded-2xl border border-[color:var(--admin-border)] px-4 py-3 text-sm"
              placeholder="Title"
              value={createForm.title}
              onChange={(event) => setCreateForm({ ...createForm, title: event.target.value })}
              required
            />
            <textarea
              className="min-h-[96px] w-full rounded-2xl border border-[color:var(--admin-border)] px-4 py-3 text-sm"
              placeholder="Description"
              value={createForm.description}
              onChange={(event) => setCreateForm({ ...createForm, description: event.target.value })}
              required
            />
            <input
              className="w-full rounded-2xl border border-[color:var(--admin-border)] px-4 py-3 text-sm"
              placeholder="Image URL"
              value={createForm.image}
              onChange={(event) => setCreateForm({ ...createForm, image: event.target.value })}
            />
            <select
              className="w-full rounded-2xl border border-[color:var(--admin-border)] px-4 py-3 text-sm"
              value={createForm.status}
              onChange={(event) =>
                setCreateForm({ ...createForm, status: event.target.value as EntityStatus })
              }
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
            <button
              type="submit"
              className="w-full rounded-2xl bg-[color:var(--admin-accent)] px-4 py-3 text-sm font-semibold text-white"
            >
              Create entity
            </button>
          </div>
        </form>

        <div className="admin-card rounded-3xl px-5 py-6">
          <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--admin-muted)]">
            Ordered list
          </div>
          <div className="mt-4 space-y-3">
            {entities.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[color:var(--admin-border)] px-4 py-6 text-xs text-[color:var(--admin-muted)]">
                No entities yet.
              </div>
            ) : (
              entities.map((entity) => (
                <div
                  key={entity.id}
                  draggable
                  onDragStart={() => setDraggedId(entity.id)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => void handleDrop(entity.id)}
                  className="flex flex-col gap-3 rounded-2xl border border-[color:var(--admin-border)] bg-white px-4 py-3 text-sm md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--admin-muted)]">
                      drag
                    </div>
                    <div>
                      <div className="font-semibold">{entity.title}</div>
                      <div className="text-xs text-[color:var(--admin-muted)]">
                        Order {entity.order}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge value={entity.status} />
                    <select
                      className="rounded-full border border-[color:var(--admin-border)] px-3 py-2 text-xs"
                      value={entity.status}
                      onChange={(event) =>
                        void handleStatusChange(entity, event.target.value as EntityStatus)
                      }
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="archived">Archived</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => void handleArchive(entity)}
                      className="rounded-full border border-[color:var(--admin-border)] px-3 py-2 text-xs font-semibold text-[color:var(--admin-muted)] hover:text-[color:var(--admin-ink)]"
                    >
                      Archive
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(entity)}
                      className="rounded-full border border-[color:var(--admin-border)] px-3 py-2 text-xs font-semibold text-[color:var(--admin-muted)] hover:text-[color:var(--admin-ink)]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(entity)}
                      className="rounded-full border border-[#f2d1cc] px-3 py-2 text-xs font-semibold text-[color:var(--admin-warn)] hover:brightness-110"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="admin-card w-full max-w-lg rounded-3xl px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="font-display text-lg font-semibold">Edit entity</div>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="text-xs font-semibold text-[color:var(--admin-muted)]"
              >
                Close
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <input
                className="w-full rounded-2xl border border-[color:var(--admin-border)] px-4 py-3 text-sm"
                value={editForm.title}
                onChange={(event) => setEditForm({ ...editForm, title: event.target.value })}
              />
              <textarea
                className="min-h-[96px] w-full rounded-2xl border border-[color:var(--admin-border)] px-4 py-3 text-sm"
                value={editForm.description}
                onChange={(event) =>
                  setEditForm({ ...editForm, description: event.target.value })
                }
              />
              <input
                className="w-full rounded-2xl border border-[color:var(--admin-border)] px-4 py-3 text-sm"
                value={editForm.image}
                onChange={(event) => setEditForm({ ...editForm, image: event.target.value })}
              />
              <select
                className="w-full rounded-2xl border border-[color:var(--admin-border)] px-4 py-3 text-sm"
                value={editForm.status}
                onChange={(event) =>
                  setEditForm({ ...editForm, status: event.target.value as EntityStatus })
                }
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => void handleEditSave()}
                className="flex-1 rounded-2xl bg-[color:var(--admin-accent)] px-4 py-3 text-sm font-semibold text-white"
              >
                Save changes
              </button>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="flex-1 rounded-2xl border border-[color:var(--admin-border)] px-4 py-3 text-sm font-semibold text-[color:var(--admin-muted)]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
