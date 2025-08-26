"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAxiosClient } from "@/utils/axiosClient";
import PagesTabs from "@/components/PagesTabs";
import Utilities from "@/components/Utilities";
import Title from "@/components/Title";
import useGetPage from "@/hooks/useGetPage";
import MyForm from "@/components/MyForm";
import MediaPicker from "@/components/MediaPicker";
import generateSlug from "@/utils/generateSlug";

export default function EditPage({ pageId }) {
  const { page, refetch, loading, error } = useGetPage({ route: pageId });
  const [pageData, setPageData] = useState(null);
  const [saving, setSaving] = useState(false);
  const axios = useAxiosClient();

  useEffect(() => {
    if (page) setPageData(page);
  }, [page]);

  const fields = [
    {
      name: "name",
      label: "Nom de la page",
      type: "text",
      placeholder: "Entrez le nom de page",
      required: true,
      defaultValue: pageData?.name || "",
    },
    {
      name: "title",
      label: "Titre",
      type: "text",
      placeholder: "Entrez le titre",
      required: true,
      defaultValue: pageData?.title || "",
    },
    {
      name: "sub_title",
      label: "Sous-titre",
      type: "text",
      placeholder: "Entrez le sous-titre",
      required: true,
      defaultValue: pageData?.subTitle || "",
    },
    {
      name: "slug",
      label: "Slug",
      type: "readonly",
      placeholder: "Entrez-le slug",
      required: true,
      defaultValue: pageData?.slug || "",
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Entrez une description",
      required: false,
      defaultValue: pageData?.description || "",
    },
  ];

  const attachToEntity = async (mediaId) => {
    await axios.put(`/api/pages/${pageId}/hero-media`, {
      heroMediaId: mediaId,
    });
  };

  const handleFormChange = (name, value, allValues) => {
    if (name === "name") {
      const newSlug = generateSlug(page?.parentPage?.slug, value);
      setPageData((prev) => ({ ...prev, slug: newSlug }));
    }
  };

  const handleSubmit = async (values) => {
    try {
      setSaving(true);
      const response = await fetch(`/api/pages/draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          pageId,
        }),
      });
      setSaving(false);
      if (!response.ok) throw new Error("Erreur lors de la mise à jour");
      refetch();
      alert("Page mise à jour !");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la sauvegarde de la page");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full p-10"
    >
      <Title
        label="Gestion des pages"
        apiUrl={`/api/pages/${pageId}`}
        data={page}
      />

      <PagesTabs pageId={pageId} />

      <Utilities actions={[]} />
      {!pageData ? (
        <div>Chargement des données ...</div>
      ) : (
        <MyForm
          fields={fields}
          formValues={pageData}
          setFormValues={setPageData}
          onSubmit={handleSubmit}
          onChange={handleFormChange}
          loading={saving}
        />
      )}

      <MediaPicker
        mediaId={page?.heroMedia?.id}
        attachToEntity={attachToEntity}
      />
    </motion.div>
  );
}
