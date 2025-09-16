"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Utilities from "@/components/Utilities";
import Title from "@/components/Title";
import MyForm from "@/components/MyForm";
import MediaPicker from "@/components/MediaPicker";
import Switch from "@/components/ui/Switch";
import StatusTag from "@/components/ui/StatusTag";
import Button from "@/components/ui/Button";
import { useNewsletterOperations } from "@/hooks/useNewsletterOperations";
import NewsletterContentManager from "@/components/NewsletterContentManager";

export default function EditNewsletters({ newsletterId }) {
  const [newsletterData, setNewsletterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingVisibility, setSavingVisibility] = useState(false);
  const [error, setError] = useState(null);

  const {
    getNewsletter,
    updateNewsletter,
    updateNewsletterVisibility,
    setNewsletterMedia,
    removeNewsletterMedia,
    publishNewsletter,
  } = useNewsletterOperations();

  // Load newsletter data
  useEffect(() => {
    if (newsletterId) {
      loadNewsletter();
    }
  }, [newsletterId]);

  const loadNewsletter = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNewsletter(newsletterId);
      setNewsletterData(data);
    } catch (error) {
      console.error("Error loading newsletter:", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  // Form fields for newsletter editing
  const fields = [
    {
      name: "name",
      label: "Nom de la newsletter",
      type: "text",
      placeholder: "Entrez le nom de la newsletter",
      required: true,
      defaultValue: newsletterData?.name || "",
    },
    {
      name: "title",
      label: "Titre",
      type: "text",
      placeholder: "Entrez le titre",
      required: true,
      defaultValue: newsletterData?.title || "",
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Entrez une description",
      required: false,
      defaultValue: newsletterData?.description || "",
    },
  ];

  const handleFormChange = (name, value, allValues) => {
    setNewsletterData((prev) => ({ ...prev, ...allValues }));
  };

  const handleSubmit = async (values) => {
    try {
      setSaving(true);
      await updateNewsletter(newsletterId, {
        name: values.name,
        title: values.title,
        description: values.description,
      });
      await loadNewsletter(); // Reload to get updated data
      alert("Newsletter mise à jour !");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la sauvegarde de la newsletter");
    } finally {
      setSaving(false);
    }
  };

  const handleVisibilityChange = async (isVisible) => {
    try {
      setSavingVisibility(true);
      await updateNewsletterVisibility(newsletterId, isVisible);
      setNewsletterData((prev) => ({ ...prev, isVisible }));
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la mise à jour de la visibilité");
    } finally {
      setSavingVisibility(false);
    }
  };

  const handlePublish = async () => {
    if (
      !window.confirm("Êtes-vous sûr de vouloir publier cette newsletter ?")
    ) {
      return;
    }

    try {
      setSaving(true);
      await publishNewsletter(newsletterId);
      await loadNewsletter(); // Reload to get updated status
      alert("Newsletter publiée avec succès !");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la publication");
    } finally {
      setSaving(false);
    }
  };

  const attachToEntity = async (mediaId) => {
    try {
      await setNewsletterMedia(newsletterId, mediaId);
      await loadNewsletter(); // Reload to get updated media
    } catch (error) {
      console.error("Error setting newsletter media:", error);
      alert("Erreur lors de l'ajout du média");
    }
  };

  const removeMedia = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer le média ?")) {
      return;
    }

    try {
      await removeNewsletterMedia(newsletterId);
      await loadNewsletter(); // Reload to get updated data
    } catch (error) {
      console.error("Error removing newsletter media:", error);
      alert("Erreur lors de la suppression du média");
    }
  };

  if (loading) return <div className="text-center py-8">Chargement...</div>;
  if (error)
    return (
      <div className="text-center py-8 text-red-600">
        Erreur: {error.message || "Erreur lors du chargement"}
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-6xl mx-auto p-6 space-y-6"
    >
      <Title
        label="Édition de newsletter"
        apiUrl={`/api/newsletter-publications/${newsletterId}`}
        data={newsletterData}
      />

      <Utilities actions={[]} />

      {!newsletterData ? (
        <div className="text-center py-8 text-text-muted">
          Chargement des données...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Newsletter Status and Actions */}
          <div className="bg-surface border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-text mb-4">
              Statut de la newsletter
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <StatusTag status={newsletterData.status} />
                <span className="text-sm text-text-muted">
                  Créée le{" "}
                  {new Date(newsletterData.createdAt).toLocaleDateString()}
                </span>
                {newsletterData.publishedDate && (
                  <span className="text-sm text-text-muted">
                    Publiée le{" "}
                    {new Date(
                      newsletterData.publishedDate,
                    ).toLocaleDateString()}
                  </span>
                )}
              </div>
              {newsletterData.status === "DRAFT" && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handlePublish}
                  disabled={saving}
                >
                  Publier la newsletter
                </Button>
              )}
            </div>
          </div>

          {/* Newsletter Visibility */}
          <div className="bg-surface border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-text mb-4">
              Visibilité de la newsletter
            </h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <Switch
                checked={newsletterData?.isVisible || false}
                onChange={handleVisibilityChange}
                disabled={savingVisibility}
              />
              <span className="font-medium text-text">
                Newsletter visible sur le site
                {savingVisibility && (
                  <span className="text-text-muted ml-2">(Sauvegarde...)</span>
                )}
              </span>
            </label>
            <p className="text-sm text-text-muted mt-2">
              Cette option se sauvegarde automatiquement
            </p>
          </div>

          {/* Main Form */}
          <MyForm
            fields={fields}
            formValues={newsletterData}
            setFormValues={setNewsletterData}
            onSubmit={handleSubmit}
            onChange={handleFormChange}
            loading={saving}
            submitButtonLabel="Enregistrer la newsletter"
          />

          {/* Media Section */}
          <div className="bg-surface border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text">
                Média principal
              </h3>
              {newsletterData.media && (
                <Button variant="danger" size="sm" onClick={removeMedia}>
                  Supprimer le média
                </Button>
              )}
            </div>
            <MediaPicker
              mediaId={newsletterData?.media?.id}
              attachToEntity={attachToEntity}
              entityType="newsletter-publications"
              entityId={newsletterId}
            />
          </div>

          {/* Newsletter Content Editor */}
          <div className="bg-surface border border-border rounded-lg p-6">
            <NewsletterContentManager
              newsletterId={newsletterId}
              initialContents={newsletterData?.contents || []}
            />
          </div>

          {/* Newsletter Info */}
          <div className="bg-surface border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-text mb-4">
              Informations sur la newsletter
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-text">ID Newsletter:</span>
                <span className="text-text-muted ml-2">
                  {newsletterData.newsletterId}
                </span>
              </div>
              <div>
                <span className="font-medium text-text">Auteur:</span>
                <span className="text-text-muted ml-2">
                  {newsletterData.author
                    ? `${newsletterData.author.firstname} ${newsletterData.author.lastname}`
                    : "Non défini"}
                </span>
              </div>
              <div>
                <span className="font-medium text-text">
                  Dernière modification:
                </span>
                <span className="text-text-muted ml-2">
                  {new Date(newsletterData.updatedAt).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="font-medium text-text">Contenus:</span>
                <span className="text-text-muted ml-2">
                  {newsletterData.contents ? newsletterData.contents.length : 0}{" "}
                  contenu(s)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
