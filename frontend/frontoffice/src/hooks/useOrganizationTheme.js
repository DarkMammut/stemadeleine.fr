import { useEffect, useState } from "react";
import useGetOrganization from "./useGetOrganization";

const useOrganizationTheme = () => {
  const [themeLoaded, setThemeLoaded] = useState(false);
  const [colors, setColors] = useState(null);

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
    if (darken) {
      return `${Math.round(rgb.r * factor)}, ${Math.round(rgb.g * factor)}, ${Math.round(rgb.b * factor)}`;
    } else {
      return `${Math.round(rgb.r + (255 - rgb.r) * (1 - factor))}, ${Math.round(
        rgb.g + (255 - rgb.g) * (1 - factor),
      )}, ${Math.round(rgb.b + (255 - rgb.b) * (1 - factor))}`;
    }
  };

  // Fonction pour générer toutes les nuances d'une couleur
  const generateColorShades = (baseColor, colorPrefix) => {
    const root = document.documentElement;
    const rgb = hexToRgb(baseColor);

    if (rgb) {
      // Variable principale avec la couleur hex
      root.style.setProperty(`--color-${colorPrefix}`, baseColor);

      // Variables RGB pour Tailwind (format: "r, g, b" sans rgb())
      root.style.setProperty(
        `--color-${colorPrefix}-50`,
        createShade(rgb, 0.95),
      );
      root.style.setProperty(
        `--color-${colorPrefix}-100`,
        createShade(rgb, 0.9),
      );
      root.style.setProperty(
        `--color-${colorPrefix}-200`,
        createShade(rgb, 0.8),
      );
      root.style.setProperty(
        `--color-${colorPrefix}-300`,
        createShade(rgb, 0.7),
      );
      root.style.setProperty(
        `--color-${colorPrefix}-400`,
        createShade(rgb, 0.6),
      );
      root.style.setProperty(
        `--color-${colorPrefix}-500`,
        `${rgb.r}, ${rgb.g}, ${rgb.b}`,
      );
      root.style.setProperty(
        `--color-${colorPrefix}-600`,
        createShade(rgb, 0.8, true),
      );
      root.style.setProperty(
        `--color-${colorPrefix}-700`,
        createShade(rgb, 0.7, true),
      );
      root.style.setProperty(
        `--color-${colorPrefix}-800`,
        createShade(rgb, 0.6, true),
      );
      root.style.setProperty(
        `--color-${colorPrefix}-900`,
        createShade(rgb, 0.5, true),
      );
    }
  };

  // Fonction pour initialiser les couleurs par défaut
  const initializeDefaultColors = () => {
    generateColorShades("#3b82f6", "primary");
    generateColorShades("#64748b", "secondary");
    setColors({
      primary: "#3b82f6",
      secondary: "#64748b",
    });
    setThemeLoaded(true);
  };

  // Fonction pour appliquer les couleurs au DOM
  const applyThemeColors = (organizationData) => {
    // Chercher les couleurs dans les différents champs possibles
    const primaryColor =
      organizationData.primaryColor ||
      organizationData.primary_color ||
      organizationData.accentColor ||
      organizationData.accent_color;
    const secondaryColor =
      organizationData.secondaryColor || organizationData.secondary_color;

    if (primaryColor) {
      generateColorShades(primaryColor, "primary");
    }

    if (secondaryColor) {
      generateColorShades(secondaryColor, "secondary");
    }

    setColors({
      primary: primaryColor || "#3b82f6",
      secondary: secondaryColor || primaryColor || "#64748b",
    });
    setThemeLoaded(true);
  };

  // Initialiser les couleurs par défaut au montage du composant
  useEffect(() => {
    initializeDefaultColors();
  }, []);

  useEffect(() => {
    // Appliquer les couleurs quand les settings sont chargés
    if (settings && !loading && !error) {
      applyThemeColors(settings);
    }
  }, [settings, loading, error]);

  return {
    themeLoaded,
    colors,
    loading,
    error,
    applyThemeColors, // Pour permettre la mise à jour manuelle
  };
};

export default useOrganizationTheme;
