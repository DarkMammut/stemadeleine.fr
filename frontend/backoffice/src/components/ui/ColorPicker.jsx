import React from "react";

export default function ColorPicker({
  value = "#000000",
  onChange,
  label,
  displayHex = true,
}) {
  // Si pas de label et pas d'affichage hex, retourner juste l'input
  if (!label && !displayHex) {
    return (
      <input
        type="color"
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        className="w-8 h-8 border rounded cursor-pointer"
      />
    );
  }

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label className="font-medium mb-1">{label}</label>}
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          className="w-8 h-8 border rounded cursor-pointer"
        />
        {displayHex && <span className="ml-2 font-mono">{value}</span>}
      </div>
    </div>
  );
}
