"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PlusIcon } from "@heroicons/react/24/outline";
import Title from "@/components/Title";
import Utilities from "@/components/Utilities";
import { useNewsOperations } from "@/hooks/useNewsOperations";
import CardList from "@/components/CardList";
import NewsCard from "@/components/NewsCard";
import Notification from "@/components/Notification";
import { useNotification } from "@/hooks/useNotification";

export default function News() {
  const router = useRouter();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  const { getAllNews, createNews } = useNewsOperations();
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();

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
      showError("Erreur de chargement", "Impossible de charger les actualités");
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
      await loadNews();
      showSuccess(
        "Actualité créée",
        "Une nouvelle actualité a été créée avec succès",
      );
    } catch (error) {
      console.error("Error creating news:", error);
      showError("Erreur de création", "Impossible de créer l'actualité");
    }
  };

  const handleNewsClick = (newsItem) => {
    router.push(`/news/${newsItem.id}`);
  };

  if (loading) {
    return <div className="text-center py-8">Chargement des news...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto space-y-6"
    >
      <Title label="Gestion des News" />

      <Utilities
        actions={[
          {
            icon: PlusIcon,
            label: "Nouvelle News",
            callback: handleCreateNews,
          },
        ]}
      />

      <CardList emptyMessage="Aucune news trouvée.">
        {news.map((newsItem) => (
          <NewsCard
            key={newsItem.id}
            news={newsItem}
            onClick={() => handleNewsClick(newsItem)}
          />
        ))}
      </CardList>

      <Notification
        show={notification.show}
        onClose={hideNotification}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </motion.div>
  );
}
