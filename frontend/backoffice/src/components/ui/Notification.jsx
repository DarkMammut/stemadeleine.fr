"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { XMarkIcon } from "@heroicons/react/20/solid";

export default function Notification({
  show = true,
  onClose,
  type = "success", // success, error, info, warning
  title,
  message,
  autoClose = true,
  duration = 3000,
  prominent = false,
}) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    // Small delay to trigger animation
    const showTimer = setTimeout(() => setVisible(true), 10);

    if (autoClose && show) {
      const closeTimer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => {
        clearTimeout(showTimer);
        clearTimeout(closeTimer);
      };
    }

    return () => clearTimeout(showTimer);
  }, [show, autoClose, duration]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
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

  // Border color for prominent notifications
  const getBorderClass = () => {
    if (!prominent) return "border-gray-200";
    switch (type) {
      case "success":
        return "border-green-500";
      case "error":
        return "border-red-500";
      case "warning":
        return "border-yellow-400";
      case "info":
        return "border-blue-500";
      default:
        return "border-gray-200";
    }
  };

  if (!mounted) return null;
  if (!show || !title) return null;

  const notificationContent = (
    <div
      aria-live="assertive"
      className="pointer-events-none fixed top-0 right-0 p-6 z-[9999]"
    >
      <div
        className={`pointer-events-auto ${
          prominent ? "w-[28rem] rounded-xl border-2" : "w-96 rounded-lg"
        } bg-white shadow-lg transform transition-all duration-300 ease-out ${
          visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
        } ${getBorderClass()}`}
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
  );

  return createPortal(notificationContent, document.body);
}
