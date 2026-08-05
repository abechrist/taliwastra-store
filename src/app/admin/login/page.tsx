'use client';

import { useActionState } from 'react';
import { loginAction } from '../actions/auth';
import Icon from '@/components/Icon';

export default function AdminLogin() {
  const [state, action, isPending] = useActionState(
    async (state: { error: string | null } | null, formData: FormData) => {
      return (await loginAction(formData)) || { error: null as string | null };
    },
    { error: null as string | null }
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-container-lowest font-body px-4">
      <div className="w-full max-w-md bg-linen-white rounded-2xl border border-outline-variant/50 p-8 md:p-10">
        <div className="text-center mb-8">
          <Icon name="admin_panel_settings" className="text-4xl text-primary mb-4 block" />
          <h1 className="font-display text-2xl text-on-surface mb-2">Tali Wastra Admin</h1>
          <p className="font-body text-sm text-on-surface-variant">Masuk untuk mengelola toko Anda.</p>
        </div>

        <form action={action} className="space-y-5">
          <div>
            <label className="block text-sm font-label text-on-surface mb-1.5">Username</label>
            <input
              type="text"
              name="username"
              required
              className="input"
              placeholder="Masukkan username"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm font-label text-on-surface mb-1.5">Password</label>
            <input
              type="password"
              name="password"
              required
              className="input"
              placeholder="Masukkan password"
              autoComplete="current-password"
            />
          </div>

          {state?.error && (
            <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-error text-sm text-center font-body">
              {state.error}
            </div>
          )}

          <button type="submit" disabled={isPending} className="btn btn-primary w-full py-3 mt-2">
            {isPending ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-soft-clay/30 text-center">
          <p className="font-body text-xs text-on-surface-variant">
            Layanan pembayaran dan manajemen toko Taliwastra
          </p>
        </div>
      </div>
    </div>
  );
}
