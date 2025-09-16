import React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/utils/cn";

const tagVariants = cva(
  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-gray-100 text-gray-800",
        draft: "bg-yellow-100 text-yellow-800 border border-yellow-200",
        published: "bg-green-100 text-green-800 border border-green-200",
        archived: "bg-gray-100 text-gray-600 border border-gray-200",
        deleted: "bg-red-100 text-red-800 border border-red-200",
        primary: "bg-primary/10 text-primary border border-primary/20",
        secondary: "bg-gray-100 text-gray-600 border border-gray-200",
        success: "bg-green-100 text-green-800 border border-green-200",
        warning: "bg-yellow-100 text-yellow-800 border border-yellow-200",
        error: "bg-red-100 text-red-800 border border-red-200",
        info: "bg-blue-100 text-blue-800 border border-blue-200",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        default: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const StatusTag = ({
  status,
  variant,
  size = "default",
  className,
  children,
  ...props
}) => {
  // Auto-detect variant based on status if not provided
  const getStatusVariant = (status) => {
    if (variant) return variant;

    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case "draft":
        return "draft";
      case "published":
        return "published";
      case "archived":
        return "archived";
      case "deleted":
        return "deleted";
      default:
        return "default";
    }
  };

  const displayText = children || status;
  const statusVariant = getStatusVariant(status);

  return (
    <span
      className={cn(tagVariants({ variant: statusVariant, size }), className)}
      {...props}
    >
      {displayText}
    </span>
  );
};

// Export individual Tag component for general use
export const Tag = ({
  variant = "default",
  size = "default",
  className,
  children,
  ...props
}) => {
  return (
    <span className={cn(tagVariants({ variant, size }), className)} {...props}>
      {children}
    </span>
  );
};

export default StatusTag;
