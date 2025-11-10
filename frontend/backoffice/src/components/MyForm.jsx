import React, { useEffect, useState } from "react";
import CurrencyInput from "@/components/CurrencyInput";
import Button from "@/components/ui/Button";
import Notification from "@/components/Notification";
import { useNotification } from "@/hooks/useNotification";

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
  title, // Titre optionnel
  successMessage = "Enregistré avec succès",
  errorMessage = "Erreur lors de l'enregistrement",
}) {
  // Initialisation du state à partir de initialValues uniquement au montage
  const [formValues, setFormValues] = useState(() => ({ ...initialValues }));
  const [errors, setErrors] = useState({});
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();

  // Synchroniser formValues avec initialValues quand ils changent (ex: après sauvegarde)
  useEffect(() => {
    console.log(
      "🔄 MyForm - initialValues changé, mise à jour:",
      initialValues,
    );
    setFormValues({ ...initialValues });
  }, [initialValues]);

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
  const hasChanges = () => {
    return fields.some((field) => {
      const currentValue = formValues[field.name];
      const initialValue = initialValues[field.name];

      // Comparaison en tenant compte des valeurs nulles/undefined/vides
      if (currentValue === initialValue) return false;

      const isCurrentEmpty =
        !currentValue && currentValue !== 0 && currentValue !== false;
      const isInitialEmpty =
        !initialValue && initialValue !== 0 && initialValue !== false;

      return !(isCurrentEmpty && isInitialEmpty);
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

  const handleSubmit = async (e) => {
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
      showError(
        "Formulaire incomplet",
        "Veuillez remplir tous les champs requis",
      );
      return;
    }
    setErrors({});

    try {
      await onSubmit(formValues);
      showSuccess("Succès", successMessage);
    } catch (error) {
      console.error("Erreur lors de la soumission du formulaire:", error);
      showError("Erreur", errorMessage);
    }
  };

  return (
    <form
      className="bg-white shadow-xs outline outline-gray-900/5 sm:rounded-xl"
      onSubmit={handleSubmit}
    >
      {title && (
        <div className="px-4 py-6 sm:px-8 sm:pt-8 sm:pb-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      <div className="px-4 py-6 sm:p-8">
        <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          {fields.map((field) => (
            <div
              key={field.name}
              className={`${field.type === "textarea" || field.fullWidth ? "col-span-full" : "sm:col-span-3"}`}
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
                      className="size-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                    />
                  </div>
                  <div className="text-sm/6">
                    <label
                      htmlFor={field.name}
                      className="font-medium text-gray-900"
                    >
                      {field.label}
                    </label>
                  </div>
                </div>
              ) : field.name === "amount" ? (
                <>
                  {field.label && (
                    <label
                      htmlFor={field.name}
                      className="block text-sm/6 font-medium text-gray-900"
                    >
                      {field.label}
                    </label>
                  )}
                  <div className="mt-2">
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
                  </div>
                  {errors.amount && (
                    <p className="mt-2 text-sm text-red-600">{errors.amount}</p>
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
                        className={`block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 ${
                          errors[field.name] ? "outline-red-500" : ""
                        }`}
                      />
                    ) : field.type === "select" ? (
                      <select
                        id={field.name}
                        name={field.name}
                        value={formValues[field.name] || ""}
                        onChange={handleChange}
                        className={`block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 cursor-pointer min-h-[2.5rem] ${
                          errors[field.name] ? "outline-red-500" : ""
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
                        id={field.name}
                        name={field.name}
                        value={formValues[field.name] || ""}
                        disabled
                        className="block w-full rounded-md bg-gray-50 px-3 py-2 text-base text-gray-500 outline-1 -outline-offset-1 outline-gray-300 sm:text-sm/6"
                      />
                    ) : (
                      <input
                        type={field.type || "text"}
                        id={field.name}
                        name={field.name}
                        value={formValues[field.name] || ""}
                        onChange={handleChange}
                        placeholder={field.placeholder || ""}
                        className={`block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 ${
                          errors[field.name] ? "outline-red-500" : ""
                        }`}
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
      </div>

      {(showSubmitButton || onCancel) && (
        <div className="flex items-center justify-end gap-x-3 px-4 py-4 sm:px-8">
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
              type="submit"
              variant="primary"
              size="md"
              disabled={loading || !isValid() || !hasChanges()}
              loading={loading}
            >
              {submitButtonLabel}
            </Button>
          )}
        </div>
      )}

      {/* Notifications */}
      <Notification
        show={notification.show}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={hideNotification}
      />
    </form>
  );
}
