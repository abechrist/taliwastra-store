'use client';

import { useEffect, useState, useMemo, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';
import { getCart, createOrder, getProvinces, getCities, getShippingCost } from '@/lib/api';
import { addToast } from '@/components/Toast';
import { getClientDictionary } from '@/lib/client-dictionary';
import Icon from '@/components/Icon';

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
  const dict = getClientDictionary(lang);
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
      addToast(dict.checkout.cart_empty, 'error');
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
        addToast(res.message || dict.checkout.toast_order_failed, 'error');
      }
    } catch {
      addToast(dict.checkout.toast_order_failed, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar lang={lang} dict={dict} />
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
        <Footer lang={lang} dict={dict} />
      </>
    );
  }

  if (orderResult) {
    return (
      <>
        <Navbar lang={lang} dict={dict} />
        <main className="flex-grow w-full max-w-[1280px] mx-auto px-5 md:px-16 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <Icon name="check_circle" className="text-3xl text-green-600" />
            </div>
            <h1 className="font-display text-2xl md:text-3xl text-on-surface mb-3">{dict.checkout.order_success}</h1>
            <p className="font-body text-on-surface-variant mb-2">
              {dict.checkout.order_number} <span className="font-bold text-on-surface">{orderResult.order_number}</span>
            </p>
            <p className="font-body text-sm text-on-surface-variant mb-8">
              {dict.checkout.order_success_desc}
            </p>
            {orderResult.midtrans_redirect_url && (
              <a
                href={orderResult.midtrans_redirect_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary mb-4"
              >
                <Icon name="payment" />
                {dict.checkout.pay_now}
              </a>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
              <Link href={`/${lang}/track?order=${orderResult.order_number}`} className="btn btn-secondary">
                {dict.checkout.track_order}
              </Link>
              <Link href={`/${lang}/categories`} className="btn btn-secondary">
                {dict.checkout.continue_shopping}
              </Link>
            </div>
          </div>
        </main>
        <Footer lang={lang} dict={dict} />
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <Navbar lang={lang} dict={dict} />
        <main className="flex-grow w-full max-w-[1280px] mx-auto px-5 md:px-16 py-12">
          <div className="text-center py-20">
            <Icon name="shopping_cart" className="text-6xl text-outline mb-4 block" />
            <p className="font-body text-lg text-on-surface-variant mb-6">{dict.checkout.cart_empty_page}</p>
            <Link href={`/${lang}/categories`} className="btn btn-primary">
              {dict.checkout.start_shopping}
            </Link>
          </div>
        </main>
        <Footer lang={lang} dict={dict} />
      </>
    );
  }

  return (
    <>
      <Navbar lang={lang} dict={dict} />
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-5 md:px-16 py-8 md:py-12">
        <Breadcrumb
          items={[
            { label: dict.breadcrumb.home, href: `/${lang}` },
            { label: dict.breadcrumb.cart, href: `/${lang}/cart` },
            { label: dict.breadcrumb.checkout },
          ]}
        />

        <h1 className="font-display text-2xl md:text-3xl text-on-surface mb-8">{dict.checkout.title}</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-7 space-y-8">
            <section className="card p-6 md:p-8 space-y-6">
              <h2 className="font-display text-xl text-on-surface flex items-center gap-2">
                <Icon name="person" className="text-secondary" />
                {dict.checkout.shipping_info}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <div className="md:col-span-2">
                  <label className="block font-label text-xs text-on-surface-variant uppercase tracking-wider mb-2">{dict.checkout.name}</label>
                  <input required value={form.fullName} onChange={(e) => updateField('fullName', e.target.value)} className="input" placeholder={dict.checkout.name_placeholder} />
                </div>
                <div>
                  <label className="block font-label text-xs text-on-surface-variant uppercase tracking-wider mb-2">{dict.checkout.email}</label>
                  <input required type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} className="input" placeholder={dict.checkout.email_placeholder} />
                </div>
                <div>
                  <label className="block font-label text-xs text-on-surface-variant uppercase tracking-wider mb-2">{dict.checkout.phone}</label>
                  <input required type="tel" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} className="input" placeholder={dict.checkout.phone_placeholder} />
                </div>
                <div className="md:col-span-2">
                  <label className="block font-label text-xs text-on-surface-variant uppercase tracking-wider mb-2">{dict.checkout.address}</label>
                  <textarea required value={form.address} onChange={(e) => updateField('address', e.target.value)} className="input resize-none" rows={3} placeholder={dict.checkout.address_placeholder} />
                </div>
                <div>
                  <label className="block font-label text-xs text-on-surface-variant uppercase tracking-wider mb-2">{dict.checkout.province}</label>
                  <select required value={form.province} onChange={(e) => updateField('province', e.target.value)} className="input">
                    <option value="">{dict.checkout.select_province}</option>
                    {provinces.map((p) => (
                      <option key={p.province_id} value={p.province_id}>{p.province}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-label text-xs text-on-surface-variant uppercase tracking-wider mb-2">{dict.checkout.city}</label>
                  <select required value={form.city} onChange={(e) => updateField('city', e.target.value)} className="input" disabled={!form.province}>
                    <option value="">{dict.checkout.select_city}</option>
                    {cities.map((c) => (
                      <option key={c.city_id} value={c.city_id}>{c.type ? `${c.type} ${c.city_name}` : c.city_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-label text-xs text-on-surface-variant uppercase tracking-wider mb-2">{dict.checkout.postal_code}</label>
                  <input value={form.postalCode} onChange={(e) => updateField('postalCode', e.target.value)} className="input" placeholder={dict.checkout.postal_placeholder} />
                </div>
              </div>
            </section>

            <section className="card p-6 md:p-8 space-y-6">
              <h2 className="font-display text-xl text-on-surface flex items-center gap-2">
                <Icon name="local_shipping" className="text-secondary" />
                {dict.checkout.shipping_section}
              </h2>
              <div>
                <label className="block font-label text-xs text-on-surface-variant uppercase tracking-wider mb-2">{dict.checkout.courier}</label>
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
                      <Icon name={c.icon} className="text-sm" />
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
                  <label className="block font-label text-xs text-on-surface-variant uppercase tracking-wider mb-2">{dict.checkout.service_fee}</label>
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
                            <p className="font-body text-xs text-on-surface-variant">{dict.checkout.estimate_days.replace('{etd}', opt.etd)}</p>
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
              <h3 className="font-display text-xl text-on-surface">{dict.checkout.order_summary}</h3>
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
                  <span className="font-body text-on-surface-variant">{dict.checkout.subtotal}</span>
                  <span className="font-body text-on-surface">Rp {subtotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-body text-on-surface-variant">{dict.checkout.shipping_cost}</span>
                  <span className="font-body text-on-surface">
                    {selectedShippingCost > 0 ? `Rp ${selectedShippingCost.toLocaleString('id-ID')}` : fetchingShipping ? dict.checkout.shipping_calculating : dict.checkout.shipping_after_service}
                  </span>
                </div>
                <div className="flex justify-between items-end pt-3 border-t border-soft-clay/50">
                  <span className="font-body text-sm text-on-surface">{dict.checkout.total}</span>
                  <span className="font-display text-2xl font-bold text-primary">Rp {total.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <button type="submit" disabled={submitting || items.length === 0} className="btn btn-primary w-full py-4">
                {submitting ? (
                  <>
                    <Icon name="sync" className="animate-spin" />
                    {dict.checkout.processing}
                  </>
                ) : (
                  <>
                    <Icon name="lock" />
                    {dict.checkout.pay_now}
                  </>
                )}
              </button>
              <p className="text-center font-body text-xs text-on-surface-variant">{dict.checkout.secure_payment}</p>
            </div>
          </div>
        </form>
      </main>
      <Footer lang={lang} dict={dict} />
    </>
  );
}
