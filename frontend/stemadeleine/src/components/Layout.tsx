import React, { ReactNode } from 'react';
import Meta from '@/components/Meta';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import useGetPages from '@/hooks/useGetPages';
import type { PageItem } from './Navigation';

// Types for the page shape used by Meta/Hero
type PageShape = {
  name?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  keywords?: string;
  heroMedia?: { id?: string | number } | null;
  pageId?: string | number;
  slug?: string;
};

// Minimal navigation types passed to Footer (optional)
export type NavLink = { name: string; href: string };
export type SocialItem = { name: string; href: string; icon?: React.ComponentType<React.SVGProps<SVGSVGElement>> };
export type NavigationShape = {
  solutions?: NavLink[];
  support?: NavLink[];
  company?: NavLink[];
  legal?: NavLink[];
  social?: SocialItem[];
};

export type FooterParent = { name: string; href: string; children: { name: string; href: string }[] };

type LayoutProps = {
  children: ReactNode;
  page?: PageShape | null;
};

export default function Layout({ children, page }: LayoutProps) {
  const { tree } = useGetPages();

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
        ? p.children.filter((c) => c && c.isVisible).map((c) => ({ name: c.name, href: c.slug || '#' }))
        : [],
    }));

  return (
    <>
      <Meta
        title={page?.name || 'Accueil'}
        description={
          page?.description ||
          'Bienvenue sur le site des amis de Sainte-Madeleine de la Jarrie. Découvrez nos actualités et nos activités.'
        }
        keywords={
          page?.keywords ? page.keywords.split(',') : ['accueil', 'paroisse', 'actualités', 'newsletters']
        }
        type="website"
        url={typeof window !== 'undefined' ? window.location.href : undefined}
      />

      <Header pagesTree={tree} />

      <div className={`pt-16 md:pt-20 ${page?.slug === '/' ? 'min-h-screen' : ''}`}>
        <Hero
          title={page?.title}
          mediaId={page?.heroMedia?.id}
          subtitle={page?.subtitle}
          variant={page?.slug === '/' ? 'home' : 'default'}
        />
      </div>

      {children}

      <Footer pagesNav={pagesNav} />
    </>
  );
}