"use client";

import React, { useEffect, useState } from "react";
import SceneLayout from "@/components/ui/SceneLayout";
import Title from "@/components/ui/Title";
import Tabs from "@/components/Tabs";

import MyForm from "@/components/MyForm";
import OrganizationDetails from "@/components/OrganizationDetails";
import AddressManager from "@/components/AddressManager";
import MediaManager from "@/components/MediaManager";
import ColorInputWithPicker from "@/components/ColorInputWithPicker";
import InputWithActions from "@/components/InputWithActions";
import Notification from "@/components/Notification";
import { useNotification } from "@/hooks/useNotification";
import { useAxiosClient } from "@/utils/axiosClient";

export default function Settings() {
  const axios = useAxiosClient();
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();
  const [organization, setOrganization] = useState(null);
  const [organizationForm, setOrganizationForm] = useState({});
  const [organizationSettings, setOrganizationSettings] = useState({});
  const [originalOrganizationSettings, setOriginalOrganizationSettings] =
    useState({});
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
      const settings = {
        slug: res.data.slug || "",
        description: res.data.description || "",
        primaryColor: res.data.primaryColor || "#1976d2",
        secondaryColor: res.data.secondaryColor || "#dc004e",
      };
      setOrganizationSettings(settings);
      setOriginalOrganizationSettings(settings);
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

  // Fonctions pour MediaManager (logo)
  const handleLogoAdd = async (contentId, mediaId) => {
    await axios.put(
      `/api/organizations/${organization.id}/logo?mediaId=${mediaId}`,
    );
    await loadOrganization();
  };

  const handleLogoRemove = async (contentId, mediaId) => {
    await axios.delete(`/api/organizations/${organization.id}/media`);
    await loadOrganization();
  };

  // Créer un objet "content" pour MediaManager à partir du logo
  const logoContent = {
    id: organization?.id,
    medias: organization?.logo ? [organization.logo] : [],
  };

  // Handlers génériques pour settings
  const handleChangeSetting = (key) => (val) => {
    setOrganizationSettings((f) => ({ ...f, [key]: val }));
  };

  const handleSaveSetting = (key) => async (val) => {
    setSaving(true);
    try {
      await axios.patch(`/api/organizations/${organization.id}/settings`, {
        [key]: val,
      });

      // Mettre à jour seulement les données nécessaires sans refresh complet
      const updatedSettings = { ...originalOrganizationSettings, [key]: val };
      setOriginalOrganizationSettings(updatedSettings);
      setOrganizationSettings(updatedSettings);

      // Mettre à jour l'organisation avec la nouvelle valeur
      setOrganization((prev) => ({ ...prev, [key]: val }));

      showSuccess("Paramètre modifié", "La modification a été enregistrée");
    } catch (e) {
      showError(
        "Erreur de modification",
        "Impossible de modifier le paramètre",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Chargement...</div>;

  const tabs = [
    {
      label: "Organisation",
      content: (
        <div className="space-y-6">
          {/* Informations de l'organisation */}
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
      ),
    },
    {
      label: "Paramètres du site",
      content: (
        <div className="space-y-6">
          <MediaManager
            title="Logo de l'organisation"
            content={logoContent}
            onMediaAdd={handleLogoAdd}
            onMediaRemove={handleLogoRemove}
            onMediaChanged={loadOrganization}
            maxMedias={1}
          />

          <InputWithActions
            title="Description de l'organisation"
            label="Description"
            initialValue={originalOrganizationSettings.description || ""}
            onSave={handleSaveSetting("description")}
            onChange={handleChangeSetting("description")}
            disabled={saving}
            multiline={true}
            showSaveButton={false}
            showCancelButton={false}
            successMessage="Description mise à jour"
            errorMessage="Erreur lors de la mise à jour de la description"
          />

          <div className="bg-white shadow-xs outline outline-gray-900/5 sm:rounded-xl">
            <div className="px-4 py-6 sm:px-8 sm:pt-8 sm:pb-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Thème et couleurs
              </h3>
            </div>
            <ColorInputWithPicker
              label="Couleur principale"
              initialValue={
                originalOrganizationSettings.primaryColor || "#1976d2"
              }
              onSave={handleSaveSetting("primaryColor")}
              onChange={handleChangeSetting("primaryColor")}
              disabled={saving}
              loading={saving}
              showSaveButton={false}
              showCancelButton={false}
              successMessage="Couleur principale mise à jour"
              errorMessage="Erreur lors de la mise à jour de la couleur principale"
            />
            <ColorInputWithPicker
              label="Couleur secondaire"
              initialValue={
                originalOrganizationSettings.secondaryColor || "#dc004e"
              }
              onSave={handleSaveSetting("secondaryColor")}
              onChange={handleChangeSetting("secondaryColor")}
              disabled={saving}
              loading={saving}
              showSaveButton={false}
              showCancelButton={false}
              successMessage="Couleur secondaire mise à jour"
              errorMessage="Erreur lors de la mise à jour de la couleur secondaire"
            />
          </div>
        </div>
      ),
    },
  ];

  return (
    <SceneLayout>
      <Title label="Paramètres" />

      {/* Tabs avec persistance automatique */}
      <Tabs tabs={tabs} defaultIndex={0} persistKey="settings-active-tab" />

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
