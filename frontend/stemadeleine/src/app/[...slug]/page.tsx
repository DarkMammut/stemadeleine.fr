import React from 'react';
import DynamicPage from '@/pages/DynamicPage';
import { Metadata } from 'next';
import { getMetadataForSlug } from '@/lib/metadata';
import { getPageBySlug, getSectionsByPageId } from '@/lib/serverApi';

type Params = { params: { slug?: string[] } };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  // params peut être une Promise dans certains contextes : await avant d'accéder aux propriétés
  const resolvedParams = (await params) as { slug?: string[] };
  const slugParts = resolvedParams.slug ?? [];
  const slug = '/' + (slugParts.length ? slugParts.join('/') : '');
  return getMetadataForSlug(slug);
}

export default async function Slug({ params }: Params) {
  const resolvedParams = (await params) as { slug?: string[] };
  const slugParts = resolvedParams.slug ?? [];
  const slug = '/' + (slugParts.length ? slugParts.join('/') : '');
  const page = await getPageBySlug(slug);
  const sections = page?.pageId ? await getSectionsByPageId(page.pageId) : [];

  return <DynamicPage initialPage={page} initialSections={sections} />;
}