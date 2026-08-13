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
  forceWhiteOnHover?: boolean;
  unstyled?: boolean;
}

export default function IconButton({
                                     icon: Icon,
                                     label,
                                     variant = 'primary',
                                     size = 'md',
                                     className = '',
                                     forceWhiteOnHover = true,
                                     unstyled = false,
                                     ...props
                                   }: IconButtonProps) {
  // Button n'accepte que 'sm'|'md'|'lg' — mapper 'xl' vers 'lg' pour compatibilité
  const forwardedSize = (size === 'xl' ? 'lg' : size) as 'sm' | 'md' | 'lg';
  const hoverTextClass = forceWhiteOnHover ? 'group-hover:!text-white' : '';

  return (
    <Button
      variant={variant}
      size={forwardedSize}
      unstyled={unstyled}
      className={clsx('flex items-center gap-2 group', `icon-button-${variant}`, className)}
      {...(props as Record<string, unknown>)}
    >
      {Icon && (
        // Icon peut être n'importe quel component (SVG, React component...).
        <Icon
          className={clsx('w-5 h-5 transition-all duration-200', hoverTextClass)}
          style={{ color: 'currentColor' }}
        />
      )}

      {label && (
        <span className={clsx('transition-all duration-200', hoverTextClass)}>{label}</span>
      )}
    </Button>
  );
}
