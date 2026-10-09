"use client";

import React, { useEffect, useState } from "react";
import SceneLayout from "@/components/ui/SceneLayout";
import Title from "@/components/ui/Title";
import { useAxiosClient } from "@/utils/axiosClient";
import EditablePanel from "@/components/ui/EditablePanel";
import AddressManager from "@/components/AddressManager";
import Notification from "@/components/ui/Notification";
import { useNotification } from "@/hooks/useNotification";
import { BuildingOffice2Icon } from "@heroicons/react/24/outline";
import { useTranslation } from "@/i18n/I18nContext";

export default function Organization() {
  const axios = useAxiosClient();
  const { t } = useTranslation();
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadOrganization();
    return () => {
      hideNotification();
    };
  }, []);

  const loadOrganization = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/organizations`);
      setOrganization(res.data);
    } catch (e) {
      showError(t("organization.loadErrorTitle"), t("organization.loadErrorMessage"));
    } finally {
      setLoading(false);
    }
  };

  const computeInitialValues = (org) => {
    if (!org) return {};
    return {
      name: org.name || "",
      legalForm: org.legalInfo?.legalForm || "",
      siret: org.legalInfo?.siret || "",
      siren: org.legalInfo?.siren || "",
      vatNumber: org.legalInfo?.vatNumber || "",
      apeCode: org.legalInfo?.apeCode || "",
    };
  };

  const organizationFields = [
    {
      name: "name",
      label: t("organization.fields.name"),
      type: "text",
      required: true,
    },
    {
      name: "legalForm",
      label: t("organization.fields.legalForm"),
      type: "text",
      required: false,
    },
    {
      name: "siret",
      label: t("organization.fields.siret"),
      type: "text",
      required: false,
    },
    {
      name: "siren",
      label: t("organization.fields.siren"),
      type: "text",
      required: false,
    },
    {
      name: "vatNumber",
      label: t("organization.fields.vatNumber"),
      type: "text",
      required: false,
    },
    {
      name: "apeCode",
      label: t("organization.fields.apeCode"),
      type: "text",
      required: false,
    },
  ];

  const handleSave = async (formValues) => {
    setSaving(true);
    try {
      await axios.patch(`/api/organizations/${organization.id}/info`, {
        ...formValues,
      });
      await loadOrganization();
      showSuccess(
        t("organization.saveSuccessTitle"),
        t("organization.saveSuccessMessage"),
      );
    } catch (e) {
      showError(t("organization.saveErrorTitle"), t("organization.saveErrorMessage"));
      throw e;
    } finally {
      setSaving(false);
    }
  };

  return (
    <SceneLayout>
      <Title label={t("organization.title")} />

      <div className="space-y-6">
        <EditablePanel
          title={t("organization.panelTitle")}
          icon={BuildingOffice2Icon}
          canEdit={true}
          initialValues={computeInitialValues(organization)}
          fields={organizationFields}
          displayColumns={2}
          loading={loading || saving}
          onSubmit={handleSave}
        />

        <AddressManager
          label={t("organization.addressLabel")}
          addresses={
            organization && organization.address ? [organization.address] : []
          }
          ownerId={organization ? organization.id : null}
          ownerType="ORGANIZATION"
          refreshAddresses={loadOrganization}
          editable={true}
          newAddressName={t("organization.newAddressName")}
          maxAddresses={1}
        />
      </div>

      {notification.show && (
        <Notification
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={hideNotification}
        />
      )}
    </SceneLayout>
  );
}
