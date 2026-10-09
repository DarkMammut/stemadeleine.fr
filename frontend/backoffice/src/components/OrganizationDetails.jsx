"use client";

import React from "react";
import ModifyButton from "@/components/ui/ModifyButton";
import Panel from "@/components/ui/Panel";
import PropTypes from "prop-types";
import { useTranslation } from "@/i18n/I18nContext";

export default function OrganizationDetails({ organization, onEdit }) {
  const { t } = useTranslation();

  if (!organization) return null;

  return (
    <Panel
      title={organization.name}
      actions={
        onEdit ? (
          <ModifyButton
            onModify={onEdit}
            modifyLabel={t("organizationDetails.modify")}
            size="sm"
          />
        ) : null
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-[140px_1fr] gap-4">
          <span className="text-sm font-semibold text-gray-500">
            {t("organizationDetails.legalForm")}
          </span>
          <span className="text-sm text-gray-900">
            {organization.legalInfo?.legalForm || "-"}
          </span>
        </div>

        <div className="grid grid-cols-[140px_1fr] gap-4">
          <span className="text-sm font-semibold text-gray-500">
            {t("organizationDetails.siret")}
          </span>
          <span className="text-sm text-gray-900">
            {organization.legalInfo?.siret || "-"}
          </span>
        </div>

        <div className="grid grid-cols-[140px_1fr] gap-4">
          <span className="text-sm font-semibold text-gray-500">
            {t("organizationDetails.siren")}
          </span>
          <span className="text-sm text-gray-900">
            {organization.legalInfo?.siren || "-"}
          </span>
        </div>

        <div className="grid grid-cols-[140px_1fr] gap-4">
          <span className="text-sm font-semibold text-gray-500">
            {t("organizationDetails.vatNumber")}
          </span>
          <span className="text-sm text-gray-900">
            {organization.legalInfo?.vatNumber || "-"}
          </span>
        </div>

        <div className="grid grid-cols-[140px_1fr] gap-4">
          <span className="text-sm font-semibold text-gray-500">
            {t("organizationDetails.apeCode")}
          </span>
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
