import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAxiosClient } from "@/utils/axiosClient";
import MyForm from "@/components/MyForm";
import { motion } from "framer-motion";
import Title from "@/components/Title";
import Utilities from "@/components/Utilities";
import Switch from "@/components/ui/Switch";
import Addresses from "@/components/Addresses";

export default function EditUser() {
  const { id } = useParams();
  const axios = useAxiosClient();
  const [user, setUser] = useState(null);
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userForm, setUserForm] = useState({});
  const [savingUser, setSavingUser] = useState(false);
  const [membershipForm, setMembershipForm] = useState({});
  const [savingMembership, setSavingMembership] = useState(false);
  const [showMembershipForm, setShowMembershipForm] = useState(false);

  useEffect(() => {
    loadUser();
  }, [id]);

  useEffect(() => {
    if (membership) {
      setShowMembershipForm(true);
      setMembershipForm({
        dateAdhesion: membership.dateAdhesion
          ? membership.dateAdhesion.substring(0, 10)
          : "",
        dateFin: membership.dateFin
          ? membership.dateFin.substring(0, 10)
          : getDefaultDateFin(),
        isActive: membership.active ?? true,
      });
    } else {
      setShowMembershipForm(false);
      setMembershipForm({
        dateAdhesion: "",
        dateFin: getDefaultDateFin(),
        isActive: true,
      });
    }
  }, [membership]);

  const getDefaultDateFin = () => {
    const year = new Date().getFullYear();
    return `${year}-12-31`;
  };

  const loadUser = async () => {
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
      // Charger l'adhésion de l'année en cours
      if (res.data.memberships && res.data.memberships.length > 0) {
        const currentYear = new Date().getFullYear();
        const currentMembership = res.data.memberships.find(
          (m) => m.dateFin && new Date(m.dateFin).getFullYear() === currentYear,
        );
        if (currentMembership) {
          setMembership(currentMembership);
        } else {
          setMembership(null);
        }
      } else {
        setMembership(null);
      }
    } catch (e) {
      alert("Erreur lors du chargement de l'utilisateur");
    } finally {
      setLoading(false);
    }
  };

  const handleUserChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Nouveau : le switch ne fait qu'afficher/masquer le formulaire
  const handleSwitchChange = (checked) => {
    setShowMembershipForm(checked);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setSavingUser(true);
    try {
      await axios.put(`/api/users/${id}`, userForm);
      await loadUser();
      alert("Utilisateur modifié");
    } catch (e) {
      alert("Erreur lors de la modification du user");
    } finally {
      setSavingUser(false);
    }
  };

  const handlePublishUser = async () => {
    await axios.put(`/api/users/${id}/publish`);
    await loadUser();
  };

  // Nouveau : création ou update selon existence
  const handleSaveMembership = async (e) => {
    e.preventDefault();
    setSavingMembership(true);
    try {
      if (membership) {
        await axios.put(`/api/memberships/${membership.id}`, {
          ...membershipForm,
          active: membershipForm.isActive,
        });
      } else {
        await axios.post(`/api/memberships?userId=${id}`, {
          ...membershipForm,
          active: membershipForm.isActive,
        });
      }
      await loadUser();
      alert("Adhésion enregistrée");
    } catch (e) {
      alert("Erreur lors de l'enregistrement de l'adhésion");
    } finally {
      setSavingMembership(false);
    }
  };

  // Méthodes pour gérer les adresses
  const handleAddAddress = async (address) => {
    await axios.post(`/api/users/${id}/addresses`, address);
    await loadUser();
  };
  const handleEditAddress = async (addressId, address) => {
    await axios.put(`/api/addresses/${addressId}`, address);
    await loadUser();
  };
  const handleDeleteAddress = async (addressId) => {
    await axios.delete(`/api/addresses/${addressId}`);
    await loadUser();
  };

  // Champs du formulaire utilisateur
  const userFields = [
    {
      name: "firstname",
      label: "Prénom",
      type: "text",
      required: true,
      defaultValue: userForm.firstname,
    },
    {
      name: "lastname",
      label: "Nom",
      type: "text",
      required: true,
      defaultValue: userForm.lastname,
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      required: false,
      defaultValue: userForm.email,
    },
    {
      name: "phoneMobile",
      label: "Mobile",
      type: "text",
      required: false,
      defaultValue: userForm.phoneMobile,
    },
    {
      name: "phoneLandline",
      label: "Fixe",
      type: "text",
      required: false,
      defaultValue: userForm.phoneLandline,
    },
    {
      name: "birthDate",
      label: "Date de naissance",
      type: "date",
      required: false,
      defaultValue: userForm.birthDate,
    },
    {
      name: "newsletter",
      label: "Abonné à la newsletter",
      type: "checkbox",
      required: false,
      defaultValue: userForm.newsletter,
    },
  ];

  // Champs du formulaire d'adhésion
  const membershipFields = [
    {
      name: "dateAdhesion",
      label: "Date d'adhésion",
      type: "date",
      required: false,
      defaultValue: membershipForm.dateAdhesion,
    },
    {
      name: "dateFin",
      label: "Date de fin",
      type: "date",
      required: false,
      defaultValue: membershipForm.dateFin,
    },
    {
      name: "isActive",
      label: "Adhésion active",
      type: "checkbox",
      required: false,
      defaultValue: membershipForm.isActive,
    },
  ];

  if (loading) return <div>Chargement...</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-6xl mx-auto space-y-6"
    >
      <Title label="Modifier l'utilisateur" onPublish={handlePublishUser} />
      <Utilities actions={[]} />
      <div className="bg-surface border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text mb-4">
          Informations utilisateur
        </h3>
        <MyForm
          fields={userFields}
          onSubmit={handleSaveUser}
          onChange={setUserForm}
          loading={savingUser}
          submitButtonLabel="Enregistrer les infos utilisateur"
        />
      </div>
      <div className="bg-surface border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text mb-4">Adresses</h3>
        <Addresses
          addresses={user?.addresses || []}
          onAdd={handleAddAddress}
          onEdit={handleEditAddress}
          onDelete={handleDeleteAddress}
        />
      </div>
      <div className="bg-surface border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text mb-4">Adhésion</h3>
        <div className="flex items-center gap-4 mb-4">
          <span>Adhérent&nbsp;:</span>
          <Switch
            checked={showMembershipForm}
            onChange={handleSwitchChange}
            loading={false}
          />
        </div>
        {showMembershipForm && (
          <MyForm
            fields={membershipFields}
            onSubmit={handleSaveMembership}
            onChange={setMembershipForm}
            loading={savingMembership}
            submitButtonLabel={
              membership ? "Enregistrer l'adhésion" : "Créer l'adhésion"
            }
          />
        )}
      </div>
    </motion.div>
  );
}
