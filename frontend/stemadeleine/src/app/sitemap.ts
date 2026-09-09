import { MetadataRoute } from 'next';
import { getPublicPages } from '@/lib/serverApi';

type PublicPage = {
  slug?: string | null;
  updatedAt?: string | null;
  children?: PublicPage[] | null;
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://stemadeleine.fr';

function toAbsoluteUrl(slug: string): string {
  const normalized = slug.startsWith('/') ? slug : `/${slug}`;
  return new URL(normalized, siteUrl).toString();
}

// La route /pages/tree renvoie une arborescence (pages + sous-pages) : on l'aplatit
// pour obtenir la liste complète des slugs à référencer dans le sitemap.
function flattenPages(pages: PublicPage[]): PublicPage[] {
  return pages.flatMap((page) => [page, ...flattenPages(page.children || [])]);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = flattenPages((await getPublicPages()) as PublicPage[]);

  const entries = pages
    .filter((page): page is PublicPage & { slug: string } => Boolean(page?.slug))
    .map((page) => ({
      slug: page.slug,
      url: toAbsoluteUrl(page.slug),
      updatedAt: page.updatedAt || null,
    }));

  const uniqueEntries = Array.from(new Map(entries.map((entry) => [entry.slug, entry])).values());
  const homeEntry = { slug: '/', url: toAbsoluteUrl('/'), updatedAt: null };
  const allEntries = uniqueEntries.some((entry) => entry.slug === '/') ? uniqueEntries : [homeEntry, ...uniqueEntries];

  return allEntries.map((entry) => ({
    url: entry.url,
    lastModified: entry.updatedAt ? new Date(entry.updatedAt) : new Date(),
    changeFrequency: 'weekly',
    priority: entry.slug === '/' ? 1 : 0.7,
  }));
}
