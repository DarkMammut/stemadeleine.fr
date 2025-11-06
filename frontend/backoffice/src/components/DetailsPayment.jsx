import React from "react";
import UserLink from "@/components/UserLink";
import Currency from "@/components/Currency";
import IconButton from "@/components/ui/IconButton";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function DetailsPayment({
  payment,
  onEdit,
  onDelete,
  onUserNavigate,
}) {
  if (!payment) return null;

  return (
    <div className="details-payment space-y-6">
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
            <span className="text-sm text-gray-900">{payment.type}</span>
          </div>

          <div className="grid grid-cols-[140px_1fr] gap-4">
            <span className="text-sm font-semibold text-gray-500">Statut</span>
            <span className="text-sm text-gray-900">{payment.status}</span>
          </div>

          <div className="grid grid-cols-[140px_1fr] gap-4">
            <span className="text-sm font-semibold text-gray-500">Date</span>
            <span className="text-sm text-gray-900">{payment.paymentDate}</span>
          </div>

          <div className="grid grid-cols-[140px_1fr] gap-4">
            <span className="text-sm font-semibold text-gray-500">
              Formulaire
            </span>
            <span className="text-sm text-gray-900">{payment.formSlug}</span>
          </div>

          <div className="grid grid-cols-[140px_1fr] gap-4">
            <span className="text-sm font-semibold text-gray-500">Reçu</span>
            <span className="text-sm text-gray-900">
              {payment.receiptUrl ? (
                <a
                  href={payment.receiptUrl}
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

      {payment.user && (
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Utilisateur associé
          </h3>
          <UserLink user={payment.user} onClick={onUserNavigate} />
        </div>
      )}

      <div className="border-t border-gray-200 pt-6 flex gap-2">
        <IconButton
          icon={PencilIcon}
          label="Modifier"
          variant="secondary"
          size="md"
          onClick={onEdit}
        />
        <IconButton
          icon={TrashIcon}
          label="Supprimer"
          variant="danger"
          size="md"
          onClick={onDelete}
        />
      </div>
    </div>
  );
}
