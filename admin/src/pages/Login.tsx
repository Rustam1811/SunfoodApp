import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useAdminAuth } from '../auth/AdminAuthContext';

export const Login: React.FC = () => {
  const { user, loading, login, error } = useAdminAuth();
  const history = useHistory();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (user) {
      history.replace('/dashboard');
    }
  }, [user, history]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await login(email.trim(), password);
  };

  return (
    <div className="min-h-screen bg-[color:var(--admin-bg)] text-[color:var(--admin-ink)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(33,95,90,0.2),transparent_60%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl items-center justify-between gap-12 px-6 py-12">
        <div className="max-w-md space-y-6">
          <div className="text-xs uppercase tracking-[0.35em] text-[color:var(--admin-muted)]">
            Admin Only
          </div>
          <h1 className="font-display text-4xl font-semibold leading-tight">
            Sign in to the control layer.
          </h1>
          <p className="text-sm text-[color:var(--admin-muted)]">
            The admin panel is the source of truth. Clients only read and act.
          </p>
          <div className="rounded-3xl border border-[color:var(--admin-border)] bg-white/70 px-5 py-4 text-xs text-[color:var(--admin-muted)]">
            Access is restricted to existing Firebase Auth accounts.
          </div>
        </div>
        <form
          onSubmit={onSubmit}
          className="admin-card w-full max-w-sm rounded-3xl px-6 py-8 backdrop-blur"
        >
          <div className="space-y-6">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--admin-muted)]">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-[color:var(--admin-border)] bg-white px-4 py-3 text-sm"
                placeholder="admin@company.com"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--admin-muted)]">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-[color:var(--admin-border)] bg-white px-4 py-3 text-sm"
                placeholder="********"
                required
              />
            </div>
            {error && (
              <div className="rounded-2xl border border-[#f2d1cc] bg-[#fbecea] px-4 py-3 text-xs text-[color:var(--admin-warn)]">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[color:var(--admin-accent)] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
