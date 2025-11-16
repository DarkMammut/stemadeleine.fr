import React from "react";
import { motion } from "framer-motion";

function normalizeBg(bg) {
  if (!bg) return "bg-white";
  if (typeof bg === "object") {
    const { color, shade } = bg;
    if (color && shade) return `bg-${color}-${shade}`;
    if (color) return `bg-${color}`;
    return "bg-white";
  }
  if (typeof bg === "string") {
    if (bg.startsWith("bg-")) return bg;
    return `bg-${bg}`;
  }
  return "bg-white";
}

function normalizeTextColor(col) {
  if (!col) return "text-gray-800";
  if (typeof col === "object") {
    const { color, shade } = col;
    if (color && shade) return `text-${color}-${shade}`;
    if (color) return `text-${color}`;
    return "text-gray-800";
  }
  if (typeof col === "string") {
    if (col.startsWith("text-")) return col;
    // e.g. 'white' or 'blue-600' -> 'text-white' or 'text-blue-600'
    return `text-${col}`;
  }
  return "text-gray-800";
}

const sizeMap = {
  sm: { icon: "w-4 h-4", pad: "px-3 py-2", text: "text-sm" },
  md: { icon: "w-6 h-6", pad: "px-4 py-3", text: "text-base" },
  lg: { icon: "w-8 h-8", pad: "px-6 py-4", text: "text-lg" },
};

export default function BigButton({
  onClick,
  label,
  icon: Icon,
  className = "",
  bg,
  color,
  iconColor,
  watermarkColor,
  size = "md",
  square = false,
}) {
  const resolvedBg = normalizeBg(bg);
  const resolvedText = normalizeTextColor(color);
  const resolvedIconColor = iconColor
    ? normalizeTextColor(iconColor)
    : resolvedText;
  const resolvedWatermark = watermarkColor
    ? normalizeTextColor(watermarkColor)
    : resolvedIconColor;

  const s = sizeMap[size] || sizeMap.md;
  const padClass = square ? "" : s.pad;
  const iconSizeClass = s.icon;
  const textSizeClass = s.text;

  // build root classes
  const rootClasses = [
    "relative",
    "rounded-2xl",
    resolvedBg,
    resolvedText,
    "font-semibold",
    "shadow-lg",
    "flex",
    "items-center",
    "justify-center",
    "overflow-hidden",
    "cursor-pointer",
    className,
  ];
  if (square) rootClasses.push("aspect-square");

  return (
    <motion.button
      key={label}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`${rootClasses.filter(Boolean).join(" ")} ${padClass}`}
    >
      {/* watermark icon (subtil, occupe tout le background) */}
      {Icon && (
        <div className="absolute inset-0 pointer-events-none">
          <Icon className={`w-full h-full opacity-10 ${resolvedWatermark}`} />
        </div>
      )}

      {/* content */}
      <span
        className={`relative z-10 flex flex-col items-center justify-center text-center px-3 ${textSizeClass}`}
      >
        {Icon && (
          <Icon className={`${iconSizeClass} mb-2 ${resolvedIconColor}`} />
        )}
        {label && <span className="truncate">{label}</span>}
      </span>
    </motion.button>
  );
}
