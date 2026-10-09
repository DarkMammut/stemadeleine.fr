import React, { useState } from "react";
import MyForm from "@/components/ui/MyForm";
import Button from "@/components/ui/Button";
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
import AddressCard from "@/components/AddressCard";
import { useTranslation } from "@/i18n/I18nContext";

export default function AddressManager({
  label = null,
  addresses,
  ownerId,
  ownerType,
  refreshAddresses,
  editable = true,
  newAddressName = null,
  maxAddresses = undefined,
  loading = false,
}) {
  const { t } = useTranslation();
  const resolvedLabel = label || t("addresses.title");
  const resolvedNewAddressName = newAddressName || t("addresses.newAddressName");
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
    name: resolvedNewAddressName,
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
    { name: "name", label: t("addresses.fields.name"), type: "text", required: true },
    {
      name: "addressLine1",
      label: t("addresses.fields.addressLine1"),
      type: "text",
      required: true,
    },
    {
      name: "addressLine2",
      label: t("addresses.fields.addressLine2"),
      type: "text",
      required: false,
    },
    { name: "city", label: t("addresses.fields.city"), type: "text", required: true },
    {
      name: "postCode",
      label: t("addresses.fields.postCode"),
      type: "text",
      required: true,
    },
    { name: "state", label: t("addresses.fields.state"), type: "text", required: false },
    { name: "country", label: t("addresses.fields.country"), type: "text", required: false },
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
        name: resolvedNewAddressName,
        addressLine1: "",
        addressLine2: "",
        city: "",
        postCode: "",
        state: "",
        country: "",
      });
      setAdding(false);
      await refreshAddresses();
      showSuccess(t("addresses.addSuccessTitle"), t("addresses.addSuccessMessage"));
    } catch (err) {
      console.error("Erreur lors de l'ajout:", err);
      showError(t("addresses.addErrorTitle"), t("addresses.addErrorMessage"));
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
      showSuccess(
        t("addresses.updateSuccessTitle"),
        t("addresses.updateSuccessMessage"),
      );
    } catch (err) {
      console.error("Erreur lors de la modification:", err);
      showError(t("addresses.updateErrorTitle"), t("addresses.updateErrorMessage"));
    }
  };

  // Suppression d'une adresse
  const handleDelete = async (addressId) => {
    if (!editable || !refreshAddresses) return;
    try {
      await axios.delete(`/api/addresses/${addressId}`);
      await refreshAddresses();
      showSuccess(
        t("addresses.deleteSuccessTitle"),
        t("addresses.deleteSuccessMessage"),
      );
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      showError(t("addresses.deleteErrorTitle"), t("addresses.deleteErrorMessage"));
    }
  };

  // Header action: always show the primary add button when editable and not limit reached
  const headerAction =
    editable && !isLimitReached ? (
      <IconButton
        icon={PlusIcon}
        label={t("addresses.add")}
        variant="primary"
        size="md"
        onClick={handleAddClick}
        disabled={loading}
      />
    ) : null;

  const TitleNode = (
    <div className="flex items-center gap-3">
      <MapPinOutlineIcon className="w-6 h-6 text-gray-500" />
      <h3 className="text-lg font-semibold text-gray-900">{resolvedLabel}</h3>
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
              submitButtonLabel={t("addresses.add")}
              onCancel={() => setAdding(false)}
              cancelButtonLabel={t("users.form.cancel")}
              allowNoChanges={true}
              inline={true}
            />
          </div>
        )}

        {loading && (!addresses || addresses.length === 0) ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="py-3">
                <AddressCard
                  fields={addressFields}
                  data={{}}
                  titleField="name"
                  loading={true}
                  editable={false}
                  showLabels={false}
                  compact={true}
                />
              </div>
            ))}
          </div>
        ) : addresses.length > 0 ? (
          <div className="space-y-3">
            {addresses.map((address) => (
              <div key={address.id} className="py-2">
                {editingId === address.id ? (
                  <div className="p-3 rounded-lg bg-white shadow-sm">
                    <MyForm
                      key={editingId}
                      fields={addressFields}
                      initialValues={editForm}
                      onSubmit={handleEditSubmit}
                      onChange={setEditForm}
                      submitButtonLabel={t("addresses.save")}
                      inline={true}
                      onCancel={() => setEditingId(null)}
                      cancelButtonLabel={t("users.form.cancel")}
                    />
                  </div>
                ) : (
                  <AddressCard
                    fields={addressFields}
                    data={address}
                    titleField="name"
                    onEdit={() => handleEdit(address)}
                    onDelete={() => handleDelete(address.id)}
                    editable={editable}
                    loading={loading}
                    columns={1}
                    gap={2}
                    showLabels={false}
                    compact={true}
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">{t("addresses.empty")}</p>
        )}

        {/* Affiche le bouton bas uniquement si la liste est vide (évite une bordure vide sous la liste) */}
        {editable && addresses && addresses.length === 0 && !loading && (
          <div className="mt-0">
            {!adding && (
              <Button variant="link" size="sm" onClick={handleAddClick}>
                {t("addresses.addInline")}
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
  label: null,
  ownerId: null,
  ownerType: null,
  refreshAddresses: null,
  editable: true,
  newAddressName: null,
  maxAddresses: undefined,
};
