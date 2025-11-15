"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import Button from "@/components/ui/Button";
import MyForm from "@/components/ui/MyForm";
import { useAccountOperations } from "@/hooks/useAccountOperations";
import { useNotification } from "@/hooks/useNotification";
import PropTypes from "prop-types";

export default function ChangePasswordModal({
  open,
  onClose,
  accountId,
  onSuccess,
}) {
  const [loading, setLoading] = useState(false);
  const accountOps = useAccountOperations();
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    if (open) {
      // reset state if needed
    }
  }, [open]);

  const fields = [
    {
      name: "currentPassword",
      label: "Mot de passe actuel",
      type: "password",
      required: true,
    },
    {
      name: "newPassword",
      label: "Nouveau mot de passe",
      type: "password",
      required: true,
    },
    {
      name: "confirmPassword",
      label: "Confirmer le nouveau mot de passe",
      type: "password",
      required: true,
    },
  ];

  const handleSubmit = async (payload) => {
    if (!accountId) throw new Error("Compte invalide");
    // Normalize (trim) inputs to avoid accidental spaces
    const currentPassword = (payload.currentPassword || "").trim();
    const newPassword = (payload.newPassword || "").trim();
    const confirmPassword = (payload.confirmPassword || "").trim();

    if (newPassword !== confirmPassword)
      throw new Error("Les mots de passe ne correspondent pas");
    // Client-side validation: enforce minimum length and difference to current
    if (!newPassword || newPassword.length < 8) {
      showError(
        "Erreur",
        "Le nouveau mot de passe doit contenir au moins 8 caractères",
        { autoClose: false },
      );
      throw new Error("New password too short");
    }
    if (currentPassword && currentPassword === newPassword) {
      showError(
        "Erreur",
        "Le nouveau mot de passe doit être différent de l'actuel",
        { autoClose: false },
      );
      throw new Error("New password same as current");
    }
    // Ensure currentPassword is provided
    if (!currentPassword || currentPassword.length === 0) {
      showError("Erreur", "Veuillez entrer votre mot de passe actuel", {
        autoClose: false,
      });
      throw new Error("Current password missing");
    }
    setLoading(true);
    try {
      await accountOps.changePassword(accountId, {
        currentPassword,
        newPassword,
      });
      showSuccess("Mot de passe modifié", "Le mot de passe a été modifié", {
        autoClose: false,
      });
      if (typeof onSuccess === "function") await onSuccess();
      onClose();
    } catch (err) {
      console.error("Erreur change password modal:", err);
      // Map common API responses to user-friendly messages
      const status = err?.response?.status;
      if (status === 400) {
        const apiMessage =
          err?.response?.data?.message ||
          "Le nouveau mot de passe doit contenir au moins 8 caractères et être différent de l'actuel";
        showError("Erreur", apiMessage, { autoClose: false });
      } else if (status === 403) {
        const apiMessage =
          err?.response?.data?.message ||
          "Mot de passe actuel incorrect ou vous n'êtes pas autorisé à changer ce mot de passe";
        showError("Erreur", apiMessage, { autoClose: false });
      } else {
        const apiMessage =
          err?.response?.data?.message ||
          err?.message ||
          "Impossible de changer le mot de passe";
        showError("Erreur", apiMessage, { autoClose: false });
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
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
          <DialogPanel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left flex-1">
                <DialogTitle
                  as="h3"
                  className="text-base font-semibold text-gray-900"
                >
                  Changer le mot de passe
                </DialogTitle>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Entrez votre mot de passe actuel puis le nouveau mot de
                    passe.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <MyForm
                fields={fields}
                initialValues={{}}
                onSubmit={handleSubmit}
                onCancel={handleClose}
                submitButtonLabel="Changer le mot de passe"
                loading={loading}
              />
            </div>

            <div className="mt-3 sm:mt-4 sm:flex sm:flex-row-reverse">
              <Button
                type="button"
                onClick={handleClose}
                variant="outline"
                size="md"
                className="mt-3 sm:mt-0 w-full sm:w-auto"
              >
                Fermer
              </Button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}

ChangePasswordModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  accountId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onSuccess: PropTypes.func,
};
