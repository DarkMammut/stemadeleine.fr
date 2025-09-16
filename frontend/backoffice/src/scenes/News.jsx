"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PlusIcon } from "@heroicons/react/24/outline";
import Title from "@/components/Title";
import Utilities from "@/components/Utilities";
import { useNewsOperations } from "@/hooks/useNewsOperations";
import ListContent from "@/components/ListContent";

export default function News() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  const { getAllNews, createNews, updateNewsVisibility, deleteNews } =
    useNewsOperations();

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      setLoading(true);
      const data = await getAllNews();
      setNews(data);
    } catch (error) {
      console.error("Error loading news:", error);
      alert("Erreur lors du chargement des news");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNews = async () => {
    try {
      await createNews({
        name: "Nouvelle News",
        title: "Nouvelle News",
        description: "Description de la news",
        isVisible: false,
      });

      // Reload newsletters list
      await loadNews();
      console.log("News created successfully");
    } catch (error) {
      console.error("Error creating news:", error);
      alert("Erreur lors de la création de la news");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Chargement des news...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-6xl mx-auto p-6 space-y-6"
    >
      <Title
        label="Gestion des News"
        apiUrl="/api/news-publications"
        data={news}
      />

      <Utilities
        actions={[
          {
            icon: PlusIcon,
            label: "Nouvelle News",
            callback: handleCreateNews,
          },
        ]}
      />

      <ListContent
        label="News"
        getAll={getAllNews}
        updateVisibility={updateNewsVisibility}
        remove={deleteNews}
        routePrefix="news"
      />
    </motion.div>
  );
}
