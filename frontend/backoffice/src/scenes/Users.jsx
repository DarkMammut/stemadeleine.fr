"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowPathIcon, PlusIcon } from "@heroicons/react/24/outline";
import Title from "@/components/Title";
import Utilities from "@/components/Utilities";
import { useUserOperations } from "@/hooks/useUserOperations";
import ListUsers from "@/components/ListUsers";
import { useAxiosClient } from "@/utils/axiosClient";

export default function Users() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdherentsOnly, setShowAdherentsOnly] = useState(false);

  const { getAllUsers, createUser, deleteUser } = useUserOperations();
  const axios = useAxiosClient();

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
      alert("Erreur lors du chargement des utilisateurs");
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
      console.log("User created successfully");
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Erreur lors de la création de l'utilisateur");
    }
  };

  const handleDeleteUser = async (user) => {
    try {
      await deleteUser(user.id);
      await loadUsers();
      console.log("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Erreur lors de la suppression de l'utilisateur");
    }
  };

  const handleEditUser = (user) => {
    router.push(`/users/${user.id}`);
  };

  const handleImportHelloAsso = async () => {
    try {
      await axios.post("/api/helloasso/import");
      await loadUsers();
      alert("Import HelloAsso terminé avec succès.");
    } catch (error) {
      console.error("Erreur lors de l'import HelloAsso:", error);
      alert("Erreur lors de l'import HelloAsso");
    }
  };

  const handleToggleAdherents = () => {
    setShowAdherentsOnly((prev) => !prev);
  };

  if (loading) {
    return (
      <div className="text-center py-8">Chargement des utilisateurs...</div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-6xl mx-auto p-6 space-y-6"
    >
      <Title label="Gestion des Utilisateurs" />

      <Utilities
        actions={[
          {
            icon: PlusIcon,
            label: "Nouvel Utilisateur",
            callback: handleCreateUser,
          },
          {
            icon: ArrowPathIcon,
            label: "Actualiser HelloAsso",
            callback: handleImportHelloAsso,
          },
          {
            icon: null,
            label: showAdherentsOnly ? "Afficher tous" : "Afficher adhérents",
            callback: handleToggleAdherents,
          },
        ]}
      />

      <ListUsers
        users={users}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        showAdherentFlag={true}
      />
    </motion.div>
  );
}
