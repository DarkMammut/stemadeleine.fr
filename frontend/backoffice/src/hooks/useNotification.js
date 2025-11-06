"use client";

import { useState } from "react";

export function useNotification() {
  const [notification, setNotification] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });

  const showNotification = (type, title, message = "") => {
    setNotification({
      show: true,
      type,
      title,
      message,
    });
  };

  const hideNotification = () => {
    setNotification((prev) => ({
      ...prev,
      show: false,
    }));
  };

  // Méthodes de convenance
  const showSuccess = (title, message) =>
    showNotification("success", title, message);
  const showError = (title, message) =>
    showNotification("error", title, message);
  const showInfo = (title, message) => showNotification("info", title, message);
  const showWarning = (title, message) =>
    showNotification("warning", title, message);

  return {
    notification,
    showNotification,
    hideNotification,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };
}
