'use server';

import { revalidatePath } from 'next/cache';
import {
  createExpense,
  updateExpense,
  deleteExpense,
  upsertProductHpp,
} from '@/lib/db/repositories/finances';

export async function createExpenseAction(formData: FormData) {
  const title = String(formData.get('title') || '').trim();
  const category = String(formData.get('category') || 'operasional');
  const amount = Number(formData.get('amount') || 0);
  const expense_date = String(formData.get('expense_date') || '');
  const supplier = String(formData.get('supplier') || '');
  const notes = String(formData.get('notes') || '');

  if (!title) return { error: 'Judul pengeluaran harus diisi' };
  if (!amount || amount <= 0) return { error: 'Jumlah pengeluaran harus lebih besar dari 0' };

  try {
    await createExpense({ title, category, amount, expense_date, supplier, notes });
    revalidatePath('/admin/finances');
    return { success: true };
  } catch (error) {
    console.error('Error creating expense:', error);
    return { error: 'Gagal menambah pengeluaran' };
  }
}

export async function updateExpenseAction(id: string, formData: FormData) {
  const title = String(formData.get('title') || '').trim();
  const category = String(formData.get('category') || 'operasional');
  const amount = Number(formData.get('amount') || 0);
  const expense_date = String(formData.get('expense_date') || '');
  const supplier = String(formData.get('supplier') || '');
  const notes = String(formData.get('notes') || '');

  if (!title) return { error: 'Judul pengeluaran harus diisi' };
  if (!amount || amount <= 0) return { error: 'Jumlah pengeluaran harus lebih besar dari 0' };

  try {
    await updateExpense(id, { title, category, amount, expense_date, supplier, notes });
    revalidatePath('/admin/finances');
    return { success: true };
  } catch (error) {
    console.error('Error updating expense:', error);
    return { error: 'Gagal memperbarui pengeluaran' };
  }
}

export async function deleteExpenseAction(id: string) {
  try {
    await deleteExpense(id);
    revalidatePath('/admin/finances');
    return { success: true };
  } catch (error) {
    console.error('Error deleting expense:', error);
    return { error: 'Gagal menghapus pengeluaran' };
  }
}

export async function saveProductHppAction(formData: FormData) {
  const product_id = String(formData.get('product_id') || '');
  const material_cost = Number(formData.get('material_cost') || 0);
  const labor_cost = Number(formData.get('labor_cost') || 0);
  const overhead_cost = Number(formData.get('overhead_cost') || 0);
  const notes = String(formData.get('notes') || '');

  if (!product_id) return { error: 'Produk harus dipilih' };

  try {
    await upsertProductHpp({ product_id, material_cost, labor_cost, overhead_cost, notes });
    revalidatePath('/admin/finances');
    return { success: true };
  } catch (error) {
    console.error('Error saving product HPP:', error);
    return { error: 'Gagal menyimpan HPP produk' };
  }
}
