import Button from './Button';

/**
 * Composant bouton avec icône et texte
 *
 * @param {Object} icon - Le composant icône à afficher (Heroicons)
 * @param {string} label - Le texte à afficher dans le bouton
 * @param {string} variant - La variante de couleur ('primary', 'secondary', 'danger', 'ghost')
 * @param {string} size - La taille du bouton ('sm', 'md', 'lg')
 * @param {function} onClick - Fonction appelée au clic
 * @param {boolean} disabled - État désactivé du bouton
 * @param {string} className - Classes CSS supplémentaires
 */
export default function IconButton({
  icon: Icon,
  label,
  variant = "secondary",
  size = "md",
  onClick,
  disabled = false,
  className,
  ...props
}) {
  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled}
      className={className}
      {...props}
    >
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className={iconSizes[size]} />}
        <span>{label}</span>
      </div>
    </Button>
  );
}
