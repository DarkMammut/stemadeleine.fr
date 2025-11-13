"use client";

import React, { useEffect, useState } from "react";
import SceneLayout from "@/components/ui/SceneLayout";
import Title from "@/components/ui/Title";
import MediaManager from "@/components/MediaManager";
import ColorInputWithPicker from "@/components/ColorInputWithPicker";
import EditablePanel from "@/components/ui/EditablePanel";
import MyForm from "@/components/MyForm";
import Notification from "@/components/ui/Notification";
import { useNotification } from "@/hooks/useNotification";
import { useAxiosClient } from "@/utils/axiosClient";
import { BuildingOffice2Icon } from "@heroicons/react/24/outline";

export default function Site() {
  const axios = useAxiosClient();
  const { notification, showError, showSuccess, hideNotification } =
    useNotification();
  const [organization, setOrganization] = useState(null);
  const [originalOrganizationSettings, setOriginalOrganizationSettings] =
    useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrganization();
    return () => hideNotification();
  }, []);

  const loadOrganization = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/organizations`);
      setOrganization(res.data);
      setOriginalOrganizationSettings({
        description: res.data.description || "",
        primaryColor: res.data.primaryColor || "#1976d2",
        secondaryColor: res.data.secondaryColor || "#dc004e",
      });
    } catch (e) {
      showError("Erreur de chargement", "Impossible de charger l'organisation");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSetting = (key) => async (val) => {
    setSaving(true);
    try {
      await axios.patch(`/api/organizations/${organization.id}/settings`, {
        [key]: val,
      });

      const updated = { ...originalOrganizationSettings, [key]: val };
      setOriginalOrganizationSettings(updated);
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

  return (
    <SceneLayout>
      <Title label="Paramètres du site" />

      <div className="space-y-6">
        <MediaManager
          title="Logo de l'organisation"
          content={{
            id: organization.id,
            medias: organization.logo ? [organization.logo] : [],
          }}
          onMediaAdd={async (contentId, mediaId) => {
            await axios.put(
              `/api/organizations/${organization.id}/logo?mediaId=${mediaId}`,
            );
            await loadOrganization();
          }}
          onMediaRemove={async () => {
            await axios.delete(`/api/organizations/${organization.id}/media`);
            await loadOrganization();
          }}
          onMediaChanged={loadOrganization}
          maxMedias={1}
        />

        <EditablePanel
          title="Description"
          icon={BuildingOffice2Icon}
          canEdit={true}
          initialValues={{
            description: originalOrganizationSettings.description || "",
          }}
          fields={[
            {
              name: "description",
              label: "Description",
              type: "textarea",
              defaultValue: originalOrganizationSettings.description || "",
              required: false,
            },
          ]}
          onSubmit={async (vals) => {
            await handleSaveSetting("description")(vals.description);
          }}
          renderForm={({ initialValues, onCancel, onSubmit, loading }) => (
            <MyForm
              fields={[
                {
                  name: "description",
                  label: "Description",
                  type: "textarea",
                  defaultValue: initialValues.description || "",
                  required: false,
                },
              ]}
              initialValues={initialValues}
              onSubmit={(vals) => onSubmit(vals)}
              loading={loading || saving}
              submitButtonLabel="Enregistrer"
              onCancel={onCancel}
              cancelButtonLabel="Annuler"
            />
          )}
        >
          <div className="prose max-w-none">
            {organization.description || "Aucune description fournie."}
          </div>
        </EditablePanel>

        <div>
          <div className="space-y-4">
            <ColorInputWithPicker
              label="Couleur principale"
              initialValue={originalOrganizationSettings.primaryColor}
              onSave={handleSaveSetting("primaryColor")}
              onChange={() => {}}
              disabled={saving}
            />
            <ColorInputWithPicker
              label="Couleur secondaire"
              initialValue={originalOrganizationSettings.secondaryColor}
              onSave={handleSaveSetting("secondaryColor")}
              onChange={() => {}}
              disabled={saving}
            />
          </div>
        </div>
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
