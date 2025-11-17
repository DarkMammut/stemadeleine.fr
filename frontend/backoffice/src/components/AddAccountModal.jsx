"use client";

import React from "react";
import PropTypes from "prop-types";
import Modal from "@/components/ui/Modal";
import AccountForm from "@/components/AccountForm";

export default function AddAccountModal({ open, onClose, onCreated }) {
  return (
    <Modal open={open} onClose={onClose} size="md">
      <div>
        <AccountForm
          initialValues={{ email: "", role: "USER", provider: "local" }}
          onCancel={onClose}
          onCreated={async (created) => {
            try {
              if (typeof onCreated === "function") onCreated(created);
            } catch (e) {}
          }}
        />
      </div>
    </Modal>
  );
}

AddAccountModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreated: PropTypes.func,
};

AddAccountModal.defaultProps = {
  onCreated: null,
};
