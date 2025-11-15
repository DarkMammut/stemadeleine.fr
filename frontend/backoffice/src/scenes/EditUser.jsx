import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAxiosClient } from "@/utils/axiosClient";
import Title from "@/components/ui/Title";
import UserDetails from "@/components/UserDetails";
import SceneLayout from "@/components/ui/SceneLayout";

export default function EditUser() {
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
      alert("Erreur lors du chargement de l'utilisateur");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/users/${id}`);
      alert("Utilisateur supprimé");
      // Redirection ou autre logique ici
    } catch (error) {
      alert("Erreur lors de la suppression");
    }
  };

  const effectiveLoading = loading;
  if (effectiveLoading && !user)
    return (
      <SceneLayout>
        <Title label="Modifier l'utilisateur" />
        <div className="space-y-6">
          <UserDetails loading={true} editable={false} />
        </div>
      </SceneLayout>
    );

  return (
    <SceneLayout>
      <Title label="Modifier l'utilisateur" />

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
