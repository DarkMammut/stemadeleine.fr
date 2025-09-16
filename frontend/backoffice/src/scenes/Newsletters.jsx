"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PlusIcon } from "@heroicons/react/24/outline";
import Title from "@/components/Title";
import Utilities from "@/components/Utilities";
import { useNewsletterOperations } from "@/hooks/useNewsletterOperations";
import ListContent from "@/components/ListContent";

export default function Newsletters() {
  const [newsletters, setNewsletters] = useState([]);
  const [loading, setLoading] = useState(true);

  const {
    getAllNewsletters,
    createNewsletter,
    updateNewsletterVisibility,
    deleteNewsletter,
  } = useNewsletterOperations();

  useEffect(() => {
    loadNewsletters();
  }, []);

  const loadNewsletters = async () => {
    try {
      setLoading(true);
      const data = await getAllNewsletters();
      setNewsletters(data);
    } catch (error) {
      console.error("Error loading newsletters:", error);
      alert("Erreur lors du chargement des newsletters");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewsletter = async () => {
    try {
      await createNewsletter({
        name: "Nouvelle Newsletter",
        title: "Nouvelle Newsletter",
        description: "Description de la newsletter",
        isVisible: false,
      });

      // Reload newsletters list
      await loadNewsletters();
      console.log("Newsletter created successfully");
    } catch (error) {
      console.error("Error creating newsletter:", error);
      alert("Erreur lors de la création de la newsletter");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">Chargement des newsletters...</div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-6xl mx-auto p-6 space-y-6"
    >
      <Title
        label="Gestion des Newsletters"
        apiUrl="/api/newsletters"
        data={newsletters}
      />

      <Utilities
        actions={[
          {
            icon: PlusIcon,
            label: "Nouvelle Newsletter",
            callback: handleCreateNewsletter,
          },
        ]}
      />

      <ListContent
        label="Newsletters"
        getAll={getAllNewsletters}
        updateVisibility={updateNewsletterVisibility}
        remove={deleteNewsletter}
        routePrefix="newsletters"
      />
    </motion.div>
  );
}
