import { NextRequest, NextResponse } from 'next/server';
import { getCategoryBySlug } from '@/lib/db/repositories/categories';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const row = await getCategoryBySlug(slug);
    if (!row) return NextResponse.json({ success: false, message: 'Kategori tidak ditemukan' }, { status: 404 });
    return NextResponse.json({ success: true, data: row });
  } catch (err) {
    console.error('getCategoryBySlug error:', err);
    return NextResponse.json({ success: false, message: 'Gagal mengambil kategori' }, { status: 500 });
  }
}
