import React from "react";

export default function MembershipCard({
  membership = {},
  onClick,
  isPlaceholder = false,
}) {
  const {
    dateAdhesion = "",
    dateFin = "",
    isActive = false,
    active = undefined,
  } = membership || {};

  const effectiveActive = active !== undefined ? active : isActive;

  const formatYmdToDmy = (s) => {
    if (!s || typeof s !== "string") return null;
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) return `${m[3]}/${m[2]}/${m[1]}`;
    // fallback: try Date but be defensive
    try {
      const dt = new Date(s);
      if (isNaN(dt.getTime())) return s;
      return dt.toLocaleDateString();
    } catch (e) {
      return s;
    }
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 bg-gray-50 rounded-lg shadow-sm border ${isPlaceholder ? "border-dashed border-gray-300" : "border-transparent"} cursor-pointer hover:bg-gray-100`}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-600">
            {isPlaceholder
              ? "Nouvelle adhésion"
              : `${formatYmdToDmy(dateAdhesion) || dateAdhesion} — ${formatYmdToDmy(dateFin) || dateFin}`}
          </div>
          <div className="text-lg font-medium text-gray-900">
            {isPlaceholder
              ? "En création..."
              : effectiveActive
                ? "Active"
                : "Inactive"}
          </div>
        </div>
        <div className="text-sm text-gray-500">
          {!isPlaceholder && dateAdhesion ? formatYmdToDmy(dateAdhesion) : null}
        </div>
      </div>
    </div>
  );
}
