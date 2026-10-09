"use client";

import React, { useEffect, useState } from "react";
import Title from "@/components/ui/Title";
import UserDetails from "@/components/UserDetails";
import SceneLayout from "@/components/ui/SceneLayout";
import { useUserOperations } from "@/hooks/useUserOperations";
import { useTranslation } from "@/i18n/I18nContext";

export default function Profile() {
  const { t } = useTranslation();
  const { getCurrentUser } = useUserOperations();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    setLoading(true);
    try {
      const res = await getCurrentUser();
      if (!res) {
        setUser(null);
        return;
      }
      setUser(res);
    } catch (e) {
      alert(t("users.profileLoadError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SceneLayout>
      <Title label={t("users.profileTitle")} />

      <UserDetails
        user={user}
        loading={loading}
        showAddresses={true}
        showMemberships={false}
        showAccountsManager={true}
        editAccounts={false}
        refreshUser={fetchCurrentUser}
        editable={true}
        changePassword={true}
      />
    </SceneLayout>
  );
}
