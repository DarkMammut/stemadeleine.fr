import React from 'react';
import clsx from 'clsx';
import Button from '@/components/Button';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
type Size = 'sm' | 'md' | 'lg' | 'xl';

interface IconButtonProps extends Record<string, unknown> {
  icon?: React.ElementType;
  label?: string;
  variant?: Variant;
  size?: Size;
  className?: string;
}

export default function IconButton({
                                     icon: Icon,
                                     label,
                                     variant = 'primary',
                                     size = 'md',
                                     className = '',
                                     ...props
                                   }: IconButtonProps) {
  // Définir les couleurs d'icône en fonction du variant
  const getIconColor = (variantValue: Variant) => {
    switch (variantValue) {
      case 'primary':
      case 'danger':
        return 'white';
      case 'secondary':
        return 'rgb(var(--color-secondary-800))';
      case 'ghost':
        return 'rgb(var(--color-secondary-700))';
      case 'outline':
        return 'rgb(var(--color-primary-600))';
      default:
        return 'currentColor';
    }
  };

  // Button n'accepte que 'sm'|'md'|'lg' — mapper 'xl' vers 'lg' pour compatibilité
  const forwardedSize = (size === 'xl' ? 'lg' : size) as 'sm' | 'md' | 'lg';

  return (
    <Button
      variant={variant}
      size={forwardedSize}
      className={clsx('flex items-center gap-2 group', `icon-button-${variant}`, className)}
      {...(props as Record<string, unknown>)}
    >
      {Icon && (
        // Icon peut être n'importe quel component (SVG, React component...).
        <Icon
          className="w-5 h-5 transition-all duration-200 group-hover:!text-white"
          style={{ color: getIconColor(variant) }}
        />
      )}

      {label && (
        <span className="transition-all duration-200 group-hover:!text-white">{label}</span>
      )}
    </Button>
  );
}

