"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Title from "@/components/Title";
import Utilities from "@/components/Utilities";
import NavigationButtons from "@/components/NavigationButtons";
import { useContactOperations } from "@/hooks/useContactOperations";
import { useContactsContext } from "@/contexts/ContactsContext";

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
      alert("Erreur lors du chargement du contact");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce contact ?")) {
      try {
        await deleteContact(id);
        await refreshUnreadCount();
        alert("Contact supprimé");
        router.push("/contacts");
      } catch (error) {
        console.error("Error deleting contact:", error);
        alert("Erreur lors de la suppression du contact");
      }
    }
  };

  const handleToggleRead = async () => {
    try {
      const newStatus = !contact.isRead;
      await markContactAsRead(id, newStatus);
      setContact((prev) => ({ ...prev, isRead: newStatus }));
      await refreshUnreadCount();
    } catch (error) {
      console.error("Error toggling read status:", error);
      alert("Erreur lors de la modification du statut");
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

  const formatDate = (date) => {
    if (!date) return "Non renseignée";
    return new Date(date).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFullName = () => {
    if (!contact) return "";
    return (
      [contact.firstName, contact.lastName].filter(Boolean).join(" ") ||
      "Anonyme"
    );
  };

  if (loading) {
    return <div className="text-center py-8">Chargement du contact...</div>;
  }

  if (!contact) {
    return <div className="text-center py-8">Contact non trouvé</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto space-y-6"
    >
      <Title
        label={`Contact: ${getFullName()}`}
        showBackButton={true}
        backTo="/contacts"
      />

      <Utilities
        actions={[
          {
            icon: contact.isRead ? XMarkIcon : CheckIcon,
            label: contact.isRead ? "Marquer non lu" : "Marquer lu",
            callback: handleToggleRead,
          },
          {
            icon: TrashIcon,
            label: "Supprimer",
            callback: handleDelete,
            variant: "danger",
          },
        ]}
      />

      <div className="bg-white shadow-sm sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {/* Status badge */}
          <div className="mb-6">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                contact.isRead
                  ? "bg-gray-100 text-gray-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {contact.isRead ? "Lu" : "Non lu"}
            </span>
          </div>

          {/* Contact info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom complet
              </label>
              <p className="text-base text-gray-900">{getFullName()}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <p className="text-base text-gray-900">
                <a
                  href={`mailto:${contact.email}`}
                  className="text-blue-600 hover:underline"
                >
                  {contact.email}
                </a>
              </p>
            </div>

            {contact.subject && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sujet
                </label>
                <p className="text-base text-gray-900">{contact.subject}</p>
              </div>
            )}

            {contact.message && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <div className="bg-gray-50 rounded-md p-4">
                  <p className="text-base text-gray-900 whitespace-pre-wrap">
                    {contact.message}
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de réception
              </label>
              <p className="text-base text-gray-900">
                {formatDate(contact.createdAt)}
              </p>
            </div>

            {contact.user && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Utilisateur lié
                </label>
                <div className="inline-flex items-center px-3 py-2 rounded-md bg-green-50 border border-green-200">
                  <p className="text-sm text-green-900">
                    {contact.user.firstname} {contact.user.lastname} (
                    {contact.user.email})
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Buttons at bottom */}
        <NavigationButtons
          onPrevious={handlePrevious}
          onNext={handleNext}
          hasPrevious={currentIndex > 0}
          hasNext={currentIndex < allContacts.length - 1}
        />
      </div>
    </motion.div>
  );
}
