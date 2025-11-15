import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Panel from "@/components/ui/Panel";
import ModifyButton from "@/components/ui/ModifyButton";
import VariableDisplay from "@/components/ui/VariableDisplay";
import MyForm from "@/components/ui/MyForm";
import DeleteButton from "@/components/ui/DeleteButton";
import FormPanelContext from "@/components/ui/FormPanelContext";

export default function EditablePanel({
  title,
  icon = null,
  canEdit = true,
  children,
  renderForm = null,
  fields = null, // MyForm-style fields
  initialValues = {},
  loading = false,
  onSubmit = null,
  onCancelExternal = null,
  onDelete = null,
  actions = null,
  displayColumns = 1,
  displayGap = 4,
  editing,
  onEditingChange,
}) {
  const [editingLocal, setEditingLocal] = useState(false);
  const [formValues, setFormValues] = useState(initialValues || {});

  const effectiveEditing = () =>
    typeof editing === "boolean" ? editing : editingLocal;

  useEffect(() => {
    if (!effectiveEditing()) {
      try {
        const prev = JSON.stringify(formValues || {});
        const next = JSON.stringify(initialValues || {});
        if (prev !== next) setFormValues(initialValues || {});
      } catch (e) {
        setFormValues(initialValues || {});
      }
    }
  }, [initialValues, editing, editingLocal]);

  const startEdit = () => {
    if (typeof editing === "boolean") {
      if (typeof onEditingChange === "function") onEditingChange(true);
    } else {
      setEditingLocal(true);
    }
  };

  const cancelEdit = () => {
    setFormValues(initialValues || {});
    if (typeof editing === "boolean") {
      if (typeof onEditingChange === "function") onEditingChange(false);
    } else {
      setEditingLocal(false);
    }
    if (typeof onCancelExternal === "function") onCancelExternal();
  };

  const handleSubmit = async (values) => {
    if (typeof onSubmit === "function") {
      await onSubmit(values);
    }
    if (typeof editing === "boolean") {
      if (typeof onEditingChange === "function") onEditingChange(false);
    } else {
      setEditingLocal(false);
    }
  };

  const renderView = () => {
    if (Array.isArray(fields) && fields.length > 0) {
      return (
        <VariableDisplay
          fields={fields}
          data={initialValues}
          columns={displayColumns}
          gap={displayGap}
          loading={loading}
        />
      );
    }
    return <div>{children}</div>;
  };

  const renderEditor = () => {
    const rf = renderForm;
    const defaultRender = ({
      initialValues: iv,
      onCancel,
      onSubmit: s,
      onChange,
      loading: ld,
    }) => (
      <MyForm
        fields={fields}
        initialValues={iv}
        onSubmit={s}
        onCancel={onCancel}
        onChange={onChange}
        loading={ld}
      />
    );

    const renderer = typeof rf === "function" ? rf : defaultRender;

    return (
      <FormPanelContext.Provider value={false}>
        {renderer({
          initialValues: formValues,
          onCancel: cancelEdit,
          onSubmit: handleSubmit,
          onChange: (a, b, c) => {
            if (typeof a === "function") {
              setFormValues((prev) => a(prev) || prev);
              return;
            }
            if (typeof a === "object") {
              setFormValues((prev) => ({ ...(prev || {}), ...(a || {}) }));
              return;
            }
            if (c && typeof c === "object") {
              setFormValues(c);
              return;
            }
            setFormValues((prev) => ({ ...(prev || {}), [a]: b }));
          },
          loading,
        })}
      </FormPanelContext.Provider>
    );
  };

  return (
    <Panel
      title={title}
      icon={icon}
      actions={
        <>
          {actions}
          {canEdit && !effectiveEditing() && (
            <ModifyButton
              onModify={startEdit}
              modifyLabel="Modifier"
              size="sm"
              disabled={loading}
            />
          )}
          {onDelete && !effectiveEditing() && (
            <DeleteButton
              onDelete={onDelete}
              hoverExpand={true}
              disabled={loading}
              size="sm"
            />
          )}
        </>
      }
      loading={loading}
    >
      {!effectiveEditing() ? renderView() : renderEditor()}
    </Panel>
  );
}

EditablePanel.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  icon: PropTypes.any,
  canEdit: PropTypes.bool,
  children: PropTypes.node,
  renderForm: PropTypes.func,
  fields: PropTypes.array,
  initialValues: PropTypes.object,
  loading: PropTypes.bool,
  onSubmit: PropTypes.func,
  onCancelExternal: PropTypes.func,
  actions: PropTypes.node,
  onDelete: PropTypes.func,
  editing: PropTypes.bool,
  onEditingChange: PropTypes.func,
  displayColumns: PropTypes.number,
  displayGap: PropTypes.number,
};

EditablePanel.defaultProps = {
  icon: null,
  canEdit: true,
  children: null,
  renderForm: null,
  fields: null,
  initialValues: {},
  loading: false,
  onSubmit: null,
  onCancelExternal: null,
  actions: null,
  onDelete: null,
  editing: undefined,
  onEditingChange: undefined,
  displayColumns: 1,
  displayGap: 4,
};
