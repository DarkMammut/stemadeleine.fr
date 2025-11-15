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

export default function Organization() {
  const axios = useAxiosClient();
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
      showError("Erreur de chargement", "Impossible de charger l'organisation");
    } finally {
      setLoading(false);
    }
  };

  // Helper to compute flat initialValues for forms from the organization object
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
      label: "Nom de l'organisation",
      type: "text",
      required: true,
    },
    {
      name: "legalForm",
      label: "Forme juridique",
      type: "text",
      required: false,
    },
    {
      name: "siret",
      label: "SIRET",
      type: "text",
      required: false,
    },
    {
      name: "siren",
      label: "SIREN",
      type: "text",
      required: false,
    },
    {
      name: "vatNumber",
      label: "Numéro de TVA",
      type: "text",
      required: false,
    },
    {
      name: "apeCode",
      label: "Code APE",
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
        "Organisation modifiée",
        "Les informations ont été mises à jour avec succès",
      );
    } catch (e) {
      showError(
        "Erreur de modification",
        "Impossible de modifier l'organisation",
      );
      throw e;
    } finally {
      setSaving(false);
    }
  };

  // Ne pas rendre tôt pendant le chargement : laisser EditablePanel afficher les skeletons via la prop `loading`.

  return (
    <SceneLayout>
      <Title label="Organisation" />

      <div className="space-y-6">
        {/* Informations */}
        <EditablePanel
          title="Informations de l'organisation"
          icon={BuildingOffice2Icon}
          canEdit={true}
          initialValues={computeInitialValues(organization)}
          fields={organizationFields}
          displayColumns={2}
          loading={loading || saving}
          onSubmit={handleSave}
        />

        {/* Adresse du siège social */}
        <AddressManager
          label="Adresse du siège social"
          addresses={
            organization && organization.address ? [organization.address] : []
          }
          ownerId={organization ? organization.id : null}
          ownerType="ORGANIZATION"
          refreshAddresses={loadOrganization}
          editable={true}
          newAddressName={"Siège social"}
          maxAddresses={1}
        />
      </div>

      {/* Notification */}
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
