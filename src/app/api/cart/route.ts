import { NextRequest, NextResponse } from 'next/server';
import { getCartItems, addToCart, clearCart } from '@/lib/db/repositories/cart';
import { CART_SESSION_COOKIE, generateSessionId, cartCookieOptions } from '@/lib/cart/session';

function getOrCreateSession(req: NextRequest, res: NextResponse): string {
  const existing = req.cookies.get(CART_SESSION_COOKIE)?.value;
  if (existing) return existing;
  const sessionId = generateSessionId();
  res.cookies.set(CART_SESSION_COOKIE, sessionId, cartCookieOptions());
  return sessionId;
}

export async function GET(req: NextRequest) {
  try {
    const items = await getCartItems(req.cookies.get(CART_SESSION_COOKIE)?.value || '');
    const total = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    const res = NextResponse.json({ success: true, data: items, total });
    getOrCreateSession(req, res);
    return res;
  } catch (err) {
    console.error('getCart error:', err);
    return NextResponse.json({ success: false, message: 'Gagal mengambil keranjang' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const res = NextResponse.json({ success: true, message: 'Produk ditambahkan ke keranjang' });
    const sessionId = getOrCreateSession(req, res);

    const body = await req.json();
    const { product_id, quantity = 1 } = body;
    if (!product_id) return NextResponse.json({ success: false, message: 'Product ID diperlukan' }, { status: 400 });

    await addToCart(sessionId, product_id, Number(quantity) || 1);
    return res;
  } catch (err) {
    console.error('addToCart error:', err);
    return NextResponse.json({ success: false, message: 'Gagal menambahkan ke keranjang' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const sessionId = req.cookies.get(CART_SESSION_COOKIE)?.value;
    if (!sessionId) return NextResponse.json({ success: true, message: 'Keranjang dikosongkan' });

    await clearCart(sessionId);
    return NextResponse.json({ success: true, message: 'Keranjang dikosongkan' });
  } catch (err) {
    console.error('clearCart error:', err);
    return NextResponse.json({ success: false, message: 'Gagal mengosongkan keranjang' }, { status: 500 });
  }
}
