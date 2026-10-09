import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAxiosClient } from "@/utils/axiosClient";
import Title from "@/components/ui/Title";
import UserDetails from "@/components/UserDetails";
import SceneLayout from "@/components/ui/SceneLayout";
import { useTranslation } from "@/i18n/I18nContext";

export default function EditUser() {
  const { t } = useTranslation();
  const { id } = useParams();
  const axios = useAxiosClient();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/users/${id}`);
      setUser(res.data);
    } catch (e) {
      alert(t("users.editLoadError"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/users/${id}`);
      alert(t("users.deleteSuccess"));
      // Redirection ou autre logique ici
    } catch (error) {
      alert(t("users.deleteError"));
    }
  };

  const effectiveLoading = loading;
  if (effectiveLoading && !user)
    return (
      <SceneLayout>
        <Title label={t("users.editTitle")} />
        <div className="space-y-6">
          <UserDetails loading={true} editable={false} />
        </div>
      </SceneLayout>
    );

  return (
    <SceneLayout>
      <Title label={t("users.editTitle")} />

      <UserDetails
        user={user}
        onDelete={handleDelete}
        /* Allow UserDetails to render AddressManager and MembershipManager */
        showAddresses={true}
        showMemberships={true}
        refreshUser={fetchUser}
        editable={true}
        loading={effectiveLoading}
      />
    </SceneLayout>
  );
}
