import React, { useEffect, useState } from "react";
import Panel from "@/components/ui/Panel";
import ModifyButton from "@/components/ui/ModifyButton";
import VariableDisplay from "@/components/ui/VariableDisplay";
import { mapMyFormToVariableFields } from "@/utils/mapMyFormToVariableFields";
import PropTypes from "prop-types";
import Button from "@/components/ui/Button";
import FormPanelContext from "@/components/ui/FormPanelContext";

export default function EditablePanel({
  title,
  icon = null,
  canEdit = true,
  children, // view content
  renderForm, // function that returns form component: ({ initialValues, onCancel, onSubmit, onChange, loading }) => ReactNode
  initialValues = {},
  onSubmit,
  loading = false,
  onCancelExternal = null,
  actions = null,
  // Optional MyForm-style fields: if provided, EditablePanel will render a VariableDisplay in read-only mode
  fields = null,
  displayColumns = 1,
  displayGap = 4,
  // Controlled editing props
  editing, // if provided, component is controlled
  onEditingChange, // callback(editing) when editing state should change
  // New props to control footer buttons appearance/behavior
  showFooterButtons = false,
  submitButtonLabel = "Enregistrer",
  cancelButtonLabel = "Annuler",
  // If true, disable save button (consumer can compute based on formValues)
  saveDisabled = false,
  // If true, automatically disable save when there are no changes between initialValues and formValues
  disableSaveWhenNoChanges = false,
  // If true, require fields to be valid (non-empty for required) to enable save
  requireValid = true,
}) {
  // internal state used only when `editing` prop is undefined (uncontrolled mode)
  const [editingLocal, setEditingLocal] = useState(false);
  const [formValues, setFormValues] = useState(initialValues || {});

  // Helper to determine effective editing state (controlled vs uncontrolled)
  const effectiveEditing = () => {
    return typeof editing === "boolean" ? editing : editingLocal;
  };

  // Keep formValues in sync when not editing
  useEffect(() => {
    if (!effectiveEditing()) {
      try {
        const prev = JSON.stringify(formValues || {});
        const next = JSON.stringify(initialValues || {});
        if (prev !== next) setFormValues(initialValues || {});
      } catch (e) {
        // fallback: if stringify fails, set directly
        setFormValues(initialValues || {});
      }
    }
    // include deps so effect only runs when relevant inputs change
  }, [initialValues, editing, editingLocal]);

  const startEdit = () => {
    if (typeof editing === "boolean") {
      // controlled mode: notify parent only
      if (typeof onEditingChange === "function") onEditingChange(true);
    } else {
      setEditingLocal(true);
    }
  };

  const cancelEdit = () => {
    // reset local form values to initialValues
    setFormValues(initialValues || {});
    if (typeof editing === "boolean") {
      if (typeof onEditingChange === "function") onEditingChange(false);
    } else {
      setEditingLocal(false);
    }
    if (typeof onCancelExternal === "function") onCancelExternal();
  };

  const handleFormSubmit = async (values) => {
    if (typeof onSubmit === "function") {
      await onSubmit(values);
    }
    // After successful submit, exit editing mode
    if (typeof editing === "boolean") {
      if (typeof onEditingChange === "function") onEditingChange(false);
    } else {
      setEditingLocal(false);
    }
  };

  // Footer actions rendered inside Panel when editing: Cancel + Save (optional)
  // compute whether form has changes (simple stable stringify compare)
  const hasChanges = (() => {
    try {
      const a = JSON.stringify(initialValues || {});
      const b = JSON.stringify(formValues || {});
      return a !== b;
    } catch (e) {
      return true; // be conservative if serialization fails
    }
  })();

  // compute a simple validity check based on provided `fields` and `formValues`
  const computedIsValid = (() => {
    if (!Array.isArray(fields) || fields.length === 0) return true;
    try {
      return fields.every((field) => {
        if (field.required && field.type !== "readonly") {
          const v = formValues ? formValues[field.name] : undefined;
          return v !== "" && v !== null && v !== undefined;
        }
        return true;
      });
    } catch (e) {
      return false;
    }
  })();

  const computedSaveDisabled =
    saveDisabled ||
    (disableSaveWhenNoChanges && !hasChanges) ||
    (requireValid && !computedIsValid);

  const footer =
    effectiveEditing() && showFooterButtons ? (
      <div className="w-full flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="md"
          onClick={cancelEdit}
          disabled={loading}
        >
          {cancelButtonLabel}
        </Button>
        <Button
          variant="primary"
          size="md"
          onClick={() => handleFormSubmit(formValues)}
          loading={loading}
          disabled={loading || computedSaveDisabled}
        >
          {submitButtonLabel}
        </Button>
      </div>
    ) : null;

  return (
    <Panel
      title={title}
      icon={icon}
      actions={
        <>
          {actions}
          {/* Show modify button only when editing is false and editing is allowed */}
          {canEdit && !effectiveEditing() && (
            <ModifyButton
              onModify={startEdit}
              modifyLabel="Modifier"
              size="sm"
            />
          )}
        </>
      }
      footer={footer}
    >
      {!effectiveEditing() ? (
        <div>
          {/* If MyForm-style fields are provided, render a VariableDisplay mapped from fields+initialValues */}
          {Array.isArray(fields) && fields.length > 0 ? (
            <VariableDisplay
              fields={mapMyFormToVariableFields(fields, initialValues)}
              columns={displayColumns}
              gap={displayGap}
            />
          ) : (
            <div>{children}</div>
          )}
        </div>
      ) : (
        <div>
          <FormPanelContext.Provider value={false}>
            {renderForm({
              initialValues: formValues,
              onCancel: cancelEdit,
              onSubmit: handleFormSubmit,
              onChange: (a, b, c) => {
                // proxy updater to keep local formValues in sync
                if (typeof a === "function") {
                  setFormValues((prev) => a(prev) || prev);
                  return;
                }
                if (typeof a === "object") {
                  setFormValues((prev) => ({ ...(prev || {}), ...(a || {}) }));
                  return;
                }
                // a is name
                if (c && typeof c === "object") {
                  setFormValues(c);
                  return;
                }
                setFormValues((prev) => ({ ...(prev || {}), [a]: b }));
              },
              loading,
            })}
          </FormPanelContext.Provider>
        </div>
      )}
    </Panel>
  );
}

EditablePanel.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  icon: PropTypes.any,
  canEdit: PropTypes.bool,
  children: PropTypes.node,
  renderForm: PropTypes.func,
  initialValues: PropTypes.object,
  onSubmit: PropTypes.func,
  loading: PropTypes.bool,
  onCancelExternal: PropTypes.func,
  actions: PropTypes.node,
  editing: PropTypes.bool,
  onEditingChange: PropTypes.func,
  showFooterButtons: PropTypes.bool,
  submitButtonLabel: PropTypes.string,
  cancelButtonLabel: PropTypes.string,
  saveDisabled: PropTypes.bool,
  disableSaveWhenNoChanges: PropTypes.bool,
  requireValid: PropTypes.bool,
};

EditablePanel.defaultProps = {
  icon: null,
  canEdit: true,
  children: null,
  renderForm: null,
  initialValues: {},
  onSubmit: null,
  loading: false,
  onCancelExternal: null,
  actions: null,
  editing: undefined,
  onEditingChange: undefined,
  fields: null,
  displayColumns: 1,
  displayGap: 4,
  showFooterButtons: false,
  submitButtonLabel: "Enregistrer",
  cancelButtonLabel: "Annuler",
  saveDisabled: false,
  disableSaveWhenNoChanges: false,
  requireValid: true,
};
