import { Metadata } from 'next';
import { getPageBySlug } from '@/lib/serverApi';

type PageShape = {
  name?: string;
  description?: string;
  heroMedia?: { fileUrl?: string } | null;
  url?: string;
  keywords?: string | null;
};

const DEFAULT_SITE_NAME = 'Les Amis de Sainte-Madeleine';
const DEFAULT_DESCRIPTION = 'Site officiel des Amis de Sainte-Madeleine de la Jarrie';
const DEFAULT_LOCALE = 'fr_FR';

export function buildMetadataFromPage(page: PageShape | null, opts?: { siteName?: string; locale?: string }): Metadata {
  const siteName = opts?.siteName ?? DEFAULT_SITE_NAME;
  const locale = opts?.locale ?? DEFAULT_LOCALE;

  if (!page) {
    return {
      title: siteName,
      description: DEFAULT_DESCRIPTION,
      openGraph: {
        title: siteName,
        description: DEFAULT_DESCRIPTION,
        siteName,
        locale,
      },
      twitter: {
        card: 'summary_large_image',
      },
    } as Metadata;
  }

  const title = page.name ? `${page.name} - ${siteName}` : siteName;
  const description = page.description || DEFAULT_DESCRIPTION;
  const image = page.heroMedia?.fileUrl || undefined;
  const url = page.url || undefined;

  const keywordsArray = page.keywords ? page.keywords.split(',').map((k) => k.trim()).filter(Boolean) : [];

  const metadata: Metadata = {
    title,
    description,
    // You can add other top-level fields as needed
    openGraph: {
      title,
      description,
      url,
      images: image ? [{ url: image }] : undefined,
      siteName,
      locale,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
  } as Metadata;

  if (keywordsArray.length > 0) {
    // Attach keywords in a safe way; Metadata type may vary between Next versions
    (metadata as unknown as Record<string, unknown>)['keywords'] = keywordsArray;
  }

  return metadata;
}

export async function getMetadataForSlug(slug = '/'): Promise<Metadata> {
  const page = await getPageBySlug(slug);
  return buildMetadataFromPage(page);
}
