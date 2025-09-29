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
    <div className="details-user p-4 border rounded">
      <h2 className="text-xl font-bold mb-2">
        {user.firstname} {user.lastname}
      </h2>
      <div>Email : {user.email}</div>
      <div>Téléphone mobile : {user.phoneMobile}</div>
      <div>Téléphone fixe : {user.phoneLandline}</div>
      <div>Newsletter : {user.newsletter ? "Oui" : "Non"}</div>
      <div>Date de naissance : {user.birthDate}</div>
      <div className="mt-2">
        <h3 className="font-semibold">Adresses :</h3>
        <AddressManager addresses={user.addresses || []} editable={false} />
      </div>
      <Utilities actions={actions} />
    </div>
  );
}
