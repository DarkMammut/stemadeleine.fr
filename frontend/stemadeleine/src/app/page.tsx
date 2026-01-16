import React from 'react';
import HomePage from '@/pages/HomePage';
import {Metadata} from 'next';
import {getMetadataForSlug} from '@/lib/metadata';
import {getPageBySlug, getSectionsByPageId} from '@/lib/serverApi';

export async function generateMetadata(): Promise<Metadata> {
    return getMetadataForSlug('/');
}

export default async function Home() {
    const page = await getPageBySlug('/');
    const sections = page?.pageId ? await getSectionsByPageId(page.pageId) : [];

    return (
        <HomePage initialPage={page} initialSections={sections}/>
    );
}
