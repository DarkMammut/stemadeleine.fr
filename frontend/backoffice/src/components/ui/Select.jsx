"use client";

import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";

export default function Select({
  value,
  onChange,
  children,
  className = "",
  placeholder,
  ...props
}) {
  return (
    <select
      value={value}
      onChange={onChange}
      className={clsx(
        "border border-gray-300 bg-white px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500",
        className,
      )}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {children}
    </select>
  );
}

Select.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  children: PropTypes.node,
  className: PropTypes.string,
  placeholder: PropTypes.string,
};

Select.defaultProps = {
  value: "",
  onChange: () => {},
  children: null,
  className: "",
  placeholder: null,
};
