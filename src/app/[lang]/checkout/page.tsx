'use client';

import { useEffect, useState, useMemo, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';
import { getCart, createOrder, getProvinces, getCities, getShippingCost } from '@/lib/api';
import { addToast } from '@/components/Toast';

type CartItem = {
  id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  slug: string;
  stock: number;
  weight_grams: number;
};

type Province = { province_id: string; province: string };
type City = { city_id: string; city_name: string; type: string };

type ShippingOption = {
  service: string;
  description: string;
  cost: number;
  etd: string;
};

type CheckoutForm = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  province: string;
  city: string;
  cityName: string;
  postalCode: string;
  courier: string;
  shippingService: string;
};

const COURIER_OPTIONS = [
  { code: 'jne', name: 'JNE', icon: 'local_shipping' },
  { code: 'jnt', name: 'J&T Express', icon: 'local_shipping' },
  { code: 'sicepat', name: 'SiCepat', icon: 'local_shipping' },
];

export default function CheckoutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [fetchingShipping, setFetchingShipping] = useState(false);
  const [orderResult, setOrderResult] = useState<{ order_number: string; midtrans_redirect_url?: string } | null>(null);

  const [form, setForm] = useState<CheckoutForm>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    province: '',
    city: '',
    cityName: '',
    postalCode: '',
    courier: '',
    shippingService: '',
  });

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0), [items]);
  const totalWeight = useMemo(() => items.reduce((sum, item) => sum + (item.weight_grams || 100) * item.quantity, 0), [items]);
  const selectedShippingCost = useMemo(() => {
    const option = shippingOptions.find((o) => `${o.service}__${o.description}` === form.shippingService);
    return option?.cost || 0;
  }, [shippingOptions, form.shippingService]);
  const total = subtotal + selectedShippingCost;

  useEffect(() => {
    const init = async () => {
      try {
        const [cartRes, provRes] = await Promise.all([getCart(), getProvinces()]);
        setItems(cartRes.data || []);
        setProvinces(provRes.data || []);
      } catch {
        setItems([]);
        setProvinces([]);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!form.province) return;
    let cancelled = false;
    const fetchCities = async () => {
      try {
        const res = await getCities(form.province);
        if (!cancelled) setCities(res.data || []);
      } catch {
        if (!cancelled) setCities([]);
      }
    };
    fetchCities();
    return () => { cancelled = true; };
  }, [form.province]);

  useEffect(() => {
    if (!form.courier || !form.province || !form.city || totalWeight <= 0) return;
    let cancelled = false;
    const fetchCost = async () => {
      setFetchingShipping(true);
      try {
        const res = await getShippingCost({
          origin: '501', // default origin city id, adjust as needed
          destination: form.city,
          weight: totalWeight,
          courier: form.courier,
        });
        if (!cancelled) {
          const results = res.data || [];
          const mapped: ShippingOption[] = [];
          for (const r of results) {
            for (const s of r.costs || []) {
              mapped.push({
                service: r.service,
                description: s.service,
                cost: Number(s.cost?.[0]?.value || 0),
                etd: s.cost?.[0]?.etd || '-',
              });
            }
          }
          setShippingOptions(mapped);
          if (mapped.length > 0 && !form.shippingService) {
            setForm((f) => ({ ...f, shippingService: `${mapped[0].service}__${mapped[0].description}` }));
          }
        }
      } catch {
        if (!cancelled) setShippingOptions([]);
      } finally {
        if (!cancelled) setFetchingShipping(false);
      }
    };
    fetchCost();
    return () => { cancelled = true; };
  }, [form.courier, form.province, form.city, totalWeight, form.shippingService]);

  const updateField = (field: keyof CheckoutForm, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'province') {
        next.city = '';
        next.cityName = '';
        next.shippingService = '';
      }
      if (field === 'city') {
        next.shippingService = '';
      }
      if (field === 'courier') {
        next.shippingService = '';
      }
      return next;
    });
    if (field === 'province') {
      setCities([]);
    }
    if (field === 'city' || field === 'courier') {
      setShippingOptions([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      addToast('Keranjang belanja kosong', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await createOrder({
        customer_name: form.fullName,
        customer_email: form.email,
        customer_phone: form.phone,
        shipping_address: form.address,
        shipping_city: form.cityName || form.city,
        shipping_postal_code: form.postalCode,
        shipping_courier: form.courier,
        shipping_service: form.shippingService || undefined,
        shipping_cost: selectedShippingCost,
        payment_method: 'midtrans',
      });
      if (res.success) {
        setOrderResult(res.data);
      } else {
        addToast(res.message || 'Gagal membuat pesanan', 'error');
      }
    } catch {
      addToast('Gagal membuat pesanan', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar lang={lang} dict={{}} />
        <main className="flex-grow w-full max-w-[1280px] mx-auto px-5 md:px-16 py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-7 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton w-full h-16 rounded-xl" />
              ))}
            </div>
            <div className="lg:col-span-5">
              <div className="skeleton w-full h-[400px] rounded-xl" />
            </div>
          </div>
        </main>
        <Footer lang={lang} />
      </>
    );
  }

  if (orderResult) {
    return (
      <>
        <Navbar lang={lang} dict={{}} />
        <main className="flex-grow w-full max-w-[1280px] mx-auto px-5 md:px-16 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-3xl text-green-600">check_circle</span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl text-on-surface mb-3">Pesanan Berhasil Dibuat</h1>
            <p className="font-body text-on-surface-variant mb-2">
              Nomor Pesanan: <span className="font-bold text-on-surface">{orderResult.order_number}</span>
            </p>
            <p className="font-body text-sm text-on-surface-variant mb-8">
              Terima kasih atas pesanan Anda. Silakan selesaikan pembayaran untuk memproses pesanan.
            </p>
            {orderResult.midtrans_redirect_url && (
              <a
                href={orderResult.midtrans_redirect_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary mb-4"
              >
                <span className="material-symbols-outlined">payment</span>
                Bayar Sekarang
              </a>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
              <Link href={`/${lang}/track?order=${orderResult.order_number}`} className="btn btn-secondary">
                Lacak Pesanan
              </Link>
              <Link href={`/${lang}/categories`} className="btn btn-secondary">
                Lanjut Belanja
              </Link>
            </div>
          </div>
        </main>
        <Footer lang={lang} />
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <Navbar lang={lang} dict={{}} />
        <main className="flex-grow w-full max-w-[1280px] mx-auto px-5 md:px-16 py-12">
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-outline mb-4 block">shopping_cart</span>
            <p className="font-body text-lg text-on-surface-variant mb-6">Keranjang belanja Anda masih kosong.</p>
            <Link href={`/${lang}/categories`} className="btn btn-primary">
              Mulai Belanja
            </Link>
          </div>
        </main>
        <Footer lang={lang} />
      </>
    );
  }

  return (
    <>
      <Navbar lang={lang} dict={{}} />
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-5 md:px-16 py-8 md:py-12">
        <Breadcrumb
          items={[
            { label: 'Home', href: `/${lang}` },
            { label: 'Keranjang', href: `/${lang}/cart` },
            { label: 'Checkout' },
          ]}
        />

        <h1 className="font-display text-2xl md:text-3xl text-on-surface mb-8">Checkout</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-7 space-y-8">
            <section className="card p-6 md:p-8 space-y-6">
              <h2 className="font-display text-xl text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">person</span>
                Informasi Pengiriman
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <div className="md:col-span-2">
                  <label className="block font-label text-xs text-on-surface-variant uppercase tracking-wider mb-2">Nama Lengkap</label>
                  <input required value={form.fullName} onChange={(e) => updateField('fullName', e.target.value)} className="input" placeholder="Masukkan nama lengkap" />
                </div>
                <div>
                  <label className="block font-label text-xs text-on-surface-variant uppercase tracking-wider mb-2">Email</label>
                  <input required type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} className="input" placeholder="contoh@email.com" />
                </div>
                <div>
                  <label className="block font-label text-xs text-on-surface-variant uppercase tracking-wider mb-2">Nomor Telepon</label>
                  <input required type="tel" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} className="input" placeholder="0812-3456-7890" />
                </div>
                <div className="md:col-span-2">
                  <label className="block font-label text-xs text-on-surface-variant uppercase tracking-wider mb-2">Alamat Lengkap</label>
                  <textarea required value={form.address} onChange={(e) => updateField('address', e.target.value)} className="input resize-none" rows={3} placeholder="Nama jalan, gedung, no. rumah, dll." />
                </div>
                <div>
                  <label className="block font-label text-xs text-on-surface-variant uppercase tracking-wider mb-2">Provinsi</label>
                  <select required value={form.province} onChange={(e) => updateField('province', e.target.value)} className="input">
                    <option value="">Pilih Provinsi</option>
                    {provinces.map((p) => (
                      <option key={p.province_id} value={p.province_id}>{p.province}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-label text-xs text-on-surface-variant uppercase tracking-wider mb-2">Kota/Kabupaten</label>
                  <select required value={form.city} onChange={(e) => updateField('city', e.target.value)} className="input" disabled={!form.province}>
                    <option value="">Pilih Kota</option>
                    {cities.map((c) => (
                      <option key={c.city_id} value={c.city_id}>{c.type} {c.city_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-label text-xs text-on-surface-variant uppercase tracking-wider mb-2">Kode Pos</label>
                  <input value={form.postalCode} onChange={(e) => updateField('postalCode', e.target.value)} className="input" placeholder="Kodepos" />
                </div>
              </div>
            </section>

            <section className="card p-6 md:p-8 space-y-6">
              <h2 className="font-display text-xl text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">local_shipping</span>
                Pengiriman
              </h2>
              <div>
                <label className="block font-label text-xs text-on-surface-variant uppercase tracking-wider mb-2">Kurir</label>
                <div className="grid grid-cols-3 gap-3">
                  {COURIER_OPTIONS.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => updateField('courier', c.code)}
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all font-body text-sm ${
                        form.courier === c.code ? 'border-primary bg-primary/5 text-primary font-medium' : 'border-outline-variant text-on-surface-variant hover:border-primary/50'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">{c.icon}</span>
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {fetchingShipping && (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="skeleton w-full h-16 rounded-xl" />
                  ))}
                </div>
              )}

              {shippingOptions.length > 0 && (
                <div className="space-y-2">
                  <label className="block font-label text-xs text-on-surface-variant uppercase tracking-wider mb-2">Layanan & Tarif</label>
                  {shippingOptions.map((opt) => {
                    const value = `${opt.service}__${opt.description}`;
                    const selected = form.shippingService === value;
                    return (
                      <label
                        key={value}
                        className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selected ? 'border-primary bg-primary/5' : 'border-outline-variant hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shipping"
                            value={value}
                            checked={selected}
                            onChange={() => updateField('shippingService', value)}
                            className="accent-primary"
                          />
                          <div>
                            <p className="font-body text-sm font-medium text-on-surface">{opt.service.toUpperCase()} - {opt.description}</p>
                            <p className="font-body text-xs text-on-surface-variant">Estimasi {opt.etd} hari</p>
                          </div>
                        </div>
                        <span className="font-display text-base text-primary font-bold">Rp {opt.cost.toLocaleString('id-ID')}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          <div className="lg:col-span-5">
            <div className="linen-card rounded-xl p-6 lg:p-8 lg:sticky lg:top-24 space-y-6">
              <h3 className="font-display text-xl text-on-surface">Ringkasan Pesanan</h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 items-start">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface-container shrink-0 relative">
                      {item.image_url && <Image src={item.image_url} alt={item.name} fill sizes="48px" className="object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm text-on-surface truncate">{item.name}</p>
                      <p className="font-body text-xs text-on-surface-variant">Qty {item.quantity}</p>
                    </div>
                    <span className="font-body text-sm text-on-surface shrink-0">
                      Rp {(Number(item.price) * item.quantity).toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-soft-clay/50 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-body text-on-surface-variant">Subtotal</span>
                  <span className="font-body text-on-surface">Rp {subtotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-body text-on-surface-variant">Ongkos Kirim</span>
                  <span className="font-body text-on-surface">
                    {selectedShippingCost > 0 ? `Rp ${selectedShippingCost.toLocaleString('id-ID')}` : fetchingShipping ? 'Menghitung...' : 'Dihitung setelah layanan dipilih'}
                  </span>
                </div>
                <div className="flex justify-between items-end pt-3 border-t border-soft-clay/50">
                  <span className="font-body text-sm text-on-surface">Total</span>
                  <span className="font-display text-2xl font-bold text-primary">Rp {total.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <button type="submit" disabled={submitting || items.length === 0} className="btn btn-primary w-full py-4">
                {submitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">sync</span>
                    Memproses...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">lock</span>
                    Bayar Sekarang
                  </>
                )}
              </button>
              <p className="text-center font-body text-xs text-on-surface-variant">Pembayaran aman via Midtrans.</p>
            </div>
          </div>
        </form>
      </main>
      <Footer lang={lang} />
    </>
  );
}
