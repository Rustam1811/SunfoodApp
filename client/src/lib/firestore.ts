import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { db } from './firebase';

export type EntityStatus = 'draft' | 'active' | 'archived';

export type Entity = {
  id: string;
  title: string;
  description: string;
  image: string;
  status: EntityStatus;
  order: number;
};

export type FlowStatus = 'draft' | 'active' | 'archived';
export type FlowStepType = 'info' | 'timer' | 'check' | 'media' | 'input';

export type FlowStep = {
  id: string;
  type: FlowStepType;
  title: string;
  content: string | Record<string, unknown>;
  order: number;
};

export type Flow = {
  id: string;
  entityId: string;
  status: FlowStatus;
  steps: FlowStep[];
};

export async function fetchActiveEntities(): Promise<Entity[]> {
  const entitiesQuery = query(
    collection(db, 'entities'),
    where('status', '==', 'active'),
    orderBy('order', 'asc')
  );
  const snapshot = await getDocs(entitiesQuery);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<Entity, 'id'>),
  }));
}

export async function fetchActiveFlowForEntity(entityId: string): Promise<Flow | null> {
  const flowsQuery = query(
    collection(db, 'flows'),
    where('entityId', '==', entityId),
    where('status', '==', 'active'),
    limit(1)
  );
  const snapshot = await getDocs(flowsQuery);
  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  const raw = docSnap.data() as Omit<Flow, 'id'>;
  const steps = raw.steps ? [...raw.steps].sort((a, b) => a.order - b.order) : [];
  return { id: docSnap.id, ...raw, steps };
}

export async function fetchFlowById(flowId: string): Promise<Flow | null> {
  const flowDoc = await getDoc(doc(db, 'flows', flowId));
  if (!flowDoc.exists()) return null;
  const raw = flowDoc.data() as Omit<Flow, 'id'>;
  const steps = raw.steps ? [...raw.steps].sort((a, b) => a.order - b.order) : [];
  return { id: flowDoc.id, ...raw, steps };
}

export async function fetchEntityById(entityId: string): Promise<Entity | null> {
  const entityDoc = await getDoc(doc(db, 'entities', entityId));
  if (!entityDoc.exists()) return null;
  return { id: entityDoc.id, ...(entityDoc.data() as Omit<Entity, 'id'>) };
}
