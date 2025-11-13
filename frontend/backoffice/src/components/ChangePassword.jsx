import React, { useState } from "react";
import Panel from "@/components/ui/Panel";
import MyForm from "@/components/MyForm";
import PropTypes from "prop-types";
import { useNotification } from "@/hooks/useNotification";
import { useAccountOperations } from "@/hooks/useAccountOperations";

export default function ChangePassword({ accountId, onChangePassword }) {
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useNotification();
  const accountOps = useAccountOperations();

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
    if (payload.newPassword !== payload.confirmPassword) {
      throw new Error("Les mots de passe ne correspondent pas");
    }
    setLoading(true);
    try {
      if (typeof onChangePassword === "function") {
        await onChangePassword(accountId, {
          currentPassword: payload.currentPassword,
          newPassword: payload.newPassword,
        });
      } else {
        // fallback to direct API call via hook
        await accountOps.changePassword(accountId, {
          currentPassword: payload.currentPassword,
          newPassword: payload.newPassword,
        });
      }
      showSuccess("Mot de passe modifié", "Votre mot de passe a été modifié", {
        autoClose: false,
        prominent: true,
      });
    } catch (err) {
      console.error("Erreur changement de mot de passe:", err);
      // essayer d'extraire un message utile depuis la réponse backend
      const apiMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Impossible de changer le mot de passe";
      showError("Erreur", apiMessage, { autoClose: false, prominent: true });
      const ex = new Error(apiMessage);
      ex.original = err;
      throw ex;
    } finally {
      setLoading(false);
    }
  };

  return (
    <Panel title="Changer le mot de passe">
      <MyForm
        fields={fields}
        initialValues={{}}
        onSubmit={handleSubmit}
        loading={loading}
        submitButtonLabel="Changer le mot de passe"
      />
    </Panel>
  );
}

ChangePassword.propTypes = {
  accountId: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onChangePassword: PropTypes.func,
};
