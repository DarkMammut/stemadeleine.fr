import Switch from "@/components/ui/Switch";
import React from "react";
import Panel from "@/components/ui/Panel";
import PropTypes from "prop-types";

export default function VisibilitySwitch({
  title = "Visibilité de l'élément",
  label = "Visible sur le site",
  isVisible = false,
  onChange,
  savingVisibility,
  loading = false,
}) {
  const effectiveLoading = loading || savingVisibility;

  return (
    <Panel title={title} loading={effectiveLoading}>
      <label
        htmlFor="visibility-switch"
        className={`flex items-center gap-3 ${
          effectiveLoading ? "pointer-events-none" : "cursor-pointer"
        }`}
      >
        <Switch
          id="visibility-switch"
          checked={isVisible}
          onChange={onChange}
          disabled={effectiveLoading}
        />
        <span className="font-medium text-gray-900">
          {effectiveLoading ? (
            <span className="inline-block w-40 h-4 skeleton rounded" />
          ) : (
            label
          )}
          {savingVisibility && !loading && (
            <span className="text-gray-500 ml-2">(Sauvegarde...)</span>
          )}
        </span>
      </label>
      <p className="text-sm text-gray-500 mt-2">
        Cette option se sauvegarde automatiquement
      </p>
    </Panel>
  );
}

VisibilitySwitch.propTypes = {
  title: PropTypes.node,
  label: PropTypes.node,
  isVisible: PropTypes.bool,
  onChange: PropTypes.func,
  savingVisibility: PropTypes.bool,
  loading: PropTypes.bool,
};

VisibilitySwitch.defaultProps = {
  title: "Visibilité de l'élément",
  label: "Visible sur le site",
  isVisible: false,
  onChange: null,
  savingVisibility: false,
  loading: false,
};
