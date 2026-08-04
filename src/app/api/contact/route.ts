import { NextRequest, NextResponse } from 'next/server';
import { createContactMessage } from '@/lib/db/repositories/contact';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ success: false, message: 'Semua field harus diisi' }, { status: 400 });
    }

    await createContactMessage({ name, email, subject, message });
    return NextResponse.json({ success: true, message: 'Pesan berhasil dikirim' });
  } catch (err) {
    console.error('submitContact error:', err);
    return NextResponse.json({ success: false, message: 'Gagal mengirim pesan' }, { status: 500 });
  }
}
