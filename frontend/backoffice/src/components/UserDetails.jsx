import React from "react";
import AddressManager from "@/components/AddressManager";

export default function UserDetails({ user, onEdit, onDelete }) {
  if (!user) return null;
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
      <div className="mt-2">
        <h3 className="font-semibold">Adhésion :</h3>
        {user.memberships && user.memberships.length > 0 ? (
          <div>
            {user.memberships.map((m) => (
              <div key={m.id}>
                Année : {new Date(m.dateFin).getFullYear()}
                <br />
                Début : {m.dateAdhesion}
                <br />
                Fin : {m.dateFin}
                <br />
                Active : {m.active ? "Oui" : "Non"}
              </div>
            ))}
          </div>
        ) : (
          <div>Aucune adhésion</div>
        )}
      </div>
      <div className="flex gap-2 mt-4">
        <button className="btn btn-primary" onClick={onEdit}>
          Modifier
        </button>
        <button className="btn btn-danger" onClick={onDelete}>
          Supprimer
        </button>
      </div>
    </div>
  );
}
