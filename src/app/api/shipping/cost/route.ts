import { NextRequest, NextResponse } from 'next/server';

const RAJAONGKIR_BASE = process.env.RAJAONGKIR_IS_PRO === 'true'
  ? 'https://pro.rajaongkir.com/api'
  : 'https://api.rajaongkir.com/starter';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { origin, destination, weight, courier } = body;

    if (!origin || !destination || !weight || !courier) {
      return NextResponse.json({ success: false, message: 'Semua field harus diisi (origin, destination, weight, courier)' }, { status: 400 });
    }

    if (!process.env.RAJAONGKIR_API_KEY) {
      return NextResponse.json({ success: true, data: [] });
    }

    const response = await fetch(`${RAJAONGKIR_BASE}/cost`, {
      method: 'POST',
      headers: {
        key: process.env.RAJAONGKIR_API_KEY!,
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        origin: String(origin),
        destination: String(destination),
        weight: String(weight),
        courier,
      }),
    });
    const data = await response.json();
    return NextResponse.json({ success: true, data: (data.rajaongkir?.results as Record<string, unknown>[]) || [] });
  } catch (err) {
    console.error('getShippingCost error:', err);
    return NextResponse.json({ success: true, data: [] });
  }
}
