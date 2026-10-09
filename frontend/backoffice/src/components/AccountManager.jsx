import React, { useEffect, useState } from "react";
import MyForm from "@/components/ui/MyForm";
import Button from "@/components/ui/Button";
import ModifyButton from "@/components/ui/ModifyButton";
import DeleteButton from "@/components/ui/DeleteButton";
import Notification from "@/components/ui/Notification";
import Panel from "@/components/ui/Panel";
import PropTypes from "prop-types";
import { useNotification } from "@/hooks/useNotification";
import { useAccountOperations } from "@/hooks/useAccountOperations";
import ChangePasswordModal from "@/components/ChangePasswordModal";
import IconButton from "@/components/ui/IconButton";
import { useTranslation } from "@/i18n/I18nContext";
import {
  KeyIcon as KeyOutlineIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

export default function AccountManager({
  label = null,
  accounts = [],
  userId = null,
  refreshAccounts = null,
  refreshUser = null,
  editable = true,
  changePassword = false,
  allowAdminReset = false,
  loading = false,
}) {
  const { t } = useTranslation();
  const resolvedLabel = label || t("accounts.title");
  const accountOps = useAccountOperations();
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();
  const [localAccounts, setLocalAccounts] = useState(accounts || []);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [changePwdAccountId, setChangePwdAccountId] = useState(null);
  const [adding, setAdding] = useState(false);
  const [addForm, setAddForm] = useState({ email: "", role: "USER" });

  const refreshFn = refreshAccounts || refreshUser;

  const loadAccounts = async () => {
    try {
      if (userId) {
        const data = await accountOps.getAccountsByUserId(userId);
        setLocalAccounts(data || []);
      } else {
        const data = await accountOps.getAllAccounts();
        setLocalAccounts(data || []);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des comptes:", err);
      showError(t("accounts.loadErrorTitle"), t("accounts.manager.loadErrorMessage"), {
        autoClose: false,
      });
    }
  };

  useEffect(() => {
    if (!refreshFn) loadAccounts();
    else setLocalAccounts(accounts || []);
  }, [userId, refreshFn, accounts]);

  const fields = [
    { name: "email", label: t("accounts.manager.email"), type: "text", required: true },
    {
      name: "role",
      label: t("accounts.manager.role"),
      type: "select",
      required: true,
      options: [
        { value: "USER", label: t("accounts.manager.userRole") },
        { value: "ADMIN", label: t("accounts.manager.adminRole") },
      ],
    },
  ];

  const handleEdit = (account) => {
    if (!editable) return;
    setEditingId(account.id);
    setEditForm({ email: account.email, role: account.role });
  };

  const handleSubmit = async (payload) => {
    if (!editable) return;
    if (!editingId) return;
    setLoadingSubmit(true);
    try {
      await accountOps.updateAccount(editingId, payload);
      showSuccess(
        t("accounts.manager.updateSuccessTitle"),
        t("accounts.manager.updateSuccessMessage"),
      );
      setEditingId(null);
      if (refreshFn) await refreshFn();
      else await loadAccounts();
    } catch (err) {
      console.error("Erreur sauvegarde compte:", err);
      showError(t("accounts.updateErrorTitle"), t("accounts.manager.updateErrorMessage"));
      throw err;
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleDelete = async (accountId) => {
    if (!editable || !refreshFn) return;
    try {
      await accountOps.deleteAccount(accountId);
      showSuccess(
        t("accounts.manager.deleteSuccessTitle"),
        t("accounts.manager.deleteSuccessMessage"),
      );
      if (refreshFn) await refreshFn();
      else await loadAccounts();
    } catch (err) {
      console.error("Erreur suppression compte:", err);
      showError(t("accounts.deleteErrorTitle"), t("accounts.manager.deleteErrorMessage"));
    }
  };

  const openChangePassword = (accountId) => {
    setChangePwdAccountId(accountId);
    setShowChangePwd(true);
  };

  // Add behavior: header add button
  const isLimitReached = false; // placeholder in case we want limits later
  const handleAddClick = () => {
    if (!editable || isLimitReached) return;
    setAdding(true);
    setAddForm({ email: "", role: "USER" });
    setEditingId("new");
  };

  const handleAddSubmit = async (payload) => {
    if (!editable || !userId) return;
    try {
      await accountOps.createAccount({ ...payload, userId });
      setAdding(false);
      setEditingId(null);
      if (refreshFn) await refreshFn();
      else await loadAccounts();
      showSuccess(
        t("accounts.manager.addSuccessTitle"),
        t("accounts.manager.addSuccessMessage"),
      );
    } catch (err) {
      console.error("Erreur ajout compte:", err);
      showError(t("accounts.form.errorTitle"), t("accounts.manager.addErrorMessage"));
    }
  };

  // Header action: add button like AddressManager
  const headerAction = editable ? (
    <IconButton
      icon={PlusIcon}
      label={t("accounts.manager.add")}
      variant="primary"
      size="md"
      onClick={handleAddClick}
      disabled={loading}
    />
  ) : null;

  // Build title node with icon to keep header consistent
  const TitleNode = (
    <div className="flex items-center gap-3">
      <KeyOutlineIcon className="w-6 h-6 text-gray-500" />
      <h3 className="text-lg font-semibold text-gray-900">{resolvedLabel}</h3>
    </div>
  );

  return (
    <>
      <Panel title={TitleNode} actionsPrimary={headerAction}>
        <div>
          {/* If adding, show add form inline */}
          {adding && (
            <div className="mb-4">
              <MyForm
                key="add"
                fields={fields}
                initialValues={addForm}
                onSubmit={handleAddSubmit}
                onChange={setAddForm}
                submitButtonLabel={t("accounts.manager.add")}
                onCancel={() => {
                  setAdding(false);
                  setEditingId(null);
                }}
                cancelButtonLabel={t("users.form.cancel")}
                allowNoChanges={true}
                inline={true}
                loading={loading}
              />
            </div>
          )}

          {/* Edition inline pour un compte */}
          {editingId && editingId !== "new" && (
            <div className="mb-4">
              <MyForm
                fields={fields}
                initialValues={editForm}
                onSubmit={handleSubmit}
                onChange={setEditForm}
                submitButtonLabel={t("accounts.manager.save")}
                onCancel={() => setEditingId(null)}
                inline={true}
                loading={loadingSubmit || loading}
              />
            </div>
          )}

          {/* Liste des comptes */}
          {loading ? (
            <div className="space-y-3 px-4 py-8">
              <div className="skeleton-light h-4 w-1/3 rounded" />
              <div className="skeleton-light h-4 w-1/2 rounded" />
              <div className="skeleton-light h-4 w-2/3 rounded" />
            </div>
          ) : localAccounts && localAccounts.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {localAccounts.map((account) => (
                <div key={account.id} className="py-4">
                  {editingId === account.id ? (
                    <div />
                  ) : (
                    <div className="flex items-start justify-between gap-4">
                      <div
                        className={
                          editable ? "cursor-pointer flex-1" : "flex-1"
                        }
                      >
                        <div className="space-y-2">
                          <span className="text-lg font-semibold text-gray-900 block">
                            {account.email}
                          </span>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div>
                              {t("accounts.manager.providerLabel")}:{" "}
                              {account.provider || t("accounts.localProvider")}
                            </div>
                            <div>
                              {t("accounts.manager.roleLabel")}: {account.role}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions: modifier / supprimer / changer mot de passe */}
                      <div className="flex flex-col items-end gap-2">
                        {editable && (
                          <ModifyButton
                            size="sm"
                            modifyLabel={t("accounts.manager.edit")}
                            onModify={() => handleEdit(account)}
                          />
                        )}

                        {editable && (
                          <DeleteButton
                            onDelete={() => handleDelete(account.id)}
                            size="sm"
                            deleteLabel={t("accounts.manager.delete")}
                            confirmTitle={t("accounts.manager.deleteConfirmTitle")}
                            confirmMessage={t(
                              "accounts.manager.deleteConfirmMessage",
                            ).replace("{email}", account.email)}
                          />
                        )}

                        {changePassword && (
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => openChangePassword(account.id)}
                            disabled={!account}
                          >
                            {t("accounts.manager.changePassword")}
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">{t("accounts.manager.empty")}</p>
          )}

          {/* Affiche le bouton bas uniquement si la liste est vide (évite une bordure vide sous la liste) */}
          {editable &&
            !loading &&
            localAccounts &&
            localAccounts.length === 0 && (
              <div className="mt-0">
                <Button variant="link" size="sm" onClick={handleAddClick}>
                  {t("accounts.manager.emptyAdd")}
                </Button>
              </div>
            )}
        </div>

        {notification.show && (
          <Notification
            type={notification.type}
            title={notification.title}
            message={notification.message}
            onClose={hideNotification}
          />
        )}
      </Panel>

      {/* Change password modal */}
      <ChangePasswordModal
        open={showChangePwd}
        onClose={() => setShowChangePwd(false)}
        accountId={changePwdAccountId}
        allowAdminReset={allowAdminReset}
        onSuccess={async () => {
          setShowChangePwd(false);
          setChangePwdAccountId(null);
          if (refreshFn) await refreshFn();
          else await loadAccounts();
        }}
      />
    </>
  );
}

AccountManager.propTypes = {
  label: PropTypes.string,
  accounts: PropTypes.array,
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  refreshAccounts: PropTypes.func,
  refreshUser: PropTypes.func,
  editable: PropTypes.bool,
  changePassword: PropTypes.bool,
};

AccountManager.defaultProps = {
  label: null,
  accounts: [],
  userId: null,
  refreshAccounts: null,
  refreshUser: null,
  editable: true,
  changePassword: false,
};
