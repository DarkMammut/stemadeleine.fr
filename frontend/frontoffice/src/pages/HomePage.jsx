import React, { useEffect, useState } from "react";
import useGetPages from "../hooks/useGetPages";
import HeroHome from "../components/HeroHome";
import Meta from "../components/Meta";
import Section from "../components/Section";
import useGetSections from "../hooks/useGetSections";

const HomePage = () => {
  const [page, setPage] = useState(null);
  const { fetchPageBySlug, loading, error } = useGetPages();

  const {
    sections,
    loading: sectionsLoading,
    error: sectionsError,
    fetchSectionsByPageId,
  } = useGetSections();

  useEffect(() => {
    const loadPage = async () => {
      const slug = "/";
      const pageData = await fetchPageBySlug(slug);
      setPage(pageData);
      if (pageData.pageId) {
        await fetchSectionsByPageId(pageData.pageId);
      } else {
        console.warn("Page loaded but no pageId found:", pageData);
      }
    };

    loadPage();
  }, []);

  const isLoading = loading || sectionsLoading;
  const hasError = error || sectionsError;

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
          <h2 className="text-2xl font-bold mb-4">Erreur</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Métadonnées pour la page d'accueil */}
      <Meta
        title={page?.name || "Accueil"}
        description={
          page?.description ||
          "Bienvenue sur le site des amis de Sainte-Madeleine de la Jarrie. Découvrez nos actualités et nos activités."
        }
        keywords={
          page?.keywords
            ? page.keywords.split(",")
            : ["accueil", "paroisse", "actualités", "newsletters"]
        }
        type="website"
        url={window.location.href}
      />

      <div className="pt-16 md:pt-20 lg:pt-24 min-h-screen">
        <HeroHome
          title={page?.title}
          mediaId={page?.heroMedia?.id}
          subtitle={page?.subtitle}
        />
      </div>

      {/* Page sections - now loaded separately */}
      {sections && sections.length > 0 && (
        <main className="mt-12">
          {sections.map((section) => (
            <Section
              key={section.id}
              sectionId={section.sectionId}
              title={section.title || section.name}
              mediaId={section.media?.id}
              contents={section.contents || []}
              variant={section.variant || "default"}
              className="mb-8"
            />
          ))}
        </main>
      )}
    </>
  );
};

export default HomePage;
