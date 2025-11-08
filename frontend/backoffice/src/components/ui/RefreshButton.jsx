import { useState } from 'react';
import Flag from '@/components/ui/Flag';
import Button from '@/components/ui/Button';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

/**
 * Composant de bouton d'actualisation réutilisable
 * @param {Function} onRefresh - Fonction appelée lors du clic sur actualiser
 * @param {boolean} disabled - Désactive le bouton
 * @param {string} refreshLabel - Texte du bouton d'actualisation
 * @param {string} refreshedLabel - Texte affiché quand actualisé
 * @param {string} size - Taille du bouton ("sm", "md", "lg")
 * @param {boolean} resetAfterDelay - Remet le bouton à l'état initial après un délai
 * @param {boolean} hoverExpand - Si true, le label apparaît au survol
 */
export default function RefreshButton({
  onRefresh,
  disabled = false,
  refreshLabel = "Actualiser",
  refreshedLabel = "Actualisé",
  size = "md",
  resetAfterDelay = true,
  hoverExpand = false,
}) {
  const [loading, setLoading] = useState(false);
  const [refreshed, setRefreshed] = useState(false);

  const handleRefresh = async () => {
    if (!onRefresh) return;
    try {
      setLoading(true);
      await onRefresh();
      setRefreshed(true);

      // Optionnel : remettre à l'état initial après un délai
      if (resetAfterDelay) {
        setTimeout(() => {
          setRefreshed(false);
        }, 2000); // 2 secondes
      }
    } catch (err) {
      console.error("Erreur actualisation :", err);
      setRefreshed(false);
    } finally {
      setLoading(false);
    }
  };

  if (refreshed) {
    return (
      <Flag variant="success" size={size}>
        {refreshedLabel}
      </Flag>
    );
  }

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const iconOnlyPadding = {
    sm: "!px-1.5",
    md: "!px-2",
    lg: "!px-2.5",
  };

  const shouldShowIconOnly = !refreshLabel || hoverExpand;

  return (
    <Button
      variant="refresh"
      size={size}
      onClick={handleRefresh}
      disabled={disabled || loading}
      className={clsx(
        shouldShowIconOnly && iconOnlyPadding[size],
        hoverExpand && "group overflow-hidden transition-all duration-200",
      )}
    >
      {hoverExpand ? (
        // Mode hover-expand : icône visible, label apparaît au survol
        <div className="flex items-center">
          <ArrowPathIcon
            className={clsx(
              iconSizes[size],
              "shrink-0",
              loading && "animate-spin",
            )}
          />
          {refreshLabel && (
            <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs group-hover:ml-1.5 transition-all duration-200">
              {loading ? "Actualisation..." : refreshLabel}
            </span>
          )}
        </div>
      ) : refreshLabel ? (
        // Mode normal avec label
        <div className="flex items-center gap-1.5">
          <ArrowPathIcon
            className={clsx(iconSizes[size], loading && "animate-spin")}
          />
          <span>{loading ? "Actualisation..." : refreshLabel}</span>
        </div>
      ) : (
        // Mode icon-only
        <ArrowPathIcon
          className={clsx(iconSizes[size], loading && "animate-spin")}
        />
      )}
    </Button>
  );
}
