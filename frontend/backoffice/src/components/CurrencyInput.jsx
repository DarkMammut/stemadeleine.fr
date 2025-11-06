import React, { useEffect, useState } from "react";

export default function CurrencyInput({
  value,
  onChange,
  currency = "EUR",
  cents = true,
  ...props
}) {
  // Sécurisation de la valeur
  const safeValue = typeof value === "number" && !isNaN(value) ? value : 0;
  // Conversion centimes -> euros pour l'affichage
  const [displayValue, setDisplayValue] = useState(
    cents
      ? (safeValue / 100).toFixed(2).replace(".", ",")
      : safeValue.toString(),
  );

  useEffect(() => {
    setDisplayValue(
      cents
        ? (safeValue / 100).toFixed(2).replace(".", ",")
        : safeValue.toString(),
    );
  }, [value, cents]);

  const handleChange = (e) => {
    let val = e.target.value.replace(/[^\d,]/g, "");
    setDisplayValue(val);
    if (val === "") {
      onChange(0);
    }
  };

  const handleBlur = () => {
    let val = displayValue.replace(",", ".");
    const floatVal = parseFloat(val);
    if (!isNaN(floatVal)) {
      onChange(cents ? Math.round(floatVal * 100) : floatVal);
      setDisplayValue(
        cents ? floatVal.toFixed(2).replace(".", ",") : floatVal.toString(),
      );
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
