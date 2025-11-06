import React, { useEffect, useState } from "react";
import ColorPicker from "@/components/ColorPicker";
import Button from "@/components/ui/Button";

export default function ColorInputWithPicker({
  label,
  initialValue = "#000000",
  onSave,
  onChange,
  saveButtonLabel = "Enregistrer",
  cancelButtonLabel = "Annuler",
  disabled = false,
}) {
  const [savedColor, setSavedColor] = useState(initialValue);
  const [color, setColor] = useState(initialValue);

  useEffect(() => {
    setSavedColor(initialValue);
    setColor(initialValue);
  }, [initialValue]);

  const handleChange = (val) => {
    setColor(val);
    if (onChange) onChange(val);
  };

  const handleSave = () => {
    setSavedColor(color);
    if (onSave) onSave(color);
  };

  const handleCancel = () => {
    setColor(savedColor);
    if (onChange) onChange(savedColor);
  };

  const isModified = color !== savedColor;

  return (
    <>
      <div className="px-4 py-6 sm:p-8">
        <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8">
          <div className="col-span-full">
            {label && (
              <label className="block text-sm/6 font-medium text-gray-900 mb-2">
                {label}
              </label>
            )}
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
                className="block w-32 rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 font-mono disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
          </div>
        </div>
      </div>
      {isModified && (
        <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            disabled={disabled}
          >
            {cancelButtonLabel}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={disabled}
          >
            {saveButtonLabel}
          </Button>
        </div>
      )}
    </>
  );
}
