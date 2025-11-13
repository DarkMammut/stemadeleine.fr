"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowPathIcon, FunnelIcon } from "@heroicons/react/24/outline";
import SceneLayout from "@/components/ui/SceneLayout";
import Title from "@/components/ui/Title";
import Utilities from "@/components/Utilities";
import { useContactOperations } from "@/hooks/useContactOperations";
import { useContactsContext } from "@/contexts/ContactsContext";
import CardList from "@/components/CardList";
import ContactCard from "@/components/ContactCard";
import Notification from "@/components/ui/Notification";
import { useNotification } from "@/hooks/useNotification";

export default function Contacts() {
  const router = useRouter();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, unread, read

  const { getAllContacts, markContactAsRead } = useContactOperations();
  const { refreshUnreadCount } = useContactsContext();
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const data = await getAllContacts();
      setContacts(data);
      await refreshUnreadCount();
    } catch (error) {
      console.error("Error loading contacts:", error);
      showError("Erreur de chargement", "Impossible de charger les contacts");
    } finally {
      setLoading(false);
    }
  };

  const handleContactClick = async (contact) => {
    // Mark as read when clicked if not already read
    if (!contact.isRead) {
      try {
        await markContactAsRead(contact.id, true);
        // Update local state
        setContacts((prev) =>
          prev.map((c) => (c.id === contact.id ? { ...c, isRead: true } : c)),
        );
        // Refresh unread count in navbar
        await refreshUnreadCount();
      } catch (error) {
        console.error("Error marking contact as read:", error);
        showError("Erreur", "Impossible de marquer le contact comme lu");
      }
    }
    // Navigate to contact detail page
    router.push(`/contacts/${contact.id}`);
  };

  const handleRefresh = async () => {
    try {
      await loadContacts();
      showSuccess(
        "Actualisation réussie",
        "La liste des contacts a été mise à jour",
      );
    } catch (error) {
      // Error already handled in loadContacts
    }
  };

  const toggleFilter = () => {
    if (filter === "all") setFilter("unread");
    else if (filter === "unread") setFilter("read");
    else setFilter("all");
  };

  const getFilterLabel = () => {
    if (filter === "unread") return "Non lus";
    if (filter === "read") return "Lus";
    return "Tous";
  };

  const filteredContacts = contacts.filter((contact) => {
    if (filter === "unread") return !contact.isRead;
    if (filter === "read") return contact.isRead;
    return true;
  });

  if (loading) {
    return <div className="text-center py-8">Chargement des contacts...</div>;
  }

  return (
    <SceneLayout>
      <Title label="Demandes" />

      <Utilities
        actions={[
          {
            icon: ArrowPathIcon,
            label: "Actualiser",
            callback: handleRefresh,
            variant: "refresh",
          },
          {
            icon: FunnelIcon,
            label: `Filtre: ${getFilterLabel()}`,
            callback: toggleFilter,
            variant: "filter",
          },
        ]}
      />

      <CardList emptyMessage="Aucun contact trouvé.">
        {filteredContacts.map((contact) => (
          <ContactCard
            key={contact.id}
            contact={contact}
            onClick={() => handleContactClick(contact)}
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
