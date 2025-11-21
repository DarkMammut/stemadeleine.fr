'use client';

import React, { useEffect } from 'react';
import useOrganizationTheme from '@/hooks/useOrganizationTheme';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Le hook initialise les couleurs par défaut et applique celles du backend quand disponibles
  const { themeLoaded, colors } = useOrganizationTheme();

  useEffect(() => {
    // marquer le document pour debug et faciliter le test manuel
    try {
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme-loaded', themeLoaded ? 'true' : 'false');
        if (colors) {
          document.documentElement.setAttribute('data-theme-primary', colors.primary || '');
          document.documentElement.setAttribute('data-theme-secondary', colors.secondary || '');
        }
      }
    } catch (e) {
      // ignore
    }

    // logs utiles pour debug en dev
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.debug('[ThemeProvider] themeLoaded=', themeLoaded, 'colors=', colors);
    }
  }, [themeLoaded, colors]);

  // Nous retournons simplement les enfants: le but est d'exécuter le hook tôt.
  return <>{children}</>;
}
