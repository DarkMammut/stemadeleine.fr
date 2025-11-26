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
  // Configuration du contenu fixe par page
  const staticContentConfig: Record<string, React.ReactNode> = {
    '/contact': <ContactPageContent />,
    '/about': <AboutPageContent />,
    // Vous pouvez ajouter d'autres pages ici
    // '/services': <ServicesPageContent />,
  };

  // Retourne le contenu fixe correspondant au slug, ou null
  return (pageSlug && staticContentConfig[pageSlug]) || null;
};

export default StaticPageContent;

