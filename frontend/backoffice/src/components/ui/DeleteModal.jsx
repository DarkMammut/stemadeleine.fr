"use client";

import Modal from '@/components/ui/Modal';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';

/**
 * Composant générique de modal de confirmation de suppression
 *
 * @param {boolean} open - Contrôle l'état d'ouverture du modal
 * @param {function} onClose - Callback appelé lors de la fermeture du modal
 * @param {function} onConfirm - Callback appelé lors de la confirmation de suppression
 * @param {string} title - Titre du modal (par défaut: "Confirmer la suppression")
 * @param {string} message - Message de confirmation à afficher
 * @param {string} confirmLabel - Label du bouton de confirmation (par défaut: "Supprimer")
 * @param {string} cancelLabel - Label du bouton d'annulation (par défaut: "Annuler")
 * @param {boolean} isDeleting - Indique si l'opération de suppression est en cours
 */
export default function DeleteModal({
  open,
  onClose,
  onConfirm,
  title = "Confirmer la suppression",
  message = "Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.",
  confirmLabel = "Supprimer",
  cancelLabel = "Annuler",
  isDeleting = false,
}) {
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Modal open={open} onClose={onClose} size="md">
      <div className="sm:flex sm:items-start">
        <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:size-10">
          <ExclamationTriangleIcon
            aria-hidden="true"
            className="size-6 text-red-600"
          />
        </div>
        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <div className="mt-2">
            <p className="text-sm text-gray-500">{message}</p>
          </div>
        </div>
      </div>
      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
        <Button
          type="button"
          onClick={handleConfirm}
          disabled={isDeleting}
          variant="danger"
          size="md"
          loading={isDeleting}
          className="w-full sm:w-auto"
        >
          {confirmLabel}
        </Button>
        <Button
          type="button"
          onClick={onClose}
          disabled={isDeleting}
          variant="outline"
          size="md"
          className="mt-3 sm:mt-0 w-full sm:w-auto"
        >
          {cancelLabel}
        </Button>
      </div>
    </Modal>
  );
}
