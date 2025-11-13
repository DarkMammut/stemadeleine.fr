// Utility to map MyForm fields + data -> VariableDisplay fields

import MyLink from "@/components/ui/MyLink";
import StatusTag from "@/components/ui/StatusTag";

export function mapMyFormToVariableFields(
  myFormFields = [],
  data = {},
  opts = {},
) {
  const {
    dateFormat = (s) => {
      if (s === null || s === undefined || s === "") return "-";
      try {
        // YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(String(s))) {
          const [y, m, d] = String(s).split("-");
          return `${d}/${m}/${y}`;
        }
        const dt = new Date(s);
        if (isNaN(dt.getTime())) return String(s);
        return dt.toLocaleDateString("fr-FR");
      } catch (e) {
        return String(s);
      }
    },
    booleanFormat = (b) => (b ? "Oui" : "Non"),
    numberFormat = (n) =>
      n === null || n === undefined || n === "" ? "-" : String(n),
  } = opts;

  return (myFormFields || []).map((f, index) => {
    const name = f?.name ?? `field_${index}`;
    const label = f?.label ?? name;

    const rawValue = data?.[name];
    const val =
      rawValue === undefined || rawValue === null
        ? (f?.defaultValue ?? "")
        : rawValue;

    // If the field defines a custom display renderer, prefer it
    if (typeof f.renderDisplay === "function") {
      return {
        name,
        label,
        render: () => f.renderDisplay(data),
      };
    }

    switch ((f?.type || "text").toLowerCase()) {
      case "currency": {
        // Format currency values. If field.cents is true (default), interpret value as integer cents.
        const currencyCode = f?.currency || "EUR";
        const cents = f?.cents === undefined ? true : !!f?.cents;
        if (val === "" || val === null || val === undefined) {
          return { name, label, value: "-" };
        }
        let amountNum = Number(val);
        if (isNaN(amountNum)) return { name, label, value: String(val) };
        if (cents) {
          // value is in cents
          amountNum = amountNum / 100.0;
        }
        const fmt = new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: currencyCode,
        }).format(amountNum);
        return { name, label, value: fmt };
      }
      case "url": {
        // Render a link-like button that opens the URL in a new tab
        return {
          name,
          label,
          children: !val ? (
            "-"
          ) : (
            <MyLink href={String(val)} ariaLabel={`Ouvrir ${String(val)}`}>
              Voir
            </MyLink>
          ),
        };
      }
      case "date":
        return { name, label, value: dateFormat(val) };
      case "datetime":
      case "offsetdatetime":
      case "datetime-local":
        return {
          name,
          label,
          value: val ? new Date(val).toLocaleString("fr-FR") : "-",
        };
      case "checkbox":
      case "boolean":
        return { name, label, value: booleanFormat(Boolean(val)) };
      case "select":
      case "radio": {
        const options = f?.options ?? [];
        if (Array.isArray(options)) {
          // options can be array of values or {label,value}
          const opt = options.find((o) => (o?.value ?? o) === val);
          const labelOpt = opt ? (opt.label ?? opt.value ?? String(opt)) : val;
          // Support flag display: if field requests a flag or data contains a `${name}Flag`, render a StatusTag
          const flagKey = f?.flagKey || `${name}Flag`;
          const flagValue = data?.[flagKey];
          if (f?.flag || (flagValue !== undefined && flagValue !== null)) {
            const statusValue = flagValue ?? (labelOpt || null);
            return {
              name,
              label,
              // render as children so VariableDisplay shows the label then the tag
              children: (
                <StatusTag status={statusValue}>{labelOpt ?? "-"}</StatusTag>
              ),
            };
          }
          return { name, label, value: labelOpt ?? "-" };
        }
        return { name, label, value: val ?? "-" };
      }
      case "number": {
        if (val === "" || val === null || val === undefined) {
          return { name, label, value: "-" };
        }
        const decimals = typeof f?.decimals === "number" ? f.decimals : 0;
        const nf = new Intl.NumberFormat("fr-FR", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        });
        const num = Number(val);
        if (isNaN(num)) return { name, label, value: String(val) };
        return { name, label, value: nf.format(num) };
      }
      case "textarea":
      case "text":
      default:
        // If a field provides a custom format function, use it
        if (typeof f.format === "function") {
          try {
            return { name, label, value: f.format(val, data) };
          } catch (e) {
            return { name, label, value: val ?? "-" };
          }
        }

        // For long text we may want to display truncated snippet
        if (f?.multiline || f?.type === "textarea") {
          return { name, label, value: val ? String(val) : "-" };
        }

        return {
          name,
          label,
          value: val === "" || val === null || val === undefined ? "-" : val,
        };
    }
  });
}

export default mapMyFormToVariableFields;
