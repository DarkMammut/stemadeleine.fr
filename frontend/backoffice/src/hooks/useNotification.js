"use client";

import { useState } from "react";

export function useNotification() {
  const [notification, setNotification] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
    autoClose: true,
    duration: 3000,
    prominent: false,
  });

  // options: { autoClose: boolean, duration: number }
  const showNotification = (type, title, message = "", options = {}) => {
    const {
      autoClose = true,
      duration = 3000,
      prominent = false,
    } = options || {};
    setNotification({
      show: true,
      type,
      title,
      message,
      autoClose,
      duration,
      prominent,
    });
  };

  const hideNotification = () => {
    setNotification({
      show: false,
      type: "success",
      title: "",
      message: "",
      autoClose: true,
      duration: 3000,
      prominent: false,
    });
  };

  // Méthodes de convenance
  const showSuccess = (title, message, options) =>
    showNotification("success", title, message, options);
  const showError = (title, message, options) =>
    showNotification("error", title, message, options);
  const showInfo = (title, message, options) =>
    showNotification("info", title, message, options);
  const showWarning = (title, message, options) =>
    showNotification("warning", title, message, options);

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
