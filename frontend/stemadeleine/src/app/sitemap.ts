import { MetadataRoute } from 'next';
import { getPublicPages } from '@/lib/serverApi';

type PublicPage = {
  slug?: string | null;
  updatedAt?: string | null;
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

function toAbsoluteUrl(slug: string): string {
  const normalized = slug.startsWith('/') ? slug : `/${slug}`;
  return new URL(normalized, siteUrl).toString();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = (await getPublicPages()) as PublicPage[];

  const entries = pages
    .filter((page): page is PublicPage & { slug: string } => Boolean(page?.slug))
    .map((page) => ({
      slug: page.slug,
      url: toAbsoluteUrl(page.slug),
      updatedAt: page.updatedAt || null,
    }));

  const uniqueEntries = Array.from(new Map(entries.map((entry) => [entry.slug, entry])).values());

  return uniqueEntries.map((entry) => ({
    url: entry.url,
    lastModified: entry.updatedAt ? new Date(entry.updatedAt) : new Date(),
    changeFrequency: 'weekly',
    priority: entry.slug === '/' ? 1 : 0.7,
  }));
}
