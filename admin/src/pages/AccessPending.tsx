import React from 'react';
import { useAdminAuth } from '../auth/AdminAuthContext';

export const AccessPending: React.FC = () => {
  const { user, logout } = useAdminAuth();

  return (
    <div className="admin-card rounded-3xl px-6 py-8">
      <div className="text-xs uppercase tracking-[0.3em] text-[color:var(--admin-muted)]">
        Access Pending
      </div>
      <h2 className="mt-3 font-display text-2xl font-semibold">Not an admin yet.</h2>
      <p className="mt-3 text-sm text-[color:var(--admin-muted)]">
        Your account is authenticated, but the admin claim is missing. Ask an owner to grant
        admin access.
      </p>
      <div className="mt-4 rounded-2xl border border-[color:var(--admin-border)] bg-white px-4 py-3 text-xs text-[color:var(--admin-muted)]">
        Signed in as: <span className="font-semibold text-[color:var(--admin-ink)]">{user?.email}</span>
      </div>
      <button
        type="button"
        onClick={() => void logout()}
        className="mt-5 rounded-2xl border border-[color:var(--admin-border)] px-4 py-3 text-xs font-semibold text-[color:var(--admin-muted)]"
      >
        Sign out
      </button>
    </div>
  );
};
