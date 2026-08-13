import React from 'react';
import DynamicPage from '@/pages/DynamicPage';
import {Metadata} from 'next';
import {getMetadataForSlug} from '@/lib/metadata';
import {getPageBySlug, getSectionsByPageId} from '@/lib/serverApi';

const NEWSLETTERS_SLUG = '/newsletters';

export async function generateMetadata(): Promise<Metadata> {
    const slug = NEWSLETTERS_SLUG;
    return getMetadataForSlug(slug);
}

export default async function NewslettersPage() {
    const slug = NEWSLETTERS_SLUG;
    const page = await getPageBySlug(slug);
    const sections = page?.pageId ? await getSectionsByPageId(page.pageId) : [];

    return <DynamicPage initialPage={page} initialSections={sections}/>;
}