import {useEffect} from 'react';
import useGetOrganization from './useGetOrganization';

const useOrganizationTheme = () => {
    const {settings, loading, error} = useGetOrganization();

    useEffect(() => {
        if (settings && settings.primaryColor && settings.secondaryColor) {
            // Apply colors as CSS custom properties (CSS variables)
            const root = document.documentElement;

            // Set primary color
            root.style.setProperty('--color-primary', settings.primaryColor);

            // Set secondary color
            root.style.setProperty('--color-secondary', settings.secondaryColor);

            // Convert hex to RGB for Tailwind opacity utilities
            const primaryRgb = hexToRgb(settings.primaryColor);
            const secondaryRgb = hexToRgb(settings.secondaryColor);

            if (primaryRgb) {
                root.style.setProperty('--color-primary-rgb', `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`);
            }

            if (secondaryRgb) {
                root.style.setProperty('--color-secondary-rgb', `${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}`);
            }

            // Create color variations for different shades
            if (primaryRgb) {
                // Lighter shades
                root.style.setProperty('--color-primary-50', createShade(primaryRgb, 0.95));
                root.style.setProperty('--color-primary-100', createShade(primaryRgb, 0.9));
                root.style.setProperty('--color-primary-200', createShade(primaryRgb, 0.8));
                root.style.setProperty('--color-primary-300', createShade(primaryRgb, 0.7));
                root.style.setProperty('--color-primary-400', createShade(primaryRgb, 0.6));
                root.style.setProperty('--color-primary-500', settings.primaryColor); // Base color
                // Darker shades
                root.style.setProperty('--color-primary-600', createShade(primaryRgb, 0.8, true));
                root.style.setProperty('--color-primary-700', createShade(primaryRgb, 0.7, true));
                root.style.setProperty('--color-primary-800', createShade(primaryRgb, 0.6, true));
                root.style.setProperty('--color-primary-900', createShade(primaryRgb, 0.5, true));
            }

            if (secondaryRgb) {
                // Lighter shades
                root.style.setProperty('--color-secondary-50', createShade(secondaryRgb, 0.95));
                root.style.setProperty('--color-secondary-100', createShade(secondaryRgb, 0.9));
                root.style.setProperty('--color-secondary-200', createShade(secondaryRgb, 0.8));
                root.style.setProperty('--color-secondary-300', createShade(secondaryRgb, 0.7));
                root.style.setProperty('--color-secondary-400', createShade(secondaryRgb, 0.6));
                root.style.setProperty('--color-secondary-500', settings.secondaryColor); // Base color
                // Darker shades
                root.style.setProperty('--color-secondary-600', createShade(secondaryRgb, 0.8, true));
                root.style.setProperty('--color-secondary-700', createShade(secondaryRgb, 0.7, true));
                root.style.setProperty('--color-secondary-800', createShade(secondaryRgb, 0.6, true));
                root.style.setProperty('--color-secondary-900', createShade(secondaryRgb, 0.5, true));
            }

            console.log('Organization theme colors applied:', {
                primary: settings.primaryColor,
                secondary: settings.secondaryColor
            });
        }
    }, [settings]);

    return {
        primaryColor: settings?.primaryColor,
        secondaryColor: settings?.secondaryColor,
        loading,
        error,
    };
};

// Helper function to convert hex to RGB
const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

// Helper function to create color shades
const createShade = (rgb, factor, darken = false) => {
    if (darken) {
        // Darken the color
        const r = Math.round(rgb.r * factor);
        const g = Math.round(rgb.g * factor);
        const b = Math.round(rgb.b * factor);
        return `rgb(${r}, ${g}, ${b})`;
    } else {
        // Lighten the color
        const r = Math.round(rgb.r + (255 - rgb.r) * (1 - factor));
        const g = Math.round(rgb.g + (255 - rgb.g) * (1 - factor));
        const b = Math.round(rgb.b + (255 - rgb.b) * (1 - factor));
        return `rgb(${r}, ${g}, ${b})`;
    }
};

export default useOrganizationTheme;
