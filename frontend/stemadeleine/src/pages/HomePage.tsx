'use client';

import React, { useEffect, useRef, useState } from 'react';
import useGetPages from '@/hooks/useGetPages';
import Section, { ContentItem } from '@/components/Section';
import useGetSections from '@/hooks/useGetSections';
import Layout from '@/components/Layout';

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

type HomePageProps = {
  initialPage?: PageShape | null;
  initialSections?: SectionShape[];
};

export default function HomePage({ initialPage = null, initialSections = [] }: HomePageProps) {
  const [page, setPage] = useState<PageShape | null>(initialPage);
  const { fetchPageBySlug, loading, error } = useGetPages();

  const {
    sections,
    loading: sectionsLoading,
    error: sectionsError,
    fetchSectionsByPageId,
  } = useGetSections();

  // Track which pageIds we've already attempted to fetch sections for
  const fetchedSectionsFor = useRef(new Set());

  useEffect(() => {
    const loadPage = async () => {
      if (page) {
        if (page.pageId) {
          const pageIdStr = String(page.pageId);
          if ((!sections || sections.length === 0) && !fetchedSectionsFor.current.has(pageIdStr)) {
            await fetchSectionsByPageId(page.pageId);
            // Mark as attempted even if response is empty to avoid retry loops
            fetchedSectionsFor.current.add(pageIdStr);
          }
        }
        return;
      }

      const slug = '/';
      const pageData = await fetchPageBySlug(slug);
      setPage(pageData);
      if (pageData?.pageId) {
        const pageIdStr = String(pageData.pageId);
        if (!fetchedSectionsFor.current.has(pageIdStr)) {
          await fetchSectionsByPageId(pageData.pageId);
          fetchedSectionsFor.current.add(pageIdStr);
        }
      } else {
        console.warn('Page loaded but no pageId found:', pageData);
      }
    };

    loadPage();
  }, [page, sections, fetchPageBySlug, fetchSectionsByPageId]);

  const isLoading = loading || sectionsLoading;
  const hasError = error || sectionsError;

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
          <h2 className="text-2xl font-bold mb-4">Erreur</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const effectiveSections = initialSections && initialSections.length > 0 ? initialSections : sections;

  return (
    <Layout page={page}>
      {effectiveSections && effectiveSections.length > 0 && (
        <main className="mt-12">
          {effectiveSections.map((section: SectionShape) => (
            <Section
              key={section.id}
              sectionId={section.sectionId}
              title={section.title || section.name}
              mediaId={section.media?.id}
              contents={((section.contents as unknown) as ContentItem[]) || []}
              variant={section.variant || 'default'}
              className="mb-8"
            />
          ))}
        </main>
      )}
    </Layout>
  );
}
