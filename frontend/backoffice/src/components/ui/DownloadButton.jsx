import { useState } from 'react';
import Flag from '@/components/ui/Flag';
import IconButton from '@/components/ui/IconButton';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

/**
 * Composant de bouton de téléchargement réutilisable
 * @param {Function} onDownload - Fonction appelée lors du clic sur télécharger
 * @param {boolean} disabled - Désactive le bouton
 * @param {string} downloadLabel - Texte du bouton de téléchargement
 * @param {string} downloadedLabel - Texte affiché quand téléchargé
 * @param {string} size - Taille du bouton ("sm", "md", "lg")
 * @param {boolean} resetAfterDelay - Remet le bouton à l'état initial après un délai
 * @param {boolean} hoverExpand - Si true, le label apparaît au survol
 */
export default function DownloadButton({
  onDownload,
  disabled = false,
  downloadLabel = "Télécharger",
  downloadedLabel = "Téléchargé",
  size = "md",
  resetAfterDelay = true,
  hoverExpand = false,
}) {
  const [loading, setLoading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = async () => {
    if (!onDownload) return;
    try {
      setLoading(true);
      await onDownload();
      setDownloaded(true);

      // Optionnel : remettre à l'état initial après un délai
      if (resetAfterDelay) {
        setTimeout(() => {
          setDownloaded(false);
        }, 3000); // 3 secondes
      }
    } catch (err) {
      console.error("Erreur téléchargement :", err);
      setDownloaded(false);
    } finally {
      setLoading(false);
    }
  };

  if (downloaded) {
    return (
      <Flag variant="success" size={size}>
        {downloadedLabel}
      </Flag>
    );
  }

  return (
    <IconButton
      onClick={handleDownload}
      variant="secondary"
      size={size}
      icon={ArrowDownTrayIcon}
      label={loading ? "Chargement..." : downloadLabel}
      disabled={disabled || loading}
      hoverExpand={hoverExpand}
    />
  );
}
