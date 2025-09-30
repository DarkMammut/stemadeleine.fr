import React from "react";
import Utilities from "@/components/Utilities";

export default function DetailsPayment({ organization, onEdit }) {
  if (!organization) return null;

  const actions = [
    {
      label: "Modifier",
      icon: null,
      callback: onEdit,
    },
  ];

  return (
    <div className="details-payment p-4 border rounded">
      <h2 className="text-xl font-bold mb-2">{organization.name}</h2>
      <div>Forme juridique : {organization.legalInfo?.legalForm}</div>
      <div>SIRET : {organization.legalInfo?.siret}</div>
      <div>SIREN : {organization.legalInfo?.siren}</div>
      <div>N° TVA : {organization.legalInfo?.vatNumber}</div>
      <div>Code APE : {organization.legalInfo?.apeCode}</div>
      <Utilities actions={actions} />
    </div>
  );
}
