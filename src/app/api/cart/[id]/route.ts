import { NextRequest, NextResponse } from 'next/server';
import { updateCartItem, removeCartItem } from '@/lib/db/repositories/cart';
import { CART_SESSION_COOKIE } from '@/lib/cart/session';

function getSessionId(req: NextRequest): string | null {
  return req.cookies.get(CART_SESSION_COOKIE)?.value || null;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionId = getSessionId(req);
    if (!sessionId) return NextResponse.json({ success: false, message: 'Session ID diperlukan' }, { status: 400 });

    const { id } = await params;
    const body = await req.json();
    const { quantity } = body;

    if (quantity < 1) return NextResponse.json({ success: false, message: 'Minimal quantity 1' }, { status: 400 });

    await updateCartItem(sessionId, id, Number(quantity));
    return NextResponse.json({ success: true, message: 'Keranjang diperbarui' });
  } catch (err) {
    console.error('updateCartItem error:', err);
    return NextResponse.json({ success: false, message: 'Gagal memperbarui keranjang' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionId = getSessionId(req);
    if (!sessionId) return NextResponse.json({ success: false, message: 'Session ID diperlukan' }, { status: 400 });

    const { id } = await params;
    await removeCartItem(sessionId, id);

    return NextResponse.json({ success: true, message: 'Produk dihapus dari keranjang' });
  } catch (err) {
    console.error('removeCartItem error:', err);
    return NextResponse.json({ success: false, message: 'Gagal menghapus item' }, { status: 500 });
  }
}
