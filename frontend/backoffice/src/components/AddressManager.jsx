import React, { useState } from "react";
import MyForm from "@/components/MyForm";
import Button from "@/components/ui/Button";
import DeleteButton from "@/components/ui/DeleteButton";
import { useAxiosClient } from "@/utils/axiosClient";
import Notification from "@/components/Notification";
import { useNotification } from "@/hooks/useNotification";

export default function AddressManager({
  label = "Adresses",
  addresses,
  ownerId,
  ownerType,
  refreshAddresses,
  editable = true,
  newAddressName = "Nouvelle adresse",
  maxAddresses = undefined,
}) {
  const axios = useAxiosClient();
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [adding, setAdding] = useState(false);
  const [addForm, setAddForm] = useState({
    name: newAddressName,
    addressLine1: "",
    addressLine2: "",
    city: "",
    postCode: "",
    state: "",
    country: "",
  });

  const isLimitReached =
    typeof maxAddresses === "number" && addresses.length >= maxAddresses;

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
    if (!editable || !ownerId || !refreshAddresses || isLimitReached) return;
    try {
      await axios.post("/api/addresses", {
        ...formValues,
        ownerId,
        ownerType,
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
      showSuccess("Adresse ajoutée", "L'adresse a été ajoutée avec succès");
    } catch (err) {
      console.error("Erreur lors de l'ajout:", err);
      showError(
        "Erreur d'ajout",
        "Impossible d'ajouter l'adresse. Veuillez réessayer.",
      );
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
        ownerType,
      });
      setEditingId(null);
      await refreshAddresses();
      showSuccess("Adresse modifiée", "L'adresse a été modifiée avec succès");
    } catch (err) {
      console.error("Erreur lors de la modification:", err);
      showError(
        "Erreur de modification",
        "Impossible de modifier l'adresse. Veuillez réessayer.",
      );
    }
  };

  // Suppression d'une adresse
  const handleDelete = async (addressId) => {
    if (!editable || !refreshAddresses) return;
    try {
      await axios.delete(`/api/addresses/${addressId}`);
      await refreshAddresses();
      showSuccess("Adresse supprimée", "L'adresse a été supprimée avec succès");
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      showError(
        "Erreur de suppression",
        "Impossible de supprimer l'adresse. Veuillez réessayer.",
      );
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900">{label}</h3>

      <div className="space-y-4">
        {addresses.map((address) => (
          <div key={address.id} className="border-t border-gray-200 pt-4">
            {editable && editingId === address.id ? (
              <div className="flex-1">
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
              </div>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div
                  className={editable ? "cursor-pointer flex-1" : "flex-1"}
                  onClick={editable ? () => handleEdit(address) : undefined}
                >
                  <div className="space-y-2">
                    <span className="text-lg font-semibold text-gray-900 block">
                      {address.name}
                    </span>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>{address.addressLine1}</div>
                      {address.addressLine2 && (
                        <div>{address.addressLine2}</div>
                      )}
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
                </div>
                {editable && (
                  <DeleteButton
                    onDelete={() => handleDelete(address.id)}
                    size="sm"
                    deleteLabel="Supprimer"
                    confirmTitle="Supprimer l'adresse"
                    confirmMessage={`Êtes-vous sûr de vouloir supprimer l'adresse "${address.name}" ?`}
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {editable &&
        !isLimitReached &&
        (adding ? (
          <div className="border-t border-gray-200 pt-4">
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
          </div>
        ) : (
          <div className="border-t border-gray-200 pt-4">
            <Button variant="link" size="sm" onClick={() => setAdding(true)}>
              + Ajouter une adresse
            </Button>
          </div>
        ))}

      {/* Notification */}
      {notification.show && (
        <Notification
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={hideNotification}
        />
      )}
    </div>
  );
}
