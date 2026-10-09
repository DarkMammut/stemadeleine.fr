"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "@/i18n/I18nContext";

const resolveIntlLocale = (locale) => (locale === "en" ? "en-US" : "fr-FR");

const formatDisplayValue = (value, cents, locale) => {
  const normalizedValue = typeof value === "number" && !Number.isNaN(value) ? value : 0;
  const amount = cents ? normalizedValue / 100 : normalizedValue;
  const fixedValue = cents ? amount.toFixed(2) : String(amount);
  return locale === "fr-FR" ? fixedValue.replace(".", ",") : fixedValue;
};

export default function CurrencyInput({
  value,
  onChange,
  currency = "EUR",
  cents = true,
  locale: localeOverride,
  ...props
}) {
  const { locale } = useTranslation();
  const resolvedLocale = localeOverride || resolveIntlLocale(locale);
  const [displayValue, setDisplayValue] = useState(
    formatDisplayValue(value, cents, resolvedLocale),
  );

  useEffect(() => {
    setDisplayValue(formatDisplayValue(value, cents, resolvedLocale));
  }, [value, cents, resolvedLocale]);

  const handleChange = (e) => {
    const nextValue = e.target.value.replace(/[^\d,.-]/g, "");
    setDisplayValue(nextValue);
    if (nextValue === "") {
      onChange(0);
    }
  };

  const handleBlur = () => {
    const normalizedValue = displayValue.replace(/\s/g, "").replace(/,/g, ".");
    const floatValue = parseFloat(normalizedValue);

    if (!Number.isNaN(floatValue)) {
      onChange(cents ? Math.round(floatValue * 100) : floatValue);
      setDisplayValue(formatDisplayValue(cents ? Math.round(floatValue * 100) : floatValue, cents, resolvedLocale));
    } else {
      onChange(0);
      setDisplayValue("");
    }
  };

  return (
    <div className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
      <input
        type="text"
        inputMode="decimal"
        pattern="[0-9]*[.,]?[0-9]*"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        {...props}
        className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 text-right placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
      />
      <div className="shrink-0 text-base text-gray-500 select-none pr-3 sm:text-sm/6">
        {currency}
      </div>
    </div>
  );
}
