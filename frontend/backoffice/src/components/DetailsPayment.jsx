import React from "react";
import UserLink from "@/components/UserLink";
import Currency from "@/components/Currency";
import Button from "@/components/ui/Button";

export default function DetailsPayment({
  payment,
  onEdit,
  onDelete,
  onUserNavigate,
}) {
  if (!payment) return null;

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
      <div className="flex gap-2 mt-4">
        <Button variant="primary" onClick={onEdit}>
          Modifier
        </Button>
        <Button variant="danger" onClick={onDelete}>
          Supprimer
        </Button>
      </div>
    </div>
  );
}
