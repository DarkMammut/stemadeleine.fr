import React, { useState } from "react";
import MyForm from "@/components/MyForm";
import { useAxiosClient } from "@/utils/axiosClient";

export default function MembershipManager({
  userId,
  memberships,
  refreshUser,
}) {
  const axios = useAxiosClient();
  const currentYear = new Date().getFullYear();
  const currentMembership = memberships.find(
    (m) => m.dateFin && new Date(m.dateFin).getFullYear() === currentYear,
  );
  const [form, setForm] = useState({
    dateAdhesion: currentMembership?.dateAdhesion?.substring(0, 10) || "",
    dateFin:
      currentMembership?.dateFin?.substring(0, 10) || `${currentYear}-12-31`,
    isActive: currentMembership?.active ?? true,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (currentMembership) {
        await axios.put(`/api/memberships/${currentMembership.id}`, {
          ...form,
          active: form.isActive,
        });
      } else {
        await axios.post(`/api/memberships?userId=${userId}`, {
          ...form,
          active: form.isActive,
        });
      }
      await refreshUser();
      alert("Adhésion enregistrée");
    } catch (e) {
      alert("Erreur lors de l'enregistrement de l'adhésion");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      name: "dateAdhesion",
      label: "Date d'adhésion",
      type: "date",
      required: false,
    },
    { name: "dateFin", label: "Date de fin", type: "date", required: false },
    {
      name: "isActive",
      label: "Adhésion active",
      type: "checkbox",
      required: false,
    },
  ];

  return (
    <div>
      <div className="mb-4">
        <h4 className="font-semibold">Adhésions existantes :</h4>
        {memberships.length === 0 ? (
          <div>Aucune adhésion</div>
        ) : (
          <ul className="mb-2">
            {memberships.map((m) => (
              <li key={m.id}>
                Année : {new Date(m.dateFin).getFullYear()} | Début :{" "}
                {m.dateAdhesion} | Fin : {m.dateFin} | Active :{" "}
                {m.active ? "Oui" : "Non"}
              </li>
            ))}
          </ul>
        )}
      </div>
      <MyForm
        fields={fields}
        initialValues={form}
        onSubmit={handleSubmit}
        onChange={setForm}
        loading={loading}
        submitButtonLabel={
          currentMembership ? "Enregistrer l'adhésion" : "Créer l'adhésion"
        }
      />
    </div>
  );
}
