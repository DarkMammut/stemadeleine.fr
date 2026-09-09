import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import NewsDetailClient from '@/components/news/NewsDetailClient';
import { buildMetadataFromPage } from '@/lib/metadata';
import { getPageBySlug } from '@/lib/serverApi';
import { getNewsPublicationByNewsId } from '@/lib/publicApi';

type Params = { params: Promise<{ newsId: string }> };

const ACTUALITES_SLUG = '/actualites';

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { newsId } = await params;
  const [page, newsPublication] = await Promise.all([
    getPageBySlug(ACTUALITES_SLUG),
    getNewsPublicationByNewsId(newsId),
  ]);

  if (!newsPublication) {
    return buildMetadataFromPage(page);
  }

  const canonicalPath = `/actualites/${newsId}`;
  const pageForSeo = {
    title: newsPublication.title || newsPublication.name || page?.title || page?.name || 'Actualites',
    description: newsPublication.description || page?.description,
    heroMedia: newsPublication.media?.fileUrl ? { fileUrl: newsPublication.media.fileUrl } : page?.heroMedia,
    slug: canonicalPath,
    keywords: page?.keywords || null,
  };

  return buildMetadataFromPage(pageForSeo);
}

export default async function ActualitePage({ params }: Params) {
  const { newsId } = await params;
  const [newsPublication, page] = await Promise.all([
    getNewsPublicationByNewsId(newsId),
    getPageBySlug(ACTUALITES_SLUG),
  ]);

  if (!newsPublication) {
    notFound();
  }

  return (
    <NewsDetailClient
      newsPublication={newsPublication}
      page={page}
      organizationLogo="/logo.png"
    />
  );
}
