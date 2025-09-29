import React, { useState } from "react";
import MyForm from "@/components/MyForm";
import Button from "@/components/ui/Button";
import { useAxiosClient } from "@/utils/axiosClient";

export default function AddressManager({
  addresses,
  ownerId,
  refreshAddresses,
  editable = true,
}) {
  if (editable) {
    console.log("ownerId dans Addresses:", ownerId);
    console.log("Props reçues dans Addresses:", {
      addresses,
      ownerId,
      refreshAddresses,
    });
  }
  const axios = useAxiosClient();
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [adding, setAdding] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "Nouvelle adresse",
    addressLine1: "",
    addressLine2: "",
    city: "",
    postCode: "",
    state: "",
    country: "",
  });

  const addressFields = [
    { name: "name", label: "Nom", type: "text", required: true },
    { name: "addressLine1", label: "Ligne 1", type: "text", required: true },
    { name: "addressLine2", label: "Ligne 2", type: "text", required: false },
    { name: "city", label: "Ville", type: "text", required: true },
    { name: "postCode", label: "Code postal", type: "text", required: true },
    { name: "state", label: "Région", type: "text", required: false },
    { name: "country", label: "Pays", type: "text", required: false },
  ];

  // Ajout d'une adresse
  const handleAddSubmit = async (formValues) => {
    if (!editable || !ownerId || !refreshAddresses) return;
    try {
      await axios.post("/api/addresses", {
        ...formValues,
        ownerId,
      });
      setAddForm({
        name: "Nouvelle adresse",
        addressLine1: "",
        addressLine2: "",
        city: "",
        postCode: "",
        state: "",
        country: "",
      });
      setAdding(false);
      await refreshAddresses();
    } catch (err) {
      alert("Erreur lors de l'ajout");
    }
  };

  // Edition d'une adresse
  const handleEdit = (address) => {
    if (!editable) return;
    setEditingId(address.id);
    setEditForm({
      name: address.name || "",
      addressLine1: address.addressLine1 || "",
      addressLine2: address.addressLine2 || "",
      city: address.city || "",
      postCode: address.postCode || "",
      state: address.state || "",
      country: address.country || "",
    });
  };

  const handleEditSubmit = async (formValues) => {
    if (!editable || !ownerId || !refreshAddresses) return;
    try {
      await axios.put(`/api/addresses/${editingId}`, {
        ...formValues,
        ownerId,
      });
      setEditingId(null);
      await refreshAddresses();
    } catch (err) {
      alert("Erreur lors de la modification");
    }
  };

  // Suppression d'une adresse
  const handleDelete = async (id) => {
    if (!editable || !refreshAddresses) return;
    if (window.confirm("Supprimer cette adresse ?")) {
      try {
        await axios.delete(`/api/addresses/${id}`);
        await refreshAddresses();
      } catch (err) {
        alert("Erreur lors de la suppression");
      }
    }
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <ul className="divide-y divide-border mb-4">
        {addresses.map((address) => (
          <li
            key={address.id}
            className="flex items-center justify-between py-2"
          >
            {editable && editingId === address.id ? (
              <MyForm
                key={editingId}
                fields={addressFields}
                initialValues={editForm}
                onSubmit={handleEditSubmit}
                onChange={setEditForm}
                submitButtonLabel="Enregistrer"
                onCancel={() => setEditingId(null)}
                cancelButtonLabel="Annuler"
              />
            ) : (
              <>
                <div
                  className={editable ? "cursor-pointer flex-1" : "flex-1"}
                  onClick={editable ? () => handleEdit(address) : undefined}
                >
                  <div className="flex flex-col gap-1 p-3 rounded-md bg-muted hover:bg-accent transition-colors">
                    <span className="font-semibold text-lg text-primary mb-1">
                      {address.name}
                    </span>
                    <span className="text-base text-secondary">
                      {address.addressLine1}
                    </span>
                    {address.addressLine2 && (
                      <span className="text-base text-secondary">
                        {address.addressLine2}
                      </span>
                    )}
                    <div className="flex flex-row gap-2 items-center text-base text-secondary">
                      <span className="inline-block px-2 py-1 bg-surface rounded-full border text-xs font-medium text-muted mr-2">
                        {address.postCode}
                      </span>
                      <span>{address.city}</span>
                    </div>
                    {(address.state || address.country) && (
                      <div className="flex flex-row gap-2 mt-1 text-sm text-muted">
                        {address.state && <span>{address.state}</span>}
                        {address.state && address.country && <span>•</span>}
                        {address.country && <span>{address.country}</span>}
                      </div>
                    )}
                  </div>
                </div>
                {editable && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(address.id)}
                  >
                    Supprimer
                  </Button>
                )}
              </>
            )}
          </li>
        ))}
      </ul>
      {editable &&
        (adding ? (
          <MyForm
            key="add"
            fields={addressFields}
            initialValues={addForm}
            onSubmit={handleAddSubmit}
            onChange={setAddForm}
            submitButtonLabel="Ajouter"
            onCancel={() => setAdding(false)}
            cancelButtonLabel="Annuler"
          />
        ) : (
          <Button variant="primary" size="sm" onClick={() => setAdding(true)}>
            Ajouter une adresse
          </Button>
        ))}
    </div>
  );
}
