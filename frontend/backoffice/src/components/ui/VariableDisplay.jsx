"use client";

import React from "react";
import PropTypes from "prop-types";
import { mapMyFormToVariableFields } from "@/utils/mapMyFormToVariableFields";

function renderSingle({
  label,
  value,
  children,
  inline = false,
  small = false,
  placeholder = "-",
  className = "",
  // defaults aligned with VariableDisplay.defaultProps
  labelClassName = "font-medium text-gray-900",
  valueClassName = "text-gray-500",
  size = "md",
  format = null,
  loading = false,
}) {
  const displayValue = () => {
    if (children) return children;
    if (typeof format === "function") return format(value);
    if (value === null || value === undefined || value === "")
      return placeholder;
    return value;
  };

  const containerClass = inline ? "flex items-center gap-3" : "flex flex-col";
  // Map logical size to Tailwind class. small boolean takes precedence and maps to text-sm
  const sizeMap = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg",
  };
  const sizeClass = small ? "text-sm" : sizeMap[size] || sizeMap.md;
  const vClass = `${valueClassName} ${sizeClass}`.trim();

  return (
    <div className={`${containerClass} ${className}`.trim()}>
      {label ? <div className={labelClassName}>{label}</div> : null}
      <div className={vClass}>
        {loading ? (
          <div className="w-full">
            <div className={`skeleton-light h-4`} />
          </div>
        ) : (
          displayValue()
        )}
      </div>
    </div>
  );
}

export default function VariableDisplay({
  // Backwards-compatible single field props
  label,
  value,
  children,
  inline = false,
  small = false,
  placeholder = "-",
  className = "",
  // label: emphasized by default
  labelClassName = "font-medium text-gray-900",
  // value: muted by default
  valueClassName = "text-gray-500",
  // size controls the displayed value text size when no per-field `size` is provided
  size = "md",
  format = null,
  // New API: fields layout
  fields = null,
  // data object used to fill fields when fields are provided in MyForm format
  data = null,
  columns = 1,
  gap = 4, // tailwind gap-x/gap-y numeric (will be mapped to class)
  layout = "grid", // 'grid' or 'stack'
  loading = false,
}) {
  // If fields provided, render a responsive layout (mobile-first flex column, desktop grid)
  if (Array.isArray(fields) && fields.length > 0) {
    // Map MyForm-style fields to display fields when `data` is provided
    let effectiveFields = fields;

    try {
      const looksLikeMyForm = fields.some(
        (f) =>
          f &&
          typeof f === "object" &&
          f.name &&
          f.value === undefined &&
          f.children === undefined &&
          typeof f.render !== "function",
      );
      if (looksLikeMyForm && data) {
        effectiveFields = mapMyFormToVariableFields(fields, data);
      }
    } catch (e) {
      effectiveFields = fields;
    }

    // Build responsive classes: mobile = flex-col, desktop = grid with columns
    const gapClass = `gap-${gap}`;
    const inlineGap = { gap: `${gap * 0.25}rem` };
    const gridStyle =
      layout === "grid"
        ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }
        : {};
    const mergedStyle = { ...(gridStyle || {}), ...(inlineGap || {}) };

    return (
      <div className={`flex flex-col ${className}`} style={mergedStyle}>
        {/* On small screens stack fields; on larger screens switch to grid */}
        <div className={`sm:grid ${gapClass}`} style={mergedStyle}>
          {effectiveFields.map((f, idx) => {
            const fld =
              typeof f === "string"
                ? { name: f, label: f, value: data?.[f] ?? "" }
                : f || {};
            const {
              label: fldLabel,
              value: fldValue,
              children: fldChildren,
              inline: fldInline,
              small: fldSmall,
              placeholder: fldPlaceholder,
              labelClassName: fldLabelClassName,
              valueClassName: fldValueClassName,
              format: fldFormat,
              render: fldRender,
            } = fld;

            // If field lacks explicit value but has a name and data available, resolve it
            let resolvedValue = fldValue;
            if (
              (resolvedValue === undefined || resolvedValue === null) &&
              fld.name &&
              data
            ) {
              resolvedValue = data[fld.name];
            }

            if (typeof fldRender === "function") {
              return (
                <div key={fld.name || idx}>
                  {fldRender({ field: fld, index: idx, data })}
                </div>
              );
            }

            return (
              <div key={fld.name || idx} className="py-2">
                {renderSingle({
                  label: fldLabel,
                  value: resolvedValue,
                  children: fldChildren,
                  inline: fldInline ?? inline,
                  small: fldSmall ?? small,
                  size: fld.size ?? size,
                  placeholder: fldPlaceholder ?? placeholder,
                  className: "",
                  labelClassName: fldLabelClassName ?? labelClassName,
                  valueClassName: fldValueClassName ?? valueClassName,
                  format: fldFormat ?? format,
                  loading: loading,
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Fallback: single display (current behaviour)
  return renderSingle({
    label,
    value,
    children,
    inline,
    small,
    placeholder,
    className,
    labelClassName,
    valueClassName,
    size,
    format,
    loading,
  });
}

VariableDisplay.propTypes = {
  // Single field props (backwards compatible)
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  value: PropTypes.any,
  children: PropTypes.node,
  inline: PropTypes.bool,
  small: PropTypes.bool,
  placeholder: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  className: PropTypes.string,
  labelClassName: PropTypes.string,
  valueClassName: PropTypes.string,
  format: PropTypes.func,
  // New API
  fields: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        name: PropTypes.string,
        label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
        value: PropTypes.any,
        children: PropTypes.node,
        inline: PropTypes.bool,
        small: PropTypes.bool,
        placeholder: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
        labelClassName: PropTypes.string,
        valueClassName: PropTypes.string,
        format: PropTypes.func,
        render: PropTypes.func,
      }),
    ]),
  ),
  data: PropTypes.object,
  columns: PropTypes.number,
  gap: PropTypes.number,
  layout: PropTypes.oneOf(["grid", "stack"]),
  size: PropTypes.oneOf(["sm", "md", "lg", "xl"]),
  loading: PropTypes.bool,
};

VariableDisplay.defaultProps = {
  label: null,
  value: null,
  children: null,
  inline: false,
  small: false,
  placeholder: "-",
  className: "",
  labelClassName: "font-medium text-gray-900",
  valueClassName: "text-gray-500",
  format: null,
  size: "md",
  fields: null,
  data: null,
  columns: 1,
  gap: 4,
  layout: "grid",
  loading: false,
};
