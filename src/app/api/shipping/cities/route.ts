import { NextRequest, NextResponse } from 'next/server';

const RAJAONGKIR_BASE = process.env.RAJAONGKIR_IS_PRO === 'true'
  ? 'https://pro.rajaongkir.com/api'
  : 'https://api.rajaongkir.com/starter';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const provinceId = searchParams.get('province');
    let url = `${RAJAONGKIR_BASE}/city`;
    if (provinceId) url += `?province=${provinceId}`;

    const response = await fetch(url, {
      headers: { key: process.env.RAJAONGKIR_API_KEY! },
    });
    const data = await response.json();
    return NextResponse.json({ success: true, data: (data.rajaongkir?.results as Record<string, unknown>[]) || [] });
  } catch (err) {
    console.error('getCities error:', err);
    return NextResponse.json({ success: false, message: 'Gagal mengambil kota' }, { status: 500 });
  }
}
