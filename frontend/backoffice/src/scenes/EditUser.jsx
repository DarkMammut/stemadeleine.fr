import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAxiosClient } from "@/utils/axiosClient";
import Title from "@/components/ui/Title";
import UserDetails from "@/components/UserDetails";
import UserForm from "@/components/UserForm";
import AddressManager from "@/components/AddressManager";
import MembershipManager from "@/components/MembershipManager";
import SceneLayout from "@/components/ui/SceneLayout";

export default function EditUser() {
  const { id } = useParams();
  const axios = useAxiosClient();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [userForm, setUserForm] = useState({});
  const [savingUser, setSavingUser] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/users/${id}`);
      setUser(res.data);
      setUserForm({
        firstname: res.data.firstname || "",
        lastname: res.data.lastname || "",
        email: res.data.email || "",
        phoneMobile: res.data.phoneMobile || "",
        phoneLandline: res.data.phoneLandline || "",
        newsletter: !!res.data.newsletter,
        birthDate: res.data.birthDate || "",
      });
    } catch (e) {
      alert("Erreur lors du chargement de l'utilisateur");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => setEditMode(true);
  const handleCancelEdit = () => setEditMode(false);

  const handleSaveUser = async () => {
    setSavingUser(true);
    try {
      await axios.put(`/api/users/${id}`, userForm);
      await fetchUser();
      setEditMode(false);
      alert("Utilisateur modifié");
    } catch (e) {
      alert("Erreur lors de la modification du user");
    } finally {
      setSavingUser(false);
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

  if (loading) return <div>Chargement...</div>;

  return (
    <SceneLayout>
      <Title label="Modifier l'utilisateur" />

      {!editMode ? (
        <UserDetails user={user} onEdit={handleEdit} onDelete={handleDelete} />
      ) : (
        <>
          {/* Informations de l'utilisateur */}
          <UserForm
            initialValues={userForm}
            onSubmit={handleSaveUser}
            onChange={(_, __, updatedValues) => setUserForm(updatedValues)}
            loading={savingUser}
            onCancel={handleCancelEdit}
          />

          {/* Section Adresses */}
          <div className="border-t border-gray-200 pt-8">
            <AddressManager
              label="Adresses"
              addresses={user.addresses || []}
              ownerId={user.id}
              ownerType="USER"
              refreshAddresses={fetchUser}
              editable={true}
            />
          </div>

          {/* Section Adhésion */}
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Adhésion</h3>
            <MembershipManager
              userId={user.id}
              memberships={user.memberships || []}
              refreshUser={fetchUser}
            />
          </div>
        </>
      )}
    </SceneLayout>
  );
}
