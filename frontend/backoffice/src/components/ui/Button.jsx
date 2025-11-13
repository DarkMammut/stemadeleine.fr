// components/ui/Button.jsx
import clsx from "clsx";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  as = "button",
  loading = false,
  className,
  ...props
}) {
  const Component = as;

  const baseStyles =
    "inline-flex items-center justify-center font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

  const variants = {
    primary:
      "bg-indigo-600 text-white hover:bg-indigo-500 focus:ring-indigo-600 shadow-sm",
    secondary:
      "bg-gray-200 text-gray-900 hover:bg-gray-300 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:ring-gray-400",
    danger:
      "bg-red-600 text-white hover:bg-red-500 focus:ring-red-500 shadow-sm",
    success:
      "bg-emerald-600 text-white hover:bg-emerald-500 focus:ring-emerald-600 shadow-sm",
    ghost: "bg-transparent text-gray-900 hover:bg-gray-100 focus:ring-gray-300",
    link: "bg-transparent text-blue-600 hover:text-blue-700 hover:bg-blue-50 focus:ring-blue-300",
    outline:
      "bg-white text-gray-900 hover:bg-gray-50 ring-1 ring-inset ring-gray-300 focus:ring-gray-400 shadow-sm",
    refresh:
      "bg-green-600 text-white hover:bg-green-500 focus:ring-green-600 shadow-sm",
    filter:
      "bg-gray-300 text-gray-900 hover:bg-gray-400 ring-1 ring-inset ring-gray-400 hover:bg-gray-50 focus:ring-gray-500",
  };

  const sizes = {
    sm: "px-2.5 py-1.5 text-sm",
    md: "px-3 py-2 text-sm",
    lg: "px-4 py-2.5 text-base",
  };

  return (
    <Component
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? "Chargement..." : children}
    </Component>
  );
}
