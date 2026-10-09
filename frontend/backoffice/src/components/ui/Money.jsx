"use client";

import React from "react";
import { useTranslation } from "@/i18n/I18nContext";

const resolveIntlLocale = (locale) => (locale === "en" ? "en-US" : "fr-FR");

export default function Money({
  value,
  className = "",
  locale: localeOverride,
  currency = "EUR",
  children,
}) {
  const { locale } = useTranslation();
  const resolvedLocale = localeOverride || resolveIntlLocale(locale);

  if (value === null || value === undefined || value === "") {
    return <span className={className}>{children ?? null}</span>;
  }

  const cleaned = String(value)
    .replace(/[^0-9.,-]+/g, "")
    .replace(",", ".");
  const n = Number(cleaned);
  if (!Number.isFinite(n)) {
    return <span className={className}>{String(value)}</span>;
  }

  const formatted = new Intl.NumberFormat(resolvedLocale, {
    style: "currency",
    currency,
  }).format(n);
  return <span className={className}>{formatted}</span>;
}
