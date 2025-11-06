import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import useGetPages from "../hooks/useGetPages";
import useGetSections from "../hooks/useGetSections";
import Meta from "../components/Meta";
import Hero from "../components/Hero";
import Section from "../components/Section";
import StaticPageContent from "../components/StaticPageContent";

const DynamicPage = () => {
  const location = useLocation();
  const [page, setPage] = useState(null);
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

  useEffect(() => {
    const loadPage = async () => {
      const fullSlug = location.pathname;

      if (fullSlug) {
        const pageData = await fetchPageBySlug(fullSlug);
        if (pageData) {
          setPage(pageData);
          setNotFound(false);

          // Load sections for this page using the business pageId
          if (pageData.pageId) {
            await fetchSectionsByPageId(pageData.pageId);
          } else {
            console.warn("Page loaded but no pageId found:", pageData);
          }
        } else {
          console.warn("No page found for slug:", fullSlug);
          setNotFound(true);
        }
      }
    };

    loadPage();
  }, [location.pathname, fetchPageBySlug, fetchSectionsByPageId]);

  const isLoading = pageLoading || sectionsLoading;
  const hasError = pageError || sectionsError;

  if (isLoading) {
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
    return <Navigate to="/404" replace />;
  }

  if (!page) {
    return null;
  }

  return (
    <>
      {/* Dynamic metadata for the page */}
      <Meta
        title={page.name}
        description={
          page.description ||
          `Discover the ${page.name} page on the Sainte-Madeleine Parish website.`
        }
        keywords={page.keywords ? page.keywords.split(",") : []}
        url={window.location.href}
        type="article"
        canonicalUrl={window.location.href}
      />

      <div className="pt-16 md:pt-20 lg:pt-24 min-h-screen">
        {/* Hero Banner */}
        <Hero mediaId={page.heroMedia?.id} title={page.name} />

        <main className="container mx-auto px-4 py-8">
          {/* Contenu fixe spécifique à certaines pages */}
          <StaticPageContent pageSlug={page.slug} />

          {/* Page sections - now loaded separately */}
          {sections && sections.length > 0 && (
            <div className="mt-12">
              {sections.map((section) => (
                <Section
                  key={section.id}
                  sectionId={section.sectionId} // Ajout du sectionId pour charger les contenus depuis l'API
                  title={section.title || section.name}
                  mediaId={section.media?.id}
                  contents={section.contents || []} // Garde les contenus statiques en fallback
                  variant={section.variant || "default"}
                  className="mb-8"
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default DynamicPage;
