import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import useGetPages from "../hooks/useGetPages";
import Meta from "../components/Meta";

const DynamicPage = () => {
  const location = useLocation();
  const [page, setPage] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const { fetchPageBySlug, loading, error } = useGetPages();

  useEffect(() => {
    const loadPage = async () => {
      const fullSlug = location.pathname.startsWith("/")
        ? location.pathname.substring(1)
        : location.pathname;

      if (fullSlug) {
        const pageData = await fetchPageBySlug(fullSlug);
        if (pageData) {
          setPage(pageData);
          setNotFound(false);
        } else {
          setNotFound(true);
        }
      }
    };

    loadPage();
  }, [location.pathname, fetchPageBySlug]);

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

  if (notFound) {
    return <Navigate to="/404" replace />;
  }

  if (!page) {
    return null;
  }

  return (
    <>
      {/* Métadonnées dynamiques pour la page */}
      <Meta
        title={page.name}
        description={
          page.description ||
          `Découvrez la page ${page.name} sur le site des amis de Sainte-Madeleine de la Jarrie.`
        }
        keywords={page.keywords ? page.keywords.split(",") : []}
        url={window.location.href}
        type="article"
        canonicalUrl={window.location.href}
      />

      <div className="pt-16 md:pt-20 lg:pt-24 min-h-screen">
        <main className="container mx-auto px-4 py-8">
          {/* Fil d'Ariane (Breadcrumb) */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm text-gray-500">
              <li>
                <a
                  href="/frontend/frontoffice/public"
                  className="hover:text-primary"
                >
                  Accueil
                </a>
              </li>
              {location.pathname
                .split("/")
                .filter(Boolean)
                .map((segment, index, array) => {
                  const href = "/" + array.slice(0, index + 1).join("/");
                  const isLast = index === array.length - 1;

                  return (
                    <li key={index} className="flex items-center">
                      <span className="mx-2">/</span>
                      {isLast ? (
                        <span className="text-gray-900 font-medium">
                          {page.name}
                        </span>
                      ) : (
                        <a
                          href={href}
                          className="hover:text-primary capitalize"
                        >
                          {segment.replace("-", " ")}
                        </a>
                      )}
                    </li>
                  );
                })}
            </ol>
          </nav>

          {/* En-tête de la page */}
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {page.name}
            </h1>
            {page.description && (
              <p className="text-lg text-gray-600 leading-relaxed">
                {page.description}
              </p>
            )}
          </header>

          {/* Contenu principal */}
          <article className="prose prose-lg max-w-none">
            {page.content && (
              <div
                className="content-html"
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
            )}
          </article>

          {/* Métadonnées */}
          {(page.createdAt || page.updatedAt) && (
            <footer className="mt-12 pt-8 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                {page.createdAt && (
                  <p>
                    Créé le :{" "}
                    {new Date(page.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                )}
                {page.updatedAt && page.updatedAt !== page.createdAt && (
                  <p>
                    Dernière mise à jour :{" "}
                    {new Date(page.updatedAt).toLocaleDateString("fr-FR")}
                  </p>
                )}
              </div>
            </footer>
          )}
        </main>
      </div>
    </>
  );
};

export default DynamicPage;
