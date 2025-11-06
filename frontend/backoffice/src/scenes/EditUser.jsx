import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAxiosClient } from "@/utils/axiosClient";
import { motion } from "framer-motion";
import Title from "@/components/Title";
import UserDetails from "@/components/UserDetails";
import UserForm from "@/components/UserForm";
import AddressManager from "@/components/AddressManager";
import MembershipManager from "@/components/MembershipManager";
import DeleteModal from "@/components/DeleteModal";

export default function EditUser() {
  const { id } = useParams();
  const axios = useAxiosClient();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [userForm, setUserForm] = useState({});
  const [savingUser, setSavingUser] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
    setIsDeleting(true);
    try {
      await axios.delete(`/api/users/${id}`);
      alert("Utilisateur supprimé");
      // Redirection ou autre logique ici
    } catch (error) {
      alert("Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto space-y-6"
    >
      <Title label="Modifier l'utilisateur" />
      {!editMode ? (
        <UserDetails
          user={user}
          onEdit={handleEdit}
          onDelete={() => setShowDeleteModal(true)}
        />
      ) : (
        <>
          <div className="bg-surface border border-border rounded-lg p-6">
            <UserForm
              initialValues={userForm}
              onSubmit={handleSaveUser}
              onChange={(_, __, updatedValues) => setUserForm(updatedValues)}
              loading={savingUser}
              onCancel={handleCancelEdit}
            />
          </div>
          <div className="bg-surface border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-text mb-4">Adresses</h3>
            <AddressManager
              addresses={user.addresses || []}
              ownerId={user.id}
              ownerType="USER"
              refreshAddresses={fetchUser}
              editable={true}
            />
          </div>
          <div className="bg-surface border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-text mb-4">Adhésion</h3>
            <MembershipManager
              userId={user.id}
              memberships={user.memberships || []}
              refreshUser={fetchUser}
            />
          </div>
        </>
      )}

      <DeleteModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Supprimer l'utilisateur"
        message="Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible."
        isDeleting={isDeleting}
      />
    </motion.div>
  );
}
