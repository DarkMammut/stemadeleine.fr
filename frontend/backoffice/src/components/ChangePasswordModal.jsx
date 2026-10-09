"use client";

import React, {useEffect, useState} from "react";
import MyForm from "@/components/ui/MyForm";
import {useAccountOperations} from "@/hooks/useAccountOperations";
import {useNotification} from "@/hooks/useNotification";
import PropTypes from "prop-types";
import Modal from "@/components/ui/Modal";
import {useTranslation} from "@/i18n/I18nContext";

export default function ChangePasswordModal({
                                                open,
                                                onClose,
                                                accountId,
                                                onSuccess,
                                                allowAdminReset = false,
                                            }) {
    const {t} = useTranslation();
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
                label: t("accounts.password.newPassword"),
                type: "password",
                required: true,
            },
            {
                name: "confirmPassword",
                label: t("accounts.password.confirmPassword"),
                type: "password",
                required: true,
            },
        ];
        if (!adminMode) {
            base.unshift({
                name: "currentPassword",
                label: t("accounts.password.currentPassword"),
                type: "password",
                required: true,
            });
        }
        return base;
    };

    const handleSubmit = async (payload) => {
        if (!accountId)
            throw {fieldErrors: {currentPassword: t("accounts.password.invalidAccount")}};
        // Normalize (trim) inputs to avoid accidental spaces
        const currentPassword = (payload.currentPassword || "").trim();
        const newPassword = (payload.newPassword || "").trim();
        const confirmPassword = (payload.confirmPassword || "").trim();

        if (newPassword !== confirmPassword) {
            // Return field error for confirmPassword
            const fe = {confirmPassword: t("accounts.password.mismatch")};
            // show an overall error too
            showError(t("accounts.password.updateErrorTitle"), fe.confirmPassword, {autoClose: false});
            throw {fieldErrors: fe};
        }
        // Client-side validation: enforce minimum length and difference to current
        if (!newPassword || newPassword.length < 8) {
            const fe = {
                newPassword:
                    t("accounts.password.minLength"),
            };
            showError(t("accounts.password.updateErrorTitle"), fe.newPassword, {autoClose: false});
            throw {fieldErrors: fe};
        }
        if (!adminMode && currentPassword && currentPassword === newPassword) {
            const fe = {
                newPassword: t("accounts.password.mustDiffer"),
            };
            showError(t("accounts.password.updateErrorTitle"), fe.newPassword, {autoClose: false});
            throw {fieldErrors: fe};
        }
        // Ensure currentPassword is provided
        if (!adminMode) {
            if (!currentPassword || currentPassword.length === 0) {
                const fe = {
                    currentPassword: t("accounts.password.currentRequired"),
                };
                showError(t("accounts.password.updateErrorTitle"), fe.currentPassword, {autoClose: false});
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

            showSuccess(t("accounts.password.modalSuccessTitle"), t("accounts.password.modalSuccessMessage"), {
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
                showError(t("accounts.password.updateErrorTitle"), firstMsg, {autoClose: false});
                // throw structured error so MyForm will display inline messages
                throw {fieldErrors};
            }

            // Map common API responses to user-friendly messages
            if (status === 400) {
                const apiMessage =
                    err?.response?.data?.message ||
                    t("accounts.password.invalidPasswordMessage");
                showError(t("accounts.password.updateErrorTitle"), apiMessage, {autoClose: false});
                throw {fieldErrors: {newPassword: apiMessage}};
            } else if (status === 403 || status === 401) {
                const apiMessage =
                    err?.response?.data?.message ||
                    t("accounts.password.unauthorizedMessage");
                showError(t("accounts.password.updateErrorTitle"), apiMessage, {autoClose: false});
                throw {fieldErrors: {currentPassword: apiMessage}};
            } else {
                const apiMessage =
                    err?.response?.data?.message ||
                    err?.message ||
                    t("accounts.password.updateErrorMessage");
                showError(t("accounts.password.updateErrorTitle"), apiMessage, {autoClose: false});
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
                            <span>{t("accounts.password.modalAdminMode")}</span>
                        </label>
                    </div>
                )}

                <MyForm
                    title={
                        adminMode
                            ? t("accounts.password.modalAdminTitle")
                            : t("accounts.password.modalUserTitle")
                    }
                    fields={buildFields()}
                    initialValues={{}}
                    onSubmit={handleSubmit}
                    onCancel={handleClose}
                    submitButtonLabel={
                        adminMode
                            ? t("accounts.password.modalAdminSubmit")
                            : t("accounts.password.modalUserSubmit")
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
