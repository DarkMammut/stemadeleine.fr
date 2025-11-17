import React from "react";

export default function Money({
  value,
  className = "",
  locale = "fr-FR",
  currency = "EUR",
  children,
}) {
  // if value is empty, render children or nothing
  if (value === null || value === undefined || value === "") {
    return <span className={className}>{children ?? null}</span>;
  }

  // try to parse a numeric value from various string shapes
  const cleaned = String(value)
    .replace(/[^0-9.,-]+/g, "")
    .replace(",", ".");
  const n = Number(cleaned);
  if (!Number.isFinite(n))
    return <span className={className}>{String(value)}</span>;

  const formatted = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(n);
  return <span className={className}>{formatted}</span>;
}
