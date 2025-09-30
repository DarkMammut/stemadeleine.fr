import React, { useEffect, useState } from "react";
import Button from "@/components/ui/Button";

export default function InputWithActions({
  label,
  initialValue = "",
  onSave,
  onChange,
  type = "text",
  placeholder = "",
  saveButtonLabel = "Enregistrer",
  cancelButtonLabel = "Annuler",
  disabled = false,
  multiline = false,
  ...props
}) {
  const [value, setValue] = useState(initialValue);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setValue(initialValue);
    setEditing(false);
  }, [initialValue]);

  const handleInputChange = (e) => {
    setValue(e.target.value);
    setEditing(e.target.value !== initialValue);
    if (onChange) onChange(e.target.value);
  };

  const handleSave = () => {
    if (onSave) onSave(value);
    setEditing(false);
  };

  const handleCancel = () => {
    setValue(initialValue);
    setEditing(false);
    if (onChange) onChange(initialValue);
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label className="font-medium mb-1">{label}</label>}
      <div
        className={
          // Responsive: boutons en colonne si multiline ou sur petits écrans
          multiline
            ? "flex flex-col gap-2 w-full"
            : "flex flex-row items-center gap-2 w-full flex-wrap"
        }
      >
        {multiline ? (
          <textarea
            value={value}
            onChange={handleInputChange}
            placeholder={placeholder}
            disabled={disabled}
            className="border rounded px-2 py-1 flex-1 min-h-[80px] resize-y"
            {...props}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={handleInputChange}
            placeholder={placeholder}
            disabled={disabled}
            className="border rounded px-2 py-1 flex-1 min-w-0"
            {...props}
          />
        )}
        {editing && (
          <div className={multiline ? "flex gap-2 mt-2" : "flex gap-2"}>
            <Button
              onClick={handleSave}
              disabled={disabled}
              size="sm"
              variant="primary"
            >
              {saveButtonLabel}
            </Button>
            <Button
              onClick={handleCancel}
              disabled={disabled}
              size="sm"
              variant="secondary"
            >
              {cancelButtonLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
