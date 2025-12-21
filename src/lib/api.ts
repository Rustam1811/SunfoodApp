/**
 * API helper
 * 
 * NOTE: Firebase Auth removed - using simple phone+password auth via Firestore.
 * Requests include user ID from session instead of Firebase Auth tokens.
 */

import { getSession } from '../services/authService';

function headersWithAuth(extra?: HeadersInit) {
  const h = new Headers(extra);
  h.set('Content-Type', 'application/json');
  const userId = getSession();
  if (userId) {
    h.set('X-User-ID', userId);
  }
  return h;
}

async function request(url: string, init: RequestInit = {}) {
  return fetch(url, { ...init, headers: headersWithAuth(init.headers) });
}

const BASE = '/api';

export const api = {
  async get(path: string) {
    const r = await request(`${BASE}/${path}`, { method: 'GET' });
    if (!r.ok) throw new Error(await r.text());
    return r.json().catch(() => ({}));
  },
  async post(path: string, body: unknown) {
    const r = await request(`${BASE}/${path}`, { method: 'POST', body: JSON.stringify(body) });
    if (!r.ok) throw new Error(await r.text());
    return r.json().catch(() => ({}));
  }
};