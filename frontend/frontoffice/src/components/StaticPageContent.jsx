import React from 'react';
import ContactPageContent from './ContactPageContent';
import AboutPageContent from './AboutPageContent';

/**
 * Composant qui gère le contenu fixe spécifique à certaines pages
 * @param {string} pageSlug - Le slug de la page courante
 * @returns {JSX.Element|null} - Le contenu fixe ou null si aucun contenu spécifique
 */
const StaticPageContent = ({ pageSlug }) => {
  // Configuration du contenu fixe par page
  const staticContentConfig = {
    "/contact": <ContactPageContent />,
    "/about": <AboutPageContent />,
    // Vous pouvez ajouter d'autres pages ici
    // '/services': <ServicesPageContent />,
  };

  // Retourne le contenu fixe correspondant au slug, ou null
  return staticContentConfig[pageSlug] || null;
};

export default StaticPageContent;
