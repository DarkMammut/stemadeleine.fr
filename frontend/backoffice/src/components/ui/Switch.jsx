// components/ui/Switch.jsx

import { useState } from "react";
import clsx from "clsx";

export default function Switch({
  checked: controlledChecked,
  onChange,
  disabled = false,
  className,
}) {
  const [internalChecked, setInternalChecked] = useState(false);

  const isControlled = controlledChecked !== undefined;
  const checked = isControlled ? controlledChecked : internalChecked;

  const handleToggle = () => {
    if (disabled) return;

    if (!isControlled) {
      setInternalChecked(!checked);
    }
    if (onChange) {
      onChange(!checked);
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={handleToggle}
      className={clsx(
        "relative inline-flex h-6 w-11 items-center rounded-full  cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
        checked ? "bg-blue-600" : "bg-gray-300",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
    >
      <span
        className={clsx(
          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
          checked ? "translate-x-6" : "translate-x-1",
        )}
      />
    </button>
  );
}
