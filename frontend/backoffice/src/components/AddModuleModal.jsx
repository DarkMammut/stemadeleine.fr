"use client";

import { useEffect, useState } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { PlusCircleIcon } from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';

/**
 * Modal pour ajouter un module à une section
 *
 * @param {boolean} open - État d'ouverture du modal
 * @param {function} onClose - Callback de fermeture
 * @param {function} onConfirm - Callback de confirmation avec le type de module sélectionné
 * @param {object} section - Section cible pour l'ajout du module
 * @param {boolean} isLoading - État de chargement
 * @param {array} moduleTypes - Liste des types de modules disponibles
 */
export default function AddModuleModal({
  open,
  onClose,
  onConfirm,
  section,
  isLoading = false,
  moduleTypes = [
    { value: "article", label: "Article" },
    { value: "gallery", label: "Gallery" },
    { value: "news", label: "News" },
    { value: "newsletter", label: "Newsletter" },
    { value: "cta", label: "CTA" },
    { value: "timeline", label: "Timeline" },
    { value: "form", label: "Form" },
    { value: "list", label: "List" },
  ],
}) {
  const [selectedType, setSelectedType] = useState("");

  // Réinitialiser la sélection quand le modal s'ouvre
  useEffect(() => {
    if (open) {
      setSelectedType("");
    }
  }, [open]);

  const handleConfirm = () => {
    if (selectedType) {
      onConfirm(selectedType);
      setSelectedType("");
    }
  };

  const handleClose = () => {
    setSelectedType("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} className="relative z-[9999]">
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
              <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:size-10">
                <PlusCircleIcon
                  aria-hidden="true"
                  className="size-6 text-blue-600"
                />
              </div>
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left flex-1">
                <DialogTitle
                  as="h3"
                  className="text-base font-semibold text-gray-900"
                >
                  Ajouter un module
                </DialogTitle>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-4">
                    {section ? (
                      <>
                        Ajouter un module à la section{" "}
                        <span className="font-semibold">{section.name}</span>
                      </>
                    ) : (
                      "Sélectionnez le type de module à ajouter"
                    )}
                  </p>

                  {/* Sélecteur de type de module */}
                  <div className="mt-4">
                    <label
                      htmlFor="module-type"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Type de module
                    </label>
                    <select
                      id="module-type"
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      disabled={isLoading}
                      className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Sélectionner un type</option>
                      {moduleTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
              <Button
                type="button"
                onClick={handleConfirm}
                disabled={!selectedType || isLoading}
                variant="primary"
                size="md"
                loading={isLoading}
                className="w-full sm:w-auto"
              >
                Ajouter
              </Button>
              <Button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                variant="outline"
                size="md"
                className="mt-3 sm:mt-0 w-full sm:w-auto"
              >
                Annuler
              </Button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
