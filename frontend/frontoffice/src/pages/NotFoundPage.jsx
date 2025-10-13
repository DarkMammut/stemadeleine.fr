import React from "react";
import { Link } from "react-router-dom";
import Meta from "../components/Meta";

const NotFoundPage = () => {
  return (
    <>
      {/* Métadonnées pour la page 404 */}
      <Meta
        title="Page non trouvée"
        description="La page que vous recherchez n'existe pas sur le site des amis de Sainte-Madeleine de la Jarrie."
        keywords={["404", "page non trouvée", "erreur"]}
        type="website"
        url={window.location.href}
      />

      <div className="pt-16 md:pt-20 lg:pt-24 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-9xl font-bold text-gray-300 mb-4">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Page non trouvée
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            La page que vous recherchez n'existe pas ou a été déplacée.
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-primary hover:bg-primary-600 text-white rounded-lg font-semibold transition-colors"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;
