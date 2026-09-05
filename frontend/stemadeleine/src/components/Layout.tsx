import React, {ReactNode} from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import useGetPages from '@/hooks/useGetPages';
import type {PageItem} from './Navigation';

// Types for the page shape used by Meta/Hero
type PageShape = {
    name?: string;
    title?: string;
    subTitle?: string;
    description?: string;
    keywords?: string;
    heroMedia?: { id?: string | number } | null;
    pageId?: string | number;
    slug?: string;
};

export type FooterParent = { name: string; href: string; children: { name: string; href: string }[] };

type LayoutProps = {
    children: ReactNode;
    page?: PageShape | null;
};

export default function Layout({children, page}: LayoutProps) {
    const {tree} = useGetPages();

    // Use static Tailwind classes for padding to avoid SSR/CSR mismatch
    // pt-16 (4rem) on mobile, md:pt-20 (5rem) on >=md

    // Derive footer navigation from pages tree: parents with their visible children
    const pagesTree: PageItem[] = Array.isArray(tree) ? tree : [];
    const pagesNav: FooterParent[] = pagesTree
        .filter((p) => p && p.isVisible)
        .map((p) => ({
            name: p.name,
            href: p.slug || '#',
            children: Array.isArray(p.children)
                ? p.children.filter((c) => c && c.isVisible).map((c) => ({name: c.name, href: c.slug || '#'}))
                : [],
        }));

    return (
        <>
            <Header
                pagesTree={tree}
            />

            <div className={page?.slug === '/' ? '' : 'pt-15'}>
                <Hero
                    title={page?.title}
                    mediaId={page?.heroMedia?.id}
                    subtitle={page?.subTitle}
                    description={page?.description}
                    variant={page?.slug === '/' ? 'home' : 'default'}
                    className={page?.slug === '/' ? 'mt-15 mb-0' : ''}
                />
            </div>

            <div
                aria-hidden="true"
                className="bg-cream py-6 text-center text-base tracking-[0.6em] text-secondary"
            >
                ✦&nbsp;✦&nbsp;✦
            </div>

            {children}

            <Footer pagesNav={pagesNav}/>
        </>
    );
}