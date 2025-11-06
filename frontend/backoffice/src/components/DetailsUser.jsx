import React from "react";
import Utilities from "@/components/Utilities";
import AddressManager from "@/components/AddressManager";

export default function DetailsUser({ user, onEdit, onDelete }) {
  if (!user) return null;

  const actions = [
    {
      label: "Modifier",
      icon: null,
      callback: onEdit,
    },
    {
      label: "Supprimer",
      icon: null,
      callback: onDelete,
    },
  ];

  return (
    <div className="details-user space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {user.firstname} {user.lastname}
        </h2>
        <div className="border-t border-gray-200 pt-6 space-y-4">
          <div className="grid grid-cols-[140px_1fr] gap-4">
            <span className="text-sm font-semibold text-gray-500">Email</span>
            <span className="text-sm text-gray-900">{user.email}</span>
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
              Newsletter
            </span>
            <span className="text-sm text-gray-900">
              {user.newsletter ? "Oui" : "Non"}
            </span>
          </div>

          <div className="grid grid-cols-[140px_1fr] gap-4">
            <span className="text-sm font-semibold text-gray-500">
              Date de naissance
            </span>
            <span className="text-sm text-gray-900">
              {user.birthDate || "-"}
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Adresses</h3>
        <AddressManager addresses={user.addresses || []} editable={false} />
      </div>

      <div className="border-t border-gray-200 pt-6">
        <Utilities actions={actions} />
      </div>
    </div>
  );
}
