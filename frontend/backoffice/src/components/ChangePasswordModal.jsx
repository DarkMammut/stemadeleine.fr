"use client";

import React, {useEffect, useState} from "react";
import MyForm from "@/components/ui/MyForm";
import {useAccountOperations} from "@/hooks/useAccountOperations";
import {useNotification} from "@/hooks/useNotification";
import PropTypes from "prop-types";
import Modal from "@/components/ui/Modal";

export default function ChangePasswordModal({
                                                open,
                                                onClose,
                                                accountId,
                                                onSuccess,
                                                allowAdminReset = false,
                                            }) {
    const [loading, setLoading] = useState(false);
    // initialize adminMode from prop so EditAccount can open modal already in admin mode
    const [adminMode, setAdminMode] = useState(() => Boolean(allowAdminReset));
    const accountOps = useAccountOperations();
    const {showSuccess, showError} = useNotification();

    useEffect(() => {
        if (open) {
            // reset state if needed when opened
            setLoading(false);
            // reset adminMode to the configured default (if allowAdminReset true we start in admin mode)
            setAdminMode(Boolean(allowAdminReset));
        }
    }, [open]);

    // fields builder depending on mode
    const buildFields = () => {
        const base = [
            {
                name: "newPassword",
                label: "Nouveau mot de passe",
                type: "password",
                required: true,
            },
            {
                name: "confirmPassword",
                label: "Confirmer le nouveau mot de passe",
                type: "password",
                required: true,
            },
        ];
        if (!adminMode) {
            base.unshift({
                name: "currentPassword",
                label: "Mot de passe actuel",
                type: "password",
                required: true,
            });
        }
        return base;
    };

    const handleSubmit = async (payload) => {
        if (!accountId)
            throw {fieldErrors: {currentPassword: "Compte invalide"}};
        // Normalize (trim) inputs to avoid accidental spaces
        const currentPassword = (payload.currentPassword || "").trim();
        const newPassword = (payload.newPassword || "").trim();
        const confirmPassword = (payload.confirmPassword || "").trim();

        if (newPassword !== confirmPassword) {
            // Return field error for confirmPassword
            const fe = {confirmPassword: "Les mots de passe ne correspondent pas"};
            // show an overall error too
            showError("Erreur", fe.confirmPassword, {autoClose: false});
            throw {fieldErrors: fe};
        }
        // Client-side validation: enforce minimum length and difference to current
        if (!newPassword || newPassword.length < 8) {
            const fe = {
                newPassword:
                    "Le nouveau mot de passe doit contenir au moins 8 caractères",
            };
            showError("Erreur", fe.newPassword, {autoClose: false});
            throw {fieldErrors: fe};
        }
        if (!adminMode && currentPassword && currentPassword === newPassword) {
            const fe = {
                newPassword: "Le nouveau mot de passe doit être différent de l'actuel",
            };
            showError("Erreur", fe.newPassword, {autoClose: false});
            throw {fieldErrors: fe};
        }
        // Ensure currentPassword is provided
        if (!adminMode) {
            if (!currentPassword || currentPassword.length === 0) {
                const fe = {
                    currentPassword: "Veuillez entrer votre mot de passe actuel",
                };
                showError("Erreur", fe.currentPassword, {autoClose: false});
                throw {fieldErrors: fe};
            }
        }

        setLoading(true);
        try {
            if (adminMode) {
                // admin reset - does not require current password
                await accountOps.resetPasswordByAdmin(accountId, newPassword);
            } else {
                // normal user change
                await accountOps.changePassword(accountId, {
                    currentPassword,
                    newPassword,
                });
            }

            showSuccess("Mot de passe modifié", "Le mot de passe a été modifié", {
                autoClose: false,
            });

            if (typeof onSuccess === "function") {
                try {
                    await onSuccess();
                } catch (e) {
                    // ignore onSuccess errors but log
                    console.warn("onSuccess callback failed", e);
                }
            }

            // Close modal after success
            onClose();
        } catch (err) {
            console.error("Erreur change password modal:", err);
            // Try to extract field errors from server response if present
            const status = err?.response?.status;
            let fieldErrors = null;
            if (err?.response?.data) {
                const data = err.response.data;
                if (data.fieldErrors && typeof data.fieldErrors === "object") {
                    fieldErrors = data.fieldErrors;
                } else if (data.errors && typeof data.errors === "object") {
                    fieldErrors = data.errors;
                } else if (
                    data.fieldErrors === undefined &&
                    data.message &&
                    typeof data.message === "string"
                ) {
                    // no field-level errors, map message to a general newPassword error as fallback
                    fieldErrors = {newPassword: data.message};
                }
            }

            if (fieldErrors) {
                // show overall notification
                const firstMsg = Object.values(fieldErrors)[0];
                showError("Erreur", firstMsg, {autoClose: false});
                // throw structured error so MyForm will display inline messages
                throw {fieldErrors};
            }

            // Map common API responses to user-friendly messages
            if (status === 400) {
                const apiMessage =
                    err?.response?.data?.message ||
                    "Le nouveau mot de passe doit contenir au moins 8 caractères et être différent de l'actuel";
                showError("Erreur", apiMessage, {autoClose: false});
                throw {fieldErrors: {newPassword: apiMessage}};
            } else if (status === 403 || status === 401) {
                const apiMessage =
                    err?.response?.data?.message ||
                    "Mot de passe actuel incorrect ou vous n'êtes pas autorisé à changer ce mot de passe";
                showError("Erreur", apiMessage, {autoClose: false});
                throw {fieldErrors: {currentPassword: apiMessage}};
            } else {
                const apiMessage =
                    err?.response?.data?.message ||
                    err?.message ||
                    "Impossible de changer le mot de passe";
                showError("Erreur", apiMessage, {autoClose: false});
                throw {fieldErrors: {newPassword: apiMessage}};
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (loading) return; // prevent closing while saving
        onClose();
    };

    return (
        <Modal open={open} onClose={handleClose} size="md">
            <div className="space-y-4">
                {allowAdminReset && (
                    <div className="flex items-center justify-end">
                        <label className="inline-flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={adminMode}
                                onChange={(e) => setAdminMode(e.target.checked)}
                            />
                            <span>
                Mode admin (réinitialisation sans mot de passe actuel)
              </span>
                        </label>
                    </div>
                )}

                <MyForm
                    title={
                        adminMode
                            ? "Réinitialiser le mot de passe (admin)"
                            : "Changer le mot de passe"
                    }
                    fields={buildFields()}
                    initialValues={{}}
                    onSubmit={handleSubmit}
                    onCancel={handleClose}
                    submitButtonLabel={
                        adminMode ? "Réinitialiser" : "Changer le mot de passe"
                    }
                    // Render a single field per line and make the form a bit wider inside the modal
                    columns={1}
                    maxWidthClass="max-w-xl"
                    loading={loading}
                />
            </div>
        </Modal>
    );
}

ChangePasswordModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    accountId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onSuccess: PropTypes.func,
    // If true, the modal exposes an "admin reset" mode (allows resetting without current password)
    allowAdminReset: PropTypes.bool,
};
ChangePasswordModal.defaultProps = {
    allowAdminReset: false,
};
