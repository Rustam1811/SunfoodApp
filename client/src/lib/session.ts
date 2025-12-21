import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './firebase';

type FlowSession = {
  id: string;
  flowId: string;
  stepIndex: number;
  stepId?: string;
  visitedStepIds?: string[];
  createdAt?: unknown;
  updatedAt?: unknown;
};

const DEVICE_KEY = 'sunfood_device_id';

function getDeviceId(): string {
  if (typeof window === 'undefined') return 'server';
  const stored = localStorage.getItem(DEVICE_KEY);
  if (stored) return stored;
  const next = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `device_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  localStorage.setItem(DEVICE_KEY, next);
  return next;
}

export function getFlowSessionId(flowId: string): string {
  return `flow_${flowId}_${getDeviceId()}`;
}

export async function updateFlowSession(
  flowId: string,
  data: Omit<FlowSession, 'id' | 'flowId'>
): Promise<void> {
  const sessionId = getFlowSessionId(flowId);
  await setDoc(
    doc(db, 'flow_sessions', sessionId),
    {
      id: sessionId,
      flowId,
      ...data,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export function subscribeFlowSession(
  flowId: string,
  onUpdate: (session: FlowSession | null) => void
): () => void {
  const sessionId = getFlowSessionId(flowId);
  return onSnapshot(doc(db, 'flow_sessions', sessionId), (snapshot) => {
    if (!snapshot.exists()) {
      onUpdate(null);
      return;
    }
    onUpdate(snapshot.data() as FlowSession);
  });
}
