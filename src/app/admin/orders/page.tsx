import { updateOrderStatusAction } from '../actions/orders';
import { getAllOrders } from '@/lib/db/repositories/orders';

export default async function AdminOrders() {
  const orders = await getAllOrders();

  const formatRp = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);

  const statusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: 'Menunggu', color: 'bg-orange-100 text-orange-800' },
    processing: { label: 'Diproses', color: 'bg-blue-100 text-blue-800' },
    shipped: { label: 'Dikirim', color: 'bg-purple-100 text-purple-800' },
    completed: { label: 'Selesai', color: 'bg-green-100 text-green-800' },
    cancelled: { label: 'Batal', color: 'bg-red-100 text-red-800' },
    failed: { label: 'Gagal', color: 'bg-red-100 text-red-800' },
  };

  const paymentConfig: Record<string, { label: string; color: string }> = {
    pending: { label: 'Belum Bayar', color: 'bg-orange-100 text-orange-800' },
    paid: { label: 'Lunas', color: 'bg-green-100 text-green-800' },
    failed: { label: 'Gagal', color: 'bg-red-100 text-red-800' },
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl md:text-3xl text-on-surface">Pesanan</h1>
        <p className="font-body text-sm text-on-surface-variant mt-1">Kelola dan lacak semua pesanan</p>
      </div>

      <div className="linen-card rounded-xl border border-outline-variant/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/80">
                <th className="p-4 text-sm font-label text-on-surface-variant border-b border-soft-clay/30">Order ID</th>
                <th className="p-4 text-sm font-label text-on-surface-variant border-b border-soft-clay/30">Pelanggan</th>
                <th className="p-4 text-sm font-label text-on-surface-variant border-b border-soft-clay/30">Total</th>
                <th className="p-4 text-sm font-label text-on-surface-variant border-b border-soft-clay/30">Pembayaran</th>
                <th className="p-4 text-sm font-label text-on-surface-variant border-b border-soft-clay/30">Status</th>
                <th className="p-4 text-sm font-label text-on-surface-variant border-b border-soft-clay/30 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="p-4 text-sm font-medium text-on-surface border-b border-soft-clay/30">{order.order_number}</td>
                  <td className="p-4 text-sm border-b border-soft-clay/30">
                    <p className="text-on-surface">{order.customer_name}</p>
                    <p className="text-xs text-on-surface-variant">{order.customer_email}</p>
                  </td>
                  <td className="p-4 text-sm border-b border-soft-clay/30 font-medium">{formatRp(Number(order.total))}</td>
                  <td className="p-4 border-b border-soft-clay/30">
                    {order.payment_status && paymentConfig[order.payment_status] ? (
                      <span className={`badge ${paymentConfig[order.payment_status].color}`}>
                        {paymentConfig[order.payment_status].label}
                      </span>
                    ) : (
                      <span className="text-xs text-on-surface-variant">-</span>
                    )}
                  </td>
                  <td className="p-4 border-b border-soft-clay/30">
                    <span className={`badge ${statusConfig[order.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 border-b border-soft-clay/30 text-right">
                    <form action={async (formData: FormData) => {
                      'use server';
                      const newStatus = formData.get('status') as string;
                      await updateOrderStatusAction(order.id, newStatus);
                    }}>
                      <select
                        name="status"
                        defaultValue={order.status}
                        className="bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent mr-2"
                      >
                        {Object.keys(statusConfig).map((s) => (
                          <option key={s} value={s}>{statusConfig[s].label}</option>
                        ))}
                      </select>
                      <button type="submit" className="btn btn-primary py-1.5 px-4 text-xs">
                        Update
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-on-surface-variant">Belum ada pesanan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
