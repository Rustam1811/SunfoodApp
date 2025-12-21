import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAdminAuth } from '../auth/AdminAuthContext';

const navItems = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Entities', to: '/entities' },
  { label: 'Flows', to: '/flows' },
];

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAdminAuth();

  return (
    <div className="min-h-screen bg-[color:var(--admin-bg)] text-[color:var(--admin-ink)]">
      <div className="absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_top,_rgba(33,95,90,0.18),transparent_65%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl gap-6 px-6 py-8">
        <aside className="admin-card sticky top-8 hidden h-[calc(100vh-4rem)] w-64 flex-col justify-between rounded-3xl px-6 py-6 md:flex">
          <div>
            <div className="text-xs uppercase tracking-[0.35em] text-[color:var(--admin-muted)]">
              Admin Console
            </div>
            <div className="mt-3 font-display text-2xl font-semibold text-[color:var(--admin-ink)]">
              Sunfood Ops
            </div>
            <nav className="mt-10 flex flex-col gap-2 text-sm font-medium">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  activeClassName="bg-[color:var(--admin-accent-soft)] text-[color:var(--admin-ink)]"
                  className="rounded-2xl px-4 py-3 text-[color:var(--admin-muted)] transition hover:text-[color:var(--admin-ink)]"
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="rounded-2xl border border-[color:var(--admin-border)] px-4 py-4 text-xs text-[color:var(--admin-muted)]">
            <div className="font-semibold text-[color:var(--admin-ink)]">{user?.email ?? 'Admin'}</div>
            <button
              type="button"
              onClick={() => void logout()}
              className="mt-3 text-xs font-semibold text-[color:var(--admin-accent)] hover:underline"
            >
              Sign out
            </button>
          </div>
        </aside>
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between rounded-3xl border border-[color:var(--admin-border)] bg-white/80 px-5 py-4 backdrop-blur">
            <div>
              <div className="text-xs uppercase tracking-[0.35em] text-[color:var(--admin-muted)]">Admin</div>
              <div className="font-display text-xl font-semibold text-[color:var(--admin-ink)]">
                Control Layer
              </div>
            </div>
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded-full border border-[color:var(--admin-border)] px-4 py-2 text-xs font-semibold text-[color:var(--admin-muted)] transition hover:text-[color:var(--admin-ink)] md:hidden"
            >
              Sign out
            </button>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto md:hidden">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                activeClassName="bg-[color:var(--admin-accent)] text-white"
                className="rounded-full border border-[color:var(--admin-border)] px-4 py-2 text-xs font-semibold text-[color:var(--admin-muted)] transition"
              >
                {item.label}
              </NavLink>
            ))}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};
