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
  loading = false,
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

  if (loading) {
    // Display a placeholder badge (animate-pulse) when loading is true
    const sizeClass =
      size === "lg" ? "h-6 w-20" : size === "sm" ? "h-4 w-16" : "h-5 w-20";
    return (
      <span
        className={cn(
          `inline-block rounded-full bg-gray-50 dark:bg-gray-600 animate-pulse ${sizeClass}`,
          className,
        )}
        style={{ display: "inline-block" }}
      />
    );
  }

  return (
    <span
      className={cn(tagVariants({ variant: statusVariant, size }), className)}
      {...props}
    >
      {displayText}
    </span>
  );
};

export default StatusTag;
