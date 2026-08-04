import { NextRequest, NextResponse } from 'next/server';
import { getCategories } from '@/lib/db/repositories/categories';

export async function GET(_req: NextRequest) {
  try {
    const rows = await getCategories();
    return NextResponse.json({ success: true, data: rows });
  } catch (err) {
    console.error('getCategories error:', err);
    return NextResponse.json({ success: false, message: 'Gagal mengambil kategori' }, { status: 500 });
  }
}
