"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon } from "@heroicons/react/24/outline";
import SceneLayout from "@/components/ui/SceneLayout";
import Title from "@/components/ui/Title";
import Utilities from "@/components/Utilities";
import { useNewsPublicationOperations } from "@/hooks/useNewsPublicationOperations";
import CardList from "@/components/CardList";
import NewsCard from "@/components/NewsCard";
import Notification from "@/components/Notification";
import { useNotification } from "@/hooks/useNotification";

export default function News() {
  const router = useRouter();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  const { getAllNewsPublications, createNewsPublication } =
    useNewsPublicationOperations();
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      setLoading(true);
      const data = await getAllNewsPublications();
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
      // Dates par défaut : aujourd'hui pour startDate, dans 30 jours pour endDate
      const now = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);

      await createNewsPublication({
        name: "Nouvelle Actualité",
        title: "Nouvelle Actualité",
        description: "Description de l'actualité",
        isVisible: false,
        startDate: now.toISOString(),
        endDate: endDate.toISOString(),
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
    <SceneLayout>
      <Title label="Actualités" />

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
    </SceneLayout>
  );
}
