import React from 'react';
import ContactPageContent from '@/pages/ContactPageContent';
import AboutPageContent from '@/pages/AboutPageContent';

interface Props {
  pageSlug?: string;
}

/**
 * Composant qui gère le contenu fixe spécifique à certaines pages
 */
const StaticPageContent: React.FC<Props> = ({ pageSlug }) => {

  // Retourner le composant correspondant au slug
  if (pageSlug === '/contact') {
    return <ContactPageContent />;
  }

  if (pageSlug === '/about') {
    return <AboutPageContent />;
  }

  return null;
};

export default StaticPageContent;

