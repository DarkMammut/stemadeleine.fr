import React from "react";

export default function Money({ value, currency = "EUR", cents = true }) {
  // Si la valeur est en centimes, on divise par 100
  const amount = cents ? value / 100 : value;
  const formatted = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return <span>{formatted}</span>;
}
