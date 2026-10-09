import React from "react";
import MyForm from "@/components/ui/MyForm";
import { useTranslation } from "@/i18n/I18nContext";

export default function UserForm({
  initialValues,
  onSubmit,
  onChange,
  loading,
  onCancel,
  title = null,
}) {
  const { t } = useTranslation();
  const userFields = [
    { name: "firstname", label: t("users.form.firstname"), type: "text", required: true },
    { name: "lastname", label: t("users.form.lastname"), type: "text", required: true },
    { name: "email", label: t("users.form.email"), type: "email", required: false },
    {
      name: "birthDate",
      label: t("users.form.birthDate"),
      type: "date",
      required: false,
    },
    { name: "phoneMobile", label: t("users.form.phoneMobile"), type: "text", required: false },
    { name: "phoneLandline", label: t("users.form.phoneLandline"), type: "text", required: false },
    {
      name: "newsletter",
      label: t("users.form.newsletter"),
      type: "checkbox",
      required: false,
    },
  ];

  // Wrapper pour normaliser les valeurs avant envoi au parent
  const handleSubmit = (values) => {
    if (!values || typeof values !== "object") {
      if (typeof onSubmit === "function") onSubmit(values);
      return;
    }

    const normalized = { ...values };

    // Convertir les dates vides en null pour éviter DateTimeParseException côté backend
    if (Object.prototype.hasOwnProperty.call(normalized, "birthDate")) {
      if (normalized.birthDate === "" || normalized.birthDate == null) {
        normalized.birthDate = null;
      }
    }

    // Appeler le callback parent avec les valeurs normalisées
    if (typeof onSubmit === "function") onSubmit(normalized);
  };

  return (
    <MyForm
      title={title}
      fields={userFields}
      initialValues={initialValues}
      onSubmit={handleSubmit}
      onChange={onChange}
      loading={loading}
      submitButtonLabel={t("users.form.save")}
      onCancel={onCancel}
      cancelButtonLabel={t("users.form.cancel")}
      successMessage={t("users.form.successMessage")}
      errorMessage={t("users.form.errorMessage")}
    />
  );
}
