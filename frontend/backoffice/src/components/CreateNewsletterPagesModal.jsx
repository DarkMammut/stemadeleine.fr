"use client";

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Modal from "@/components/ui/Modal";
import MyForm from "@/components/ui/MyForm";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function CreateNewsletterPagesModal({
  open,
  onClose,
  onSubmit,
  pages,
  loading,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setIsSubmitting(false);
    }
  }, [open]);

  const handleSubmit = async (formValues) => {
    if (!formValues.parentPageId) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formValues.parentPageId);
      onClose();
    } catch (error) {
      console.error("Erreur lors de la création des pages:", error);
      throw error; // MyForm gère l'affichage d'erreur
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fonction pour aplatir la structure hiérarchique des pages
  const flattenPages = (pages, level = 0) => {
    let flatList = [];
    pages?.forEach((page) => {
      // Ne garder que les pages publiées
      if (page.status === "PUBLISHED") {
        flatList.push({
          ...page,
          level,
        });
        if (page.children && page.children.length > 0) {
          flatList = flatList.concat(flattenPages(page.children, level + 1));
        }
      }
    });
    return flatList;
  };

  // Préparer les options pour le select avec indentation
  const flatPages = flattenPages(pages);
  const pageOptions = flatPages.map((page) => ({
    value: page.pageId, // Utiliser pageId (identifiant métier) et non id (identifiant technique)
    label: `${"  ".repeat(page.level)}${page.level > 0 ? "↳ " : ""}${page.title || page.name}`,
  }));

  const fields = [
    {
      name: "parentPageId",
      label: "Sélectionner la page parente",
      type: "select",
      options: pageOptions,
      required: true,
      placeholder: "-- Choisir une page --",
      helperText: "Cette page sera le parent de la nouvelle page \"Newsletters\" qui contiendra toutes les newsletters avec la variante ALL.",
    },
  ];

  return (
    <Modal open={open} onClose={onClose} size="md">
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Créer les pages Newsletter
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Description de ce qui sera créé */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
          <p className="text-sm text-blue-800 font-medium mb-2">
            Création automatique :
          </p>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li>Page "Newsletters" (parente)</li>
            <li>Section avec module Newsletter (variante ALL)</li>
            <li>Page dynamique "[newsletterId]" (enfant)</li>
          </ul>
        </div>

        {/* Form */}
        <MyForm
          fields={fields}
          initialValues={{ parentPageId: "" }}
          onSubmit={handleSubmit}
          submitButtonLabel="Créer"
          successMessage="Pages créées avec succès"
          errorMessage="Erreur lors de la création des pages"
          onCancel={onClose}
          cancelButtonLabel="Annuler"
          panel={false}
          loading={isSubmitting || loading}
          allowNoChanges={true}
          columns={1}
        />
      </div>
    </Modal>
  );
}

CreateNewsletterPagesModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  pages: PropTypes.array,
  loading: PropTypes.bool,
};

CreateNewsletterPagesModal.defaultProps = {
  pages: [],
  loading: false,
};

