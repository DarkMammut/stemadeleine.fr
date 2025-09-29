import React, { useState } from "react";
import Button from "@/components/ui/Button";
import CurrencyInput from "@/components/CurrencyInput";

export default function MyForm({
  fields,
  initialValues = {},
  onSubmit,
  onChange: onChangeExternal,
  loading,
  submitButtonLabel = "Sauvegarder",
  showSubmitButton = true,
  onCancel,
  cancelButtonLabel = "Annuler",
}) {
  // Initialisation du state à partir de initialValues uniquement au montage
  const [formValues, setFormValues] = useState(() => ({ ...initialValues }));
  const [errors, setErrors] = useState({});

  const hasChanges = () => {
    return Object.keys(formValues).some(
      (key) => formValues[key] !== initialValues[key],
    );
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const updatedValues = {
      ...formValues,
      [name]: type === "checkbox" ? checked : value,
    };
    setFormValues(updatedValues);
    if (onChangeExternal) {
      onChangeExternal(name, updatedValues[name], updatedValues);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    fields.forEach((field) => {
      if (field.required && field.type !== "readonly") {
        const value = formValues[field.name];
        if (value === "" || value === null || value === undefined) {
          newErrors[field.name] = "Ce champ est requis";
        }
      }
    });
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    onSubmit(formValues);
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {fields.map((field) => (
          <div key={field.name} className="flex flex-col">
            {field.type === "checkbox" ? (
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name={field.name}
                  checked={formValues[field.name] || false}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary bg-surface border-border rounded focus:ring-primary"
                />
                <span className="font-medium text-text">{field.label}</span>
              </label>
            ) : field.name === "amount" ? (
              <>
                {field.label && (
                  <label className="mb-2 font-medium text-text">
                    {field.label}
                  </label>
                )}
                <CurrencyInput
                  value={formValues.amount}
                  onChange={(val) => {
                    const updatedValues = { ...formValues, amount: val };
                    setFormValues(updatedValues);
                    if (onChangeExternal) {
                      onChangeExternal("amount", val, updatedValues);
                    }
                  }}
                  currency={field.currency || "EUR"}
                />
                {errors.amount && (
                  <span className="text-danger text-xs mt-1">
                    {errors.amount}
                  </span>
                )}
              </>
            ) : (
              <>
                {field.label && (
                  <label className="mb-2 font-medium text-text">
                    {field.label}
                  </label>
                )}
                {field.type === "textarea" ? (
                  <textarea
                    name={field.name}
                    value={formValues[field.name] || ""}
                    onChange={handleChange}
                    placeholder={field.placeholder || ""}
                    className={`bg-surface border border-border text-text rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary resize-vertical min-h-[100px] ${
                      errors[field.name] ? "border-danger" : ""
                    }`}
                  />
                ) : field.type === "select" ? (
                  <select
                    name={field.name}
                    value={formValues[field.name] || ""}
                    onChange={handleChange}
                    className={`bg-surface border border-border text-text rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary cursor-pointer ${
                      errors[field.name] ? "border-danger" : ""
                    }`}
                  >
                    <option value="">
                      {field.placeholder || "Sélectionnez une option..."}
                    </option>
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === "readonly" ? (
                  <input
                    type="text"
                    name={field.name}
                    value={formValues[field.name] || ""}
                    disabled
                    className="bg-surface/50 border border-border text-text-muted rounded-lg p-3 cursor-not-allowed"
                  />
                ) : (
                  <input
                    type={field.type || "text"}
                    name={field.name}
                    value={formValues[field.name] || ""}
                    onChange={handleChange}
                    placeholder={field.placeholder || ""}
                    className={`bg-surface border border-border text-text rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary ${
                      errors[field.name] ? "border-danger" : ""
                    }`}
                  />
                )}
              </>
            )}
            {errors[field.name] && (
              <span className="text-danger text-sm mt-2 flex items-center gap-1">
                <span>⚠️</span>
                {errors[field.name]}
              </span>
            )}
          </div>
        ))}
        <div className="flex gap-4 mt-6">
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              loading={loading}
              className=""
            >
              {cancelButtonLabel}
            </Button>
          )}
          {showSubmitButton && (
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className=""
            >
              {submitButtonLabel}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
