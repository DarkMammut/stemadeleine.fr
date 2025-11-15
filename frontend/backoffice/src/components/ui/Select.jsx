"use client";

import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";

export default function Select({
  value,
  onChange,
  onValueChange, // convenience callback that returns the selected value
  options,
  children,
  className = "",
  placeholder,
  ...props
}) {
  const handleChange = (e) => {
    onChange && onChange(e);
    if (onValueChange) onValueChange(e.target.value);
  };

  return (
    <select
      value={value}
      onChange={handleChange}
      className={clsx(
        "border border-gray-300 bg-white px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500",
        className,
      )}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {Array.isArray(options) && options.length > 0
        ? options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))
        : children}
    </select>
  );
}

Select.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  onValueChange: PropTypes.func,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
      label: PropTypes.node.isRequired,
      disabled: PropTypes.bool,
    }),
  ),
  children: PropTypes.node,
  className: PropTypes.string,
  placeholder: PropTypes.string,
};

Select.defaultProps = {
  value: "",
  onChange: () => {},
  onValueChange: null,
  options: null,
  children: null,
  className: "",
  placeholder: null,
};
