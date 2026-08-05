import { NextRequest, NextResponse } from 'next/server';

const RAJAONGKIR_BASE = 'https://rajaongkir.komerce.id/api/v1';

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

    const response = await fetch(`${RAJAONGKIR_BASE}/calculate/domestic-cost`, {
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
    const json = await response.json();
    const raw = (json.data || []) as { code: string; service: string; description?: string; cost: number; etd?: string }[];
    const results = raw.map((r) => ({
      service: r.code,
      costs: [
        {
          service: r.service,
          cost: [{ value: Number(r.cost) || 0, etd: r.etd || '-' }],
        },
      ],
    }));
    return NextResponse.json({ success: true, data: results });
  } catch (err) {
    console.error('getShippingCost error:', err);
    return NextResponse.json({ success: true, data: [] });
  }
}