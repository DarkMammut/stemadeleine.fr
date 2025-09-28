import React, { useState } from "react";
import MyForm from "@/components/MyForm";
import Button from "@/components/ui/Button";

export default function Addresses({ addresses, onAdd, onEdit, onDelete }) {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [adding, setAdding] = useState(false);
  const [addForm, setAddForm] = useState({
    street: "",
    city: "",
    zip: "",
    country: "",
  });

  const addressFields = [
    { name: "street", label: "Rue", type: "text", required: true },
    { name: "city", label: "Ville", type: "text", required: true },
    { name: "zip", label: "Code postal", type: "text", required: true },
    { name: "country", label: "Pays", type: "text", required: true },
  ];

  const handleEdit = (address) => {
    setEditingId(address.id);
    setEditForm({
      street: address.street || "",
      city: address.city || "",
      zip: address.zip || "",
      country: address.country || "",
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    await onEdit(editingId, editForm);
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer cette adresse ?")) {
      await onDelete(id);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    await onAdd(addForm);
    setAddForm({ street: "", city: "", zip: "", country: "" });
    setAdding(false);
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <ul className="divide-y divide-border mb-4">
        {addresses.map((address) => (
          <li
            key={address.id}
            className="flex items-center justify-between py-2"
          >
            {editingId === address.id ? (
              <MyForm
                fields={addressFields.map((f) => ({
                  ...f,
                  defaultValue: editForm[f.name],
                }))}
                onSubmit={handleEditSubmit}
                onChange={setEditForm}
                submitButtonLabel="Enregistrer"
              />
            ) : (
              <>
                <div
                  className="cursor-pointer flex-1"
                  onClick={() => handleEdit(address)}
                >
                  {address.street}, {address.zip} {address.city},{" "}
                  {address.country}
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(address.id)}
                >
                  Supprimer
                </Button>
              </>
            )}
          </li>
        ))}
      </ul>
      {adding ? (
        <MyForm
          fields={addressFields.map((f) => ({
            ...f,
            defaultValue: addForm[f.name],
          }))}
          onSubmit={handleAddSubmit}
          onChange={setAddForm}
          submitButtonLabel="Ajouter"
        />
      ) : (
        <Button variant="primary" size="sm" onClick={() => setAdding(true)}>
          Ajouter une adresse
        </Button>
      )}
    </div>
  );
}
