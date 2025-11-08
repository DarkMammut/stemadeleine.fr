import React from "react";
import Utilities from "@/components/Utilities";
import { PencilIcon } from "@heroicons/react/24/outline";

export default function UserDetails({ user, onEdit, onDelete }) {
  if (!user) return null;

  const actions = [
    {
      icon: PencilIcon,
      label: "Modifier",
      callback: onEdit,
    },
    {
      variant: "delete",
      label: "Supprimer",
      callback: onDelete,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Informations principales */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {user.firstname} {user.lastname}
        </h2>
        <div className="border-t border-gray-200 pt-6 space-y-4">
          <div className="grid grid-cols-[140px_1fr] gap-4">
            <span className="text-sm font-semibold text-gray-500">Email</span>
            <span className="text-sm text-gray-900">{user.email || "-"}</span>
          </div>

          <div className="grid grid-cols-[140px_1fr] gap-4">
            <span className="text-sm font-semibold text-gray-500">
              Téléphone mobile
            </span>
            <span className="text-sm text-gray-900">
              {user.phoneMobile || "-"}
            </span>
          </div>

          <div className="grid grid-cols-[140px_1fr] gap-4">
            <span className="text-sm font-semibold text-gray-500">
              Téléphone fixe
            </span>
            <span className="text-sm text-gray-900">
              {user.phoneLandline || "-"}
            </span>
          </div>

          <div className="grid grid-cols-[140px_1fr] gap-4">
            <span className="text-sm font-semibold text-gray-500">
              Date de naissance
            </span>
            <span className="text-sm text-gray-900">
              {user.birthDate
                ? new Date(user.birthDate).toLocaleDateString("fr-FR")
                : "-"}
            </span>
          </div>

          <div className="grid grid-cols-[140px_1fr] gap-4">
            <span className="text-sm font-semibold text-gray-500">
              Newsletter
            </span>
            <span className="text-sm text-gray-900">
              {user.newsletter ? "Oui" : "Non"}
            </span>
          </div>
        </div>
      </div>

      {/* Adresses */}
      {user.addresses && user.addresses.length > 0 && (
        <div className="border-t border-gray-200 pt-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Adresses</h3>
          <div className="space-y-6">
            {user.addresses.map((address) => (
              <div key={address.id} className="space-y-2">
                <div className="text-lg font-semibold text-gray-900">
                  {address.name}
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>{address.addressLine1}</div>
                  {address.addressLine2 && <div>{address.addressLine2}</div>}
                  <div className="flex items-center gap-2">
                    <span className="inline-block px-2 py-0.5 bg-gray-100 rounded text-xs font-medium text-gray-700">
                      {address.postCode}
                    </span>
                    <span>{address.city}</span>
                  </div>
                  {(address.state || address.country) && (
                    <div className="flex items-center gap-2 text-gray-500">
                      {address.state && <span>{address.state}</span>}
                      {address.state && address.country && <span>•</span>}
                      {address.country && <span>{address.country}</span>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Adhésions */}
      {user.memberships && user.memberships.length > 0 && (
        <div className="border-t border-gray-200 pt-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Adhésions</h3>
          <div className="space-y-6">
            {user.memberships.map((membership) => (
              <div key={membership.id} className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold text-gray-900">
                    Année {new Date(membership.dateFin).getFullYear()}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      membership.active
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {membership.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>
                    Du{" "}
                    {new Date(membership.dateAdhesion).toLocaleDateString(
                      "fr-FR",
                    )}{" "}
                    au{" "}
                    {new Date(membership.dateFin).toLocaleDateString("fr-FR")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Boutons d'action */}
      <div className="border-t border-gray-200 pt-6">
        <Utilities actions={actions} />
      </div>
    </div>
  );
}
