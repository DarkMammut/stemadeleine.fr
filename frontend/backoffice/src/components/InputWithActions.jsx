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
    <div className="bg-white shadow-xs outline outline-gray-900/5 sm:rounded-xl">
      <div className="px-4 py-6 sm:p-8">
        <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8">
          <div className="col-span-full">
            {label && (
              <label className="block text-sm/6 font-medium text-gray-900 mb-2">
                {label}
              </label>
            )}
            {multiline ? (
              <textarea
                value={value}
                onChange={handleInputChange}
                placeholder={placeholder}
                disabled={disabled}
                rows={4}
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 resize-y"
                {...props}
              />
            ) : (
              <input
                type={type}
                value={value}
                onChange={handleInputChange}
                placeholder={placeholder}
                disabled={disabled}
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
                {...props}
              />
            )}
          </div>
        </div>
      </div>
      {editing && (
        <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
          <Button
            onClick={handleCancel}
            disabled={disabled}
            size="sm"
            variant="outline"
          >
            {cancelButtonLabel}
          </Button>
          <Button
            onClick={handleSave}
            disabled={disabled}
            size="sm"
            variant="primary"
          >
            {saveButtonLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
