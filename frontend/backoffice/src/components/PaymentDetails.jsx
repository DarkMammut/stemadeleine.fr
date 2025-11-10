import React from "react";
import UserLink from "@/components/UserLink";
import Currency from "@/components/Currency";
import ModifyButton from "@/components/ui/ModifyButton";
import DeleteButton from "@/components/ui/DeleteButton";

export default function PaymentDetails({
  payment,
  onEdit,
  onDelete,
  onUserNavigate,
}) {
  if (!payment) return null;

  return (
    <div className="space-y-6">
      {/* Informations principales */}
      <div className="bg-white shadow-xs outline outline-gray-900/5 sm:rounded-xl">
        <div className="flex items-center justify-between px-4 py-6 sm:px-8 sm:pt-8 sm:pb-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Paiement #{payment.id}
          </h3>
          <div className="flex items-center gap-2">
            {onEdit && (
              <ModifyButton
                onModify={onEdit}
                modifyLabel="Modifier"
                size="sm"
              />
            )}
            {onDelete && (
              <DeleteButton
                onDelete={onDelete}
                deleteLabel="Supprimer"
                confirmTitle="Supprimer le paiement"
                confirmMessage="Êtes-vous sûr de vouloir supprimer ce paiement ? Cette action est irréversible."
                size="sm"
                hoverExpand={true}
              />
            )}
          </div>
        </div>
        <div className="px-4 py-6 sm:p-8 space-y-4">
          <div className="grid grid-cols-[140px_1fr] gap-4">
            <span className="text-sm font-semibold text-gray-500">Montant</span>
            <span className="text-sm text-gray-900">
              <Currency value={payment.amount} currency={payment.currency} />
            </span>
          </div>

          <div className="grid grid-cols-[140px_1fr] gap-4">
            <span className="text-sm font-semibold text-gray-500">Type</span>
            <span className="text-sm text-gray-900">{payment.type || "-"}</span>
          </div>

          <div className="grid grid-cols-[140px_1fr] gap-4">
            <span className="text-sm font-semibold text-gray-500">Statut</span>
            <span className="text-sm text-gray-900">
              {payment.status || "-"}
            </span>
          </div>

          <div className="grid grid-cols-[140px_1fr] gap-4">
            <span className="text-sm font-semibold text-gray-500">Date</span>
            <span className="text-sm text-gray-900">
              {payment.paymentDate
                ? new Date(payment.paymentDate).toLocaleDateString("fr-FR")
                : "-"}
            </span>
          </div>

          <div className="grid grid-cols-[140px_1fr] gap-4">
            <span className="text-sm font-semibold text-gray-500">
              Formulaire
            </span>
            <span className="text-sm text-gray-900">
              {payment.formSlug || "-"}
            </span>
          </div>

          <div className="grid grid-cols-[140px_1fr] gap-4">
            <span className="text-sm font-semibold text-gray-500">Reçu</span>
            <span className="text-sm text-gray-900">
              {payment.receiptUrl ? (
                <a
                  href={payment.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  Voir le reçu
                </a>
              ) : (
                "-"
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Utilisateur associé */}
      {payment.user && (
        <div className="bg-white shadow-xs outline outline-gray-900/5 sm:rounded-xl">
          <div className="px-4 py-6 sm:px-8 sm:pt-8 sm:pb-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Emetteur</h3>
          </div>
          <div className="px-4 py-6 sm:p-8">
            <UserLink user={payment.user} onClick={onUserNavigate} />
          </div>
        </div>
      )}
    </div>
  );
}
