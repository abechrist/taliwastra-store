'use server';

import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { createAdminUser, updateAdminPassword, deleteAdminUser, findAdminByUsername, getAllAdmins } from '@/lib/db/repositories/admin';

export async function createAdminUserAction(formData: FormData) {
  const username = String(formData.get('username') || '').trim();
  const password = String(formData.get('password') || '');
  const confirmPassword = String(formData.get('confirm_password') || '');
  const role = String(formData.get('role') || 'admin');

  if (!username || username.length < 3) {
    return { error: 'Username minimal 3 karakter' };
  }
  if (!password || password.length < 6) {
    return { error: 'Password minimal 6 karakter' };
  }
  if (password !== confirmPassword) {
    return { error: 'Konfirmasi password tidak cocok' };
  }

  const existing = await findAdminByUsername(username);
  if (existing) {
    return { error: 'Username sudah terdaftar' };
  }

  try {
    const password_hash = await bcrypt.hash(password, 10);
    await createAdminUser({ username, password_hash, role });
    revalidatePath('/admin/users');
    return { success: true, message: 'Admin baru berhasil didaftarkan' };
  } catch (error) {
    console.error('Error creating admin user:', error);
    return { error: 'Gagal menambahkan admin baru' };
  }
}

export async function changePasswordAction(formData: FormData) {
  const username = String(formData.get('username') || '').trim();
  const oldPassword = String(formData.get('old_password') || '');
  const newPassword = String(formData.get('new_password') || '');
  const confirmNewPassword = String(formData.get('confirm_new_password') || '');

  if (!username) {
    return { error: 'Username harus diisi' };
  }
  if (!newPassword || newPassword.length < 6) {
    return { error: 'Password baru minimal 6 karakter' };
  }
  if (newPassword !== confirmNewPassword) {
    return { error: 'Konfirmasi password baru tidak cocok' };
  }

  const user = await findAdminByUsername(username);
  if (!user) {
    return { error: 'User admin tidak ditemukan' };
  }

  const matches = await bcrypt.compare(oldPassword, user.password_hash);
  if (!matches) {
    return { error: 'Password lama Anda salah' };
  }

  try {
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await updateAdminPassword(user.id, newPasswordHash);
    revalidatePath('/admin/users');
    return { success: true, message: 'Password berhasil diubah' };
  } catch (error) {
    console.error('Error changing password:', error);
    return { error: 'Gagal mengubah password' };
  }
}

export async function deleteAdminUserAction(id: string) {
  try {
    const all = await getAllAdmins();
    if (all.length <= 1) {
      return { error: 'Tidak dapat menghapus admin terakhir' };
    }
    await deleteAdminUser(id);
    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    console.error('Error deleting admin user:', error);
    return { error: 'Gagal menghapus admin' };
  }
}
