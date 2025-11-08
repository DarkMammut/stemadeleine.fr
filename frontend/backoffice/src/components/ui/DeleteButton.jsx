import { useState } from 'react';
import IconButton from '@/components/ui/IconButton';
import ConfirmModal from '@/components/ConfirmModal';
import { TrashIcon } from '@heroicons/react/24/outline';

/**
 * Composant de bouton de suppression réutilisable avec modal de confirmation intégrée
 * @param {Function} onDelete - Fonction appelée lors de la confirmation de suppression
 * @param {Function} onSuccess - Fonction appelée après une suppression réussie
 * @param {boolean} disabled - Désactive le bouton
 * @param {string} deleteLabel - Texte du bouton de suppression
 * @param {string} confirmTitle - Titre de la modal de confirmation
 * @param {string} confirmMessage - Message de la modal de confirmation
 * @param {string} confirmLabel - Texte du bouton de confirmation
 * @param {string} size - Taille du bouton ("sm", "md", "lg")
 * @param {boolean} hoverExpand - Si true, le label apparaît au survol
 * @param {boolean} requireConfirmation - Si true, affiche une modal de confirmation (défaut: true)
 */
export default function DeleteButton({
  onDelete,
  onSuccess,
  disabled = false,
  deleteLabel = "Supprimer",
  confirmTitle = "Confirmer la suppression",
  confirmMessage = "Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.",
  confirmLabel = "Supprimer",
  size = "md",
  hoverExpand = false,
  requireConfirmation = true,
}) {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleClick = () => {
    if (requireConfirmation) {
      setShowModal(true);
    } else {
      handleConfirmDelete();
    }
  };

  const handleConfirmDelete = async () => {
    if (!onDelete) return;
    try {
      setLoading(true);
      await onDelete();
      setShowModal(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("Erreur suppression :", err);
      setShowModal(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        variant="danger"
        size={size}
        icon={TrashIcon}
        label={loading ? "Suppression..." : deleteLabel}
        disabled={disabled || loading}
        hoverExpand={hoverExpand}
        title={deleteLabel}
      />

      {requireConfirmation && (
        <ConfirmModal
          open={showModal}
          onClose={() => setShowModal(false)}
          onConfirm={handleConfirmDelete}
          title={confirmTitle}
          message={confirmMessage}
          confirmLabel={confirmLabel}
          isLoading={loading}
          variant="danger"
        />
      )}
    </>
  );
}
