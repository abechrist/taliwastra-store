'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { findAdminByUsername } from '@/lib/db/repositories/admin';
import { createAdminSessionToken, ADMIN_SESSION_COOKIE } from '@/lib/auth/session';

export async function loginAction(formData: FormData) {
  const username = String(formData.get('username') || '');
  const password = String(formData.get('password') || '');

  const user = await findAdminByUsername(username);
  if (user && (await bcrypt.compare(password, user.password_hash))) {
    const cookieStore = await cookies();
    const token = await createAdminSessionToken();
    cookieStore.set(ADMIN_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    redirect('/admin');
  }

  return { error: 'Username atau password salah' };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
  redirect('/admin/login');
}
