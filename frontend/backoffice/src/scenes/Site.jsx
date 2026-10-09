"use client";

import React, { useEffect, useState } from "react";
import SceneLayout from "@/components/ui/SceneLayout";
import Title from "@/components/ui/Title";
import MediaManager from "@/components/MediaManager";
import ColorInputWithPicker from "@/components/ui/ColorInputWithPicker";
import EditablePanel from "@/components/ui/EditablePanel";
import Notification from "@/components/ui/Notification";
import { useNotification } from "@/hooks/useNotification";
import { useAxiosClient } from "@/utils/axiosClient";
import { BuildingOffice2Icon } from "@heroicons/react/24/outline";
import { useTranslation } from "@/i18n/I18nContext";

export default function Site() {
  const axios = useAxiosClient();
  const { t } = useTranslation();
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
        accentColor: res.data.accentColor || "#B8973A",
        textColor: res.data.textColor || "#1A1208",
      });
    } catch (e) {
      showError(t("site.loadErrorTitle"), t("site.loadErrorMessage"));
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

      await loadOrganization();

      showSuccess(t("site.saveSuccessTitle"), t("site.saveSuccessMessage"));
    } catch (e) {
      showError(t("site.saveErrorTitle"), t("site.saveErrorMessage"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SceneLayout>
      <Title label={t("site.title")} />

      <div className="space-y-6">
        <MediaManager
          title={t("site.logoTitle")}
          content={{
            id: organization ? organization.id : null,
            medias: organization?.logo ? [organization.logo] : [],
          }}
          onMediaAdd={async (contentId, mediaId) => {
            if (!organization?.id) return;
            await axios.put(
              `/api/organizations/${organization.id}/logo?mediaId=${mediaId}`,
            );
            await loadOrganization();
          }}
          onMediaRemove={async () => {
            if (!organization?.id) return;
            await axios.delete(`/api/organizations/${organization.id}/media`);
            await loadOrganization();
          }}
          onMediaChanged={loadOrganization}
          maxMedias={1}
        />

        <MediaManager
          title={t("site.faviconTitle")}
          content={{
            id: organization ? organization.id : null,
            medias: organization?.favicon ? [organization.favicon] : [],
          }}
          onMediaAdd={async (contentId, mediaId) => {
            if (!organization?.id) return;
            await axios.put(
              `/api/organizations/${organization.id}/favicon?mediaId=${mediaId}`,
            );
            await loadOrganization();
          }}
          onMediaRemove={async () => {
            if (!organization?.id) return;
            await axios.delete(`/api/organizations/${organization.id}/favicon`);
            await loadOrganization();
          }}
          onMediaChanged={loadOrganization}
          maxMedias={1}
        />

        <EditablePanel
          title={t("site.descriptionPanelTitle")}
          icon={BuildingOffice2Icon}
          canEdit={true}
          initialValues={{
            description: originalOrganizationSettings.description || "",
          }}
          fields={[
            {
              name: "description",
              label: t("site.descriptionField"),
              type: "textarea",
              defaultValue: originalOrganizationSettings.description || "",
              required: false,
            },
          ]}
          onSubmit={async (vals) => {
            await handleSaveSetting("description")(vals.description);
          }}
          loading={loading || saving}
        >
          <div className="prose max-w-none">
            {organization?.description || t("site.noDescription")}
          </div>
        </EditablePanel>

        <div>
          <div className="space-y-4">
            <ColorInputWithPicker
              label={t("site.colors.primary")}
              initialValue={originalOrganizationSettings.primaryColor}
              onSave={handleSaveSetting("primaryColor")}
              onChange={() => {}}
              disabled={saving}
            />
            <ColorInputWithPicker
              label={t("site.colors.secondary")}
              initialValue={originalOrganizationSettings.secondaryColor}
              onSave={handleSaveSetting("secondaryColor")}
              onChange={() => {}}
              disabled={saving}
            />
            <ColorInputWithPicker
              label={t("site.colors.accent")}
              initialValue={originalOrganizationSettings.accentColor}
              onSave={handleSaveSetting("accentColor")}
              onChange={() => {}}
              disabled={saving}
            />
            <ColorInputWithPicker
              label={t("site.colors.text")}
              initialValue={originalOrganizationSettings.textColor}
              onSave={handleSaveSetting("textColor")}
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
