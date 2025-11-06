"use client";

import React from "react";
import Card from "@/components/ui/Card";
import {
  CheckBadgeIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

export default function UserCard({ user, onClick, showAdherentFlag = false }) {
  const getFullName = () => {
    return (
      [user.firstname, user.lastname].filter(Boolean).join(" ") ||
      "Utilisateur sans nom"
    );
  };

  const getPhone = () => {
    return user.phoneMobile || user.phoneLandline || null;
  };

  return (
    <Card onClick={onClick}>
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 mt-1">
          <UserCircleIcon className="h-6 w-6 text-gray-400" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-base font-medium text-gray-900">
              {getFullName()}
            </h3>
            {showAdherentFlag && user.isAdherent && (
              <CheckBadgeIcon
                className="h-5 w-5 text-green-600"
                title="Adhérent"
              />
            )}
          </div>

          <div className="space-y-1">
            {user.email && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <EnvelopeIcon className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
            )}

            {getPhone() && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <PhoneIcon className="h-4 w-4 flex-shrink-0" />
                <span>{getPhone()}</span>
              </div>
            )}

            {!user.email && !getPhone() && (
              <p className="text-sm text-gray-400 italic">
                Aucune information de contact
              </p>
            )}
          </div>

          {user.memberships && user.memberships.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {user.memberships.map((membership, idx) => (
                <span
                  key={idx}
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    membership.active
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {membership.active ? "Adhésion active" : "Adhésion expirée"}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
