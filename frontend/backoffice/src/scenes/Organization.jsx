"use client";

import React, { useEffect, useState } from "react";
import SceneLayout from "@/components/ui/SceneLayout";
import Title from "@/components/ui/Title";
import Tabs from "@/components/Tabs";
import MyForm from "@/components/MyForm";
import OrganizationDetails from "@/components/OrganizationDetails";
import AddressManager from "@/components/AddressManager";
import Notification from "@/components/Notification";
import { useNotification } from "@/hooks/useNotification";

export default function Organization() {
  const axios = useAxiosClient();
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();
  const [organization, setOrganization] = useState(null);
  const [organizationForm, setOrganizationForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

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
      setShowEditForm(false);
    } catch (e) {
      showError(
        "Erreur de modification",
        "Impossible de modifier l'organisation",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = () => setShowEditForm(true);
  const handleCancelEdit = () => setShowEditForm(false);

  if (loading) return <div>Chargement...</div>;

  const tabs = [
    {
      label: "Informations",
      content: (
        <div className="space-y-6">
          {showEditForm ? (
            <MyForm
              title="Informations de l'organisation"
              fields={organizationFields}
              initialValues={organizationForm}
              onSubmit={handleSave}
              onChange={handleChange}
              loading={saving}
              submitButtonLabel="Enregistrer les modifications"
              onCancel={handleCancelEdit}
              cancelButtonLabel="Annuler"
              successMessage="L'organisation a été mise à jour avec succès"
              errorMessage="Impossible d'enregistrer l'organisation"
            />
          ) : (
            <OrganizationDetails
              organization={organization}
              onEdit={handleEdit}
            />
          )}
        </div>
      ),
    },
    {
      label: "Adresse",
      content: (
        <div className="space-y-6">
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
      ),
    },
  ];

  return (
    <SceneLayout>
      <Title label="Organisation" />

      <Tabs tabs={tabs} defaultIndex={0} />

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
