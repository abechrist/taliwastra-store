'use client';

import { useState } from 'react';
import { use } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';
import { submitContact } from '@/lib/api';
import { addToast } from '@/components/Toast';

export default function ContactPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitContact(form);
      addToast('Pesan berhasil dikirim! Kami akan segera menghubungi Anda.', 'success');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      addToast('Gagal mengirim pesan. Coba lagi.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar lang={lang} dict={{}} />
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-5 md:px-16 py-8 md:py-12">
        <Breadcrumb
          items={[
            { label: 'Home', href: `/${lang}` },
            { label: 'Kontak' },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-5 space-y-6">
            <h1 className="font-display text-2xl md:text-3xl text-on-surface">Hubungi Kami</h1>
            <p className="font-body text-sm text-on-surface-variant leading-relaxed">
              Ada pertanyaan atau ingin konsultasi produk? Silakan isi form di samping atau hubungi kami melalui kontak berikut.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-secondary mt-0.5">location_on</span>
                <div>
                  <p className="font-body text-sm font-medium text-on-surface">Alamat</p>
                  <p className="font-body text-sm text-on-surface-variant">Indonesia</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-secondary mt-0.5">email</span>
                <div>
                  <p className="font-body text-sm font-medium text-on-surface">Email</p>
                  <p className="font-body text-sm text-on-surface-variant">hello@taliwastra.id</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-secondary mt-0.5">phone</span>
                <div>
                  <p className="font-body text-sm font-medium text-on-surface">WhatsApp</p>
                  <p className="font-body text-sm text-on-surface-variant">+62 812-3456-7890</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="card p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <div>
                  <label className="block font-label text-xs text-on-surface-variant uppercase tracking-wider mb-2">Nama</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" placeholder="Nama Anda" />
                </div>
                <div>
                  <label className="block font-label text-xs text-on-surface-variant uppercase tracking-wider mb-2">Email</label>
                  <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" placeholder="email@contoh.com" />
                </div>
                <div className="md:col-span-2">
                  <label className="block font-label text-xs text-on-surface-variant uppercase tracking-wider mb-2">Subjek</label>
                  <input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="input" placeholder="Subjek pesan" />
                </div>
                <div className="md:col-span-2">
                  <label className="block font-label text-xs text-on-surface-variant uppercase tracking-wider mb-2">Pesan</label>
                  <textarea required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="input resize-none" rows={5} placeholder="Tulis pesan Anda..." />
                </div>
              </div>
              <button type="submit" disabled={submitting} className="btn btn-primary">
                {submitting ? 'Mengirim...' : 'Kirim Pesan'}
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer lang={lang} />
      </>
  );
}
