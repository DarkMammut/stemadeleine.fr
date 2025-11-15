"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Title from "@/components/ui/Title";
import ContactManager from "@/components/ContactManager";
import { useContactOperations } from "@/hooks/useContactOperations";
import { useContactsContext } from "@/contexts/ContactsContext";
import { buildContactBreadcrumbs } from "@/utils/breadcrumbs";
import Notification from "@/components/ui/Notification";
import { useNotification } from "@/hooks/useNotification";

export default function EditContact() {
  const { id } = useParams();
  const router = useRouter();
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allContacts, setAllContacts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const { getAllContacts, getContactById, markContactAsRead, deleteContact } =
    useContactOperations();
  const { refreshUnreadCount } = useContactsContext();
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();

  useEffect(() => {
    loadContactAndList();
  }, [id]);

  const loadContactAndList = async () => {
    setLoading(true);
    try {
      // Load all contacts to enable navigation
      const allContactsData = await getAllContacts();
      setAllContacts(allContactsData);

      // Find current contact index
      const index = allContactsData.findIndex((c) => c.id === id);
      setCurrentIndex(index);

      // Load current contact details
      const data = await getContactById(id);
      setContact(data);

      // Mark as read when viewing
      if (!data.isRead) {
        await markContactAsRead(id, true);
        setContact((prev) => ({ ...prev, isRead: true }));
        await refreshUnreadCount();
      }
    } catch (error) {
      console.error("Error loading contact:", error);
      showError("Erreur de chargement", "Impossible de charger le contact");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteContact(id);
      await refreshUnreadCount();
      showSuccess("Contact supprimé", "Le contact a été supprimé avec succès");
      setTimeout(() => router.push("/contacts"), 1000);
    } catch (error) {
      console.error("Error deleting contact:", error);
      showError("Erreur de suppression", "Impossible de supprimer le contact");
    }
  };

  const handleToggleRead = async () => {
    try {
      const newStatus = !contact.isRead;
      await markContactAsRead(id, newStatus);
      setContact((prev) => ({ ...prev, isRead: newStatus }));
      await refreshUnreadCount();
      showSuccess(
        `Contact marqué comme ${newStatus ? "lu" : "non lu"}`,
        "Le statut a été mis à jour",
      );
    } catch (error) {
      console.error("Error toggling read status:", error);
      showError("Erreur", "Impossible de modifier le statut du contact");
    }
  };

  const handlePrevious = async () => {
    if (currentIndex > 0) {
      const prevContact = allContacts[currentIndex - 1];
      router.push(`/contacts/${prevContact.id}`);
    }
  };

  const handleNext = async () => {
    if (currentIndex < allContacts.length - 1) {
      const nextContact = allContacts[currentIndex + 1];
      router.push(`/contacts/${nextContact.id}`);
    }
  };

  const getFullName = () => {
    if (!contact) return "";
    return (
      [contact.firstName, contact.lastName].filter(Boolean).join(" ") ||
      "Anonyme"
    );
  };

  const breadcrumbs = contact ? buildContactBreadcrumbs(contact) : [];

  return (
    <>
      <Title
        label={`Contact: ${getFullName()}`}
        showBreadcrumbs={!!contact}
        breadcrumbs={breadcrumbs}
      />

      <ContactManager
        contact={contact}
        loading={loading}
        onDelete={handleDelete}
        onToggleRead={handleToggleRead}
        onPrevious={handlePrevious}
        onNext={handleNext}
        hasPrevious={currentIndex > 0}
        hasNext={currentIndex < allContacts.length - 1}
      />

      <Notification
        show={notification.show}
        onClose={hideNotification}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </>
  );
}
