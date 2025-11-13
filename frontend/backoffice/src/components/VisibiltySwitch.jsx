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
}) {
  return (
    <Panel title={title}>
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
    </Panel>
  );
}

VisibilitySwitch.propTypes = {
  title: PropTypes.node,
  label: PropTypes.node,
  isVisible: PropTypes.bool,
  onChange: PropTypes.func,
  savingVisibility: PropTypes.bool,
};

VisibilitySwitch.defaultProps = {
  title: "Visibilité de l'élément",
  label: "Visible sur le site",
  isVisible: false,
  onChange: null,
  savingVisibility: false,
};
