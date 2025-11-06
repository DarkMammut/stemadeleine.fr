"use client";

import { useEffect, useState } from "react";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { XMarkIcon } from "@heroicons/react/20/solid";

export default function Notification({
  show,
  onClose,
  type = "success", // success, error, info, warning
  title,
  message,
  autoClose = true,
  duration = 3000,
}) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (show) {
      setMounted(true);
      // Small delay to trigger animation
      setTimeout(() => setVisible(true), 10);

      if (autoClose) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);

        return () => clearTimeout(timer);
      }
    } else {
      setVisible(false);
      // Remove from DOM after animation
      setTimeout(() => setMounted(false), 300);
    }
  }, [show, autoClose, duration]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      setMounted(false);
      onClose?.();
    }, 300);
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return (
          <CheckCircleIcon
            aria-hidden="true"
            className="h-6 w-6 text-green-400"
          />
        );
      case "error":
        return (
          <XCircleIcon aria-hidden="true" className="h-6 w-6 text-red-400" />
        );
      case "warning":
        return (
          <ExclamationTriangleIcon
            aria-hidden="true"
            className="h-6 w-6 text-yellow-400"
          />
        );
      case "info":
        return (
          <InformationCircleIcon
            aria-hidden="true"
            className="h-6 w-6 text-blue-400"
          />
        );
      default:
        return (
          <CheckCircleIcon
            aria-hidden="true"
            className="h-6 w-6 text-green-400"
          />
        );
    }
  };

  if (!mounted) return null;

  return (
    <div
      aria-live="assertive"
      className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6 z-50"
    >
      <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
        <div
          className={`pointer-events-auto w-full max-w-sm rounded-lg bg-white shadow-lg border border-gray-200 transform transition-all duration-300 ease-out ${
            visible
              ? "opacity-100 translate-y-0 sm:translate-x-0"
              : "opacity-0 translate-y-2 sm:translate-x-2 sm:translate-y-0"
          }`}
        >
          <div className="p-4">
            <div className="flex items-start">
              <div className="shrink-0">{getIcon()}</div>
              <div className="ml-3 w-0 flex-1 pt-0.5">
                <p className="text-sm font-medium text-gray-900">{title}</p>
                {message && (
                  <p className="mt-1 text-sm text-gray-500">{message}</p>
                )}
              </div>
              <div className="ml-4 flex shrink-0">
                <button
                  type="button"
                  onClick={handleClose}
                  className="inline-flex rounded-md text-gray-400 hover:text-gray-500 focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 transition-colors cursor-pointer"
                >
                  <span className="sr-only">Fermer</span>
                  <XMarkIcon aria-hidden="true" className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
