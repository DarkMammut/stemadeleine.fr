import React, { useEffect, useState } from "react";
import Button from "@/components/ui/Button";

export default function MyForm({
  fields,
  onSubmit,
  onChange: onChangeExternal,
  loading,
}) {
  const initialValues = fields.reduce((acc, field) => {
    acc[field.name] =
      field.defaultValue !== undefined
        ? field.defaultValue
        : field.type === "checkbox"
          ? false
          : "";
    return acc;
  }, {});

  const [formValues, setFormValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const updatedValues = fields.reduce((acc, field) => {
      acc[field.name] =
        field.defaultValue !== undefined
          ? field.defaultValue
          : field.type === "checkbox"
            ? false
            : "";
      return acc;
    }, {});
    setFormValues(updatedValues);
  }, [fields]);

  const hasChanges = () => {
    return Object.keys(formValues).some(
      (key) => formValues[key] !== initialValues[key],
    );
  };

  const isValid = () => {
    return fields.every((field) => {
      if (field.required) {
        const value = formValues[field.name];
        if (
          value === "" ||
          value === null ||
          (field.type === "checkbox" && !value)
        ) {
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
      if (field.required) {
        const value = formValues[field.name];
        if (
          value === "" ||
          value === null ||
          (field.type === "checkbox" && !value)
        ) {
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map((field) => (
        <div key={field.name} className="flex flex-col">
          {field.label && (
            <label className="mb-1 font-medium">{field.label}</label>
          )}

          {field.type === "textarea" ? (
            <textarea
              name={field.name}
              value={formValues[field.name]}
              onChange={handleChange}
              placeholder={field.placeholder || ""}
              className={`border rounded p-2 ${errors[field.name] ? "border-red-500" : ""}`}
            />
          ) : field.type === "readonly" ? (
            <input
              type="text"
              name={field.name}
              value={formValues[field.name]}
              disabled
              className="border rounded p-2 bg-gray-100"
            />
          ) : (
            <input
              type={field.type || "text"}
              name={field.name}
              value={formValues[field.name]}
              onChange={handleChange}
              placeholder={field.placeholder || ""}
              className={`border rounded p-2 ${errors[field.name] ? "border-red-500" : ""}`}
              checked={
                field.type === "checkbox" ? formValues[field.name] : undefined
              }
            />
          )}

          {errors[field.name] && (
            <span className="text-red-500 text-sm mt-1">
              {errors[field.name]}
            </span>
          )}
        </div>
      ))}

      <Button
        type="submit"
        variant="secondary"
        size="sm"
        loading={loading}
        disabled={!isValid() || !hasChanges()}
      >
        Sauvegarder
      </Button>
    </form>
  );
}
