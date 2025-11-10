import React from "react";
import ModifyButton from "@/components/ui/ModifyButton";

export default function OrganizationDetails({ organization, onEdit }) {
  if (!organization) return null;

  return (
    <div className="bg-white shadow-xs outline outline-gray-900/5 sm:rounded-xl">
      <div className="flex items-center justify-between px-4 py-6 sm:px-8 sm:pt-8 sm:pb-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          {organization.name}
        </h3>
        {onEdit && (
          <ModifyButton onModify={onEdit} modifyLabel="Modifier" size="sm" />
        )}
      </div>
      <div className="px-4 py-6 sm:p-8 space-y-4">
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
          <span className="text-sm font-semibold text-gray-500">Code APE</span>
          <span className="text-sm text-gray-900">
            {organization.legalInfo?.apeCode || "-"}
          </span>
        </div>
      </div>
    </div>
  );
}
