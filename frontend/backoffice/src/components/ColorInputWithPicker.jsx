import React, { useEffect, useState } from "react";
import ColorPicker from "./ColorPicker";
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
    <div className="flex flex-col gap-1 w-full">
      {label && <label className="font-medium mb-1">{label}</label>}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-10">
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
            className="border rounded px-2 py-1 font-mono w-28 transition-colors"
            disabled={disabled}
          />
        </div>

        {isModified && (
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={disabled}
            >
              {saveButtonLabel}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCancel}
              disabled={disabled}
            >
              {cancelButtonLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
