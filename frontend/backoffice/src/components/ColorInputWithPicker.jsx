import React, { useEffect, useState } from "react";
import ColorPicker from "@/components/ColorPicker";
import Button from "@/components/ui/Button";
import Notification from "@/components/Notification";
import { useNotification } from "@/hooks/useNotification";

export default function ColorInputWithPicker({
  title,
  label,
  initialValue = "#000000",
  onSave,
  onChange,
  onCancel,
  saveButtonLabel = "Enregistrer",
  cancelButtonLabel = "Annuler",
  disabled = false,
  loading = false,
  showSaveButton = false,
  showCancelButton = false,
  successMessage = "Couleur mise à jour avec succès",
  errorMessage = "Erreur lors de la mise à jour de la couleur",
}) {
  const [color, setColor] = useState(initialValue);
  const [hasChanges, setHasChanges] = useState(false);
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();

  useEffect(() => {
    setColor(initialValue);
    setHasChanges(false);
  }, [initialValue]);

  // Vérifier si la couleur a été modifiée (similaire à InputWithActions)
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

  const handleChange = (val) => {
    setColor(val);
    const changes = checkForChanges(val);
    setHasChanges(changes);
    if (onChange) onChange(val);
  };

  const handleSave = async () => {
    if (onSave) {
      try {
        await onSave(color);
        setHasChanges(false);
        showSuccess("Succès", successMessage);
      } catch (error) {
        console.error("Erreur lors de la sauvegarde:", error);
        showError("Erreur", errorMessage);
      }
    }
  };

  const handleCancel = () => {
    setColor(initialValue);
    setHasChanges(false);
    if (onChange) onChange(initialValue);
    if (onCancel) onCancel();
  };

  return (
    <div className="bg-white shadow-xs outline outline-gray-900/5 sm:rounded-xl">
      {title && (
        <div className="px-4 py-6 sm:px-8 sm:pt-8 sm:pb-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      <div className="px-4 py-6 sm:p-8">
        <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          <div className="col-span-full">
            {label && (
              <label className="block text-sm/6 font-medium text-gray-900">
                {label}
              </label>
            )}
            <div className="mt-2">
              <div className="flex items-center gap-4">
                <ColorPicker
                  value={color}
                  onChange={handleChange}
                  displayHex={false}
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => handleChange(e.target.value)}
                  pattern="#?[0-9A-Fa-f]{6}"
                  maxLength={7}
                  disabled={disabled}
                  className="block w-32 rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 font-mono disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section des boutons d'actions - logique identique à InputWithActions */}
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
        <div className="flex items-center justify-end gap-x-3 px-4 py-4 sm:px-8">
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

      {/* Notifications */}
      <Notification
        show={notification.show}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={hideNotification}
      />
    </div>
  );
}
