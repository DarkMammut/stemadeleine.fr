import { Metadata } from 'next';
import { getPageBySlug } from '@/lib/serverApi';

type PageShape = {
  name?: string;
  title?: string;
  description?: string;
  heroMedia?: { fileUrl?: string } | null;
  url?: string;
  keywords?: string | null;
  noIndex?: boolean | null;
  noFollow?: boolean | null;
};

const DEFAULT_SITE_NAME = 'Les Amis de Sainte-Madeleine';
const DEFAULT_DESCRIPTION = 'Site officiel des Amis de Sainte-Madeleine de la Jarrie';
const DEFAULT_LOCALE = 'fr_FR';
const DEFAULT_AUTHOR = 'Les Amis de Sainte-Madeleine';
const DEFAULT_PUBLISHER = 'Les Amis de Sainte-Madeleine';
const DEFAULT_KEYWORDS = ['Sainte-Madeleine', 'La Jarrie', 'association', 'patrimoine'];

function getSiteBaseUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://stemadeleine.fr';
}

function buildAbsoluteUrl(pathOrUrl?: string): string | undefined {
  if (!pathOrUrl) return undefined;
  try {
    return new URL(pathOrUrl, getSiteBaseUrl()).toString();
  } catch {
    return undefined;
  }
}

function buildTitle(page: PageShape | null, siteName: string): string {
  const pageTitle = page?.title?.trim() || page?.name?.trim();
  return pageTitle ? `${pageTitle} | ${siteName}` : siteName;
}

function buildRobots(page: PageShape | null) {
  const noIndex = Boolean(page?.noIndex);
  const noFollow = Boolean(page?.noFollow);
  return {
    index: !noIndex,
    follow: !noFollow,
  };
}

export function buildMetadataFromPage(page: PageShape | null, opts?: { siteName?: string; locale?: string }): Metadata {
  const siteName = opts?.siteName ?? DEFAULT_SITE_NAME;
  const locale = opts?.locale ?? DEFAULT_LOCALE;
  const metadataBase = new URL(getSiteBaseUrl());
  const robots = buildRobots(page);

  if (!page) {
    return {
      title: siteName,
      description: DEFAULT_DESCRIPTION,
      metadataBase,
      applicationName: siteName,
      authors: [{ name: DEFAULT_AUTHOR }],
      publisher: DEFAULT_PUBLISHER,
      robots,
      keywords: DEFAULT_KEYWORDS,
      openGraph: {
        title: siteName,
        description: DEFAULT_DESCRIPTION,
        url: metadataBase.toString(),
        siteName,
        locale,
      },
      twitter: {
        card: 'summary_large_image',
      },
    } as Metadata;
  }

  const title = buildTitle(page, siteName);
  const description = page.description || DEFAULT_DESCRIPTION;
  const image = page.heroMedia?.fileUrl || undefined;
  const canonical = buildAbsoluteUrl(page.url || undefined);

  const pageKeywords = page.keywords ? page.keywords.split(',').map((k) => k.trim()).filter(Boolean) : [];
  const keywordsArray = pageKeywords.length > 0 ? pageKeywords : DEFAULT_KEYWORDS;

  return {
    metadataBase,
    applicationName: siteName,
    title,
    description,
    keywords: keywordsArray,
    authors: [{ name: DEFAULT_AUTHOR }],
    publisher: DEFAULT_PUBLISHER,
    robots,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title,
      description,
      url: canonical || metadataBase.toString(),
      images: image ? [{ url: buildAbsoluteUrl(image) || image }] : undefined,
      siteName,
      locale,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [buildAbsoluteUrl(image) || image] : undefined,
    },
  } as Metadata;
}

export async function getMetadataForSlug(slug = '/'): Promise<Metadata> {
  const page = await getPageBySlug(slug);
  return buildMetadataFromPage(page);
}
