"use client";

import React, { useEffect, useState } from "react";
import SceneLayout from "@/components/ui/SceneLayout";
import Title from "@/components/ui/Title";
import { useAxiosClient } from "@/utils/axiosClient";
import MyForm from "@/components/MyForm";
import OrganizationDetails from "@/components/OrganizationDetails";
import AddressManager from "@/components/AddressManager";
import Notification from "@/components/ui/Notification";
import { useNotification } from "@/hooks/useNotification";
import EditablePanel from "@/components/ui/EditablePanel";
import { BuildingOffice2Icon } from "@heroicons/react/24/outline";

export default function Organization() {
  const axios = useAxiosClient();
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();
  const [organization, setOrganization] = useState(null);
  const [organizationForm, setOrganizationForm] = useState({});
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
      setOrganizationForm({
        name: res.data.name || "",
        legalForm: res.data.legalInfo?.legalForm || "",
        siret: res.data.legalInfo?.siret || "",
        siren: res.data.legalInfo?.siren || "",
        vatNumber: res.data.legalInfo?.vatNumber || "",
        apeCode: res.data.legalInfo?.apeCode || "",
      });
    } catch (e) {
      showError("Erreur de chargement", "Impossible de charger l'organisation");
    } finally {
      setLoading(false);
    }
  };

  const organizationFields = [
    {
      name: "name",
      label: "Nom de l'organisation",
      type: "text",
      required: false,
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

  const handleChange = (nameOrEvent, value) => {
    if (nameOrEvent && nameOrEvent.target) {
      const { name, value: val, type, checked } = nameOrEvent.target;
      setOrganizationForm((f) => ({
        ...f,
        [name]: type === "checkbox" ? checked : val,
      }));
    } else if (typeof nameOrEvent === "string") {
      setOrganizationForm((f) => ({
        ...f,
        [nameOrEvent]: value,
      }));
    }
  };

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

  if (loading) return <div>Chargement...</div>;

  return (
    <SceneLayout>
      <Title label="Organisation" />

      <div className="space-y-6">
        {/* Informations */}
        <EditablePanel
          title="Informations de l'organisation"
          icon={BuildingOffice2Icon}
          canEdit={true}
          initialValues={{ ...organizationForm }}
          fields={organizationFields.map((f) => ({
            ...f,
            defaultValue: organizationForm[f.name],
          }))}
          displayColumns={2}
          onSubmit={handleSave}
          renderForm={({ initialValues, onCancel, onSubmit, loading }) => (
            <MyForm
              title="Informations de l'organisation"
              fields={organizationFields.map((f) => ({
                ...f,
                defaultValue: initialValues[f.name],
              }))}
              initialValues={initialValues}
              onSubmit={onSubmit}
              onChange={handleChange}
              loading={loading || saving}
              submitButtonLabel="Enregistrer les modifications"
              onCancel={onCancel}
              cancelButtonLabel="Annuler"
              successMessage="L'organisation a été mise à jour avec succès"
              errorMessage="Impossible d'enregistrer l'organisation"
            />
          )}
        >
          <OrganizationDetails organization={organization} />
        </EditablePanel>

        {/* Adresse du siège social */}
        <AddressManager
          label="Adresse du siège social"
          addresses={organization.address ? [organization.address] : []}
          ownerId={organization.id}
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
