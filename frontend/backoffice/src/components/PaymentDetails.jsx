import React from "react";
import EditablePanel from "@/components/ui/EditablePanel";
import MyForm from "@/components/MyForm";
import PropTypes from "prop-types";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";
import DeleteButton from "@/components/ui/DeleteButton";

export default function PaymentDetails({
  payment,
  onDelete,
  onUserNavigate,
  // EditablePanel-related props
  editable = true,
  initialValues = {},
  onSave = null,
  onChange = null,
  loading = false, // form loading
  saving = false, // submit in progress
  paymentEnums = { type: [], status: [] },
}) {
  if (!payment) return null;

  const paymentFields = [
    {
      name: "amount",
      label: "Montant",
      type: "currency",
      currency: "EUR",
      required: true,
      defaultValue: initialValues.amount,
    },
    {
      name: "type",
      label: "Type",
      type: "select",
      required: true,
      defaultValue: initialValues.type,
      options: (paymentEnums.type || []).map((v) => ({ label: v, value: v })),
    },
    {
      name: "status",
      label: "Statut",
      type: "select",
      required: true,
      defaultValue: initialValues.status,
      flag: true,
      flagKey: "statusFlag",
      options: (paymentEnums.status || []).map((v) => ({ label: v, value: v })),
    },
    {
      name: "formSlug",
      label: "Slug formulaire",
      type: "text",
      required: false,
      defaultValue: initialValues.formSlug,
    },
    {
      name: "receiptUrl",
      label: "URL reçu",
      type: "url",
      required: false,
      defaultValue: initialValues.receiptUrl,
    },
    {
      name: "paymentDate",
      label: "Date de paiement",
      type: "date",
      required: false,
      defaultValue: initialValues.paymentDate,
    },
  ];

  // build actions: delete button if provided
  const panelActions = (
    <>
      {onDelete && (
        <DeleteButton
          onDelete={onDelete}
          deleteLabel="Supprimer"
          confirmTitle="Supprimer le paiement"
          confirmMessage="Êtes-vous sûr de vouloir supprimer ce paiement ? Cette action est irréversible."
          size="sm"
        />
      )}
    </>
  );

  return (
    <div className="space-y-6">
      {(() => {
        // Build merged initial values and ensure statusFlag exists (fallback to status)
        const mergedInitialValues = {
          ...(payment || {}),
          statusFlag:
            (payment && (payment.statusFlag ?? payment.status)) || undefined,
          ...(initialValues || {}),
        };

        return (
          <EditablePanel
            title={`Paiement #${payment.id}`}
            icon={CurrencyDollarIcon}
            canEdit={editable}
            // For read-mode display we must pass the actual payment data as initialValues
            // Merge edit-time initialValues (if any) so editing still works
            initialValues={mergedInitialValues}
            fields={paymentFields}
            displayColumns={2}
            onSubmit={onSave}
            loading={loading}
            actions={panelActions}
            renderForm={({
              initialValues: iv,
              onCancel,
              onSubmit,
              loading: formLoading,
            }) => (
              <div>
                <MyForm
                  fields={paymentFields}
                  initialValues={iv}
                  onSubmit={onSubmit}
                  onChange={onChange}
                  loading={formLoading || saving}
                  submitButtonLabel="Enregistrer le paiement"
                  onCancel={onCancel}
                  cancelButtonLabel="Annuler"
                  successMessage="Le paiement a été mis à jour avec succès"
                  errorMessage="Impossible d'enregistrer le paiement"
                />
              </div>
            )}
          />
        );
      })()}
    </div>
  );
}

PaymentDetails.propTypes = {
  payment: PropTypes.object.isRequired,
  onDelete: PropTypes.func,
  onUserNavigate: PropTypes.func,
  editable: PropTypes.bool,
  initialValues: PropTypes.object,
  onSave: PropTypes.func,
  onChange: PropTypes.func,
  loading: PropTypes.bool,
  saving: PropTypes.bool,
  paymentEnums: PropTypes.object,
};

PaymentDetails.defaultProps = {
  onDelete: null,
  onUserNavigate: null,
  editable: true,
  initialValues: {},
  onSave: null,
  onChange: null,
  loading: false,
  saving: false,
  paymentEnums: { type: [], status: [] },
};
