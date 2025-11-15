"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Icons
import { PlusIcon } from "@heroicons/react/24/outline";

// Hooks (business)
import { useNewsletterPublicationOperations } from "@/hooks/useNewsletterPublicationOperations";
import { useNotification } from "@/hooks/useNotification";

// UI / Components
import SceneLayout from "@/components/ui/SceneLayout";
import Title from "@/components/ui/Title";
import Utilities from "@/components/ui/Utilities";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import CardList from "@/components/ui/CardList";
import NewsletterCard from "@/components/NewsletterCard";
import Notification from "@/components/ui/Notification";

export default function Newsletters() {
  const router = useRouter();
  const [newsletters, setNewsletters] = useState([]);
  const [loading, setLoading] = useState(true);

  const { getAllNewsletterPublications, createNewsletterPublication } =
    useNewsletterPublicationOperations();
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();

  useEffect(() => {
    loadNewsletters();
  }, []);

  const loadNewsletters = async () => {
    try {
      setLoading(true);
      const data = await getAllNewsletterPublications();
      setNewsletters(data);
    } catch (error) {
      console.error("Error loading newsletters:", error);
      showError(
        "Erreur de chargement",
        "Impossible de charger les newsletters",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewsletter = async () => {
    try {
      await createNewsletterPublication({
        name: "Nouvelle Newsletter",
        title: "Nouvelle Newsletter",
        description: "Description de la newsletter",
        isVisible: false,
      });
      await loadNewsletters();
      showSuccess(
        "Newsletter créée",
        "Une nouvelle newsletter a été créée avec succès",
      );
    } catch (error) {
      console.error("Error creating newsletter:", error);
      showError("Erreur de création", "Impossible de créer la newsletter");
    }
  };

  const handleNewsletterClick = (newsletter) => {
    router.push(`/newsletters/${newsletter.id}`);
  };

  const isLoading = loading;

  return (
    <SceneLayout>
      <Title label="Newsletters" />

      <Utilities
        actions={[
          {
            icon: PlusIcon,
            label: "Nouvelle Newsletter",
            callback: handleCreateNewsletter,
            disabled: isLoading,
          },
        ]}
      />

      {isLoading ? (
        <div className="mt-4">
          <LoadingSkeleton variant="card" count={6} showActions={true} />
        </div>
      ) : (
        <CardList emptyMessage="Aucune newsletter trouvée.">
          {newsletters.map((newsletter) => (
            <NewsletterCard
              key={newsletter.id}
              newsletter={newsletter}
              onClick={() => handleNewsletterClick(newsletter)}
            />
          ))}
        </CardList>
      )}

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
