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
      return;
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
    <div className="flex items-center gap-2">
      <input
        type="text"
        inputMode="decimal"
        pattern="[0-9]*[.,]?[0-9]*"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        {...props}
        className="border rounded px-2 py-1 w-24 text-right"
      />
      <span>{currency}</span>
    </div>
  );
}
