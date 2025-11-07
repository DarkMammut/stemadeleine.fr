import Button from './Button';
import clsx from 'clsx';

/**
 * Composant bouton avec icône et texte optionnel
 *
 * @param {Object} icon - Le composant icône à afficher (Heroicons)
 * @param {string} label - Le texte à afficher dans le bouton (optionnel)
 * @param {string} variant - La variante de couleur ('primary', 'secondary', 'danger', 'ghost')
 * @param {string} size - La taille du bouton ('sm', 'md', 'lg')
 * @param {function} onClick - Fonction appelée au clic
 * @param {boolean} disabled - État désactivé du bouton
 * @param {boolean} hoverExpand - Si true, le label apparaît au survol
 * @param {string} className - Classes CSS supplémentaires
 */
export default function IconButton({
  icon: Icon,
  label,
  variant = "secondary",
  size = "md",
  onClick,
  disabled = false,
  hoverExpand = false,
  className,
  ...props
}) {
  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  // En mode icon-only (pas de label OU hoverExpand), on garde le même padding vertical mais on réduit l'horizontal
  const iconOnlyPadding = {
    sm: "!px-1.5",
    md: "!px-2",
    lg: "!px-2.5",
  };

  const shouldShowIconOnly = !label || hoverExpand;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        shouldShowIconOnly && iconOnlyPadding[size],
        hoverExpand && "group overflow-hidden transition-all duration-200",
        className,
      )}
      {...props}
    >
      {hoverExpand ? (
        // Mode hover-expand : icône visible, label apparaît au survol
        <div className="flex items-center">
          {Icon && <Icon className={clsx(iconSizes[size], "shrink-0")} />}
          {label && (
            <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs group-hover:ml-1.5 transition-all duration-200">
              {label}
            </span>
          )}
        </div>
      ) : label ? (
        // Mode normal avec label
        <div className="flex items-center gap-1.5">
          {Icon && <Icon className={iconSizes[size]} />}
          <span>{label}</span>
        </div>
      ) : (
        // Mode icon-only
        Icon && <Icon className={iconSizes[size]} />
      )}
    </Button>
  );
}
