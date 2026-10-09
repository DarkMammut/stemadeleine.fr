"use client";

import React from "react";
import { useTranslation } from "@/i18n/I18nContext";

const resolveIntlLocale = (locale) => (locale === "en" ? "en-US" : "fr-FR");

export default function Currency({ value, currency = "EUR", cents = true }) {
  const { locale } = useTranslation();
  const amount = cents ? value / 100 : value;
  const formatted = new Intl.NumberFormat(resolveIntlLocale(locale), {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return <span>{formatted}</span>;
}
