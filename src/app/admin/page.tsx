import Link from 'next/link';
import { getAdminStats, getRecentOrders } from '@/lib/db/repositories/orders';
import { countActiveProducts } from '@/lib/db/repositories/products';
import Icon from '@/components/Icon';

export default async function AdminDashboard() {
  const stats = await getAdminStats();
  const totalProducts = await countActiveProducts();
  const recentOrders = await getRecentOrders(8);

  const formatRp = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl md:text-3xl text-on-surface">Dashboard</h1>
        <p className="font-body text-sm text-on-surface-variant mt-1">Ringkasan aktivitas toko Anda</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {[
          { label: 'Pendapatan', value: formatRp(stats.totalRevenue), icon: 'payments', color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Pesanan', value: stats.totalOrders, icon: 'shopping_bag', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Produk Aktif', value: totalProducts, icon: 'inventory_2', color: 'text-primary', bg: 'bg-red-50' },
          { label: 'Menunggu', value: stats.pendingOrders, icon: 'schedule', color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map((stat) => (
          <div key={stat.label} className="linen-card rounded-xl p-5 md:p-6 border border-outline-variant/30">
            <div className="flex items-start justify-between mb-4">
              <span className="font-body text-xs text-on-surface-variant uppercase tracking-wider">{stat.label}</span>
              <Icon name={stat.icon} className={stat.color} />
            </div>
            <p className="font-display text-xl md:text-2xl text-on-surface">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="linen-card rounded-xl border border-outline-variant/30 overflow-hidden">
        <div className="p-6 border-b border-soft-clay/30 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg text-on-surface">Pesanan Terbaru</h2>
            <p className="font-body text-xs text-on-surface-variant mt-1">8 pesanan terkini</p>
          </div>
          <Link href="/admin/orders" className="font-body text-sm text-primary hover:text-on-primary transition-colors font-medium">
            Lihat Semua
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/80">
                <th className="p-4 text-sm font-label text-on-surface-variant border-b border-soft-clay/30">Order ID</th>
                <th className="p-4 text-sm font-label text-on-surface-variant border-b border-soft-clay/30">Pelanggan</th>
                <th className="p-4 text-sm font-label text-on-surface-variant border-b border-soft-clay/30">Total</th>
                <th className="p-4 text-sm font-label text-on-surface-variant border-b border-soft-clay/30">Status</th>
                <th className="p-4 text-sm font-label text-on-surface-variant border-b border-soft-clay/30">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="p-4 text-sm font-medium text-on-surface border-b border-soft-clay/30">{order.order_number}</td>
                  <td className="p-4 text-sm border-b border-soft-clay/30">
                    <p className="text-on-surface">{order.customer_name}</p>
                    <p className="text-xs text-on-surface-variant">{order.customer_email}</p>
                  </td>
                  <td className="p-4 text-sm border-b border-soft-clay/30 font-medium">{formatRp(Number(order.total))}</td>
                  <td className="p-4 border-b border-soft-clay/30">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm border-b border-soft-clay/30 text-on-surface-variant">
                    {new Date(order.created_at).toLocaleDateString('id-ID')}
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-on-surface-variant">Belum ada pesanan masuk.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
