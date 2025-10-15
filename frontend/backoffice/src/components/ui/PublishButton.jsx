import { useState } from 'react';
import Flag from '@/components/ui/Flag';
import Button from '@/components/ui/Button';
import { CloudArrowUpIcon } from '@heroicons/react/24/solid';

/**
 * Composant de bouton de publication réutilisable
 * @param {Function} onPublish - Fonction appelée lors du clic sur publier
 * @param {boolean} disabled - Désactive le bouton
 * @param {string} publishLabel - Texte du bouton de publication
 * @param {string} publishedLabel - Texte affiché quand publié
 * @param {string} size - Taille du bouton ("sm", "md", "lg")
 * @param {boolean} resetAfterDelay - Remet le bouton à l'état initial après un délai
 */
export default function PublishButton({
  onPublish,
  disabled = false,
  publishLabel = "Publier",
  publishedLabel = "À jour",
  size = "md",
  resetAfterDelay = true,
}) {
  const [loading, setLoading] = useState(false);
  const [published, setPublished] = useState(false);

  const handlePublish = async () => {
    if (!onPublish) return;
    try {
      setLoading(true);
      await onPublish();
      setPublished(true);

      // Optionnel : remettre à l'état initial après un délai
      if (resetAfterDelay) {
        setTimeout(() => {
          setPublished(false);
        }, 3000); // 3 secondes
      }
    } catch (err) {
      console.error("Erreur publication :", err);
      setPublished(false);
    } finally {
      setLoading(false);
    }
  };

  if (published) {
    return (
      <Flag variant="primary" size={size}>
        {publishedLabel}
      </Flag>
    );
  }

  return (
    <Button
      onClick={handlePublish}
      variant="primary"
      size={size}
      loading={loading}
      disabled={disabled || loading}
    >
      <CloudArrowUpIcon className="w-4 h-4 mr-1" />
      {publishLabel}
    </Button>
  );
}
