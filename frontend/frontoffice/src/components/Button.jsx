// components/Button.jsx
import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  as = "button",
  loading = false,
  disabled = false,
  className,
  ...props
}) {
  const Component = as;

  const baseStyles =
    "inline-flex items-center justify-center rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

  // Utiliser des styles CSS personnalisés avec les variables CSS
  const variants = {
    primary: {
      backgroundColor: "rgb(var(--color-primary-600))",
      color: "white",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    },
    secondary: {
      backgroundColor: "rgb(var(--color-secondary-100))",
      color: "rgb(var(--color-secondary-800))",
      boxShadow:
        "0 0 0 1px rgba(var(--color-secondary-300), 0.5), 0 2px 4px rgba(0, 0, 0, 0.05)",
    },
    danger: {
      backgroundColor: "#dc2626",
      color: "white",
      boxShadow: "0 2px 4px rgba(220, 38, 38, 0.2)",
    },
    ghost: {
      backgroundColor: "transparent",
      color: "rgb(var(--color-secondary-700))",
      boxShadow: "none",
    },
    outline: {
      backgroundColor: "transparent",
      color: "rgb(var(--color-primary-600))",
      boxShadow:
        "0 0 0 1px rgba(var(--color-primary-600), 0.5), 0 2px 4px rgba(0, 0, 0, 0.05)",
    },
  };

  const hoverStyles = {
    primary: {
      "--hover-bg": "rgb(var(--color-primary-800))",
      "--active-bg": "rgb(var(--color-primary-900))",
      "--hover-shadow": "0 4px 8px rgba(0, 0, 0, 0.15)",
    },
    secondary: {
      "--hover-bg": "rgb(var(--color-secondary-200))",
      "--active-bg": "rgb(var(--color-secondary-300))",
      "--hover-shadow":
        "0 0 0 1px rgba(var(--color-secondary-400), 0.8), 0 4px 8px rgba(0, 0, 0, 0.1)",
    },
    danger: {
      "--hover-bg": "#b91c1c",
      "--active-bg": "#991b1b",
      "--hover-shadow": "0 4px 8px rgba(220, 38, 38, 0.3)",
    },
    ghost: {
      "--hover-bg": "rgb(var(--color-secondary-100))",
      "--active-bg": "rgb(var(--color-secondary-200))",
      "--hover-shadow": "0 2px 4px rgba(0, 0, 0, 0.05)",
    },
    outline: {
      "--hover-bg": "rgb(var(--color-primary-50))",
      "--active-bg": "rgb(var(--color-primary-100))",
      "--hover-shadow":
        "0 0 0 1px rgba(var(--color-primary-700), 0.8), 0 4px 8px rgba(0, 0, 0, 0.1)",
    },
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm min-h-[32px]",
    md: "px-4 py-2 text-base min-h-[40px]",
    lg: "px-6 py-3 text-lg min-h-[48px]",
    xl: "px-8 py-4 text-xl min-h-[56px]",
  };

  const loadingSpinner = (
    <svg
      className="animate-spin -ml-1 mr-2 h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );

  const buttonStyle = {
    ...variants[variant],
    ...hoverStyles[variant],
  };

  return (
    <Component
      className={clsx(
        baseStyles,
        sizes[size],
        "custom-button",
        `custom-button--${variant}`,
        className,
      )}
      style={buttonStyle}
      disabled={loading || disabled}
      {...props}
    >
      {loading && loadingSpinner}
      {loading ? "Chargement..." : children}
    </Component>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf([
    "primary",
    "secondary",
    "danger",
    "ghost",
    "outline",
  ]),
  size: PropTypes.oneOf(["sm", "md", "lg", "xl"]),
  as: PropTypes.oneOfType([PropTypes.string, PropTypes.elementType]),
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};
