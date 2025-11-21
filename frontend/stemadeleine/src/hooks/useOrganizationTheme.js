import { useCallback, useEffect, useState } from 'react';
import useGetOrganization from './useGetOrganization';

const DEFAULT_PRIMARY = '#3b82f6';
const DEFAULT_SECONDARY = '#64748b';
const DEFAULT_BACKGROUND = '#ffffff';
const DEFAULT_TEXT = '#171717';

const useOrganizationTheme = () => {
  const [themeLoaded, setThemeLoaded] = useState(true); // true car on applique des valeurs par défaut immédiatement
  const [colors, setColors] = useState({ primary: DEFAULT_PRIMARY, secondary: DEFAULT_SECONDARY });

  // Utiliser le hook existant pour récupérer les données de l'organisation
  const { settings, loading, error } = useGetOrganization();

  // Fonction pour convertir hex en RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
      : null;
  };

  // Fonction pour créer des nuances plus claires ou plus foncées
  const createShade = (rgb, factor, darken = false) => {
    if (!rgb) return null;
    if (darken) {
      return `${Math.round(rgb.r * factor)}, ${Math.round(rgb.g * factor)}, ${Math.round(rgb.b * factor)}`;
    }
    return `${Math.round(rgb.r + (255 - rgb.r) * (1 - factor))}, ${Math.round(
      rgb.g + (255 - rgb.g) * (1 - factor),
    )}, ${Math.round(rgb.b + (255 - rgb.b) * (1 - factor))}`;
  };

  // Fonction pour générer toutes les nuances d'une couleur
  const generateColorShades = useCallback((baseColor, colorPrefix) => {
    if (typeof document === 'undefined') return; // safety for SSR
    const root = document.documentElement;
    const rgb = hexToRgb(baseColor);

    if (rgb) {
      // Variable principale avec la couleur hex (pour les classes CSS personnalisées)
      root.style.setProperty(`--color-${colorPrefix}`, baseColor);

      // Variables RGB pour Tailwind (format: "r, g, b" sans rgb())
      root.style.setProperty(`--color-${colorPrefix}-50`, createShade(rgb, 0.95));
      root.style.setProperty(`--color-${colorPrefix}-100`, createShade(rgb, 0.9));
      root.style.setProperty(`--color-${colorPrefix}-200`, createShade(rgb, 0.8));
      root.style.setProperty(`--color-${colorPrefix}-300`, createShade(rgb, 0.7));
      root.style.setProperty(`--color-${colorPrefix}-400`, createShade(rgb, 0.6));
      root.style.setProperty(`--color-${colorPrefix}-500`, `${rgb.r}, ${rgb.g}, ${rgb.b}`);
      root.style.setProperty(`--color-${colorPrefix}-600`, createShade(rgb, 0.8, true));
      root.style.setProperty(`--color-${colorPrefix}-700`, createShade(rgb, 0.7, true));
      root.style.setProperty(`--color-${colorPrefix}-800`, createShade(rgb, 0.6, true));
      root.style.setProperty(`--color-${colorPrefix}-900`, createShade(rgb, 0.5, true));

      // Variables pour color-mix (compatibilité avec le CSS existant)
      root.style.setProperty(`--color-${colorPrefix}-light`, `color-mix(in srgb, ${baseColor}, white 60%)`);
      root.style.setProperty(`--color-${colorPrefix}-dark`, `color-mix(in srgb, ${baseColor}, black 40%)`);

      // console debug
      // console.log(`🎨 Couleurs ${colorPrefix} appliquées:`, {
      //   base: baseColor,
      //   rgb500: `${rgb.r}, ${rgb.g}, ${rgb.b}`,
      //   rgb700: createShade(rgb, 0.7, true),
      // });
    }
  }, []);

  // Fonction pour appliquer les couleurs au DOM et mettre à jour l'état (décalé pour éviter les warnings ESLint)
  const applyThemeColors = useCallback((organizationData) => {
    if (!organizationData) return;

    const primaryColor =
      organizationData.primaryColor || organizationData.primary_color || organizationData.accentColor || organizationData.accent_color;
    const secondaryColor = organizationData.secondaryColor || organizationData.secondary_color;

    if (primaryColor) {
      generateColorShades(primaryColor, 'primary');
    }

    if (secondaryColor) {
      generateColorShades(secondaryColor, 'secondary');
    }

    // Appliquer aussi des couleurs de fond et de texte pour éviter que la préférence système sombre ne rende toute la page noire.
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      const bg = organizationData.background || organizationData.background_color || organizationData.color_background || DEFAULT_BACKGROUND;
      const txt = organizationData.textColor || organizationData.text_color || organizationData.color_text || DEFAULT_TEXT;
      root.style.setProperty('--color-background', bg);
      root.style.setProperty('--color-text', txt);
    }

    // Décaler le setState pour éviter les erreurs ESLint liées aux setState synchrones dans useEffect
    setTimeout(() => {
      setColors({
        primary: primaryColor || DEFAULT_PRIMARY,
        secondary: secondaryColor || primaryColor || DEFAULT_SECONDARY,
      });
      setThemeLoaded(true);
    }, 0);
  }, [generateColorShades]);

  // Initialiser les couleurs par défaut au montage du composant (pas de setState ici)
  useEffect(() => {
    // Appliquer visuellement les couleurs par défaut dans le DOM
    generateColorShades(DEFAULT_PRIMARY, 'primary');
    generateColorShades(DEFAULT_SECONDARY, 'secondary');
    // Appliquer les couleurs de fond/texte par défaut
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.style.setProperty('--color-background', DEFAULT_BACKGROUND);
      root.style.setProperty('--color-text', DEFAULT_TEXT);
    }
    // L'état `colors` et `themeLoaded` contient déjà les valeurs par défaut
  }, [generateColorShades]);

  useEffect(() => {
    // Appliquer les couleurs quand les settings sont chargés
    if (settings && !loading && !error) {
      applyThemeColors(settings);
    }
  }, [settings, loading, error, applyThemeColors]);

  return {
    themeLoaded,
    colors,
    loading,
    error,
    applyThemeColors, // Pour permettre la mise à jour manuelle
  };
};

export default useOrganizationTheme;
