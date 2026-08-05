import { NextRequest, NextResponse } from 'next/server';

const RAJAONGKIR_BASE = 'https://rajaongkir.komerce.id/api/v1';

export async function GET(_req: NextRequest) {
  try {
    if (!process.env.RAJAONGKIR_API_KEY) {
      return NextResponse.json({ success: true, data: [] });
    }
    const response = await fetch(`${RAJAONGKIR_BASE}/destination/province`, {
      headers: { key: process.env.RAJAONGKIR_API_KEY! },
      next: { revalidate: 3600 },
    });
    const json = await response.json();
    const raw = (json.data || []) as { id: number; name: string }[];
    const data = raw.map((p) => ({ province_id: String(p.id), province: p.name }));
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('getProvinces error:', err);
    return NextResponse.json({ success: true, data: [] });
  }
}