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
import Notification from "@/components/ui/Notification";
import { useNotification } from "@/hooks/useNotification";
import Pagination from "@/components/ui/Pagination";

export default function Users() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showAdherentsOnly, setShowAdherentsOnly] = useState(false);

  const { getAllUsers, createUser } = useUserOperations();
  const axios = useAxiosClient();
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();

  useEffect(() => {
    // when toggling the filter, always reset to first page and load it
    setPageInfo((p) => ({ ...p, page: 0 }));
    loadUsers(0, pageInfo.size);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAdherentsOnly]);

  const loadUsers = async (page = 0, size = pageInfo.size) => {
    try {
      setLoading(true);
      const data = await getAllUsers(showAdherentsOnly, page, size);
      setUsers(data.content || []);
      setPageInfo((p) => ({
        ...p,
        page: data.number || 0,
        totalPages: data.totalPages || 0,
        size: data.size || size,
        totalElements:
          typeof data.totalElements === "number"
            ? data.totalElements
            : p.totalElements,
      }));
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
            // label reflects current filter state
            label: showAdherentsOnly ? "Adhérents" : "Tous",
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

      <Pagination
        page={pageInfo.page}
        totalPages={pageInfo.totalPages}
        pageSize={pageInfo.size}
        totalElements={
          typeof pageInfo.totalElements === "number"
            ? pageInfo.totalElements
            : undefined
        }
        onChange={(p) => loadUsers(p, pageInfo.size)}
        onPageSizeChange={(newSize) => {
          // reset to first page when page size changes
          setPageInfo((p) => ({ ...p, size: newSize, page: 0 }));
          loadUsers(0, newSize);
        }}
      />

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
