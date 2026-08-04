'use server';

import { revalidatePath } from 'next/cache';
import { updateOrderStatus, updatePaymentStatus } from '@/lib/db/repositories/orders';

export async function updateOrderStatusAction(orderId: string, status: string) {
  const allowed = ['pending', 'processing', 'shipped', 'completed', 'cancelled', 'failed'];
  const next = allowed.includes(status) ? status : 'pending';

  try {
    await updateOrderStatus(orderId, next);
    revalidatePath('/admin/orders');
    revalidatePath('/admin');
  } catch (error) {
    console.error('Error updating order:', error);
  }
}

export async function updatePaymentStatusAction(orderId: string, paymentStatus: string) {
  const allowed = ['pending', 'paid', 'failed'];
  const next = allowed.includes(paymentStatus) ? paymentStatus : 'pending';

  try {
    await updatePaymentStatus(orderId, next);
    revalidatePath('/admin/orders');
    revalidatePath('/admin');
  } catch (error) {
    console.error('Error updating payment status:', error);
  }
}
