import React, { useState } from "react";
import Panel from "@/components/ui/Panel";
import MyForm from "@/components/ui/MyForm";
import PropTypes from "prop-types";
import { useNotification } from "@/hooks/useNotification";
import { useAccountOperations } from "@/hooks/useAccountOperations";
import { useTranslation } from "@/i18n/I18nContext";

export default function ChangePassword({ accountId, onChangePassword }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useNotification();
  const accountOps = useAccountOperations();

  const fields = [
    {
      name: "currentPassword",
      label: t("accounts.password.currentPassword"),
      type: "password",
      required: true,
    },
    {
      name: "newPassword",
      label: t("accounts.password.newPassword"),
      type: "password",
      required: true,
    },
    {
      name: "confirmPassword",
      label: t("accounts.password.confirmPassword"),
      type: "password",
      required: true,
    },
  ];

  const handleSubmit = async (payload) => {
    if (payload.newPassword !== payload.confirmPassword) {
      throw new Error(t("accounts.password.mismatch"));
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
      showSuccess(
        t("accounts.password.updateSuccessTitle"),
        t("accounts.password.updateSuccessMessage"),
        {
          autoClose: false,
          prominent: true,
        },
      );
    } catch (err) {
      console.error("Erreur changement de mot de passe:", err);
      // essayer d'extraire un message utile depuis la réponse backend
      const apiMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        t("accounts.password.updateErrorMessage");
      showError(t("accounts.password.updateErrorTitle"), apiMessage, {
        autoClose: false,
        prominent: true,
      });
      const ex = new Error(apiMessage);
      ex.original = err;
      throw ex;
    } finally {
      setLoading(false);
    }
  };

  return (
    <Panel title={t("accounts.password.panelTitle")}>
      <MyForm
        fields={fields}
        initialValues={{}}
        onSubmit={handleSubmit}
        loading={loading}
        submitButtonLabel={t("accounts.password.panelTitle")}
      />
    </Panel>
  );
}

ChangePassword.propTypes = {
  accountId: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onChangePassword: PropTypes.func,
};
