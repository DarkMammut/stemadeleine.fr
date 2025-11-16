import React from "react";
import PropTypes from "prop-types";

export default function CardLayout({
  children,
  cardsPerRow = 1,
  gap = "gap-4",
  align = "stretch",
  emptyMessage = "Aucune carte trouvée.",
  className = "",
  responsive = { md: 2, lg: 3 },
}) {
  // Build Tailwind-compatible classes for grid columns
  const sanitizeCols = (n) => (Number.isFinite(n) && n >= 1 ? n : 1);
  const baseCols = sanitizeCols(cardsPerRow);

  // Allowed Tailwind breakpoint prefixes
  const allowedBps = ["sm", "md", "lg", "xl", "2xl"];

  // Build responsive classes like "md:grid-cols-2 lg:grid-cols-3"
  let responsiveClasses = Object.entries(responsive)
    .filter(([bp]) => allowedBps.includes(bp))
    .map(([bp, val]) => `${bp}:grid-cols-${sanitizeCols(val)}`)
    .join(" ");

  // gap can be a Tailwind class like "gap-4" or a number (px fallback)
  let gapClass = "";
  const gapStyle = {};
  if (typeof gap === "string" && gap.startsWith("gap-")) gapClass = gap;
  else if (typeof gap === "number") gapStyle.gap = `${gap}px`;
  else if (typeof gap === "string") gapStyle.gap = gap;

  // map align prop to Tailwind items-* classes so it affects vertical alignment
  const alignMap = {
    stretch: "items-stretch",
    start: "items-start",
    center: "items-center",
    end: "items-end",
  };
  const alignClass = alignMap[align] || alignMap.stretch;

  const containerClass =
    `grid grid-cols-${baseCols} ${responsiveClasses} ${gapClass} ${alignClass} ${className}`.trim();

  const hasChildren =
    React.Children.toArray(children).filter(Boolean).length > 0;

  return (
    <div className={containerClass} style={gapStyle}>
      {hasChildren ? (
        React.Children.map(children, (child, i) => (
          <div key={i} className="w-full">
            {child}
          </div>
        ))
      ) : (
        <div className="p-8 text-center text-gray-500">{emptyMessage}</div>
      )}
    </div>
  );
}

CardLayout.propTypes = {
  children: PropTypes.node,
  cardsPerRow: PropTypes.number,
  gap: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  align: PropTypes.oneOf(["stretch", "start", "center", "end"]),
  emptyMessage: PropTypes.string,
  className: PropTypes.string,
  responsive: PropTypes.object,
};
