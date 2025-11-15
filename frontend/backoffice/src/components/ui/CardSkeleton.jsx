import React from "react";
import PropTypes from "prop-types";

// Generic card skeleton that mimics NewsCard / NewsletterCard structure
// Render the same li wrapper as Card to avoid circular imports
export default function CardSkeleton({
  showActions = false,
  size = "md",
  className = "",
  ariaLabel = "Chargement de la carte",
}) {
  // use central skeleton utility for uniform placeholder look
  const base = "skeleton";
  const imgH = size === "sm" ? "h-5 w-5" : "h-6 w-6";
  const titleH = size === "sm" ? "h-3" : "h-4";
  const lineH = size === "sm" ? "h-2.5" : "h-3";

  return (
    <li
      className={`px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors cursor-pointer ${className}`}
    >
      <div role="status" aria-live="polite" aria-label={ariaLabel}>
        <span className="sr-only">{ariaLabel}</span>
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0 mt-1">
            <div className={`${base} ${imgH} rounded-full`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div className={`w-1/2 ${base} ${titleH} rounded`} />
              <div className="flex items-center gap-2">
                <div className={`${base} h-5 w-5 rounded`} />
              </div>
            </div>

            <div className={`mt-2 space-y-2`}>
              <div className={`${base} w-full ${lineH} rounded`} />
              <div className={`${base} w-3/4 ${lineH} rounded`} />
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-500 mt-3">
              <div className={`${base} w-16 ${lineH} rounded`} />
              <div className={`${base} w-24 ${lineH} rounded`} />
              <div className={`${base} w-28 ${lineH} rounded`} />
            </div>

            {showActions && (
              <div className="mt-4 flex items-center justify-end gap-2">
                <div className={`${base} w-20 h-8 rounded`} />
                <div className={`${base} w-12 h-8 rounded`} />
              </div>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

CardSkeleton.propTypes = {
  showActions: PropTypes.bool,
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  className: PropTypes.string,
  ariaLabel: PropTypes.string,
};
