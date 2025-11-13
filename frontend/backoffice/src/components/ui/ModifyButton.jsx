import { useState } from 'react';
import Flag from '@/components/ui/Flag';
import Button from '@/components/ui/Button';
import { PencilIcon } from '@heroicons/react/24/outline';

/**
 * Composant de bouton de modification réutilisable
 * @param {Function} onModify - Fonction appelée lors du clic sur modifier
 * @param {boolean} disabled - Désactive le bouton
 * @param {string} modifyLabel - Texte du bouton de modification
 * @param {string} modifiedLabel - Texte affiché quand modifié
 * @param {string} size - Taille du bouton ("sm", "md", "lg")
 * @param {boolean} resetAfterDelay - Remet le bouton à l'état initial après un délai
 */
export default function ModifyButton({
  onModify,
  disabled = false,
  modifyLabel = "Modifier",
  modifiedLabel = "Chargement",
  size = "sm",
  resetAfterDelay = true,
}) {
  const [loading, setLoading] = useState(false);
  const [modified, setModified] = useState(false);

  const handleModify = async () => {
    if (!onModify) return;
    try {
      setLoading(true);
      await onModify();
      setModified(true);

      // Optionnel : remettre à l'état initial après un délai
      if (resetAfterDelay) {
        setTimeout(() => {
          setModified(false);
        }, 2000); // 2 secondes
      }
    } catch (err) {
      console.error("Erreur modification :", err);
      setModified(false);
    } finally {
      setLoading(false);
    }
  };

  if (modified) {
    return (
      <Flag variant="secondary" size={size}>
        {modifiedLabel}
      </Flag>
    );
  }

  return (
    <Button
      onClick={handleModify}
      variant="secondary"
      size={size}
      loading={loading}
      disabled={disabled || loading}
    >
      <PencilIcon className="w-4 h-4 mr-1" />
      {modifyLabel}
    </Button>
  );
}
