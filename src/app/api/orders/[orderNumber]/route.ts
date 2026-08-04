import { NextRequest, NextResponse } from 'next/server';
import { getOrderByNumber } from '@/lib/db/repositories/orders';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;
    const order = await getOrderByNumber(orderNumber);
    if (!order) return NextResponse.json({ success: false, message: 'Pesanan tidak ditemukan' }, { status: 404 });

    return NextResponse.json({ success: true, data: order });
  } catch (err) {
    console.error('getOrderByNumber error:', err);
    return NextResponse.json({ success: false, message: 'Gagal mengambil pesanan' }, { status: 500 });
  }
}
