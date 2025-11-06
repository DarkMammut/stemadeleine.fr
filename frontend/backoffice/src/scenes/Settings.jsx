import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAxiosClient } from "@/utils/axiosClient";
import Title from "@/components/Title";
import MyForm from "@/components/MyForm";
import DetailsOrganization from "@/components/DetailsOrganization";
import MediaPicker from "@/components/MediaPicker";
import AddressManager from "@/components/AddressManager";
import ColorInputWithPicker from "@/components/ColorInputWithPicker";
import InputWithActions from "@/components/InputWithActions";

export default function Settings() {
  const axios = useAxiosClient();
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
      alert("Erreur lors du chargement de l'organisation");
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
      defaultValue: organization?.name || "",
    },
    {
      name: "legalForm",
      label: "Forme juridique",
      type: "text",
      required: false,
      defaultValue: organization?.legalForm || "",
    },
    {
      name: "siret",
      label: "SIRET",
      type: "text",
      required: false,
      defaultValue: organization?.siret || "",
    },
    {
      name: "siren",
      label: "SIREN",
      type: "text",
      required: false,
      defaultValue: organization?.siren || "",
    },
    {
      name: "vatNumber",
      label: "Numéro de TVA",
      type: "text",
      required: false,
      defaultValue: organization?.vatNumber || "",
    },
    {
      name: "apeCode",
      label: "Code APE",
      type: "text",
      required: false,
      defaultValue: organization?.apeCode || "",
    },
  ];

  const handleChange = (nameOrEvent, value, allValues) => {
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
        description: organizationForm.description,
        primaryColor: organizationForm.primaryColor,
        secondaryColor: organizationForm.secondaryColor,
      });
      await loadOrganization();
      alert("Organisation modifiée");
      setShowEditForm(false);
    } catch (e) {
      alert("Erreur lors de la modification de l'organisation");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = () => setShowEditForm(true);

  const handleCancelEdit = () => setShowEditForm(false);

  const attachToEntity = async (mediaId) => {
    await axios.put(
      `/api/organizations/${organization.id}/logo?mediaId=${mediaId}`,
    );
    loadOrganization();
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
      await loadOrganization();
    } catch (e) {
      alert("Erreur lors de la modification");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto space-y-8"
    >
      <Title label="Modifier l'organisation" />

      {showEditForm ? (
        <div className="space-y-6">
          {/* Champs principaux */}
          <MyForm
            fields={organizationFields}
            initialValues={organizationForm}
            onSubmit={handleSave}
            onChange={handleChange}
            loading={saving}
            submitButtonLabel="Enregistrer les modifications"
            onCancel={handleCancelEdit}
            cancelButtonLabel="Annuler"
          />
        </div>
      ) : (
        <DetailsOrganization organization={organization} onEdit={handleEdit} />
      )}

      <div className="border-t border-gray-200 pt-8">
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

      {/* Sélection des couleurs primaires et secondaires */}
      <div className="border-t border-gray-200 pt-8 space-y-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Paramètres</h3>
        <MediaPicker
          mediaId={organization?.logo?.id}
          attachToEntity={attachToEntity}
          entityType="organizations"
          entityId={organization.id}
          label="Logo de l'organisation"
        />
        <InputWithActions
          label="Description"
          initialValue={originalOrganizationSettings.description || ""}
          value={organizationSettings.description || ""}
          onSave={handleSaveSetting("description")}
          onChange={handleChangeSetting("description")}
          disabled={saving}
          multiline={true}
        />
        <div className="bg-white shadow-xs outline outline-gray-900/5 sm:rounded-xl">
          <ColorInputWithPicker
            label="Couleur principale"
            initialValue={
              originalOrganizationSettings.primaryColor || "#1976d2"
            }
            value={organizationSettings.primaryColor || "#1976d2"}
            onSave={handleSaveSetting("primaryColor")}
            onChange={handleChangeSetting("primaryColor")}
            disabled={saving}
          />
          <ColorInputWithPicker
            label="Couleur secondaire"
            initialValue={
              originalOrganizationSettings.secondaryColor || "#dc004e"
            }
            value={organizationSettings.secondaryColor || "#dc004e"}
            onSave={handleSaveSetting("secondaryColor")}
            onChange={handleChangeSetting("secondaryColor")}
            disabled={saving}
          />
        </div>
      </div>
    </motion.div>
  );
}
