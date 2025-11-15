"use client";

import React from "react";
import PropTypes from "prop-types";
import VariableDisplay from "@/components/ui/VariableDisplay";
import ModifyButton from "@/components/ui/ModifyButton";
import DeleteButton from "@/components/ui/DeleteButton";
import PanelCard from "@/components/ui/PanelCard";

// MembershipCard: tailored card for membership entries using VariableDisplay
// - title defaults to year extracted from `dateAdhesion`
// - default layout uses 2 columns for compactness
export default function MembershipCard({
  fields,
  data = {},
  titleField = "dateAdhesion",
  titleRender = null,
  onEdit = null,
  onDelete = null,
  editable = true,
  loading = false,
  columns = 2,
  gap = 3,
  className = "",
}) {
  // Title render: show year and active badge
  const renderTitle = (opts) => {
    const { data: d, loading: l } = opts || { data, loading };
    if (typeof titleRender === "function")
      return titleRender({ data: d, loading: l });
    if (l) return <div className={"skeleton-light w-40 h-4 inline-block"} />;
    const v = d ? d[titleField] : null;
    let titleText = "—";
    if (v && typeof v === "string") {
      const m = v.match(/^(\d{4})-(\d{2})-(\d{2})/);
      titleText = m ? m[1] : v;
    } else if (v) {
      titleText = String(v);
    }
    const isActive = !!(d && d.active);
    return (
      <div className="flex items-center gap-3">
        <div className="text-base font-semibold text-gray-800 truncate">
          {titleText}
        </div>
        {isActive && (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
            Actif
          </span>
        )}
      </div>
    );
  };

  // membership specific pieces
  const start = data?.dateAdhesion || null;
  const end = data?.dateFin || null;

  const actions = editable ? (
    <div className="flex flex-col items-end gap-2">
      <ModifyButton
        size="sm"
        modifyLabel="Modifier"
        onModify={onEdit}
        disabled={loading || !onEdit}
      />
      <DeleteButton
        onDelete={onDelete}
        size="sm"
        deleteLabel="Supprimer"
        confirmTitle={"Supprimer"}
        confirmMessage={"Confirmer la suppression ?"}
        disabled={loading || !onDelete}
      />
    </div>
  ) : null;

  return (
    <PanelCard
      data={data}
      titleField={titleField}
      titleRender={renderTitle}
      loading={loading}
      className={className}
      actions={actions}
    >
      <div className={`text-gray-700`}>
        {loading ? (
          <div className="space-y-1">
            <div className="skeleton-light w-36 h-4 rounded" />
            <div className="skeleton-light w-28 h-4 rounded" />
          </div>
        ) : (
          <div className="leading-tight">
            {start && (
              <div className="text-sm">
                Début:{" "}
                <span className="font-medium">
                  {new Date(start).toLocaleDateString("fr-FR")}
                </span>
              </div>
            )}
            {end && (
              <div className="text-sm">
                Fin:{" "}
                <span className="font-medium">
                  {new Date(end).toLocaleDateString("fr-FR")}
                </span>
              </div>
            )}
            {Array.isArray(fields) && (
              <div className="mt-1">
                <VariableDisplay
                  fields={fields.filter(
                    (f) => f.name !== "dateAdhesion" && f.name !== "dateFin",
                  )}
                  data={data}
                  loading={loading}
                  columns={columns}
                  gap={gap}
                  labelClassName="font-medium text-gray-500"
                  valueClassName="text-gray-700"
                  size="md"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </PanelCard>
  );
}

MembershipCard.propTypes = {
  fields: PropTypes.array,
  data: PropTypes.object,
  titleField: PropTypes.string,
  titleRender: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  editable: PropTypes.bool,
  loading: PropTypes.bool,
  columns: PropTypes.number,
  gap: PropTypes.number,
  className: PropTypes.string,
};

MembershipCard.defaultProps = {
  fields: null,
  data: {},
  titleField: "dateAdhesion",
  titleRender: null,
  onEdit: null,
  onDelete: null,
  editable: true,
  loading: false,
  columns: 2,
  gap: 3,
  className: "",
};
