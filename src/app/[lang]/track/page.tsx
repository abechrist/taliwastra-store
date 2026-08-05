'use client';

import { useState } from 'react';
import { use } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';
import { getOrder } from '@/lib/api';
import { getClientDictionary } from '@/lib/client-dictionary';

type OrderItem = {
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
};

type OrderStatus = {
  order_number: string;
  status: string;
  payment_status: string;
  total: number;
  subtotal: number;
  shipping_cost: number;
  shipping_courier: string;
  shipping_service: string;
  customer_name: string;
  shipping_address: string;
  shipping_city: string;
  items: OrderItem[];
  created_at: string;
};

export default function TrackPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const dict = getClientDictionary(lang);
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState<OrderStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const res = await getOrder(orderNumber.trim());
      if (res.success && res.data) {
        setOrder(res.data);
      } else {
        setError(dict.track.not_found);
      }
    } catch {
      setError(dict.track.load_failed);
    } finally {
      setLoading(false);
    }
  };

  const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
    pending: { label: dict.track.status_pending, color: 'bg-orange-100 text-orange-700', icon: 'schedule' },
    processing: { label: dict.track.status_processing, color: 'bg-blue-100 text-blue-700', icon: 'inventory_2' },
    shipped: { label: dict.track.status_shipped, color: 'bg-purple-100 text-purple-700', icon: 'local_shipping' },
    completed: { label: dict.track.status_completed, color: 'bg-green-100 text-green-700', icon: 'check_circle' },
    cancelled: { label: dict.track.status_cancelled, color: 'bg-red-100 text-red-700', icon: 'cancel' },
    failed: { label: dict.track.status_failed, color: 'bg-red-100 text-red-700', icon: 'error' },
  };

  const paymentStatusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: dict.track.payment_pending, color: 'bg-orange-100 text-orange-700' },
    paid: { label: dict.track.payment_paid, color: 'bg-green-100 text-green-700' },
    failed: { label: dict.track.payment_failed, color: 'bg-red-100 text-red-700' },
  };

  return (
    <>
      <Navbar lang={lang} dict={dict} />
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-5 md:px-16 py-8 md:py-12">
        <Breadcrumb
          items={[
            { label: dict.breadcrumb.home, href: `/${lang}` },
            { label: dict.breadcrumb.track },
          ]}
        />

        <h1 className="font-display text-2xl md:text-3xl text-on-surface mb-8">{dict.track.title}</h1>

        <form onSubmit={handleTrack} className="max-w-xl mb-12">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder={dict.track.placeholder}
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="input flex-1"
              required
            />
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? (
                <span className="material-symbols-outlined animate-spin">sync</span>
              ) : (
                dict.track.track
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="max-w-2xl mx-auto mb-8 p-4 rounded-xl bg-error/10 border border-error/20 text-error text-center font-body text-sm">
            {error}
          </div>
        )}

        {order && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="card p-6 md:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="font-body text-xs text-on-surface-variant uppercase tracking-wider mb-1">{dict.track.order_number}</p>
                  <p className="font-display text-xl text-primary font-bold">{order.order_number}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {order.payment_status && paymentStatusConfig[order.payment_status] && (
                    <span className={`badge ${paymentStatusConfig[order.payment_status].color}`}>
                      {paymentStatusConfig[order.payment_status].label}
                    </span>
                  )}
                  {order.status && statusConfig[order.status] && (
                    <span className={`badge ${statusConfig[order.status].color}`}>
                      {order.status}
                    </span>
                  )}
                </div>
              </div>

              <div className="border-t border-soft-clay/50 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="font-body text-xs text-on-surface-variant uppercase tracking-wider mb-2">{dict.track.customer}</p>
                  <p className="font-body text-sm text-on-surface">{order.customer_name}</p>
                  <p className="font-body text-xs text-on-surface-variant mt-1">{order.shipping_address}, {order.shipping_city}</p>
                </div>
                <div>
                  <p className="font-body text-xs text-on-surface-variant uppercase tracking-wider mb-2">{dict.track.shipping}</p>
                  <p className="font-body text-sm text-on-surface">
                    {order.shipping_courier ? order.shipping_courier.toUpperCase() : '-'} {order.shipping_service ? `- ${order.shipping_service}` : ''}
                  </p>
                  <p className="font-body text-xs text-on-surface-variant mt-1">{dict.track.shipping_cost.replace('{cost}', Number(order.shipping_cost).toLocaleString('id-ID'))}</p>
                </div>
              </div>

              <div className="border-t border-soft-clay/50 pt-6">
                <p className="font-body text-xs text-on-surface-variant uppercase tracking-wider mb-4">{dict.track.items}</p>
                <div className="space-y-3">
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div>
                        <p className="font-body text-sm text-on-surface">{item.product_name}</p>
                        <p className="font-body text-xs text-on-surface-variant">{dict.track.qty.replace('{qty}', String(item.quantity)).replace('{price}', Number(item.product_price).toLocaleString('id-ID'))}</p>
                      </div>
                      <span className="font-body text-sm text-on-surface">Rp {Number(item.subtotal).toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-soft-clay/50 pt-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-body text-on-surface-variant">{dict.track.subtotal}</span>
                  <span className="font-body text-on-surface">Rp {Number(order.subtotal).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-body text-on-surface-variant">{dict.track.shipping_fee}</span>
                  <span className="font-body text-on-surface">Rp {Number(order.shipping_cost).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-end pt-3">
                  <span className="font-body text-sm text-on-surface">{dict.track.total}</span>
                  <span className="font-display text-2xl font-bold text-primary">Rp {Number(order.total).toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            {order.status && statusConfig[order.status] && (
              <div className="card p-6">
                <div className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-3xl text-primary">{statusConfig[order.status].icon}</span>
                  <div>
                    <p className="font-body text-sm font-medium text-on-surface">{dict.track.status.replace('{status}', statusConfig[order.status].label)}</p>
                    <p className="font-body text-xs text-on-surface-variant mt-1">
                      {dict.track.created_on.replace('{date}', new Date(order.created_at).toLocaleString('id-ID'))}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer lang={lang} dict={dict} />
    </>
  );
}
