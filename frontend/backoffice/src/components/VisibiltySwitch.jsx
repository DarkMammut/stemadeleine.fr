import Switch from "@/components/ui/Switch";
import React from "react";

export default function VisibilitySwitch({
  title = "Visibilité de l'élément",
  label = "Visible sur le site",
  isVisible = false,
  onChange,
  savingVisibility,
}) {
  return (
    <div className="bg-white shadow-xs outline outline-gray-900/5 sm:rounded-xl">
      <div className="px-4 py-6 sm:px-8 sm:pt-8 sm:pb-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="px-4 py-6 sm:p-8">
        <label
          htmlFor="visibility-switch"
          className="flex items-center gap-3 cursor-pointer"
        >
          <Switch
            id="visibility-switch"
            checked={isVisible}
            onChange={onChange}
            disabled={savingVisibility}
          />
          <span className="font-medium text-gray-900">
            {label}
            {savingVisibility && (
              <span className="text-gray-500 ml-2">(Sauvegarde...)</span>
            )}
          </span>
        </label>
        <p className="text-sm text-gray-500 mt-2">
          Cette option se sauvegarde automatiquement
        </p>
      </div>
    </div>
  );
}
