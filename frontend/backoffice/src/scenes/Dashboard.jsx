import Campaigns from "@/components/Campaigns";
import SceneLayout from "@/components/ui/SceneLayout";
import Title from "@/components/ui/Title";
import Notification from "@/components/ui/Notification";
import { useNotification } from "@/hooks/useNotification";
import React from "react";

export default function Dashboard() {
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();

  return (
    <SceneLayout>
      <Title label="Dashboard" />

      <Campaigns onNotifySuccess={showSuccess} onNotifyError={showError} />

      <Notification
        show={notification.show}
        onClose={hideNotification}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </SceneLayout>
  );
}
