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
    { name: "phoneMobile", label: "Mobile", type: "text", required: false },
    { name: "phoneLandline", label: "Fixe", type: "text", required: false },
    {
      name: "birthDate",
      label: "Date de naissance",
      type: "date",
      required: false,
    },
    {
      name: "newsletter",
      label: "Abonné à la newsletter",
      type: "checkbox",
      required: false,
    },
  ];
  return (
    <MyForm
      fields={userFields}
      initialValues={initialValues}
      onSubmit={onSubmit}
      onChange={onChange}
      loading={loading}
      submitButtonLabel="Enregistrer l'utilisateur"
      onCancel={onCancel}
      cancelButtonLabel="Annuler"
    />
  );
}
