import React from "react";

export default function Currency({ value, currency = "EUR", cents = true }) {
  const amount = cents ? value / 100 : value;
  const formatted = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return <span>{formatted}</span>;
}
