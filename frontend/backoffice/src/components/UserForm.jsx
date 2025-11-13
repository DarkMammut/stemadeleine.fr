import React from "react";
import MyForm from "@/components/MyForm";

export default function UserForm({
  initialValues,
  onSubmit,
  onChange,
  loading,
  onCancel,
}) {
  const userFields = [
    { name: "firstname", label: "Prénom", type: "text", required: true },
    { name: "lastname", label: "Nom", type: "text", required: true },
    { name: "email", label: "Email", type: "email", required: false },
    {
      name: "birthDate",
      label: "Date de naissance",
      type: "date",
      required: false,
    },
    { name: "phoneMobile", label: "Mobile", type: "text", required: false },
    { name: "phoneLandline", label: "Fixe", type: "text", required: false },
    {
      name: "newsletter",
      label: "Abonné à la newsletter",
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
      fields={userFields}
      initialValues={initialValues}
      onSubmit={handleSubmit}
      onChange={onChange}
      loading={loading}
      submitButtonLabel="Enregistrer l'utilisateur"
      onCancel={onCancel}
      cancelButtonLabel="Annuler"
      successMessage="L'utilisateur a été enregistré avec succès"
      errorMessage="Impossible d'enregistrer l'utilisateur"
    />
  );
}
