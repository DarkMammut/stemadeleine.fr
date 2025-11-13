import React, { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Notification from "@/components/ui/Notification";
import { useNotification } from "@/hooks/useNotification";
import Panel from "@/components/ui/Panel";
import PropTypes from "prop-types";

export default function InputWithActions({
  title,
  label,
  initialValue = "",
  onSave,
  onChange,
  onCancel,
  type = "text",
  placeholder = "",
  disabled = false,
  multiline = false,
  successMessage = "Enregistré avec succès",
  errorMessage = "Erreur lors de l'enregistrement",
  loading = false,
  saveButtonLabel = "Enregistrer",
  cancelButtonLabel = "Annuler",
  showSaveButton = false,
  showCancelButton = false,
  ...props
}) {
  const [value, setValue] = useState(initialValue);
  const [hasChanges, setHasChanges] = useState(false);
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();

  useEffect(() => {
    setValue(initialValue);
    setHasChanges(false);
  }, [initialValue]);

  // Vérifier si le formulaire a été modifié (similaire à MyForm)
  const checkForChanges = (newValue) => {
    const currentValue = newValue;
    const initial = initialValue;

    // Comparaison en tenant compte des valeurs nulles/undefined/vides
    if (currentValue === initial) return false;

    const isCurrentEmpty =
      !currentValue && currentValue !== 0 && currentValue !== false;
    const isInitialEmpty = !initial && initial !== 0 && initial !== false;

    return !(isCurrentEmpty && isInitialEmpty);
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    const changes = checkForChanges(newValue);
    setHasChanges(changes);
    if (onChange) onChange(newValue);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (onSave) {
      try {
        await onSave(value);
        setHasChanges(false);
        showSuccess("Succès", successMessage);
      } catch (error) {
        console.error("Erreur lors de la sauvegarde:", error);
        showError("Erreur", errorMessage);
      }
    }
  };

  const handleCancel = () => {
    setValue(initialValue);
    setHasChanges(false);
    if (onChange) onChange(initialValue);
    if (onCancel) onCancel();
  };

  return (
    <Panel title={title}>
      <form>
        <div className="px-0 py-0">
          <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="col-span-full">
              {label && (
                <label className="block text-sm/6 font-medium text-gray-900">
                  {label}
                </label>
              )}
              <div className="mt-2">
                {multiline ? (
                  <textarea
                    value={value}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    rows={3}
                    className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
                    {...props}
                  />
                ) : (
                  <input
                    type={type}
                    value={value}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
                    {...props}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section des boutons d'actions - logique simplifiée */}
        {(() => {
          // Logique d'affichage des boutons :
          // - Si showButton est true : toujours visible
          // - Si showButton est false : visible seulement si hasChanges
          const shouldShowCancel =
            showCancelButton === true ||
            (showCancelButton === false && hasChanges);
          const shouldShowSave =
            showSaveButton === true || (showSaveButton === false && hasChanges);
          return shouldShowCancel || shouldShowSave;
        })() && (
          <div className="flex items-center justify-end gap-x-3">
            {(showCancelButton === true ||
              (showCancelButton === false && hasChanges)) && (
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={handleCancel}
                disabled={loading || !hasChanges}
              >
                {cancelButtonLabel}
              </Button>
            )}
            {(showSaveButton === true ||
              (showSaveButton === false && hasChanges)) && (
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleSave}
                disabled={disabled || !hasChanges || loading}
                loading={loading}
              >
                {saveButtonLabel}
              </Button>
            )}
          </div>
        )}
      </form>

      {/* Notifications */}
      <Notification
        show={notification.show}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={hideNotification}
      />
    </Panel>
  );
}

InputWithActions.propTypes = {
  title: PropTypes.node,
  label: PropTypes.string,
  initialValue: PropTypes.any,
  onSave: PropTypes.func,
  onChange: PropTypes.func,
  onCancel: PropTypes.func,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  multiline: PropTypes.bool,
  loading: PropTypes.bool,
  saveButtonLabel: PropTypes.string,
  cancelButtonLabel: PropTypes.string,
  showSaveButton: PropTypes.bool,
  showCancelButton: PropTypes.bool,
};

InputWithActions.defaultProps = {
  title: null,
  label: "",
  initialValue: "",
  onSave: null,
  onChange: null,
  onCancel: null,
  type: "text",
  placeholder: "",
  disabled: false,
  multiline: false,
  loading: false,
  saveButtonLabel: "Enregistrer",
  cancelButtonLabel: "Annuler",
  showSaveButton: false,
  showCancelButton: false,
};
