'use client';

import { useState } from 'react';
import Icon from '@/components/Icon';
import {
  createExpenseAction,
  updateExpenseAction,
  deleteExpenseAction,
  saveProductHppAction,
} from '../actions/finances';

type ExpenseItem = {
  id: string;
  title: string;
  category: string;
  amount: number;
  expense_date: string;
  supplier: string | null;
  notes: string | null;
};

type ProductHppItem = {
  id?: string;
  product_id: string;
  product_name: string;
  product_price: number;
  material_cost: number;
  labor_cost: number;
  overhead_cost: number;
  total_hpp: number;
  profit_margin: number;
  notes: string;
};

type FinancialSummary = {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMarginPercent: number;
  breakdown: {
    rawMaterials: number;
    operational: number;
    labor: number;
    marketing: number;
    others: number;
  };
};

const CATEGORIES: Record<string, { label: string; color: string }> = {
  bahan_baku: { label: 'Bahan Baku', color: 'bg-amber-500/10 text-amber-600 border-amber-500/30' },
  operasional: { label: 'Operasional', color: 'bg-blue-500/10 text-blue-600 border-blue-500/30' },
  gaji: { label: 'Gaji / Pengrajin', color: 'bg-purple-500/10 text-purple-600 border-purple-500/30' },
  pemasaran: { label: 'Pemasaran & Packaging', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' },
  lainnya: { label: 'Lain-lain', color: 'bg-slate-500/10 text-slate-600 border-slate-500/30' },
};

export default function FinanceManager({
  summary,
  expenses,
  hpps,
}: {
  summary: FinancialSummary;
  expenses: ExpenseItem[];
  hpps: ProductHppItem[];
}) {
  const [activeTab, setActiveTab] = useState<'expenses' | 'hpp' | 'report'>('expenses');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isExporting, setIsExporting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Expense Modal State
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [editExpense, setEditExpense] = useState<ExpenseItem | null>(null);
  const [deleteExpenseId, setDeleteExpenseId] = useState<string | null>(null);

  // Expense Form state
  const [expTitle, setExpTitle] = useState('');
  const [expCategory, setExpCategory] = useState('bahan_baku');
  const [expAmount, setExpAmount] = useState('');
  const [expDate, setExpDate] = useState(new Date().toISOString().slice(0, 10));
  const [expSupplier, setExpSupplier] = useState('');
  const [expNotes, setExpNotes] = useState('');

  // HPP Modal State
  const [editHppProduct, setEditHppProduct] = useState<ProductHppItem | null>(null);
  const [matCost, setMatCost] = useState('0');
  const [labCost, setLabCost] = useState('0');
  const [ovhCost, setOvhCost] = useState('0');
  const [hppNotes, setHppNotes] = useState('');

  const openAddExpenseModal = () => {
    setExpTitle('');
    setExpCategory('bahan_baku');
    setExpAmount('');
    setExpDate(new Date().toISOString().slice(0, 10));
    setExpSupplier('');
    setExpNotes('');
    setIsAddExpenseOpen(true);
  };

  const openEditExpenseModal = (item: ExpenseItem) => {
    setEditExpense(item);
    setExpTitle(item.title);
    setExpCategory(item.category);
    setExpAmount(String(item.amount));
    setExpDate(new Date(item.expense_date).toISOString().slice(0, 10));
    setExpSupplier(item.supplier || '');
    setExpNotes(item.notes || '');
  };

  const openEditHppModal = (item: ProductHppItem) => {
    setEditHppProduct(item);
    setMatCost(String(item.material_cost || 0));
    setLabCost(String(item.labor_cost || 0));
    setOvhCost(String(item.overhead_cost || 0));
    setHppNotes(item.notes || '');
  };

  const handleExpenseSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    if (editExpense) {
      await updateExpenseAction(editExpense.id, formData);
      setEditExpense(null);
    } else {
      await createExpenseAction(formData);
      setIsAddExpenseOpen(false);
    }
    setIsSubmitting(false);
  };

  const handleDeleteExpenseSubmit = async () => {
    if (!deleteExpenseId) return;
    setIsSubmitting(true);
    await deleteExpenseAction(deleteExpenseId);
    setIsSubmitting(false);
    setDeleteExpenseId(null);
  };

  const handleHppSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editHppProduct) return;
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    formData.append('product_id', editHppProduct.product_id);
    await saveProductHppAction(formData);
    setIsSubmitting(false);
    setEditHppProduct(null);
  };

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      const res = await fetch('/api/admin/finances/export');
      if (!res.ok) throw new Error('Gagal mengunduh');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Laporan_Keuangan_TaliWastra_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      alert('Gagal mengeksport laporan excel');
    } finally {
      setIsExporting(false);
    }
  };

  const filteredExpenses = categoryFilter === 'all'
    ? expenses
    : expenses.filter((e) => e.category === categoryFilter);

  const calcHppTotal = Number(matCost || 0) + Number(labCost || 0) + Number(ovhCost || 0);
  const calcMargin = editHppProduct && editHppProduct.product_price > 0
    ? Math.round((((editHppProduct.product_price - calcHppTotal) / editHppProduct.product_price) * 100) * 10) / 10
    : 0;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl text-on-surface">Manajemen Keuangan & HPP</h1>
          <p className="font-body text-sm text-on-surface-variant mt-1">Kelola belanja bahan baku, biaya operasional, dan kalkulasi Harga Pokok Produksi</p>
        </div>
        <button
          onClick={handleExportExcel}
          disabled={isExporting}
          className="bg-emerald-700 text-white hover:bg-emerald-800 font-label text-xs py-3 px-5 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 uppercase tracking-wider font-bold"
        >
          <Icon name="table_chart" className="text-lg" />
          {isExporting ? 'Mengunduh...' : 'Print Laporan Excel (.xlsx)'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="linen-card p-5 rounded-xl border border-outline-variant/30 space-y-2">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label text-xs uppercase tracking-wider">Total Pemasukan</span>
            <Icon name="trending_up" className="text-success text-xl" />
          </div>
          <p className="font-display text-2xl font-bold text-success">
            Rp {summary.totalRevenue.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-on-surface-variant font-body">Penjualan produk lunas</p>
        </div>

        <div className="linen-card p-5 rounded-xl border border-outline-variant/30 space-y-2">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label text-xs uppercase tracking-wider">Total Pengeluaran</span>
            <Icon name="trending_down" className="text-error text-xl" />
          </div>
          <p className="font-display text-2xl font-bold text-error">
            Rp {summary.totalExpenses.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-on-surface-variant font-body">Bahan baku, operasional, & gaji</p>
        </div>

        <div className="linen-card p-5 rounded-xl border border-outline-variant/30 space-y-2">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label text-xs uppercase tracking-wider">Laba Bersih</span>
            <Icon name="account_balance_wallet" className="text-primary text-xl" />
          </div>
          <p className={`font-display text-2xl font-bold ${summary.netProfit >= 0 ? 'text-primary' : 'text-error'}`}>
            Rp {summary.netProfit.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-on-surface-variant font-body">Pemasukan - Pengeluaran</p>
        </div>

        <div className="linen-card p-5 rounded-xl border border-outline-variant/30 space-y-2">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label text-xs uppercase tracking-wider">Margin Keuntungan</span>
            <Icon name="pie_chart" className="text-secondary text-xl" />
          </div>
          <p className="font-display text-2xl font-bold text-on-surface">
            {summary.profitMarginPercent}%
          </p>
          <p className="text-[11px] text-on-surface-variant font-body">Persentase profitabilitas</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-outline-variant gap-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('expenses')}
          className={`pb-3 font-label text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors shrink-0 ${
            activeTab === 'expenses' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <Icon name="receipt_long" className="text-lg" />
          Pengeluaran & Belanja Bahan
        </button>
        <button
          onClick={() => setActiveTab('hpp')}
          className={`pb-3 font-label text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors shrink-0 ${
            activeTab === 'hpp' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <Icon name="calculate" className="text-lg" />
          Kalkulator & HPP Produk
        </button>
        <button
          onClick={() => setActiveTab('report')}
          className={`pb-3 font-label text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors shrink-0 ${
            activeTab === 'report' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <Icon name="bar_chart" className="text-lg" />
          Laporan Laba Rugi
        </button>
      </div>

      {/* Tab 1: Pengeluaran & Belanja */}
      {activeTab === 'expenses' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`btn text-xs py-1.5 px-3 rounded-lg border ${
                  categoryFilter === 'all' ? 'bg-primary text-white border-primary' : 'bg-surface-container border-outline-variant text-on-surface'
                }`}
              >
                Semua
              </button>
              {Object.entries(CATEGORIES).map(([key, cat]) => (
                <button
                  key={key}
                  onClick={() => setCategoryFilter(key)}
                  className={`btn text-xs py-1.5 px-3 rounded-lg border ${
                    categoryFilter === key ? 'bg-primary text-white border-primary' : 'bg-surface-container border-outline-variant text-on-surface'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <button onClick={openAddExpenseModal} className="btn btn-primary flex items-center gap-2 self-start sm:self-auto">
              <Icon name="add" className="text-lg" />
              Catat Pengeluaran Baru
            </button>
          </div>

          <div className="linen-card rounded-xl border border-outline-variant/30 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/80">
                    <th className="p-4 text-sm font-label text-on-surface-variant border-b border-soft-clay/30">Tanggal</th>
                    <th className="p-4 text-sm font-label text-on-surface-variant border-b border-soft-clay/30">Judul Transaksi</th>
                    <th className="p-4 text-sm font-label text-on-surface-variant border-b border-soft-clay/30">Kategori</th>
                    <th className="p-4 text-sm font-label text-on-surface-variant border-b border-soft-clay/30">Supplier / Vendor</th>
                    <th className="p-4 text-sm font-label text-on-surface-variant border-b border-soft-clay/30">Jumlah (Rp)</th>
                    <th className="p-4 text-sm font-label text-on-surface-variant border-b border-soft-clay/30 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((exp) => {
                    const catInfo = CATEGORIES[exp.category] || CATEGORIES.operasional;
                    return (
                      <tr key={exp.id} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="p-4 text-xs font-mono text-on-surface-variant border-b border-soft-clay/30">
                          {new Date(exp.expense_date).toLocaleDateString('id-ID')}
                        </td>
                        <td className="p-4 text-sm font-medium text-on-surface border-b border-soft-clay/30">
                          <div>{exp.title}</div>
                          {exp.notes && <div className="text-xs text-on-surface-variant line-clamp-1">{exp.notes}</div>}
                        </td>
                        <td className="p-4 text-sm border-b border-soft-clay/30">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-label border ${catInfo.color}`}>
                            {catInfo.label}
                          </span>
                        </td>
                        <td className="p-4 text-sm border-b border-soft-clay/30 text-on-surface-variant">
                          {exp.supplier || '-'}
                        </td>
                        <td className="p-4 text-sm font-bold text-error border-b border-soft-clay/30">
                          Rp {exp.amount.toLocaleString('id-ID')}
                        </td>
                        <td className="p-4 text-sm border-b border-soft-clay/30 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditExpenseModal(exp)}
                              className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                              title="Edit Pengeluaran"
                            >
                              <Icon name="edit" className="text-lg" />
                            </button>
                            <button
                              onClick={() => setDeleteExpenseId(exp.id)}
                              className="p-1.5 rounded-lg text-error hover:bg-error/10 transition-colors"
                              title="Hapus Pengeluaran"
                            >
                              <Icon name="delete" className="text-lg" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredExpenses.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-on-surface-variant">
                        Belum ada catatan pengeluaran. Klik "Catat Pengeluaran Baru" untuk menambahkan transaksi.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: HPP Produk */}
      {activeTab === 'hpp' && (
        <div className="space-y-6">
          <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/40 flex items-start gap-3">
            <Icon name="info" className="text-primary text-xl mt-0.5 shrink-0" />
            <p className="text-xs font-body text-on-surface-variant leading-relaxed">
              <strong>Harga Pokok Produksi (HPP)</strong> dihitung berdasarkan penjumlahan dari Biaya Bahan Baku (benang, kain, dll), Biaya Tenaga Kerja (upah pengrajin), dan Biaya Overhead (packaging, listrik, alat). HPP yang akurat membantu Anda memastikan margin keuntungan yang sehat pada toko online.
            </p>
          </div>

          <div className="linen-card rounded-xl border border-outline-variant/30 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/80">
                    <th className="p-4 text-sm font-label text-on-surface-variant border-b border-soft-clay/30">Nama Produk</th>
                    <th className="p-4 text-sm font-label text-on-surface-variant border-b border-soft-clay/30">Harga Jual Toko</th>
                    <th className="p-4 text-sm font-label text-on-surface-variant border-b border-soft-clay/30">Biaya Bahan Baku</th>
                    <th className="p-4 text-sm font-label text-on-surface-variant border-b border-soft-clay/30">Biaya Tenaga Kerja</th>
                    <th className="p-4 text-sm font-label text-on-surface-variant border-b border-soft-clay/30">Biaya Overhead</th>
                    <th className="p-4 text-sm font-label text-on-surface-variant border-b border-soft-clay/30">Total HPP</th>
                    <th className="p-4 text-sm font-label text-on-surface-variant border-b border-soft-clay/30">Profit Margin %</th>
                    <th className="p-4 text-sm font-label text-on-surface-variant border-b border-soft-clay/30 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {hpps.map((hpp) => (
                    <tr key={hpp.product_id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="p-4 text-sm font-semibold text-on-surface border-b border-soft-clay/30">
                        {hpp.product_name}
                      </td>
                      <td className="p-4 text-sm font-bold text-primary border-b border-soft-clay/30">
                        Rp {hpp.product_price.toLocaleString('id-ID')}
                      </td>
                      <td className="p-4 text-sm border-b border-soft-clay/30 text-on-surface-variant">
                        Rp {hpp.material_cost.toLocaleString('id-ID')}
                      </td>
                      <td className="p-4 text-sm border-b border-soft-clay/30 text-on-surface-variant">
                        Rp {hpp.labor_cost.toLocaleString('id-ID')}
                      </td>
                      <td className="p-4 text-sm border-b border-soft-clay/30 text-on-surface-variant">
                        Rp {hpp.overhead_cost.toLocaleString('id-ID')}
                      </td>
                      <td className="p-4 text-sm font-bold text-error border-b border-soft-clay/30">
                        Rp {hpp.total_hpp.toLocaleString('id-ID')}
                      </td>
                      <td className="p-4 text-sm border-b border-soft-clay/30">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          hpp.profit_margin >= 30 ? 'bg-success/10 text-success' : hpp.profit_margin > 0 ? 'bg-amber-500/10 text-amber-600' : 'bg-error/10 text-error'
                        }`}>
                          {hpp.profit_margin}%
                        </span>
                      </td>
                      <td className="p-4 text-sm border-b border-soft-clay/30 text-right">
                        <button
                          onClick={() => openEditHppModal(hpp)}
                          className="btn btn-secondary text-xs px-3 py-1.5 flex items-center gap-1 ml-auto"
                        >
                          <Icon name="calculate" className="text-sm" />
                          Set HPP
                        </button>
                      </td>
                    </tr>
                  ))}
                  {hpps.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-on-surface-variant">Belum ada produk di database.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Income Statement Report */}
      {activeTab === 'report' && (
        <div className="space-y-6">
          <div className="card p-6 space-y-6">
            <h2 className="font-display text-xl text-on-surface border-b border-soft-clay/30 pb-3">Laporan Laba Rugi Toko</h2>

            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-soft-clay/20">
                <span className="font-body text-base font-semibold text-on-surface">Total Pemasukan (Penjualan Lunas)</span>
                <span className="font-display text-lg font-bold text-success">Rp {summary.totalRevenue.toLocaleString('id-ID')}</span>
              </div>

              <div className="space-y-2 pt-2">
                <span className="font-body text-sm font-semibold text-on-surface uppercase tracking-wider block mb-2">Rincian Pengeluaran Usaha:</span>
                <div className="flex justify-between items-center text-sm text-on-surface-variant">
                  <span>1. Belanja Bahan Baku (Benang, Kain, dll)</span>
                  <span className="font-medium text-error">Rp {summary.breakdown.rawMaterials.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-on-surface-variant">
                  <span>2. Biaya Operasional (Listrik, Air, Sewa, Alat)</span>
                  <span className="font-medium text-error">Rp {summary.breakdown.operational.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-on-surface-variant">
                  <span>3. Gaji & Upah Pengrajin / Tenaga Kerja</span>
                  <span className="font-medium text-error">Rp {summary.breakdown.labor.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-on-surface-variant">
                  <span>4. Biaya Pemasaran & Kemasan (Box, Iklan)</span>
                  <span className="font-medium text-error">Rp {summary.breakdown.marketing.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-on-surface-variant">
                  <span>5. Pengeluaran Lain-lain</span>
                  <span className="font-medium text-error">Rp {summary.breakdown.others.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-3 border-t border-b border-soft-clay/40 font-bold">
                <span className="font-body text-base text-on-surface">TOTAL BEBAN / PENGELUARAN</span>
                <span className="font-display text-lg text-error">Rp {summary.totalExpenses.toLocaleString('id-ID')}</span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <div>
                  <span className="font-display text-xl font-bold text-on-surface block">LABA / (RUGI) BERSIH</span>
                  <span className="text-xs text-on-surface-variant font-body">Margin Bersih: {summary.profitMarginPercent}%</span>
                </div>
                <span className={`font-display text-3xl font-bold ${summary.netProfit >= 0 ? 'text-primary' : 'text-error'}`}>
                  Rp {summary.netProfit.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add/Edit Expense */}
      {(isAddExpenseOpen || editExpense) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card max-w-lg w-full p-6 space-y-6 bg-surface-container-lowest shadow-xl">
            <div className="flex items-center justify-between border-b border-soft-clay/30 pb-3">
              <h2 className="font-display text-xl text-on-surface">
                {editExpense ? 'Edit Transaksi Pengeluaran' : 'Catat Pengeluaran Baru'}
              </h2>
              <button
                onClick={() => {
                  setIsAddExpenseOpen(false);
                  setEditExpense(null);
                }}
                className="text-on-surface-variant hover:text-error"
              >
                <Icon name="close" className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleExpenseSubmit} className="space-y-4">
              <div>
                <label className="block font-label text-xs uppercase tracking-wider text-on-surface-variant mb-1">
                  Judul Transaksi <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  placeholder="Contoh: Pembelian Benang Katun & Dyeing"
                  className="input"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-label text-xs uppercase tracking-wider text-on-surface-variant mb-1">
                    Kategori <span className="text-error">*</span>
                  </label>
                  <select
                    name="category"
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value)}
                    className="input"
                  >
                    <option value="bahan_baku">Belanja Bahan Baku</option>
                    <option value="operasional">Operasional</option>
                    <option value="gaji">Gaji / Pengrajin</option>
                    <option value="pemasaran">Pemasaran & Packaging</option>
                    <option value="lainnya">Lain-lain</option>
                  </select>
                </div>

                <div>
                  <label className="block font-label text-xs uppercase tracking-wider text-on-surface-variant mb-1">
                    Jumlah (Rp) <span className="text-error">*</span>
                  </label>
                  <input
                    type="number"
                    name="amount"
                    required
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    placeholder="0"
                    className="input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-label text-xs uppercase tracking-wider text-on-surface-variant mb-1">
                    Tanggal Transaksi
                  </label>
                  <input
                    type="date"
                    name="expense_date"
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block font-label text-xs uppercase tracking-wider text-on-surface-variant mb-1">
                    Supplier / Vendor
                  </label>
                  <input
                    type="text"
                    name="supplier"
                    value={expSupplier}
                    onChange={(e) => setExpSupplier(e.target.value)}
                    placeholder="Nama Toko/Supplier"
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="block font-label text-xs uppercase tracking-wider text-on-surface-variant mb-1">
                  Catatan Tambahan
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  value={expNotes}
                  onChange={(e) => setExpNotes(e.target.value)}
                  placeholder="Rincian barang atau nota transaksi..."
                  className="input resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-soft-clay/30">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddExpenseOpen(false);
                    setEditExpense(null);
                  }}
                  className="btn btn-secondary"
                >
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Pengeluaran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirm Delete Expense */}
      {deleteExpenseId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card max-w-md w-full p-6 space-y-4 bg-surface-container-lowest shadow-xl text-center">
            <div className="w-12 h-12 rounded-full bg-error/10 text-error flex items-center justify-center mx-auto">
              <Icon name="warning" className="text-2xl" />
            </div>
            <h3 className="font-display text-lg text-on-surface">Hapus Transaksi Pengeluaran Ini?</h3>
            <p className="font-body text-xs text-on-surface-variant">
              Tindakan ini tidak dapat dibatalkan. Transaksi akan terhapus dari perhitungan pengeluaran keuangan toko.
            </p>
            <div className="flex items-center justify-center gap-3 pt-4 border-t border-soft-clay/30">
              <button onClick={() => setDeleteExpenseId(null)} className="btn btn-secondary w-full">
                Batal
              </button>
              <button
                onClick={handleDeleteExpenseSubmit}
                disabled={isSubmitting}
                className="bg-error text-white font-label text-xs py-2.5 px-4 rounded-lg hover:bg-error/80 transition-colors w-full font-bold"
              >
                {isSubmitting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Set HPP Produk */}
      {editHppProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card max-w-lg w-full p-6 space-y-6 bg-surface-container-lowest shadow-xl">
            <div className="flex items-center justify-between border-b border-soft-clay/30 pb-3">
              <div>
                <h2 className="font-display text-xl text-on-surface">Set HPP Produk</h2>
                <p className="text-xs text-primary font-semibold font-body mt-0.5">{editHppProduct.product_name}</p>
              </div>
              <button onClick={() => setEditHppProduct(null)} className="text-on-surface-variant hover:text-error">
                <Icon name="close" className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleHppSubmit} className="space-y-4">
              <div className="bg-surface-container p-3 rounded-lg text-xs flex justify-between items-center">
                <span className="text-on-surface-variant font-label">Harga Jual Toko:</span>
                <span className="font-bold text-primary text-sm">Rp {editHppProduct.product_price.toLocaleString('id-ID')}</span>
              </div>

              <div>
                <label className="block font-label text-xs uppercase tracking-wider text-on-surface-variant mb-1">
                  1. Biaya Bahan Baku / Unit (Rp)
                </label>
                <input
                  type="number"
                  name="material_cost"
                  value={matCost}
                  onChange={(e) => setMatCost(e.target.value)}
                  placeholder="Contoh: benang, kain, pewarna per unit"
                  className="input"
                />
              </div>

              <div>
                <label className="block font-label text-xs uppercase tracking-wider text-on-surface-variant mb-1">
                  2. Biaya Tenaga Kerja / Upah Pengrajin per Unit (Rp)
                </label>
                <input
                  type="number"
                  name="labor_cost"
                  value={labCost}
                  onChange={(e) => setLabCost(e.target.value)}
                  placeholder="Upah pembuatan per unit"
                  className="input"
                />
              </div>

              <div>
                <label className="block font-label text-xs uppercase tracking-wider text-on-surface-variant mb-1">
                  3. Biaya Overhead & Kemasan / Unit (Rp)
                </label>
                <input
                  type="number"
                  name="overhead_cost"
                  value={ovhCost}
                  onChange={(e) => setOvhCost(e.target.value)}
                  placeholder="Kotak packaging, stiker, listrik"
                  className="input"
                />
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/40 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-label text-on-surface-variant">Total HPP per Unit:</span>
                  <span className="font-bold text-error font-display text-base">Rp {calcHppTotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-label text-on-surface-variant">Estimasi Profit Margin:</span>
                  <span className={`font-bold text-sm ${calcMargin >= 30 ? 'text-success' : calcMargin > 0 ? 'text-amber-600' : 'text-error'}`}>
                    {calcMargin}%
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-label text-xs uppercase tracking-wider text-on-surface-variant mb-1">
                  Catatan Kalkulasi
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  value={hppNotes}
                  onChange={(e) => setHppNotes(e.target.value)}
                  placeholder="Detail rincian bahan baku..."
                  className="input resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-soft-clay/30">
                <button type="button" onClick={() => setEditHppProduct(null)} className="btn btn-secondary">
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                  {isSubmitting ? 'Menyimpan...' : 'Simpan HPP Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
