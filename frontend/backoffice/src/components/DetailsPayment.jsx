import React from "react";
import Utilities from "@/components/Utilities";
import UserLink from "@/components/UserLink";
import Currency from "@/components/Currency";

export default function DetailsPayment({
  payment,
  onEdit,
  onDelete,
  onUserNavigate,
}) {
  if (!payment) return null;

  const actions = [
    {
      label: "Modifier",
      icon: null,
      callback: onEdit,
    },
    {
      label: "Supprimer",
      icon: null,
      callback: onDelete,
    },
  ];

  return (
    <div className="details-payment p-4 border rounded">
      <h2 className="text-xl font-bold mb-2">Paiement #{payment.id}</h2>
      <div>
        Montant :{" "}
        <Currency value={payment.amount} currency={payment.currency} />
      </div>
      <div>Type : {payment.type}</div>
      <div>Statut : {payment.status}</div>
      <div>Date : {payment.paymentDate}</div>
      <div>Formulaire : {payment.formSlug}</div>
      <div>
        Reçu :{" "}
        {payment.receiptUrl ? <a href={payment.receiptUrl}>Voir</a> : "-"}
      </div>
      {payment.user && (
        <div className="mt-2">
          <h3 className="font-semibold">Utilisateur associé :</h3>
          <UserLink user={payment.user} onClick={onUserNavigate} />
        </div>
      )}
      <Utilities actions={actions} />
    </div>
  );
}
