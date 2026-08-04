import { NextRequest, NextResponse } from 'next/server';

const RAJAONGKIR_BASE = process.env.RAJAONGKIR_IS_PRO === 'true'
  ? 'https://pro.rajaongkir.com/api'
  : 'https://api.rajaongkir.com/starter';

export async function GET(_req: NextRequest) {
  try {
    const response = await fetch(`${RAJAONGKIR_BASE}/province`, {
      headers: { key: process.env.RAJAONGKIR_API_KEY! },
    });
    const data = await response.json();
    return NextResponse.json({ success: true, data: (data.rajaongkir?.results as Record<string, unknown>[]) || [] });
  } catch (err) {
    console.error('getProvinces error:', err);
    return NextResponse.json({ success: false, message: 'Gagal mengambil provinsi' }, { status: 500 });
  }
}
