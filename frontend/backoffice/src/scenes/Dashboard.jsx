import Campaigns from "@/components/Campaigns";
import { motion } from "framer-motion";
import Title from "@/components/Title";
import Notification from "@/components/Notification";
import { useNotification } from "@/hooks/useNotification";
import React from "react";

export default function Dashboard() {
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-6xl mx-auto p-6 space-y-6"
    >
      <Title label="Dashboard" />

      <Campaigns onNotifySuccess={showSuccess} onNotifyError={showError} />

      <Notification
        show={notification.show}
        onClose={hideNotification}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </motion.div>
  );
}
