import React, { useContext, useEffect, useRef, useState } from "react";
import CurrencyInput from "@/components/ui/CurrencyInput";
import Button from "@/components/ui/Button";
import Panel from "@/components/ui/Panel";
import Notification from "@/components/ui/Notification";
import { useNotification } from "@/hooks/useNotification";
import FormPanelContext from "@/components/ui/FormPanelContext";
import Select from "@/components/ui/Select";

export default function MyForm({
  title = null,
  fields = [],
  initialValues = {},
  onSubmit,
  onChange: onChangeExternal,
  submitButtonLabel = "Sauvegarder",
  successMessage = "Enregistré avec succès",
  errorMessage = "Erreur lors de l'enregistrement",
  inline = false,
  // New prop: if false, do not wrap in Panel (render only form + buttons)
  panel = true,
  loading = false,
  onCancel = null,
  cancelButtonLabel = "Annuler",
  showSubmitButton = true,
  allowNoChanges = false,
  // number of columns (fields per row) — default 2 keeps previous behavior
  columns = 2,
  // Tailwind max-width class applied to the grid container (default preserved)
  maxWidthClass = "max-w-2xl",
}) {
  // If a parent context indicates forms should not render their own panel, honor it
  const panelContext = useContext(FormPanelContext);
  if (typeof panelContext === "boolean" && panelContext === false) {
    panel = false;
  }

  // Initialisation du state à partir de initialValues uniquement au montage
  const [formValues, setFormValues] = useState(() => ({ ...initialValues }));
  // Garder une baseline immuable des initialValues normalisées pour comparaison (hasChanges)
  const baselineRef = useRef(null);
  // Ref pour debounce des appels onChange vers le parent
  const changeDebounceRef = useRef(null);
  // When true, skip applying external initialValues updates temporarily (prevents parent echo from clearing local edits)
  const ignoreInitialUpdatesRef = useRef(false);
  // timeout ref used to clear ignoreInitialUpdatesRef (separate from changeDebounceRef)
  const ignoreInitialTimeoutRef = useRef(null);
  // Track last user interaction timestamp to avoid flicker of hasChanges
  const lastInteractionAtRef = useRef(0);
  const [errors, setErrors] = useState({});
  // Track visibility toggles for password fields by field name
  const [passwordVisible, setPasswordVisible] = useState({});
  const togglePasswordVisible = (name) => {
    setPasswordVisible((s) => ({ ...(s || {}), [name]: !s?.[name] }));
  };
  const { notification, showSuccess, showError } = useNotification();
  const formRef = useRef(null);

  // Normalize a value for date inputs to YYYY-MM-DD which <input type="date"> requires
  const normalizeDateForInput = (raw) => {
    if (!raw) return "";
    // Already yyyy-mm-dd
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
    // ISO datetime -> take date portion
    if (/^\d{4}-\d{2}-\d{2}T/.test(raw)) return raw.substring(0, 10);
    // dd/mm/yyyy -> convert
    const dm = /^([0-3]\d)\/([0-1]\d)\/(\d{4})$/.exec(raw);
    if (dm) return `${dm[3]}-${dm[2]}-${dm[1]}`;
    // If it's a Date object
    if (raw instanceof Date && !isNaN(raw)) {
      const y = raw.getFullYear();
      const m = String(raw.getMonth() + 1).padStart(2, "0");
      const d = String(raw.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }
    // fallback: return empty to avoid invalid value in date input
    return "";
  };

  // Format a value for <input type="datetime-local"> which requires "YYYY-MM-DDTHH:MM" (seconds optional)
  const formatForDatetimeLocal = (raw) => {
    if (!raw) return "";
    // If it's an ISO string possibly with seconds and timezone (Z or +hh:mm), capture YYYY-MM-DDTHH:MM
    const isoMatch = raw.match(
      /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})(:\d{2}(?:\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})?$/,
    );
    if (isoMatch) {
      return isoMatch[1];
    }
    // Already in YYYY-MM-DDTHH:MM or with seconds -> normalize to first 16 chars
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?$/.test(raw)) {
      return raw.substring(0, 16);
    }
    // Try parsing with Date as a fallback and convert to local datetime-local
    try {
      const d = new Date(raw);
      if (!isNaN(d)) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const hh = String(d.getHours()).padStart(2, "0");
        const mm = String(d.getMinutes()).padStart(2, "0");
        return `${y}-${m}-${day}T${hh}:${mm}`;
      }
    } catch (e) {
      // fallthrough
    }
    // Fallback: try to parse a DD/MM/YYYY HH:MM-like and convert
    const dtm = /^([0-3]\d)\/([0-1]\d)\/(\d{4})[ T](\d{2}):(\d{2})$/.exec(raw);
    if (dtm) {
      return `${dtm[3]}-${dtm[2]}-${dtm[1]}T${dtm[4]}:${dtm[5]}`;
    }
    return "";
  };

  // Synchroniser formValues avec initialValues quand ils changent (ex: après sauvegarde)
  useEffect(() => {
    // InitialValues changed: update internal state
    // If the user just interacted, ignore this external update to avoid flicker
    if (ignoreInitialUpdatesRef.current) {
      return;
    }
    // Normalize date fields so that <input type="date"> receives YYYY-MM-DD
    const normalized = { ...initialValues };
    try {
      fields?.forEach((f) => {
        if (f.type === "date") {
          normalized[f.name] = normalizeDateForInput(normalized[f.name]);
        }
        if (f.type === "datetime-local") {
          normalized[f.name] = formatForDatetimeLocal(normalized[f.name]);
        }
      });
    } catch (err) {
      // fields might be undefined in some rare cases; ignore
    }
    // Update local form values when parent initialValues change (supports parent-driven updates like autoYear)
    setFormValues(normalized);
    baselineRef.current = normalized;
  }, [initialValues, fields]);

  // Helper to determine if form has changes; small grace window after user interaction keeps button enabled briefly

  // Helper to get the value passed to input elements (date normalization handled here)
  const getFieldValueForInput = (field) => {
    const raw = formValues[field.name];
    if (field.type === "date") return normalizeDateForInput(raw);
    if (field.type === "datetime-local") return formatForDatetimeLocal(raw);
    if (field.type === "select") {
      // If the field expects multiple values, ensure we pass an array; otherwise pass a scalar
      if (field.multiple) {
        return Array.isArray(raw) ? raw : raw ? [raw] : [];
      }
      // single select: coerce arrays to first element
      if (Array.isArray(raw)) return raw.length > 0 ? raw[0] : "";
      if (raw === null || raw === undefined) return "";
      return raw;
    }
    if (raw === null || raw === undefined) return "";
    return raw;
  };

  const isValid = () => {
    return fields.every((field) => {
      if (field.required && field.type !== "readonly") {
        const value = formValues[field.name];
        if (value === "" || value === null || value === undefined) {
          return false;
        }
      }
      return true;
    });
  };

  // Vérifier si le formulaire a été modifié
  // Comparaison stable et normalisée entre la baseline initiale et l'état courant
  const normalizeForCompare = (field, raw) => {
    if (field.type === "date") return normalizeDateForInput(raw || "");
    if (field.type === "datetime-local")
      return formatForDatetimeLocal(raw || "");
    if (raw === null || raw === undefined) return "";
    // Pour booleans et nombres on retourne la valeur brute
    if (typeof raw === "boolean") return raw ? "1" : "0";
    if (typeof raw === "number") return String(raw);
    return String(raw);
  };

  const hasChanges = () => {
    const initialRef =
      baselineRef.current && Object.keys(baselineRef.current).length > 0
        ? baselineRef.current
        : initialValues;

    for (const field of fields) {
      const a = normalizeForCompare(field, initialRef[field.name]);
      const b = normalizeForCompare(field, formValues[field.name]);
      // Les deux vides => pas de changement
      if (a === "" && b === "") continue;
      if (a !== b) {
        return true;
      }
    }
    return false;
  };

  const handleChange = (e) => {
    // mark that user interacted; used to avoid immediate external sync overriding local edits
    ignoreInitialUpdatesRef.current = true;
    lastInteractionAtRef.current = Date.now();
    // ensure we clear the ignore flag after a short debounce window
    if (ignoreInitialTimeoutRef.current)
      clearTimeout(ignoreInitialTimeoutRef.current);
    ignoreInitialTimeoutRef.current = setTimeout(() => {
      ignoreInitialUpdatesRef.current = false;
      ignoreInitialTimeoutRef.current = null;
    }, 400);

    const { name, value, type, checked } = e.target;
    let updatedValue = value;

    // Gestion spécifique pour les champs de type "date"
    if (type === "date") {
      updatedValue = normalizeDateForInput(e.target.value);
    }
    if (type === "datetime-local") {
      // keep the value as provided by input (YYYY-MM-DDTHH:MM)
      updatedValue = formatForDatetimeLocal(e.target.value);
    }

    // Convert numeric inputs to numbers
    if (type === "number") {
      // empty string -> keep as empty to allow clearing
      if (value === "") updatedValue = "";
      else if (value.includes(".")) updatedValue = parseFloat(value);
      else updatedValue = parseInt(value, 10);
    }

    // Clear field error for this field when the user edits it
    setErrors((prev) => {
      if (!prev) return {};
      if (prev[name]) {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      }
      return prev;
    });

    // Build nextValues synchronously from current state to avoid relying on setState callback
    const current = formValues || {};
    let nextValues = {
      ...current,
      [name]: type === "checkbox" ? checked : updatedValue,
    };
    // Apply state update
    setFormValues(nextValues);

    // Live cross-field validation: ensure end >= start for common date pairs
    // Support pairs: dateAdhesion/dateFin and startDate/endDate
    const validateDateOrder = (startName, endName, errFieldName) => {
      const s = normalizeDateForInput(nextValues[startName] || "");
      const e = normalizeDateForInput(nextValues[endName] || "");
      if (s && e) {
        const [sy, sm, sd] = s.split("-").map((v) => parseInt(v, 10));
        const [ey, em, ed] = e.split("-").map((v) => parseInt(v, 10));
        const sdt = new Date(sy, sm - 1, sd).getTime();
        const edt = new Date(ey, em - 1, ed).getTime();
        if (edt < sdt) {
          setErrors((prev) => ({
            ...(prev || {}),
            [errFieldName]:
              "La date de fin ne peut pas être antérieure à la date de début",
          }));
        } else {
          setErrors((prev) => {
            if (!prev) return {};
            const copy = { ...prev };
            if (copy[errFieldName]) delete copy[errFieldName];
            return copy;
          });
        }
      } else {
        // If one of the fields is empty, clear the related error
        setErrors((prev) => {
          if (!prev) return {};
          const copy = { ...prev };
          if (copy[errFieldName]) delete copy[errFieldName];
          return copy;
        });
      }
    };

    // Trigger validation depending on which field changed
    if (name === "dateAdhesion" || name === "dateFin") {
      validateDateOrder("dateAdhesion", "dateFin", "dateFin");
    }
    if (name === "startDate" || name === "endDate") {
      validateDateOrder("startDate", "endDate", "endDate");
    }

    // If the field toggled is autoYear, apply the auto-fill behavior immediately
    if (name === "autoYear") {
      const auto = !!checked;
      // Determine base year from nextValues, fallback to formValues, then today's date
      let base =
        (nextValues && nextValues.dateAdhesion) ||
        (formValues && formValues.dateAdhesion) ||
        normalizeDateForInput(new Date());
      if (!base) base = normalizeDateForInput(new Date());
      const year = String(base).slice(0, 4);
      if (auto) {
        nextValues = {
          ...nextValues,
          dateAdhesion: `${year}-01-01`,
          dateFin: `${year}-12-31`,
          autoYear: true,
        };
      } else {
        nextValues = { ...nextValues, autoYear: false };
      }
      // Update local state with computed dates
      setFormValues(nextValues);
      // Immediately notify parent so it can update field.disabled and initialValues
      if (typeof onChangeExternal === "function") {
        try {
          // prefer (name, value, allValues) signature
          if (onChangeExternal.length >= 2) {
            onChangeExternal(name, nextValues[name], nextValues);
          } else {
            onChangeExternal(nextValues);
          }
        } catch (err) {
          try {
            onChangeExternal(nextValues);
          } catch (e) {
            // ignore
          }
        }
      }
      // Clear any pending debounce to avoid duplicate calls
      if (changeDebounceRef.current) {
        clearTimeout(changeDebounceRef.current);
        changeDebounceRef.current = null;
      }
      return;
    }
    // debug: log new internal state after change
    // Debounce the call to parent onChange to avoid parent overwriting local typing on every keystroke
    if (typeof onChangeExternal === "function") {
      if (changeDebounceRef.current) clearTimeout(changeDebounceRef.current);
      changeDebounceRef.current = setTimeout(() => {
        // Prefer calling signature (name, value, updatedValues) if the handler expects it
        const obj = nextValues || {};
        if (onChangeExternal.length >= 2) {
          try {
            onChangeExternal(name, obj[name], obj);
            return;
          } catch (err) {
            // continue
          }
        }

        try {
          // Prefer functional setter if consumer is a setter
          onChangeExternal((prev) => ({ ...(prev || {}), ...obj }));
          return;
        } catch (err) {
          // fallback to passing object
        }

        try {
          onChangeExternal(obj);
        } catch (err) {
          try {
            onChangeExternal(name, obj[name], obj);
          } catch (e) {
            // ignore
          }
        }
      }, 300);
    }
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (changeDebounceRef.current) clearTimeout(changeDebounceRef.current);
      if (ignoreInitialTimeoutRef.current)
        clearTimeout(ignoreInitialTimeoutRef.current);
    };
  }, []);

  // Local submitting state to avoid double submits
  const [submitting, setSubmitting] = useState(false);

  // Handle form submission. Accepts an event (with preventDefault) or a plain object
  const handleSubmit = async (e) => {
    // Support being called with an event-like object used elsewhere in the code
    if (e && typeof e.preventDefault === "function") {
      try {
        e.preventDefault();
      } catch (err) {
        // ignore
      }
    }

    if (typeof onSubmit !== "function") return;
    if (submitting) return; // prevent double submit

    setSubmitting(true);
    try {
      // Call parent submit handler with current form values
      const result = await onSubmit(formValues);

      // Treat successful resolution as saved: update baseline so hasChanges() becomes false
      baselineRef.current = { ...(formValues || {}) };

      // Notify success (safe-guard if hook not provided)
      try {
        if (typeof showSuccess === "function") showSuccess(successMessage);
      } catch (notifErr) {
        // ignore notification errors
      }

      setSubmitting(false);
      return result;
    } catch (err) {
      // Log and show notification
      try {
        // eslint-disable-next-line no-console
        console.error(err);
      } catch (e) {}
      // If the thrown error contains fieldErrors (object mapping fieldName -> message), surface them inline
      try {
        if (
          err &&
          typeof err === "object" &&
          err.fieldErrors &&
          typeof err.fieldErrors === "object"
        ) {
          setErrors(err.fieldErrors || {});
          // autofocus first field with an error if possible
          try {
            const firstField = Object.keys(err.fieldErrors || {})[0];
            if (firstField && formRef.current) {
              setTimeout(() => {
                const el = formRef.current.querySelector(
                  `[name="${firstField}"]`,
                );
                if (el && typeof el.focus === "function") {
                  try {
                    el.focus();
                  } catch (e) {}
                  try {
                    el.scrollIntoView({ behavior: "smooth", block: "center" });
                  } catch (e) {}
                }
              }, 60);
            }
          } catch (ee) {
            // ignore focus errors
          }
        }
      } catch (ee) {
        // ignore
      }
      try {
        if (typeof showError === "function") showError(errorMessage);
      } catch (notifErr) {}
      setSubmitting(false);
      throw err;
    }
  };

  // Helper that renders the fields grid (used in inline and panel modes)
  const renderFields = () => (
    <div
      className={`grid grid-cols-1 gap-x-6 gap-y-8 ${maxWidthClass}`}
      style={{
        gridTemplateColumns: `repeat(${Math.max(1, columns)}, minmax(0, 1fr))`,
      }}
    >
      {(fields || []).map((field) => (
        <div
          key={field.name}
          className={`${field.type === "textarea" || field.fullWidth ? "col-span-full" : ""}`}
          // when columns==1 we want full width per field; otherwise each field occupies one column unless fullWidth
        >
          {field.type === "checkbox" ? (
            <div className="flex gap-3">
              <div className="flex h-6 shrink-0 items-center">
                <input
                  type="checkbox"
                  name={field.name}
                  id={field.name}
                  checked={formValues[field.name] || false}
                  onChange={handleChange}
                  disabled={field.disabled}
                  className="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                />
              </div>
              <div className="text-sm/6">
                <label
                  htmlFor={field.name}
                  className="font-medium text-gray-900"
                >
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
              </div>
            </div>
          ) : field.type === "currency" ? (
            <>
              {field.label && (
                <label
                  htmlFor={field.name}
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
              )}
              <div className="mt-2">
                <CurrencyInput
                  value={formValues[field.name]}
                  onChange={(val) => {
                    const updatedValues = { ...formValues, [field.name]: val };
                    setFormValues(updatedValues);
                    if (onChangeExternal) {
                      try {
                        // Prefer object signature
                        onChangeExternal(updatedValues);
                      } catch (err) {
                        try {
                          onChangeExternal(field.name, val, updatedValues);
                        } catch (e) {
                          // ignore
                        }
                      }
                    }
                  }}
                  currency={field.currency || "EUR"}
                />
              </div>
              {errors[field.name] && (
                <p className="mt-2 text-sm text-red-600">
                  {errors[field.name]}
                </p>
              )}
            </>
          ) : (
            <>
              {field.label && (
                <label
                  htmlFor={field.name}
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
              )}
              <div className="mt-2">
                {field.type === "textarea" ? (
                  <textarea
                    id={field.name}
                    name={field.name}
                    rows={3}
                    value={formValues[field.name] || ""}
                    onChange={handleChange}
                    placeholder={field.placeholder || ""}
                    className={`block w-full rounded-md px-3 py-2 text-base outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 ${field.disabled ? "bg-gray-200 text-gray-600 cursor-not-allowed" : "bg-white text-gray-900"} ${errors[field.name] ? "outline-red-500" : ""}`}
                    disabled={field.disabled}
                  />
                ) : field.type === "select" ? (
                  <Select
                    id={field.name}
                    name={field.name}
                    value={getFieldValueForInput(field)}
                    onChange={handleChange}
                    options={field.options}
                    placeholder={
                      field.placeholder || "Sélectionnez une option..."
                    }
                    disabled={field.disabled}
                    className={`block w-full rounded-md px-3 py-2 text-base outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 cursor-pointer min-h-[2.5rem] ${field.disabled ? "bg-gray-200 text-gray-600 cursor-not-allowed" : "bg-white text-gray-900"} ${errors[field.name] ? "outline-red-500" : ""}`}
                  />
                ) : field.type === "password" ? (
                  <div className="relative">
                    <input
                      id={field.name}
                      name={field.name}
                      type={passwordVisible[field.name] ? "text" : "password"}
                      value={getFieldValueForInput(field)}
                      onChange={handleChange}
                      disabled={field.disabled}
                      placeholder={field.placeholder || ""}
                      className={`block w-full rounded-md px-3 py-2 pr-10 text-base outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 ${field.disabled ? "bg-gray-200 text-gray-600 cursor-not-allowed" : "bg-white text-gray-900"} ${errors[field.name] ? "outline-red-500" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisible(field.name)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                      tabIndex={-1}
                    >
                      {passwordVisible[field.name] ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5 text-gray-400 hover:text-gray-600"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5 text-gray-400 hover:text-gray-600"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                ) : field.type === "readonly" ? (
                  <input
                    type="text"
                    id={field.name}
                    name={field.name}
                    value={getFieldValueForInput(field)}
                    disabled
                    className="block w-full rounded-md bg-gray-50 px-3 py-2 text-base text-gray-500 outline-1 -outline-offset-1 outline-gray-300 sm:text-sm/6"
                  />
                ) : (
                  <input
                    type={field.type || "text"}
                    id={field.name}
                    name={field.name}
                    value={getFieldValueForInput(field)}
                    onChange={handleChange}
                    disabled={field.disabled}
                    placeholder={field.placeholder || ""}
                    className={`block w-full rounded-md px-3 py-2 text-base outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 ${field.disabled ? "bg-gray-200 text-gray-600 cursor-not-allowed" : "bg-white text-gray-900"} ${errors[field.name] ? "outline-red-500" : ""}`}
                  />
                )}
              </div>
              {errors[field.name] && (
                <p className="mt-2 text-sm text-red-600">
                  {errors[field.name]}
                </p>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );

  // If inline == true OR panel == false, render the form without the Panel wrapper and render footer inline
  if (inline || panel === false) {
    return (
      <>
        <form ref={formRef} onSubmit={handleSubmit}>
          {renderFields()}
        </form>

        {/* Footer inline */}
        {(showSubmitButton || onCancel) && (
          <div className="mt-4 flex items-center justify-end gap-x-3">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={onCancel}
                disabled={loading}
              >
                {cancelButtonLabel}
              </Button>
            )}

            {showSubmitButton && (
              <Button
                type="button"
                variant="primary"
                size="md"
                disabled={
                  loading || !isValid() || (!hasChanges() && !allowNoChanges)
                }
                loading={loading}
                onClick={() => {
                  if (
                    formRef.current &&
                    typeof formRef.current.requestSubmit === "function"
                  ) {
                    formRef.current.requestSubmit();
                    return;
                  }
                  try {
                    handleSubmit({
                      preventDefault: () => {},
                    });
                  } catch (err) {
                    console.error(
                      "Erreur lors de la soumission (fallback)",
                      err,
                    );
                  }
                }}
              >
                {submitButtonLabel}
              </Button>
            )}
          </div>
        )}

        {/* Notification */}
        {notification.show && (
          <Notification
            show={notification.show}
            type={notification.type}
            title={notification.title}
            message={notification.message}
            onClose={() => {}}
          />
        )}
      </>
    );
  }

  return (
    <>
      <Panel
        title={title}
        footer={
          (showSubmitButton || onCancel) && (
            <div className="flex items-center justify-end gap-x-3">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={onCancel}
                  disabled={loading}
                >
                  {cancelButtonLabel}
                </Button>
              )}

              {showSubmitButton && (
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  disabled={
                    loading || !isValid() || (!hasChanges() && !allowNoChanges)
                  }
                  loading={loading}
                  onClick={() => {
                    if (
                      formRef.current &&
                      typeof formRef.current.requestSubmit === "function"
                    ) {
                      formRef.current.requestSubmit();
                      return;
                    }
                    try {
                      handleSubmit({
                        preventDefault: () => {},
                      });
                    } catch (err) {
                      console.error(
                        "Erreur lors de la soumission (fallback)",
                        err,
                      );
                    }
                  }}
                >
                  {submitButtonLabel}
                </Button>
              )}
            </div>
          )
        }
        footerDivider={true}
      >
        <form ref={formRef} onSubmit={handleSubmit}>
          {renderFields()}
        </form>
      </Panel>

      {/* Notifications */}
      {notification.show && (
        <Notification
          show={notification.show}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={() => {}}
        />
      )}
    </>
  );
}
