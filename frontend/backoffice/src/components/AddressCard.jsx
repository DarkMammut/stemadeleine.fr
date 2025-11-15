"use client";

import React from "react";
import PropTypes from "prop-types";
import ModifyButton from "@/components/ui/ModifyButton";
import DeleteButton from "@/components/ui/DeleteButton";
import PanelCard from "@/components/ui/PanelCard";

// AddressCard: clean postal-address layout specialized for addresses.
export default function AddressCard({
  data = {},
  titleField = "name",
  titleRender = null,
  onEdit = null,
  onDelete = null,
  editable = true,
  loading = false,
  className = "",
}) {
  // address components
  const line1 = data?.addressLine1 || "";
  const line2 = data?.addressLine2 || "";
  const city = data?.city || "";
  const postCode = data?.postCode || "";
  const state = data?.state || "";
  const country = data?.country || "";

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
      titleRender={titleRender}
      loading={loading}
      className={className}
      actions={actions}
    >
      <div className={`text-gray-700`}>
        {loading ? (
          <div className="space-y-1">
            <div className="skeleton-light w-48 h-4 rounded" />
            <div className="skeleton-light w-40 h-4 rounded" />
            <div className="skeleton-light w-32 h-4 rounded" />
          </div>
        ) : (
          <div className="leading-tight">
            {line1 && <div className="text-sm">{line1}</div>}
            {line2 && <div className="text-sm">{line2}</div>}
            {(postCode || city) && (
              <div className="text-sm">
                {postCode ? (
                  <span className="font-medium mr-2">{postCode}</span>
                ) : null}
                {city}
              </div>
            )}
            {(state || country) && (
              <div className="text-xs text-gray-500 mt-1">
                {[state, country].filter(Boolean).join(" — ")}
              </div>
            )}
            {!line1 && !line2 && !postCode && !city && !state && !country && (
              <div className="text-sm text-gray-500">
                Aucune adresse renseignée
              </div>
            )}
          </div>
        )}
      </div>
    </PanelCard>
  );
}

AddressCard.propTypes = {
  data: PropTypes.object,
  titleField: PropTypes.string,
  titleRender: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  editable: PropTypes.bool,
  loading: PropTypes.bool,
  className: PropTypes.string,
};

AddressCard.defaultProps = {
  data: {},
  titleField: "name",
  titleRender: null,
  onEdit: null,
  onDelete: null,
  editable: true,
  loading: false,
  className: "",
};
