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
  canonicalUrl?: string | undefined;
};

export default function Meta({
                               title,
                               description,
                               keywords,
                               image,
                               url,
                               type = 'website',
                               canonicalUrl,
                             }: MetaProps) {
  const defaultTitle = 'Les Amis de Sainte-Madeleine de la Jarrie';
  const pageTitle = title ? `${title} - ${defaultTitle}` : defaultTitle;
  const pageDescription = description || defaultTitle;

  const pageKeywords = keywords ? keywords.join(', ') : undefined;

  const pageUrl = url;
  const pageImage = image;

  return (
    <Head>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      {pageKeywords && <meta name="keywords" content={pageKeywords} />}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      {pageImage && <meta property="og:image" content={pageImage} />}
      {pageUrl && <meta property="og:url" content={pageUrl} />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
    </Head>
  );
}

