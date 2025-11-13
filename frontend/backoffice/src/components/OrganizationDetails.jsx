import React from "react";
import ModifyButton from "@/components/ui/ModifyButton";
import Panel from "@/components/ui/Panel";
import PropTypes from "prop-types";

export default function OrganizationDetails({ organization, onEdit }) {
  if (!organization) return null;

  return (
    <Panel
      title={organization.name}
      actions={
        onEdit ? (
          <ModifyButton onModify={onEdit} modifyLabel="Modifier" size="sm" />
        ) : null
      }
    >
      <div className="space-y-4">
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
    </Panel>
  );
}

OrganizationDetails.propTypes = {
  organization: PropTypes.object.isRequired,
  onEdit: PropTypes.func,
};

OrganizationDetails.defaultProps = {
  onEdit: null,
};
