// components/IconButton.jsx
import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import Button from "./Button";

export default function IconButton({
  icon: Icon,
  label,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) {
  // Définir les couleurs d'icône en fonction du variant
  const getIconColor = (variant) => {
    switch (variant) {
      case "primary":
      case "danger":
        return "white";
      case "secondary":
        return "rgb(var(--color-secondary-800))";
      case "ghost":
        return "rgb(var(--color-secondary-700))";
      case "outline":
        return "rgb(var(--color-primary-600))";
      default:
        return "currentColor";
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={clsx(
        "flex items-center gap-2 group",
        `icon-button-${variant}`,
        className,
      )}
      {...props}
    >
      {label && (
        <span className="group-hover:!text-white transition-colors duration-200">
          {label}
        </span>
      )}
      {Icon && (
        <Icon
          className="w-5 h-5 transition-all duration-200 group-hover:!text-white"
          style={{ color: getIconColor(variant) }}
        />
      )}
    </Button>
  );
}

IconButton.propTypes = {
  icon: PropTypes.elementType,
  label: PropTypes.string,
  variant: PropTypes.oneOf([
    "primary",
    "secondary",
    "danger",
    "ghost",
    "outline",
  ]),
  size: PropTypes.oneOf(["sm", "md", "lg", "xl"]),
  className: PropTypes.string,
};
