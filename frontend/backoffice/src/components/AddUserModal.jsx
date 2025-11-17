"use client";

import React, { useState } from "react";
import PropTypes from "prop-types";
import Modal from "@/components/ui/Modal";
import UserForm from "@/components/UserForm";
import { useUserOperations } from "@/hooks/useUserOperations";
import { useNotification } from "@/hooks/useNotification";

export default function AddUserModal({ open, onClose, onCreate }) {
  const { createUser } = useUserOperations();
  const { showError } = useNotification();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (values) => {
    setSaving(true);
    try {
      const created = await createUser(values);
      onCreate && onCreate(created);
      onClose && onClose();
    } catch (err) {
      console.error("Erreur création utilisateur:", err);
      showError("Erreur", "Impossible de créer l'utilisateur");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <UserForm
        title={"Ajouter un utilisateur"}
        initialValues={{}}
        onSubmit={handleSubmit}
        onChange={() => {}}
        loading={saving}
        onCancel={onClose}
      />
    </Modal>
  );
}

AddUserModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onCreate: PropTypes.func,
};

AddUserModal.defaultProps = {
  open: false,
  onClose: null,
  onCreate: null,
};
