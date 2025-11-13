import Switch from "@/components/ui/Switch";
import React, { useEffect, useState } from "react";
import Panel from "@/components/ui/Panel";
import PropTypes from "prop-types";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useUserOperations } from "@/hooks/useUserOperations";

export default function ActiveSwitch({
  title = "Etat du compte",
  label = "Compte activé",
  isActive = false,
  onChange,
  saving = false,
  accountOwnerId = null,
}) {
  const [open, setOpen] = useState(false);
  const [pendingValue, setPendingValue] = useState(null);
  const [forbidden, setForbidden] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  const { getCurrentUser } = useUserOperations();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const u = await getCurrentUser();
        if (mounted && u) setCurrentUserId(u.id);
      } catch (e) {
        // ignore - if we can't get current user, we won't block anything
        console.debug(
          "ActiveSwitch: impossible de récupérer l'utilisateur courant",
          e,
        );
      }
    })();
    return () => {
      mounted = false;
    };
  }, [getCurrentUser]);

  const handleToggle = (nextChecked) => {
    if (saving) return;

    // If trying to deactivate the account we're currently logged with -> forbidden
    const ownerId = accountOwnerId || null;
    if (
      nextChecked === false &&
      ownerId != null &&
      currentUserId != null &&
      String(ownerId) === String(currentUserId)
    ) {
      setForbidden(true);
      setPendingValue(null);
      setOpen(true);
      return;
    }

    setForbidden(false);
    setPendingValue(nextChecked);
    setOpen(true);
  };

  const handleConfirm = async () => {
    setOpen(false);
    if (forbidden) {
      setForbidden(false);
      return;
    }

    // call parent onChange with the new value if it accepts it, otherwise without args
    try {
      if (onChange) {
        // some callers expect no arg (they compute toggle themselves), others expect the new value
        // call with the pending value first; if the handler ignores it, it's fine
        onChange(pendingValue);
      }
    } catch (e) {
      console.error("ActiveSwitch onChange handler error:", e);
    } finally {
      setPendingValue(null);
    }
  };

  return (
    <>
      <Panel title={title}>
        <label
          htmlFor="active-switch"
          className="flex items-center gap-3 cursor-pointer"
        >
          <Switch
            id="active-switch"
            checked={!!isActive}
            onChange={handleToggle}
            disabled={saving}
          />
          <span className="font-medium text-gray-900">
            {label}
            {saving && (
              <span className="text-gray-500 ml-2">(Sauvegarde...)</span>
            )}
          </span>
        </label>
        <p className="text-sm text-gray-500 mt-2">
          Cette option se sauvegarde automatiquement
        </p>
      </Panel>

      <ConfirmModal
        open={open}
        onClose={() => {
          setOpen(false);
          setForbidden(false);
          setPendingValue(null);
        }}
        onConfirm={handleConfirm}
        title={forbidden ? "Action interdite" : "Attention — action critique"}
        message={
          forbidden
            ? "Vous ne pouvez pas désactiver le compte lié à l'utilisateur actuellement connecté."
            : "Vous êtes sur le point de changer l'état de ce compte. Cette opération peut empêcher la connexion à ce compte. Voulez-vous continuer ?"
        }
        confirmLabel={forbidden ? "Fermer" : "Confirmer"}
        cancelLabel={forbidden ? "" : "Annuler"}
        isLoading={saving}
        variant={"danger"}
      />
    </>
  );
}

ActiveSwitch.propTypes = {
  title: PropTypes.node,
  label: PropTypes.node,
  isActive: PropTypes.bool,
  onChange: PropTypes.func,
  saving: PropTypes.bool,
  accountOwnerId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

ActiveSwitch.defaultProps = {
  title: "Etat du compte",
  label: "Compte activé",
  isActive: false,
  onChange: null,
  saving: false,
  accountOwnerId: null,
};
