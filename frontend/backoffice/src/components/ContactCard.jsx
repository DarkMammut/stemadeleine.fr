"use client";

import React from "react";
import Card from "@/components/Card";
import { EnvelopeIcon, EnvelopeOpenIcon } from "@heroicons/react/24/outline";

export default function ContactCard({ contact, onClick }) {
  const getFullName = () => {
    return (
      [contact.firstName, contact.lastName].filter(Boolean).join(" ") ||
      "Anonyme"
    );
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

  return (
    <Card onClick={onClick} className={contact.isRead ? "" : "bg-blue-50"}>
      <div className="flex items-start gap-4">
        {/* Read/Unread indicator icon */}
        <div className="flex-shrink-0 mt-1">
          {contact.isRead ? (
            <EnvelopeOpenIcon className="h-6 w-6 text-gray-400" />
          ) : (
            <EnvelopeIcon className="h-6 w-6 text-blue-600" />
          )}
        </div>

        {/* Contact content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3
              className={`text-base font-medium ${contact.isRead ? "text-gray-900" : "text-gray-900 font-semibold"}`}
            >
              {getFullName()}
            </h3>
            <span className="text-sm text-gray-500">
              {formatDate(contact.createdAt)}
            </span>
          </div>

          <div className="mb-1">
            <p className="text-sm text-gray-600">{contact.email}</p>
          </div>

          {contact.subject && (
            <div className="mb-2">
              <p
                className={`text-sm ${contact.isRead ? "text-gray-700" : "text-gray-900 font-medium"}`}
              >
                {contact.subject}
              </p>
            </div>
          )}

          {contact.message && (
            <div>
              <p className="text-sm text-gray-500 line-clamp-2">
                {contact.message}
              </p>
            </div>
          )}

          {contact.user && (
            <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Lié à l'utilisateur: {contact.user.firstname}{" "}
              {contact.user.lastname}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
