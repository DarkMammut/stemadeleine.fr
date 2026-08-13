"use client";

import React, { useEffect, useState } from "react";
import { ExclamationTriangleIcon, PlusIcon } from "@heroicons/react/24/outline";
import Button from "@/components/ui/Button";
import useNewsVariantCheck from "@/hooks/useNewsVariantCheck";
import { useNotification } from "@/hooks/useNotification";
import { useAxiosClient } from "@/utils/axiosClient";

export default function NewsAllVariantAlert() {
  const [showAlert, setShowAlert] = useState(false);
  const [checking, setChecking] = useState(true);
  const [creating, setCreating] = useState(false);

  const { checkNewsWithVariantAll } = useNewsVariantCheck();
  const { showSuccess, showError } = useNotification();
  const axiosClient = useAxiosClient();

  useEffect(() => {
    const checkVariant = async () => {
      try {
        const exists = await checkNewsWithVariantAll();
        setShowAlert(!exists);
      } catch (error) {
        console.error("Erreur lors de la vérification:", error);
        // En cas d'erreur, on affiche l'alerte par sécurité
        setShowAlert(true);
      } finally {
        setChecking(false);
      }
    };

    checkVariant();
  }, [checkNewsWithVariantAll]);

  const handleCreatePages = async () => {
    setCreating(true);
    try {
      await axiosClient.post("/api/news/setup-pages");

      showSuccess(
        "Pages créées",
        "Les pages Actualités ont été créées avec succès à /actualites",
      );

      setShowAlert(false);
    } catch (error) {
      console.error("Erreur lors de la création des pages:", error);
      showError(
        "Erreur de création",
        error?.response?.data?.message ||
          "Impossible de créer les pages Actualités",
      );
    } finally {
      setCreating(false);
    }
  };

  // Ne rien afficher pendant la vérification ou si pas besoin d'alerte
  if (checking || !showAlert) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
      <div className="flex items-start">
        <div className="shrink-0">
          <ExclamationTriangleIcon
            className="h-6 w-6 text-yellow-400"
            aria-hidden="true"
          />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-yellow-700">
            Veuillez créer la structure de pages pour afficher toutes les
            actualités à <strong>/actualites</strong>. Cela créera
            automatiquement la page principale et la page de détail{" "}
            <strong>/actualites/[newsId]</strong>.
          </p>
        </div>
        <div className="ml-3">
          <Button
            variant="primary"
            size="sm"
            onClick={handleCreatePages}
            disabled={creating}
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            {creating ? "Création..." : "Créer"}
          </Button>
        </div>
      </div>
    </div>
  );
}

