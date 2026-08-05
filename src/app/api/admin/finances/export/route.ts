import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { getExpenses, getFinancialSummary, getProductHpps } from '@/lib/db/repositories/finances';
import { getDb } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

const CATEGORY_NAMES: Record<string, string> = {
  bahan_baku: 'Belanja Bahan Baku',
  operasional: 'Operasional',
  gaji: 'Gaji & Tenaga Kerja',
  pemasaran: 'Pemasaran & Kemasan',
  lainnya: 'Lain-lain',
};

export async function GET() {
  try {
    const summary = await getFinancialSummary();
    const expensesList = await getExpenses();
    const hppsList = await getProductHpps();

    const db = getDb();
    const allOrders = await db
      .select({
        order_number: orders.order_number,
        customer_name: orders.customer_name,
        customer_email: orders.customer_email,
        payment_status: orders.payment_status,
        status: orders.status,
        shipping_courier: orders.shipping_courier,
        shipping_cost: orders.shipping_cost,
        subtotal: orders.subtotal,
        total: orders.total,
        created_at: orders.created_at,
      })
      .from(orders)
      .orderBy(desc(orders.created_at));

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Ringkasan Laba Rugi
    const summaryData = [
      ['LAPORAN KEUANGAN TALI WASTRA STORE'],
      [`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`],
      [],
      ['KATEGORI LAPORAN', 'JUMLAH (RP)'],
      ['Pemasukan Penjualan (Paid Orders)', summary.totalRevenue],
      ['Pengeluaran - Belanja Bahan Baku', summary.breakdown.rawMaterials],
      ['Pengeluaran - Biaya Operasional', summary.breakdown.operational],
      ['Pengeluaran - Biaya Gaji / Tenaga Kerja', summary.breakdown.labor],
      ['Pengeluaran - Pemasaran & Kemasan', summary.breakdown.marketing],
      ['Pengeluaran - Lain-lain', summary.breakdown.others],
      ['TOTAL PENGELUARAN', summary.totalExpenses],
      ['LABA / (RUGI) BERSIH', summary.netProfit],
      ['PROFIT MARGIN (%)', `${summary.profitMarginPercent}%`],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ringkasan Laba Rugi');

    // Sheet 2: Rincian Pengeluaran
    const expenseRows = expensesList.map((e) => ({
      'Tanggal': new Date(e.expense_date).toLocaleDateString('id-ID'),
      'Judul Pengeluaran': e.title,
      'Kategori': CATEGORY_NAMES[e.category] || e.category,
      'Supplier / Vendor': e.supplier || '-',
      'Jumlah (Rp)': e.amount,
      'Catatan': e.notes || '-',
    }));
    const expenseSheet = XLSX.utils.json_to_sheet(expenseRows);
    XLSX.utils.book_append_sheet(workbook, expenseSheet, 'Rincian Pengeluaran');

    // Sheet 3: Rincian Penjualan
    const orderRows = allOrders.map((o) => ({
      'No. Pesanan': o.order_number,
      'Tanggal': new Date(o.created_at).toLocaleDateString('id-ID'),
      'Pelanggan': o.customer_name,
      'Email': o.customer_email,
      'Kurir': o.shipping_courier || '-',
      'Status Pembayaran': o.payment_status,
      'Status Pesanan': o.status,
      'Subtotal (Rp)': Number(o.subtotal),
      'Ongkir (Rp)': Number(o.shipping_cost),
      'Total (Rp)': Number(o.total),
    }));
    const orderSheet = XLSX.utils.json_to_sheet(orderRows);
    XLSX.utils.book_append_sheet(workbook, orderSheet, 'Rincian Penjualan');

    // Sheet 4: Analisis HPP Produk
    const hppRows = hppsList.map((h) => ({
      'Nama Produk': h.product_name,
      'Harga Jual (Rp)': h.product_price,
      'Biaya Bahan Baku (Rp)': h.material_cost,
      'Biaya Tenaga Kerja (Rp)': h.labor_cost,
      'Biaya Overhead (Rp)': h.overhead_cost,
      'Total HPP (Rp)': h.total_hpp,
      'Estimasi Laba Kotor / Unit (Rp)': h.product_price - h.total_hpp,
      'Profit Margin (%)': `${h.profit_margin}%`,
      'Catatan': h.notes || '-',
    }));
    const hppSheet = XLSX.utils.json_to_sheet(hppRows);
    XLSX.utils.book_append_sheet(workbook, hppSheet, 'Analisis HPP Produk');

    // Generate buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    const filename = `Laporan_Keuangan_TaliWastra_${new Date().toISOString().slice(0, 10)}.xlsx`;

    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error generating Excel report:', error);
    return NextResponse.json({ error: 'Gagal mengeksport laporan excel' }, { status: 500 });
  }
}
