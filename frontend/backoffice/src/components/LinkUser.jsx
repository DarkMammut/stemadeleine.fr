"use client";

import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useUserOperations } from "@/hooks/useUserOperations";
import { useAccountOperations } from "@/hooks/useAccountOperations";
import { useNotification } from "@/hooks/useNotification";
import IconButton from "@/components/ui/IconButton";
import Autocomplete from "@/components/ui/Autocomplete";
import ConfirmModal from "@/components/ui/ConfirmModal";
import DeleteModal from "@/components/ui/DeleteModal";
import {
  LinkIcon,
  PencilIcon,
  PlusIcon,
  UserMinusIcon,
} from "@heroicons/react/24/outline";
import Button from "./ui/Button";
import { useRouter } from "next/navigation";
import Panel from "@/components/ui/Panel";
import AddUserModal from "@/components/AddUserModal";

export default function LinkUser({
  title = "Lier un utilisateur",
  accountId,
  currentUser,
  onLinked,
  onLink,
  onCreateAndLink,
  onUnlink,
  loading: parentLoading = false,
  operations = null, // { attach: fn, detach: fn, updateLocal: fn }
}) {
  const { getAllUsers } = useUserOperations();
  const accountOps = useAccountOperations();
  const { showSuccess, showError } = useNotification();
  const router = useRouter();

  const [userOptions, setUserOptions] = useState([]);
  const [localLoading, setLocalLoading] = useState(false);
  const [selected, setSelected] = useState(currentUser ? currentUser.id : "");
  const [saving, setSaving] = useState(false);
  const [showConfirmLink, setShowConfirmLink] = useState(false);
  const [showConfirmUnlink, setShowConfirmUnlink] = useState(false);
  const [editing, setEditing] = useState(!currentUser);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // combined loading state to control UI disabled state and skeleton display
  const combinedLoading = Boolean(parentLoading || localLoading || saving);

  useEffect(() => {
    setSelected(currentUser ? currentUser.id : "");
    setEditing(!currentUser);
  }, [currentUser]);

  // précharger la liste d'utilisateurs une fois (limité à 200)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLocalLoading(true);
        const res = await getAllUsers(false, 0, 200);
        const list = res && res.content ? res.content : res;
        const mapped = (list || []).map((u) => ({
          label:
            u.displayName ||
            u.email ||
            `${u.firstname || ""} ${u.lastname || ""}`,
          value: u.id,
        }));
        if (mounted) setUserOptions(mapped);
      } catch (err) {
        console.error("Erreur chargement utilisateurs", err);
      } finally {
        if (mounted) setLocalLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [getAllUsers]);

  // helper pour attacher/détacher via la source fournie (operations) ou fallback
  const doAttach = async (userId) => {
    console.debug("LinkUser: doAttach called with", userId);
    // priority: explicit operations prop > accountId/accountOps > onLink callback
    if (operations && typeof operations.attach === "function") {
      return operations.attach(userId);
    }
    if (
      accountId &&
      accountOps &&
      typeof accountOps.updateAccount === "function"
    ) {
      return accountOps.updateAccount(accountId, { user: { id: userId } });
    }
    if (typeof onLink === "function") {
      return onLink(userId);
    }
    throw new Error("No attach method available");
  };

  const doDetach = async () => {
    console.debug("LinkUser: doDetach called");
    // priority: explicit operations prop > accountId/accountOps > onCreateAndLink(null) or onUnlink
    if (operations && typeof operations.detach === "function") {
      return operations.detach();
    }
    if (
      accountId &&
      accountOps &&
      typeof accountOps.updateAccount === "function"
    ) {
      return accountOps.updateAccount(accountId, { user: null });
    }
    if (typeof onCreateAndLink === "function") {
      // convention existing: onCreateAndLink(null) to unlink when no accountId
      return onCreateAndLink(null);
    }
    if (typeof onUnlink === "function") {
      return onUnlink();
    }
    throw new Error("No detach method available");
  };

  // rewrite handleLink and handleUnlink to use doAttach / doDetach and optionally update local data via operations.updateLocal
  const handleLink = async () => {
    if (!selected)
      return showError("Sélection requise", "Choisissez un utilisateur");
    setShowConfirmLink(false);
    setSaving(true);
    console.debug("LinkUser: handleLink called, selected=", selected);
    try {
      // perform attach
      await doAttach(selected);

      // optionally update local data if operations provides it
      if (operations && typeof operations.updateLocal === "function") {
        try {
          operations.updateLocal({ id: selected });
        } catch (e) {
          console.debug("LinkUser: operations.updateLocal threw", e);
        }
      }

      showSuccess("Utilisateur lié", "L'utilisateur a été lié avec succès");
      onLinked && onLinked();
      setEditing(false);
    } catch (err) {
      console.error("Erreur lors du lien:", err);
      showError("Erreur", "Impossible d'effectuer l'opération de liaison");
    } finally {
      setSaving(false);
    }
  };

  const handleUnlink = async () => {
    setShowConfirmUnlink(false);
    setSaving(true);
    console.debug("LinkUser: handleUnlink called, currentUser=", currentUser);
    try {
      await doDetach();

      // optionally update local data
      if (operations && typeof operations.updateLocal === "function") {
        try {
          operations.updateLocal(null);
        } catch (e) {
          console.debug("LinkUser: operations.updateLocal threw", e);
        }
      }

      showSuccess("Compte détaché", "Le compte a été détaché de l'utilisateur");
      setSelected("");
      onLinked && onLinked();
      if (typeof onUnlink === "function") {
        try {
          const maybe = onUnlink();
          if (maybe && typeof maybe.then === "function") await maybe;
        } catch (e) {
          console.debug("LinkUser: onUnlink threw", e);
        }
      }
      setEditing(true);
    } catch (err) {
      console.error("Erreur lors du détachement:", err);
      showError("Erreur", "Impossible de détacher le compte de l'utilisateur");
    } finally {
      setSaving(false);
    }
  };

  // Render: if not editing and a user is attached, show compact view with link + unlink + edit
  const headerActions = (
    <>
      {editing ? null : (
        <IconButton
          icon={PencilIcon}
          label="Modifier"
          size="md"
          onClick={() => setEditing(true)}
          disabled={combinedLoading}
        />
      )}
      {!editing && currentUser ? (
        <IconButton
          icon={UserMinusIcon}
          label="Détacher"
          variant="danger"
          size="md"
          hoverExpand={true}
          onClick={() => setShowConfirmUnlink(true)}
          disabled={combinedLoading}
        />
      ) : null}
    </>
  );

  // Panel content: either compact view (not editing) or editor (autocomplete)
  const panelContent =
    !editing && currentUser ? (
      <div className="flex items-center gap-3">
        {combinedLoading ? (
          <div className="w-48">
            <div className="skeleton-light h-5 rounded" />
          </div>
        ) : (
          <Button
            onClick={() =>
              currentUser.id && router.push(`/users/${currentUser.id}`)
            }
            variant="link"
            disabled={!currentUser.id}
          >
            {(currentUser.firstname || "") +
              (currentUser.lastname ? " " + currentUser.lastname : "") ||
              currentUser.email ||
              "Utilisateur"}
          </Button>
        )}

        <div className="ml-auto flex items-center gap-2" />

        <DeleteModal
          open={showConfirmUnlink}
          onClose={() => setShowConfirmUnlink(false)}
          onConfirm={handleUnlink}
          title="Confirmer le détachement"
          message={"Voulez-vous vraiment détacher ce compte de l'utilisateur ?"}
          confirmLabel="Détacher"
          cancelLabel="Annuler"
          isDeleting={saving}
        />
      </div>
    ) : (
      <div className="space-y-3">
        <label className="text-sm font-semibold text-gray-500">
          Utilisateur lié
        </label>
        <div className="flex items-center space-x-2">
          <div className="w-80">
            <Autocomplete
              value={selected}
              onChange={(val) => setSelected(val)}
              options={userOptions}
              labelKey="label"
              valueKey="value"
              placeholder="-- Aucun --"
              disabled={combinedLoading}
            />
          </div>
          <IconButton
            label="Ajouter un nouvel utilisateur"
            onClick={() => setShowCreateModal(true)}
            disabled={combinedLoading}
            size="md"
            variant="link"
            icon={PlusIcon}
          />
          <ConfirmModal
            open={showConfirmLink}
            onClose={() => setShowConfirmLink(false)}
            onConfirm={handleLink}
            title="Confirmer le lien"
            message={
              "Voulez-vous vraiment lier ce compte à l'utilisateur sélectionné ?"
            }
            confirmLabel="Lier"
            cancelLabel="Annuler"
            isLoading={saving}
            variant="primary"
          />

          {combinedLoading && (
            <div className="text-sm text-gray-500">
              Chargement utilisateurs...
            </div>
          )}
        </div>

        {/* Actions: Add + Cancel buttons */}
        <div className="flex justify-end gap-2">
          <Button
            onClick={() => {
              setEditing(false);
              setSelected(currentUser ? currentUser.id : "");
            }}
            disabled={combinedLoading}
            size="md"
            variant="outline"
          >
            Annuler
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowConfirmLink(true)}
            disabled={combinedLoading || !selected}
          >
            Enregistrer
          </Button>
        </div>
      </div>
    );

  return (
    <Panel title={title} icon={LinkIcon} actions={headerActions}>
      {panelContent}

      {/* Create user modal (shared) */}
      <AddUserModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={async (created) => {
          try {
            // after creation, link
            if (created && created.id) {
              await doAttach(created.id);
              // update local UI if possible
              if (operations && typeof operations.updateLocal === "function") {
                try {
                  operations.updateLocal({ id: created.id });
                } catch (e) {
                  console.debug(
                    "LinkUser: operations.updateLocal threw after create",
                    e,
                  );
                }
              }
              onLinked && onLinked();
              setEditing(false);
            }
          } catch (err) {
            console.error("Erreur lors de la liaison après création:", err);
            showError("Erreur", "Impossible de lier l'utilisateur créé");
            throw err;
          }
        }}
      />
    </Panel>
  );
}

LinkUser.propTypes = {
  accountId: PropTypes.string,
  currentUser: PropTypes.object,
  onLinked: PropTypes.func,
  onLink: PropTypes.func,
  onCreateAndLink: PropTypes.func,
  onUnlink: PropTypes.func,
  loading: PropTypes.bool,
  title: PropTypes.string,
  operations: PropTypes.object, // optional operations { attach, detach, updateLocal }
};

LinkUser.defaultProps = {
  accountId: null,
  currentUser: null,
  onLinked: null,
  onLink: null,
  onCreateAndLink: null,
  onUnlink: null,
  loading: false,
  title: "Lier un utilisateur",
  operations: null,
};
