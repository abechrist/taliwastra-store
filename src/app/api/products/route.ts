import { NextRequest, NextResponse } from 'next/server';
import { getProducts } from '@/lib/db/repositories/products';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const featured = searchParams.get('featured') === 'true';
    const search = searchParams.get('search') || undefined;

    const rows = await getProducts({ category, featured, search });
    return NextResponse.json({ success: true, data: rows });
  } catch (err) {
    console.error('getProducts error:', err);
    return NextResponse.json({ success: false, message: 'Gagal mengambil produk' }, { status: 500 });
  }
}

export async function POST() {
  // Handled by admin actions
  return NextResponse.json({ success: false, message: 'Method not allowed' }, { status: 405 });
}
