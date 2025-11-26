'use client';
import React from 'react';
import Head from 'next/head';

type MetaProps = {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
  locale?: string;
  author?: string;
  canonicalUrl?: string;
};

export default function Meta({
                               title,
                               description,
                               keywords,
                               image,
                               url,
                               type = 'website',
                               siteName = 'Les Amis de Sainte-Madeleine de la Jarrie',
                               locale = 'fr_FR',
                               author = 'Les Amis de Sainte-Madeleine de la Jarrie',
                               canonicalUrl,
                             }: MetaProps) {
  const defaultTitle = 'Les Amis de Sainte-Madeleine de la Jarrie';
  const pageTitle = title ? `${title} - ${defaultTitle}` : defaultTitle;

  const defaultDescription =
    'Bienvenue sur le site de la Paroisse Sainte-Madeleine. Découvrez nos actualités et nos activités.';
  const pageDescription = description || defaultDescription;

  // safe access to window (Next.js SSR)
  const hasWindow = typeof window !== 'undefined';
  const baseUrl = hasWindow ? window.location.origin : undefined;
  const pageUrl = url || (hasWindow ? window.location.href : undefined);
  const canonical = canonicalUrl || pageUrl;

  const defaultImage = baseUrl ? `${baseUrl}/favicon.png` : '/favicon.png';
  const pageImage = image || defaultImage;

  const defaultKeywords = [
    'paroisse',
    'sainte-madeleine',
    'église',
    'catholique',
    'communauté',
    'spiritualité',
    'foi',
    'La Jarrie',
  ];

  const mergedKeywords = keywords && keywords.length > 0 ? [...new Set([...defaultKeywords, ...keywords])] : defaultKeywords;
  const keywordsContent = mergedKeywords.join(', ');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Church',
    name: siteName,
    description: pageDescription,
    url: baseUrl || pageUrl || undefined,
    image: pageImage,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'FR',
      addressLocality: 'Ville',
    },
    telephone: '',
    email: '',
    openingHours: [],
    sameAs: [],
  };

  return (
    <Head>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="fr" />
      <meta name="theme-color" content="#8B4513" />
      <meta name="msapplication-navbutton-color" content="#8B4513" />
      <meta name="apple-mobile-web-app-status-bar-style" content="#8B4513" />
      <meta name="keywords" content={keywordsContent} />

      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      {pageImage && <meta property="og:image" content={pageImage} />}
      {pageUrl && <meta property="og:url" content={pageUrl} />}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      {pageImage && <meta name="twitter:image" content={pageImage} />}
      {pageUrl && <meta name="twitter:url" content={pageUrl} />}

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </Head>
  );
}
