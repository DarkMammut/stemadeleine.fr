"use client";

import React from "react";
import Currency from "@/components/Currency";

export default function ListPayments({ payments, onPaymentClick }) {
  return (
    <div className="bg-surface border border-border rounded-lg">
      {!payments || payments.length === 0 ? (
        <div className="text-center py-8 text-text-muted">
          <p>Aucun paiement trouvé.</p>
          <p className="text-sm mt-2">
            Cliquez sur "Nouveau Paiement" pour commencer.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="p-4 hover:bg-surface-hover transition-colors cursor-pointer"
              onClick={() => onPaymentClick(payment.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-text">
                      {payment.label || `Paiement #${payment.id}`}
                    </h3>
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center gap-2 text-sm text-text-muted mb-3">
                    <span>
                      Montant :{" "}
                      <Currency
                        value={payment.amount}
                        currency={payment.currency}
                      />
                    </span>
                    <span>
                      Date :{" "}
                      {payment.paymentDate
                        ? new Date(payment.paymentDate).toLocaleDateString()
                        : "Non renseignée"}
                    </span>
                    <span>
                      Utilisateur :{" "}
                      {payment.user
                        ? `${payment.user.firstname} ${payment.user.lastname}`
                        : "Non renseigné"}
                    </span>
                    <span>Type : {payment.type || "Non renseigné"}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
