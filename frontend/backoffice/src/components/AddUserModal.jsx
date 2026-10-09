"use client";

import React, { useState } from "react";
import PropTypes from "prop-types";
import Modal from "@/components/ui/Modal";
import UserForm from "@/components/UserForm";
import { useUserOperations } from "@/hooks/useUserOperations";
import { useNotification } from "@/hooks/useNotification";
import { useTranslation } from "@/i18n/I18nContext";

export default function AddUserModal({ open, onClose, onCreate }) {
  const { t } = useTranslation();
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
      showError(t("users.createErrorTitle"), t("users.createErrorMessage"));
      throw err;
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <UserForm
        title={t("users.form.addTitle")}
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
