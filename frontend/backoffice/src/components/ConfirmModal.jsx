"use client";

import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';

/**
 * Composant générique de modal de confirmation
 *
 * @param {boolean} open - Contrôle l'état d'ouverture du modal
 * @param {function} onClose - Callback appelé lors de la fermeture du modal
 * @param {function} onConfirm - Callback appelé lors de la confirmation
 * @param {string} title - Titre du modal (par défaut: "Confirmer l'action")
 * @param {string} message - Message de confirmation à afficher
 * @param {string} confirmLabel - Label du bouton de confirmation (par défaut: "Confirmer")
 * @param {string} cancelLabel - Label du bouton d'annulation (par défaut: "Annuler")
 * @param {boolean} isLoading - Indique si l'opération est en cours
 * @param {string} variant - Variant du bouton de confirmation ('danger', 'primary', etc.)
 */
export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = "Confirmer l'action",
  message = "Êtes-vous sûr de vouloir effectuer cette action ?",
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  isLoading = false,
  variant = "danger",
}) {
  const handleConfirm = () => {
    onConfirm();
  };

  const iconColorClass = variant === "danger" ? "bg-red-100" : "bg-blue-100";
  const iconTextClass = variant === "danger" ? "text-red-600" : "text-blue-600";

  return (
    <Dialog open={open} onClose={onClose} className="relative z-[9999]">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            <div className="sm:flex sm:items-start">
              <div
                className={`mx-auto flex size-12 shrink-0 items-center justify-center rounded-full ${iconColorClass} sm:mx-0 sm:size-10`}
              >
                <ExclamationTriangleIcon
                  aria-hidden="true"
                  className={`size-6 ${iconTextClass}`}
                />
              </div>
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <DialogTitle
                  as="h3"
                  className="text-base font-semibold text-gray-900"
                >
                  {title}
                </DialogTitle>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">{message}</p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
              <Button
                type="button"
                onClick={handleConfirm}
                disabled={isLoading}
                variant={variant}
                size="md"
                loading={isLoading}
                className="w-full sm:w-auto"
              >
                {confirmLabel}
              </Button>
              <Button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                variant="outline"
                size="md"
                className="mt-3 sm:mt-0 w-full sm:w-auto"
              >
                {cancelLabel}
              </Button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
