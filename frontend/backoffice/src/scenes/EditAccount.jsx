import React, {useEffect, useMemo, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import Title from "@/components/ui/Title";
import SceneLayout from "@/components/ui/SceneLayout";
import LinkUser from "@/components/LinkUser";
import {useAccountOperations} from "@/hooks/useAccountOperations";
import {useNotification} from "@/hooks/useNotification";
import Notification from "@/components/ui/Notification";
import EditablePanel from "@/components/ui/EditablePanel";
import {UserIcon} from "@heroicons/react/24/outline";
import ActiveSwitch from "@/components/ActiveSwitch";
import Utilities from "@/components/ui/Utilities";
import ChangePasswordModal from "@/components/ChangePasswordModal";
import Button from "@/components/ui/Button";

export default function EditAccount() {
    const {id} = useParams();
    const router = useRouter();
    const accountOps = useAccountOperations();
    const {attachUser, detachUser, getRoles} = accountOps;
    const {notification, showSuccess, showError, hideNotification} =
        useNotification();

    const [account, setAccount] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [roleOptions, setRoleOptions] = useState([]);
    const [showChangePwd, setShowChangePwd] = useState(false);

    // Build initialValues for the editable form: ensure `roles` is a scalar string (select expects a single value)
    const formInitialValues = useMemo(() => {
        if (!account) return {};
        const copy = {...account};
        // Take first role if array, fallback to role string or empty
        if (Array.isArray(copy.roles)) {
            copy.roles = copy.roles.length > 0 ? copy.roles[0] : "";
        } else if (typeof copy.roles === "string") {
            // keep as-is
        } else if (copy.role && typeof copy.role === "string") {
            copy.roles = copy.role;
        } else {
            copy.roles = "";
        }
        return copy;
    }, [account]);

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
        (async () => {
            try {
                const roles = await getRoles();
                setRoleOptions(
                    (roles || []).map((r) => ({
                        value: r,
                        label: r.replace(/^ROLE_/, ""),
                    })),
                );
            } catch (e) {
                console.warn("Unable to fetch roles for select", e);
            }
        })();
    }, [getRoles]);

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
                user: res.user ? res.user : res.userId ? {id: res.userId} : null,
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
            // ensure roles is an array of strings (backend expects enum names or Role[])
            roles: Array.isArray(vals.roles)
                ? vals.roles
                : typeof vals.roles === "string"
                    ? vals.roles.split(/\s*,\s*/).filter(Boolean)
                    : vals.roles
                        ? [vals.roles]
                        : [],
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
            <Title label="Modifier le compte"/>

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
                                        ? {id: updated.userId}
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

                <Utilities
                    actions={[
                        {
                            variant: "reset-password",
                            label: "Générer / réinitialiser le mot de passe",
                            // callback receives the generated password from Utilities (newPass)
                            callback: async (newPass) => {
                                try {
                                    await accountOps.resetPasswordByAdmin(id, newPass);
                                    showSuccess(
                                        "Mot de passe mis à jour",
                                        "Le mot de passe a été réinitialisé et copié dans le presse-papier",
                                    );
                                } catch (err) {
                                    // remonter l'erreur pour que Utilities puisse l'afficher si besoin
                                    console.error(err);
                                    // throw to let Utilities handle logging if necessary
                                    throw err;
                                }
                            },
                            // meta permet au composant Utilities de désactiver le bouton suivant le provider
                            meta: {
                                currentProvider: account ? account.provider : "local",
                                provider: "local",
                            },
                            size: "sm",
                        },
                    ]}
                />

                {/* Bouton pour ouvrir le modal de changement de mot de passe en mode admin */}
                <div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={
                            loading ||
                            saving ||
                            !account ||
                            (account?.provider && account?.provider.toLowerCase() !== "local")
                        }
                        onClick={() => setShowChangePwd(true)}
                        title={
                            account && account.provider && account.provider.toLowerCase() !== "local"
                                ? `Modification non disponible pour les comptes ${account.provider}`
                                : "Modifier le mot de passe (mode administrateur)"
                        }
                    >
                        Modifier le mot de passe (admin)
                    </Button>
                    {account && account.provider && account.provider.toLowerCase() !== "local" && (
                        <p className="mt-1 text-xs text-gray-500">
                            La modification de mot de passe n'est disponible que pour les comptes locaux
                        </p>
                    )}
                </div>

                <EditablePanel
                    key={account ? account.id : "account"}
                    title={getDisplayName(account) || "Compte"}
                    icon={UserIcon}
                    canEdit={true}
                    initialValues={formInitialValues || {}}
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
                            label: "Roles",
                            type: "select",
                            required: true,
                            options: [{value: "", label: "-- Choisir --"}, ...roleOptions],
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
                                                ? {id: updated.userId}
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
                                                ? {id: updated.userId}
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
                                    return setAccount((a) => (a ? {...a, user: null} : a));
                                const resolved =
                                    typeof user === "string"
                                        ? {id: user}
                                        : user.id
                                            ? {id: user.id}
                                            : user;
                                setAccount((a) => (a ? {...a, user: resolved} : a));
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

            <ChangePasswordModal
                open={showChangePwd}
                onClose={() => setShowChangePwd(false)}
                accountId={id}
                allowAdminReset={true}
                onSuccess={async () => {
                    setShowChangePwd(false);
                    // refresh account after password change
                    await fetchAccount();
                }}
            />
        </SceneLayout>
    );
}
