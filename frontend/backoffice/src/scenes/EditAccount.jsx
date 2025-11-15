import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Title from "@/components/ui/Title";
import SceneLayout from "@/components/ui/SceneLayout";
import LinkUser from "@/components/LinkUser";
import { useAccountOperations } from "@/hooks/useAccountOperations";
import { useNotification } from "@/hooks/useNotification";
import Notification from "@/components/ui/Notification";
import EditablePanel from "@/components/ui/EditablePanel";
import { UserIcon } from "@heroicons/react/24/outline";
import ActiveSwitch from "@/components/ActiveSwitch";

export default function EditAccount() {
  const { id } = useParams();
  const router = useRouter();
  const accountOps = useAccountOperations();
  const { attachUser, detachUser } = accountOps;
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();

  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Helper to compute a stable display name (avoid empty strings)
  const getDisplayName = (acc) => {
    if (!acc) return null;
    const u = typeof acc.username === "string" ? acc.username.trim() : null;
    const e = typeof acc.email === "string" ? acc.email.trim() : null;
    if (u) return u;
    if (e) return e;
    return acc.id || null;
  };

  useEffect(() => {
    if (id) fetchAccount();
    return () => hideNotification();
  }, [id]);

  const fetchAccount = async () => {
    setLoading(true);
    try {
      const res = await accountOps.getAccountById(id);
      // Normalize response: some APIs return userId instead of nested user object
      const normalized = {
        ...res,
        user: res.user ? res.user : res.userId ? { id: res.userId } : null,
        // ensure username exists (fallback to email/userId/id)
        username:
          res.username ?? res.email ?? (res.userId ? res.userId : res.id) ?? "",
        // ensure roles is an array; support legacy `role` string
        roles: Array.isArray(res.roles)
          ? res.roles
          : res.role
            ? [res.role]
            : res.roles || [],
        // ensure isActive is a boolean (backend uses isActive)
        isActive:
          typeof res.isActive === "boolean" ? res.isActive : !!res.isActive,
      };
      console.debug("fetchAccount: raw response", res);
      console.debug("fetchAccount: normalized", normalized);
      setAccount(normalized);
      // no need to keep a separate `form` state; EditablePanel uses account for initial values
    } catch (e) {
      showError("Erreur lors du chargement du compte", e?.message || "");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await accountOps.deleteAccount(id);
      showSuccess("Compte supprimé", "Le compte a bien été supprimé");
      router.push(`/settings/accounts?r=${Date.now()}`);
    } catch (err) {
      showError("Erreur lors de la suppression", err?.message || "");
    }
  };

  // noop cancel handler used by EditablePanel when edit is cancelled externally
  const handleCancelEdit = () => {
    hideNotification();
  };

  // handler to update account (used by EditablePanel)
  const handleUpdateAccount = async (vals) => {
    // map fields to payload
    const payload = {
      username: vals.username,
      provider: vals.provider,
      roles: vals.roles ? vals.roles.split(/\s*,\s*/) : [],
    };
    setSaving(true);
    try {
      await accountOps.updateAccount(id, payload);
      await fetchAccount();
      showSuccess(
        "Compte mis à jour",
        "Les modifications ont été enregistrées",
      );
      // redirect to list with selected
      router.push(`/settings/accounts?selected=${id}`);
    } catch (e) {
      showError("Erreur lors de la mise à jour du compte", e?.message || "");
      throw e;
    } finally {
      setSaving(false);
    }
  };

  // debug render
  console.debug("EditAccount render, account:", account);
  // NOTE: Ne pas retourner tôt lors du chargement — on laisse les composants (Panel, EditablePanel, LinkUser)
  // afficher leurs skeletons via la prop `loading` pour une expérience utilisateur plus fluide.

  return (
    <SceneLayout>
      <Title label="Modifier le compte" />

      <div className="space-y-6">
        <ActiveSwitch
          isActive={account ? !!account.isActive : false}
          onChange={async (next) => {
            try {
              setSaving(true);
              const updated = await accountOps.setActive(
                id,
                typeof next === "boolean" ? next : !account.isActive,
              );
              const normalized = {
                ...updated,
                user: updated.user
                  ? updated.user
                  : updated.userId
                    ? { id: updated.userId }
                    : null,
                username:
                  updated.username ??
                  updated.email ??
                  (updated.userId ? updated.userId : updated.id) ??
                  "",
                roles: Array.isArray(updated.roles)
                  ? updated.roles
                  : updated.role
                    ? [updated.role]
                    : updated.roles || [],
                isActive:
                  typeof updated.isActive === "boolean"
                    ? updated.isActive
                    : !!updated.isActive,
              };
              setAccount(normalized);
            } catch (e) {
              showError("Erreur lors du changement d'état", e?.message || "");
            } finally {
              setSaving(false);
            }
          }}
          saving={saving}
          loading={loading}
          accountId={id}
          accountOwnerId={
            account ? (account.user ? account.user.id : account.userId) : null
          }
        />

        <EditablePanel
          key={account ? account.id : "account"}
          title={getDisplayName(account) || "Compte"}
          icon={UserIcon}
          canEdit={true}
          initialValues={account || {}}
          fields={[
            {
              name: "provider",
              label: "Provider",
              type: "text",
              required: true,
            },
            {
              name: "username",
              label: "Username",
              type: "text",
              required: true,
            },
            {
              name: "roles",
              label: "Roles (csv)",
              type: "text",
              required: true,
            },
          ]}
          displayColumns={2}
          loading={loading || saving}
          onSubmit={handleUpdateAccount}
          onCancelExternal={handleCancelEdit}
          onDelete={handleDelete}
        />

        {/* LinkUser moved below the EditablePanel as requested */}
        <div className="mt-4">
          <LinkUser
            accountId={id}
            currentUser={account ? account.user : null}
            onLinked={fetchAccount}
            loading={loading || saving}
            operations={{
              attach: async (userId) => {
                const updated = await attachUser(id, userId);
                if (updated) {
                  const normalized = {
                    ...updated,
                    user: updated.user
                      ? updated.user
                      : updated.userId
                        ? { id: updated.userId }
                        : null,
                    username:
                      updated.username ??
                      updated.email ??
                      (updated.userId ? updated.userId : updated.id) ??
                      "",
                    roles: Array.isArray(updated.roles)
                      ? updated.roles
                      : updated.role
                        ? [updated.role]
                        : updated.roles || [],
                    isActive:
                      typeof updated.isActive === "boolean"
                        ? updated.isActive
                        : !!updated.isActive,
                  };
                  setAccount(normalized);
                }
              },
              detach: async () => {
                const updated = await detachUser(id);
                if (updated) {
                  const normalized = {
                    ...updated,
                    user: updated.user
                      ? updated.user
                      : updated.userId
                        ? { id: updated.userId }
                        : null,
                    username:
                      updated.username ??
                      updated.email ??
                      (updated.userId ? updated.userId : updated.id) ??
                      "",
                    roles: Array.isArray(updated.roles)
                      ? updated.roles
                      : updated.role
                        ? [updated.role]
                        : updated.roles || [],
                    isActive:
                      typeof updated.isActive === "boolean"
                        ? updated.isActive
                        : !!updated.isActive,
                  };
                  setAccount(normalized);
                }
              },
              updateLocal: (user) => {
                if (!user)
                  return setAccount((a) => (a ? { ...a, user: null } : a));
                const resolved =
                  typeof user === "string"
                    ? { id: user }
                    : user.id
                      ? { id: user.id }
                      : user;
                setAccount((a) => (a ? { ...a, user: resolved } : a));
              },
            }}
          />
        </div>
      </div>

      {notification.show && (
        <Notification
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={hideNotification}
        />
      )}
    </SceneLayout>
  );
}
