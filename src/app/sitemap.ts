import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

const staticPaths = ['', '/categories', '/about', '/contact'];

export default function sitemap(): MetadataRoute.Sitemap {
  const languageSpecific = ['id', 'en'].flatMap((lang) =>
    staticPaths.map((path) => ({
      url: `${SITE_URL}/${lang}${path}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: path === '' ? 1.0 : 0.8,
    }))
  );
  return languageSpecific;
}