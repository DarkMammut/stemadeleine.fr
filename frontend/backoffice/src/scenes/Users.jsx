"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FunnelIcon, PlusIcon } from "@heroicons/react/24/outline";
import SceneLayout from "@/components/ui/SceneLayout";
import Title from "@/components/ui/Title";
import Utilities from "@/components/Utilities";
import { useUserOperations } from "@/hooks/useUserOperations";
import CardList from "@/components/CardList";
import UserCard from "@/components/UserCard";
import { useAxiosClient } from "@/utils/axiosClient";
import Notification from "@/components/Notification";
import { useNotification } from "@/hooks/useNotification";

export default function Users() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdherentsOnly, setShowAdherentsOnly] = useState(false);

  const { getAllUsers, createUser } = useUserOperations();
  const axios = useAxiosClient();
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();

  useEffect(() => {
    loadUsers();
  }, [showAdherentsOnly]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers(showAdherentsOnly);
      setUsers(data);
    } catch (error) {
      console.error("Error loading users:", error);
      showError(
        "Erreur de chargement",
        "Impossible de charger les utilisateurs",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      await createUser({
        firstname: "Nouvel Utilisateur",
        lastname: "",
        email: "",
        phoneMobile: "",
        phoneLandline: "",
        newsletter: false,
        birthDate: null,
      });
      await loadUsers();
      showSuccess(
        "Utilisateur créé",
        "Un nouvel utilisateur a été créé avec succès",
      );
    } catch (error) {
      console.error("Error creating user:", error);
      showError("Erreur de création", "Impossible de créer l'utilisateur");
    }
  };

  const handleImportHelloAsso = async () => {
    try {
      await axios.post("/api/users/import");
      await loadUsers();
      showSuccess(
        "Import HelloAsso terminé",
        "Les données ont été importées avec succès",
      );
    } catch (error) {
      console.error("Erreur lors de l'import HelloAsso:", error);
      showError(
        "Erreur d'import",
        "Impossible d'importer les données HelloAsso",
      );
    }
  };

  const handleToggleAdherents = () => {
    setShowAdherentsOnly((prev) => !prev);
  };

  const handleUserClick = (user) => {
    router.push(`/users/${user.id}`);
  };

  if (loading) {
    return (
      <div className="text-center py-8">Chargement des utilisateurs...</div>
    );
  }

  return (
    <SceneLayout>
      <Title label="Adhérents" />

      <Utilities
        actions={[
          {
            icon: PlusIcon,
            label: "Nouvel Utilisateur",
            callback: handleCreateUser,
          },
          {
            variant: "refresh",
            label: "Actualiser HelloAsso",
            callback: handleImportHelloAsso,
            hoverExpand: true,
          },
          {
            icon: FunnelIcon,
            label: showAdherentsOnly ? "Filtre: Tous" : "Filtre: adhérents",
            callback: handleToggleAdherents,
            variant: "filter",
          },
        ]}
      />

      <CardList emptyMessage="Aucun utilisateur trouvé.">
        {users.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            onClick={() => handleUserClick(user)}
            showAdherentFlag={showAdherentsOnly}
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
