import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { getDictionary } from '@/lib/dictionaries';
import Icon from '@/components/Icon';

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  return (
    <>
      <Navbar lang={lang} dict={dict} />
      <main className="flex-grow">
        <section className="w-full max-w-[1280px] mx-auto px-5 md:px-16 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-[32px] md:text-[48px] font-display text-on-surface mb-6 leading-tight">
              {dict.about.title}
            </h1>
            <p className="text-base md:text-lg font-body text-on-surface-variant leading-relaxed">
              {dict.about.intro}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-16">
            <div className="md:col-span-5 bg-linen-white rounded-2xl p-8 md:p-12 border border-outline-variant/50 flex flex-col justify-center">
              <Icon name="auto_awesome" className="text-primary mb-6 text-4xl" />
              <h2 className="text-2xl font-display text-on-surface mb-4">{dict.about.visi_title}</h2>
              <p className="text-base font-body text-on-surface-variant leading-relaxed">
                {dict.about.visi_desc}
              </p>
            </div>
            <div className="md:col-span-7 rounded-2xl overflow-hidden bg-surface-container min-h-[300px] md:min-h-0">
            </div>
            <div className="md:col-span-6 bg-surface-container-low rounded-2xl p-8 md:p-12 flex flex-col justify-center">
              <Icon name="volunteer_activism" className="text-primary mb-6 text-4xl" />
              <h2 className="text-2xl font-display text-on-surface mb-4">{dict.about.proses_title}</h2>
              <p className="text-base font-body text-on-surface-variant leading-relaxed mb-6">
                {dict.about.proses_desc}
              </p>
              <ul className="flex flex-col gap-3">
                {dict.about.proses_items.map((item: string) => (
                  <li key={item} className="flex items-center gap-3 font-body text-sm text-on-surface-variant">
                    <Icon name="radio_button_checked" className="text-secondary text-sm" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:col-span-6 bg-surface-container-high rounded-2xl p-8 md:p-12 flex flex-col justify-center">
              <Icon name="eco" className="text-primary mb-6 text-4xl" />
              <h2 className="text-2xl font-display text-on-surface mb-4">{dict.about.berkelanjutan_title}</h2>
              <p className="text-base font-body text-on-surface-variant leading-relaxed mb-6">
                {dict.about.berkelanjutan_desc}
              </p>
              <ul className="flex flex-col gap-3">
                {dict.about.berkelanjutan_items.map((item: string) => (
                  <li key={item} className="flex items-center gap-3 font-body text-sm text-on-surface-variant">
                    <Icon name="radio_button_checked" className="text-secondary text-sm" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="w-full max-w-[1280px] mx-auto px-5 md:px-16 py-16 md:py-24 mb-16">
          <div className="bg-surface-container-high rounded-2xl p-8 md:p-16 border border-outline-variant/50 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1 space-y-6">
                <h2 className="text-[32px] md:text-3xl font-display text-on-surface">{dict.about.bahan_title}</h2>
                <p className="text-base md:text-lg font-body text-on-surface-variant leading-relaxed">
                  {dict.about.bahan_desc}
                </p>
                <Link href={`/${lang}/categories`} className="btn btn-primary">
                  {dict.about.explore}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer lang={lang} dict={dict} />
      </>
  );
}
