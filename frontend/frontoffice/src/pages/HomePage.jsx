import React, { useEffect, useState } from "react";
import useGetPages from "../hooks/useGetPages";
import HeroHome from "../components/HeroHome";
import Meta from "../components/Meta";

const HomePage = () => {
  const [page, setPage] = useState(null);
  const { fetchPageBySlug, loading, error } = useGetPages();

  useEffect(() => {
    const loadPage = async () => {
      const slug = "/";
      const pageData = await fetchPageBySlug(slug);
      setPage(pageData);
    };

    loadPage();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
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
    </>
  );
};

export default HomePage;
