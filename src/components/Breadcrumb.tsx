'use client';

import Link from 'next/link';
import Icon from './Icon';

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
};

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-on-surface-variant font-label text-xs uppercase tracking-wider">
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-2">
          {index > 0 && (
            <Icon name="chevron_right" className="text-[16px] opacity-60" />
          )}
          {item.href ? (
            <Link href={item.href} className="hover:text-primary transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-primary font-bold">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
