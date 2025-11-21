import React from "react";
import { Helmet } from "react-helmet-async";

const Meta = ({
  title,
  description,
  keywords,
  image,
  url,
  type = "website",
  siteName = "Les Amis de Sainte-Madeleine de la Jarrie",
  locale = "fr_FR",
  author = "Les Amis de Sainte-Madeleine de la Jarrie",
  canonicalUrl,
}) => {
  // Titre par défaut si aucun titre n'est fourni
  const defaultTitle = "Les Amis de Sainte-Madeleinede La Jarrie";
  const pageTitle = title ? `${title} - ${defaultTitle}` : defaultTitle;

  // Description par défaut
  const defaultDescription =
    "Bienvenue sur le site de la Paroisse Sainte-Madeleine. Découvrez nos actualités et nos activités.";
  const pageDescription = description || defaultDescription;

  // URL de base du site
  const baseUrl = window.location.origin;
  const pageUrl = url || window.location.href;
  const canonical = canonicalUrl || pageUrl;

  // Image par défaut
  const defaultImage = `${baseUrl}/favicon.png`;
  const pageImage = image || defaultImage;

  // Mots-clés par défaut
  const defaultKeywords = [
    "paroisse",
    "sainte-madeleine",
    "église",
    "catholique",
    "communauté",
    "spiritualité",
    "foi",
    "La Jarrie",
  ];
  const pageKeywords = keywords
    ? [...defaultKeywords, ...keywords]
    : defaultKeywords;

  return (
    <Helmet>
      {/* Métadonnées de base */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={pageKeywords.join(", ")} />
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="fr" />

      {/* URL canonique */}
      <link rel="canonical" href={canonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={pageImage} />
      <meta name="twitter:url" content={pageUrl} />

      {/* Métadonnées additionnelles pour les sites religieux */}
      <meta name="theme-color" content="#8B4513" />
      <meta name="msapplication-navbutton-color" content="#8B4513" />
      <meta name="apple-mobile-web-app-status-bar-style" content="#8B4513" />

      {/* Structured Data - Schema.org pour une paroisse */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Church",
          name: siteName,
          description: pageDescription,
          url: baseUrl,
          image: pageImage,
          address: {
            "@type": "PostalAddress",
            addressCountry: "FR",
            addressLocality: "Ville",
          },
          telephone: "",
          email: "",
          openingHours: [],
          sameAs: [],
        })}
      </script>
    </Helmet>
  );
};

export default Meta;
