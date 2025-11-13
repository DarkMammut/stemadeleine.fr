"use client";

import React from "react";
import PropTypes from "prop-types";

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
}) {
  const displayValue = () => {
    if (children) return children;
    if (typeof format === "function") return format(value);
    if (value === null || value === undefined || value === "")
      return placeholder;
    return value;
  };

  const containerClass = inline ? "flex items-center gap-3" : "";
  // Map logical size to Tailwind class. small boolean takes precedence and maps to text-sm
  // Réduire la taille par défaut : md devient text-sm pour un rendu plus discret
  const sizeMap = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg",
  };
  const sizeClass = small ? "text-sm" : sizeMap[size] || sizeMap.md;
  const vClass = `${valueClassName} ${sizeClass}`.trim();

  return (
    <dl className={`${containerClass} ${className}`.trim()}>
      {label ? <dt className={labelClassName}>{label}</dt> : null}
      <dd className={vClass}>{displayValue()}</dd>
    </dl>
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
  columns = 1,
  gap = 4, // tailwind gap-x/gap-y numeric (will be mapped to class)
  layout = "grid", // 'grid' or 'stack'
}) {
  // If fields provided, render a grid/stack of field entries
  if (Array.isArray(fields) && fields.length > 0) {
    const style =
      layout === "grid"
        ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }
        : {};
    // Tailwind JIT may purge dynamic class names like `gap-${gap}`. To be safe,
    // compute a gapClass and also provide an inline style fallback for the gap.
    const gapClass = `gap-${gap}`;
    const inlineGap = { gap: `${gap * 0.25}rem` };
    const mergedStyle = { ...(style || {}), ...(inlineGap || {}) };
    return (
      <div className={`grid ${gapClass} ${className}`} style={mergedStyle}>
        {fields.map((f, idx) => {
          // Field can be a string (name) or an object
          const fld =
            typeof f === "string" ? { name: f, label: f, value: "" } : f || {};
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

          if (typeof fldRender === "function") {
            return (
              <div key={fld.name || idx}>
                {fldRender({ field: fld, index: idx })}
              </div>
            );
          }

          return (
            <div key={fld.name || idx}>
              {renderSingle({
                label: fldLabel,
                value: fldValue,
                children: fldChildren,
                inline: fldInline ?? inline,
                // inherit global `small` when field doesn't specify it
                small: fldSmall ?? small,
                size: fld.size ?? size,
                placeholder: fldPlaceholder ?? placeholder,
                className: "",
                labelClassName: fldLabelClassName ?? labelClassName,
                valueClassName: fldValueClassName ?? valueClassName,
                format: fldFormat ?? format,
              })}
            </div>
          );
        })}
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
  columns: PropTypes.number,
  gap: PropTypes.number,
  layout: PropTypes.oneOf(["grid", "stack"]),
  size: PropTypes.oneOf(["sm", "md", "lg", "xl"]),
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
  columns: 1,
  gap: 4,
  layout: "grid",
};
