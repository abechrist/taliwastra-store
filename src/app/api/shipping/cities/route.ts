import { NextRequest, NextResponse } from 'next/server';

const RAJAONGKIR_BASE = 'https://rajaongkir.komerce.id/api/v1';

export async function GET(req: NextRequest) {
  try {
    if (!process.env.RAJAONGKIR_API_KEY) {
      return NextResponse.json({ success: true, data: [] });
    }
    const { searchParams } = new URL(req.url);
    const provinceId = searchParams.get('province');
    if (!provinceId) {
      return NextResponse.json({ success: true, data: [] });
    }

    const response = await fetch(`${RAJAONGKIR_BASE}/destination/city/${provinceId}`, {
      headers: { key: process.env.RAJAONGKIR_API_KEY! },
      next: { revalidate: 3600 },
    });
    const json = await response.json();
    const raw = (json.data || []) as { id: number; name: string }[];
    const data = raw.map((c) => ({ city_id: String(c.id), city_name: c.name, type: '' }));
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('getCities error:', err);
    return NextResponse.json({ success: true, data: [] });
  }
}