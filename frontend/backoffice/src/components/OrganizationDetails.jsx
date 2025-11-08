import React from "react";
import Utilities from "@/components/Utilities";

export default function OrganizationDetails({ organization, onEdit }) {
  if (!organization) return null;

  const actions = [
    {
      label: "Modifier",
      icon: null,
      callback: onEdit,
    },
  ];

  return (
    <div className="details-payment space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {organization.name}
        </h2>
        <div className="border-t border-gray-200 pt-6 space-y-4">
          <div className="grid grid-cols-[140px_1fr] gap-4">
            <span className="text-sm font-semibold text-gray-500">
              Forme juridique
            </span>
            <span className="text-sm text-gray-900">
              {organization.legalInfo?.legalForm || "-"}
            </span>
          </div>

          <div className="grid grid-cols-[140px_1fr] gap-4">
            <span className="text-sm font-semibold text-gray-500">SIRET</span>
            <span className="text-sm text-gray-900">
              {organization.legalInfo?.siret || "-"}
            </span>
          </div>

          <div className="grid grid-cols-[140px_1fr] gap-4">
            <span className="text-sm font-semibold text-gray-500">SIREN</span>
            <span className="text-sm text-gray-900">
              {organization.legalInfo?.siren || "-"}
            </span>
          </div>

          <div className="grid grid-cols-[140px_1fr] gap-4">
            <span className="text-sm font-semibold text-gray-500">N° TVA</span>
            <span className="text-sm text-gray-900">
              {organization.legalInfo?.vatNumber || "-"}
            </span>
          </div>

          <div className="grid grid-cols-[140px_1fr] gap-4">
            <span className="text-sm font-semibold text-gray-500">
              Code APE
            </span>
            <span className="text-sm text-gray-900">
              {organization.legalInfo?.apeCode || "-"}
            </span>
          </div>
        </div>
      </div>
      <Utilities actions={actions} />
    </div>
  );
}
