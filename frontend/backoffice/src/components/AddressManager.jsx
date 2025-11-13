import React, { useState } from "react";
import MyForm from "@/components/MyForm";
import Button from "@/components/ui/Button";
import DeleteButton from "@/components/ui/DeleteButton";
import { useAxiosClient } from "@/utils/axiosClient";
import Notification from "@/components/ui/Notification";
import { useNotification } from "@/hooks/useNotification";
import Panel from "@/components/ui/Panel";
import PropTypes from "prop-types";
import IconButton from "@/components/ui/IconButton";
import {
  MapPinIcon as MapPinOutlineIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import ModifyButton from "@/components/ui/ModifyButton";

export default function AddressManager({
  label = "Mes Adresses",
  addresses,
  ownerId,
  ownerType,
  refreshAddresses,
  editable = true,
  newAddressName = "Nouvelle adresse",
  maxAddresses = undefined,
}) {
  const handleAddClick = () => {
    if (!editable || isLimitReached) return;
    setAdding(true);
    setEditingId("new");
    setEditForm({ ...addForm });
  };
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
    typeof maxAddresses === "number" &&
    (addresses?.length || 0) >= maxAddresses;

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

  // Header action: always show the primary add button when editable and not limit reached
  const headerAction =
    editable && !isLimitReached ? (
      <IconButton
        icon={PlusIcon}
        label="Ajouter"
        variant="primary"
        size="md"
        onClick={handleAddClick}
      />
    ) : null;

  const TitleNode = (
    <div className="flex items-center gap-3">
      <MapPinOutlineIcon className="w-6 h-6 text-gray-500" />
      <h3 className="text-lg font-semibold text-gray-900">{label}</h3>
    </div>
  );

  return (
    <Panel title={TitleNode} actionsPrimary={headerAction}>
      <div>
        {/* Si on est en ajout, afficher le formulaire inline en haut pour éviter les doublons */}
        {adding && (
          <div className="mb-4">
            <MyForm
              key="add"
              fields={addressFields}
              initialValues={addForm}
              onSubmit={handleAddSubmit}
              onChange={setAddForm}
              submitButtonLabel="Ajouter"
              onCancel={() => setAdding(false)}
              cancelButtonLabel="Annuler"
              allowNoChanges={true}
              inline={true}
            />
          </div>
        )}

        {addresses.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {addresses.map((address) => (
              <div key={address.id} className="py-4">
                {editable && editingId === address.id ? (
                  <div className="flex-1">
                    <MyForm
                      key={editingId}
                      fields={addressFields}
                      initialValues={editForm}
                      onSubmit={handleEditSubmit}
                      onChange={setEditForm}
                      submitButtonLabel="Enregistrer"
                      inline={true}
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
                              {address.state && address.country && (
                                <span>•</span>
                              )}
                              {address.country && (
                                <span>{address.country}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {editable && (
                      <div className="flex flex-col items-end gap-2">
                        <ModifyButton
                          size="sm"
                          modifyLabel="Modifier"
                          onModify={() => handleEdit(address)}
                        />
                        <DeleteButton
                          onDelete={() => handleDelete(address.id)}
                          size="sm"
                          deleteLabel="Supprimer"
                          confirmTitle="Supprimer l'adresse"
                          confirmMessage={`Êtes-vous sûr de vouloir supprimer l'adresse "${address.name}" ?`}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Aucune adresse enregistrée</p>
        )}

        {/* Affiche le bouton bas uniquement si la liste est vide (évite une bordure vide sous la liste) */}
        {editable && !isLimitReached && addresses && addresses.length === 0 && (
          <div className="mt-0">
            {!adding && (
              <Button variant="link" size="sm" onClick={handleAddClick}>
                + Ajouter une adresse
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Notification */}
      {notification.show && (
        <Notification
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={hideNotification}
        />
      )}
    </Panel>
  );
}

AddressManager.propTypes = {
  label: PropTypes.string,
  addresses: PropTypes.array.isRequired,
  ownerId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  ownerType: PropTypes.string,
  refreshAddresses: PropTypes.func,
  editable: PropTypes.bool,
  newAddressName: PropTypes.string,
  maxAddresses: PropTypes.number,
};

AddressManager.defaultProps = {
  label: "Adresses",
  ownerId: null,
  ownerType: null,
  refreshAddresses: null,
  editable: true,
  newAddressName: "Nouvelle adresse",
  maxAddresses: undefined,
};
