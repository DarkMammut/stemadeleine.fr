import React from 'react';
import DynamicPage from '@/pages/DynamicPage';
import {Metadata} from 'next';
import {getMetadataForSlug} from '@/lib/metadata';
import {getPageBySlug, getSectionsByPageId} from '@/lib/serverApi';

const SLUG = '/mentions-legales';

export async function generateMetadata(): Promise<Metadata> {
    const slug = SLUG;
    return getMetadataForSlug(slug);
}

export default async function MentionsLegalesPage() {
    const slug = SLUG;
    const page = await getPageBySlug(slug);
    const sections = page?.pageId ? await getSectionsByPageId(page.pageId) : [];

    return <DynamicPage initialPage={page} initialSections={sections}/>;
}