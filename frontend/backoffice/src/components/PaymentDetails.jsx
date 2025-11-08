import React from "react";
import UserLink from "@/components/UserLink";
import Currency from "@/components/Currency";
import Utilities from "@/components/Utilities";
import { PencilIcon } from "@heroicons/react/24/outline";

export default function PaymentDetails({
  payment,
  onEdit,
  onDelete,
  onUserNavigate,
}) {
  if (!payment) return null;

  const actions = [
    {
      icon: PencilIcon,
      label: "Modifier",
      callback: onEdit,
    },
    {
      variant: "delete",
      label: "Supprimer",
      callback: onDelete,
      confirmTitle: "Supprimer le paiement",
      confirmMessage:
        "Êtes-vous sûr de vouloir supprimer ce paiement ? Cette action est irréversible.",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Informations principales */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Paiement #{payment.id}
        </h2>
        <div className="border-t border-gray-200 pt-6 space-y-4">
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
        <div className="border-t border-gray-200 pt-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Emetteur</h3>
          <UserLink user={payment.user} onClick={onUserNavigate} />
        </div>
      )}

      {/* Boutons d'action */}
      <div className="border-t border-gray-200 pt-6">
        <Utilities actions={actions} />
      </div>
    </div>
  );
}
