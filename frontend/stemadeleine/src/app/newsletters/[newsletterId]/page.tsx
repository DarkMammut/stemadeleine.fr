import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import NewsletterDetailClient from '@/components/newsletters/NewsletterDetailClient';
import { buildMetadataFromPage } from '@/lib/metadata';
import { getPageBySlug } from '@/lib/serverApi';
import { getNewsletterPublicationByNewsletterId } from '@/lib/publicApi';

type Params = { params: Promise<{ newsletterId: string }> };

const NEWSLETTERS_SLUG = '/newsletters';

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { newsletterId } = await params;
  const [page, newsletter] = await Promise.all([
    getPageBySlug(NEWSLETTERS_SLUG),
    getNewsletterPublicationByNewsletterId(newsletterId),
  ]);

  if (!newsletter) {
    return buildMetadataFromPage(page);
  }

  const canonicalPath = `/newsletters/${newsletterId}`;
  const pageForSeo = {
    name: newsletter.title || newsletter.name || page?.name || 'Newsletters',
    description: newsletter.description || page?.description,
    heroMedia: newsletter.media?.fileUrl ? { fileUrl: newsletter.media.fileUrl } : page?.heroMedia,
    slug: canonicalPath,
    keywords: page?.keywords || null,
  };

  return buildMetadataFromPage(pageForSeo);
}

export default async function NewsletterPage({ params }: Params) {
  const { newsletterId } = await params;
  const [newsletter, page] = await Promise.all([
    getNewsletterPublicationByNewsletterId(newsletterId),
    getPageBySlug(NEWSLETTERS_SLUG),
  ]);

  if (!newsletter) {
    notFound();
  }

  return <NewsletterDetailClient newsletter={newsletter} page={page} />;
}
