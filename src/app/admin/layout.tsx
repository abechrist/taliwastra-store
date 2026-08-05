import Link from 'next/link';
import { cookies } from 'next/headers';
import { logoutAction } from './actions/auth';
import Icon from '@/components/Icon';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');

  if (!session) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-surface-container-lowest flex font-body">
      <aside className="w-64 bg-surface-container border-r border-outline-variant hidden md:flex flex-col fixed h-full z-10">
        <div className="p-6">
          <Link href="/admin" className="text-xl font-display text-on-surface hover:text-primary transition-colors">
            Tali Wastra Admin
          </Link>
          <p className="font-body text-xs text-on-surface-variant mt-1">Panel Manajemen Toko</p>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-2">
          {[
            { href: '/admin', icon: 'dashboard', label: 'Dashboard' },
            { href: '/admin/products', icon: 'inventory_2', label: 'Produk' },
            { href: '/admin/orders', icon: 'shopping_cart', label: 'Pesanan' },
            { href: '/admin/categories', icon: 'category', label: 'Kategori' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface hover:bg-surface-container-high transition-colors font-medium text-sm"
            >
              <Icon name={item.icon} className="text-xl" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-outline-variant mt-auto">
          <form action={logoutAction}>
            <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-error hover:bg-error-container transition-colors font-medium text-sm w-full text-left">
              <Icon name="logout" className="text-xl" />
              Keluar
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 bg-surface-container-lowest min-h-screen">
        <div className="p-6 md:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
