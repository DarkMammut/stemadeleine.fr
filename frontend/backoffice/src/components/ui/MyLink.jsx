import clsx from "clsx";
import PropTypes from "prop-types";
import Link from "next/link";

export default function MyLink({
  href,
  children,
  size = "md",
  className = "",
  target = "_blank",
  rel = "noopener noreferrer",
  onClick,
  ariaLabel,
  ...props
}) {
  // base styles aligned with Button base + variant 'link'
  const baseStyles =
    "inline-flex items-center justify-center font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer";
  const variantStyles =
    "bg-transparent text-blue-600 hover:text-blue-700 hover:bg-blue-50 focus:ring-blue-300";

  const sizes = {
    sm: "px-2.5 py-1.5 text-sm",
    md: "px-3 py-2 text-sm",
    lg: "px-4 py-2.5 text-base",
  };

  const sizeClass = sizes[size] || sizes.md;
  const classNames = clsx(baseStyles, variantStyles, sizeClass, className);

  // Heuristic: treat as internal link when href starts with '/', '#', '?', or '.' (relative)
  const isInternal =
    typeof href === "string" &&
    (href.startsWith("/") ||
      href.startsWith("#") ||
      href.startsWith("?") ||
      href.startsWith("."));

  if (isInternal) {
    // Use Next.js Link for client-side navigation
    return (
      <Link
        href={href}
        className={classNames}
        onClick={onClick}
        aria-label={ariaLabel}
        {...props}
      >
        {children}
      </Link>
    );
  }

  // External link: use <a> to allow target/rel
  return (
    <a
      href={href}
      target={target}
      rel={rel}
      aria-label={ariaLabel}
      onClick={onClick}
      className={classNames}
      {...props}
    >
      {children}
    </a>
  );
}

MyLink.propTypes = {
  href: PropTypes.string.isRequired,
  children: PropTypes.node,
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  className: PropTypes.string,
  target: PropTypes.string,
  rel: PropTypes.string,
  onClick: PropTypes.func,
  ariaLabel: PropTypes.string,
};

MyLink.defaultProps = {
  children: null,
  size: "md",
  className: "",
  target: "_blank",
  rel: "noopener noreferrer",
  onClick: undefined,
  ariaLabel: undefined,
};
