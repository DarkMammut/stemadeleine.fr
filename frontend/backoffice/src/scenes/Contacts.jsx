"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowPathIcon, FunnelIcon } from "@heroicons/react/24/outline";
import Title from "@/components/Title";
import Utilities from "@/components/Utilities";
import { useContactOperations } from "@/hooks/useContactOperations";
import { useContactsContext } from "@/contexts/ContactsContext";
import CardList from "@/components/CardList";
import ContactCard from "@/components/ContactCard";

export default function Contacts() {
  const router = useRouter();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, unread, read

  const { getAllContacts, markContactAsRead } = useContactOperations();
  const { refreshUnreadCount } = useContactsContext();

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
      alert("Erreur lors du chargement des contacts");
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
      }
    }
    // Navigate to contact detail page
    router.push(`/contacts/${contact.id}`);
  };

  const handleRefresh = async () => {
    await loadContacts();
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto space-y-6"
    >
      <Title label="Contacts" />

      <Utilities
        actions={[
          {
            icon: ArrowPathIcon,
            label: "Actualiser",
            callback: handleRefresh,
          },
          {
            icon: FunnelIcon,
            label: `Filtre: ${getFilterLabel()}`,
            callback: toggleFilter,
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
    </motion.div>
  );
}
