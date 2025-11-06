import React from "react";
import PropTypes from "prop-types";

const Button = React.forwardRef((props, ref) => {
  const {
    children,
    className = "",
    variant = "primary",
    size = "md",
    disabled = false,
    loading = false,
    type = "button",
    onClick,
    ...restProps
  } = props;

  // Classes de base
  const baseClasses =
    "inline-flex items-center justify-center font-semibold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed";

  // Variantes de style
  const variants = {
    primary:
      "bg-primary text-white hover:bg-primary-700 focus:ring-primary disabled:bg-gray-300 disabled:text-gray-500",
    secondary:
      "bg-secondary text-white hover:bg-secondary-700 focus:ring-secondary disabled:bg-gray-300 disabled:text-gray-500",
    outline:
      "border-2 border-primary text-primary bg-transparent hover:bg-primary-50 focus:ring-primary disabled:border-gray-300 disabled:text-gray-300",
    ghost:
      "text-primary bg-transparent hover:bg-primary-50 focus:ring-primary disabled:text-gray-300",
    danger:
      "bg-red-600 text-white hover:bg-red-500 focus:ring-red-500 disabled:bg-gray-300 disabled:text-gray-500",
  };

  // Tailles
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  // Classes finales
  const buttonClasses = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button
      ref={ref}
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={onClick}
      {...restProps}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
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
      )}
      {children}
    </button>
  );
});

Button.displayName = "Button";

Button.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  variant: PropTypes.oneOf([
    "primary",
    "secondary",
    "outline",
    "ghost",
    "danger",
  ]),
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  onClick: PropTypes.func,
};

export default Button;
