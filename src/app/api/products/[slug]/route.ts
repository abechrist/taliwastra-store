import { NextRequest, NextResponse } from 'next/server';
import { getProductBySlug, getRelatedProducts } from '@/lib/db/repositories/products';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const product = await getProductBySlug(decodeURIComponent(slug));

    if (!product) {
      return NextResponse.json({ success: false, message: 'Produk tidak ditemukan' }, { status: 404 });
    }

    const related = await getRelatedProducts(product.category_id, product.id);
    return NextResponse.json({ success: true, data: { ...product, related_products: related } });
  } catch (err) {
    console.error('getProduct error:', err);
    return NextResponse.json({ success: false, message: 'Gagal mengambil produk' }, { status: 500 });
  }
}
