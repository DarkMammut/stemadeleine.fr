import React from "react";
import ModifyButton from "@/components/ui/ModifyButton";
import DeleteButton from "@/components/ui/DeleteButton";

export default function UserDetails({ user, onEdit, onDelete }) {
  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Informations principales */}
      <div className="bg-white shadow-xs outline outline-gray-900/5 sm:rounded-xl">
        <div className="flex items-center justify-between px-4 py-6 sm:px-8 sm:pt-8 sm:pb-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {user.firstname} {user.lastname}
          </h3>
          <div className="flex items-center gap-2">
            {onEdit && (
              <ModifyButton
                onModify={onEdit}
                modifyLabel="Modifier"
                size="sm"
              />
            )}
            {onDelete && (
              <DeleteButton
                onDelete={onDelete}
                deleteLabel="Supprimer"
                confirmTitle="Supprimer l'utilisateur"
                confirmMessage="Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible."
                size="sm"
                hoverExpand={true}
              />
            )}
          </div>
        </div>
        <div className="px-4 py-6 sm:p-8 space-y-4">
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
        <div className="bg-white shadow-xs outline outline-gray-900/5 sm:rounded-xl">
          <div className="px-4 py-6 sm:px-8 sm:pt-8 sm:pb-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Adresses</h3>
          </div>
          <div className="px-4 py-6 sm:p-8 space-y-6">
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
        <div className="bg-white shadow-xs outline outline-gray-900/5 sm:rounded-xl">
          <div className="px-4 py-6 sm:px-8 sm:pt-8 sm:pb-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Adhésions</h3>
          </div>
          <div className="px-4 py-6 sm:p-8 space-y-6">
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
    </div>
  );
}
