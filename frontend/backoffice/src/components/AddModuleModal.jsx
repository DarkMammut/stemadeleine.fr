"use client";

import { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import { PlusCircleIcon } from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Panel from '@/components/ui/Panel';
import { useTranslation } from "@/i18n/I18nContext";

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
  const { t } = useTranslation();
  const resolvedModuleTypes = moduleTypes.map((moduleType) => ({
    ...moduleType,
    label: t(`pages.moduleTypes.${moduleType.value}`),
  }));

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
    <Modal open={open} onClose={handleClose} size="md">
      <Panel title={t("pages.addModuleModal.title")} icon={PlusCircleIcon}>
        <div className="mt-2">
          <p className="text-sm text-gray-500 mb-4">
            {section ? (
              <>
                {t("pages.addModuleModal.descriptionWithSectionPrefix")}{" "}
                <span className="font-semibold">{section.name}</span>
              </>
            ) : (
              t("pages.addModuleModal.descriptionWithoutSection")
            )}
          </p>

          {/* Sélecteur de type de module */}
          <div className="mt-4">
            <label
              htmlFor="module-type"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {t("pages.addModuleModal.fieldLabel")}
            </label>
            <Select
              id="module-type"
              value={selectedType}
              onValueChange={setSelectedType}
              disabled={isLoading}
              options={resolvedModuleTypes}
              placeholder={t("pages.addModuleModal.fieldPlaceholder")}
              className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 disabled:opacity-50 disabled:cursor-not-allowed"
            />
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
            {t("pages.addModuleModal.confirm")}
          </Button>
          <Button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            variant="outline"
            size="md"
            className="mt-3 sm:mt-0 w-full sm:w-auto"
          >
            {t("pages.addModuleModal.cancel")}
          </Button>
        </div>
      </Panel>
    </Modal>
  );
}
