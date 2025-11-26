'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import useGetPages from '@/hooks/useGetPages';
import useGetSections from '@/hooks/useGetSections';
import Meta from '@/components/Meta';
import Hero from '@/components/Hero';
import Section, { ContentItem } from '@/components/Section';
import StaticPageContent from '@/pages/StaticPageContent';
import Header from '@/components/Header';

type PageShape = {
  name?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  keywords?: string;
  heroMedia?: { id?: string | number; fileUrl?: string } | null;
  pageId?: string | number;
  slug?: string;
};

type SectionShape = {
  id?: string | number;
  sectionId?: string;
  title?: string;
  name?: string;
  media?: { id?: string | number } | null;
  contents?: unknown[];
  variant?: string;
};

type DynamicPageProps = {
  initialPage?: PageShape | null;
  initialSections?: SectionShape[];
};

export default function DynamicPage({ initialPage = null, initialSections = [] }: DynamicPageProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [page, setPage] = useState<PageShape | null>(initialPage);
  const [notFound, setNotFound] = useState(false);
  const {
    fetchPageBySlug,
    loading: pageLoading,
    error: pageError,
  } = useGetPages();
  const {
    sections,
    loading: sectionsLoading,
    error: sectionsError,
    fetchSectionsByPageId,
  } = useGetSections();

  // Track which pageIds we've already attempted to fetch sections for
  const fetchedSectionsFor = useRef(new Set());

  // Normalise un slug pour faciliter la comparaison
  const normalizeSlug = (s?: string | null) => {
    if (!s) return '/';
    try {
      // Décoder et s'assurer qu'il commence par un slash et sans slash final
      const decoded = decodeURIComponent(s);
      return '/' + decoded.replace(/^\/+/, '').replace(/\/+$/, '');
    } catch {
      return '/' + String(s).replace(/^\/+/, '').replace(/\/+$/, '');
    }
  };

  // Charger la page quand le pathname change (dépend uniquement de pathname)
  useEffect(() => {
    let mounted = true;

    const loadPage = async () => {
      const fullSlug = pathname || '/';
      const normalizedFullSlug = normalizeSlug(fullSlug);

      // Si on a déjà une page et que son slug normalisé correspond, on ne refetch pas
      if (page && normalizeSlug(page.slug) === normalizedFullSlug) {
        return;
      }

      const pageData = await fetchPageBySlug(fullSlug);

      if (!mounted) return;

      if (pageData) {
        setPage(pageData);
        setNotFound(false);
      } else {
        console.warn('No page found for slug:', fullSlug);
        setNotFound(true);
      }
    };

    loadPage();

    return () => {
      mounted = false;
    };
    // On veut rerun uniquement quand le pathname change, que la fonction de fetch change, ou que la page change
  }, [pathname, fetchPageBySlug, page]);

  // Charger les sections quand la page change (dépend uniquement de page.pageId)
  useEffect(() => {
    if (!page?.pageId) return;

    const pageIdStr = String(page.pageId);

    // Si on a déjà tenté de charger les sections pour cette page, ne pas recharger
    if (fetchedSectionsFor.current.has(pageIdStr)) return;

    let mounted = true;
    const loadSections = async () => {
      try {
        await fetchSectionsByPageId(page.pageId as string | number);
      } finally {
        // Marquer comme tenté pour éviter une nouvelle tentative (même si la réponse est vide)
        fetchedSectionsFor.current.add(pageIdStr);
      }
    };

    if (mounted) {
      loadSections();
    }

    return () => {
      mounted = false;
    };
  }, [page?.pageId, fetchSectionsByPageId]);

  // Handle client-side redirect to 404 when page is not found
  useEffect(() => {
    if (notFound) {
      // use replace to avoid adding an extra entry in the history stack
      router.replace('/404');
    }
  }, [notFound, router]);

  const isLoading = pageLoading || sectionsLoading;
  const hasError = pageError || sectionsError;

  if (isLoading && !page) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-center">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p>{pageError || sectionsError}</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    // The router.replace in useEffect will redirect; render nothing while that happens
    return null;
  }

  if (!page) {
    return null;
  }

  // Use server-provided sections when available
  const effectiveSections = initialSections && initialSections.length > 0 ? initialSections : sections;

  const StaticPageContentComponent = StaticPageContent as unknown as React.ComponentType<{ pageSlug?: string }>;

  return (
    <>
      {/* Dynamic metadata for the page */}
      <Meta
        title={page.name}
        description={
          page.description ||
          `Discover the ${page.name} page on the Sainte-Madeleine Parish website.`
        }
        keywords={page.keywords ? page.keywords.split(',') : []}
        url={typeof window !== 'undefined' ? window.location.href : undefined}
        type="article"
        canonicalUrl={typeof window !== 'undefined' ? window.location.href : undefined}
      />

      <Header />

      <div className="pt-16 md:pt-20 min-h-screen">
        {/* Hero Banner */}
        <Hero mediaId={page.heroMedia?.id} title={page.name} />

        <main className="container mx-auto px-4 py-8">
          {/* Contenu fixe spécifique à certaines pages */}
          <StaticPageContentComponent pageSlug={String(page.slug || '')} />

          {/* Page sections - now loaded separately */}
          {effectiveSections && effectiveSections.length > 0 && (
            <div className="mt-12">
              {effectiveSections.map((section: SectionShape) => (
                <Section
                  key={section.id}
                  sectionId={section.sectionId} // Ajout du sectionId pour charger les contenus depuis l'API
                  title={section.title || section.name}
                  mediaId={section.media?.id}
                  contents={((section.contents as unknown) as ContentItem[]) || []} // Garde les contenus statiques en fallback
                  variant={section.variant || 'default'}
                  className="mb-8"
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
