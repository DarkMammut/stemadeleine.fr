import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAxiosClient } from "@/utils/axiosClient";
import { motion } from "framer-motion";
import Title from "@/components/Title";
import MyForm from "@/components/MyForm";
import DetailsPayment from "@/components/DetailsPayment";
import LinkUser from "@/components/LinkUser";

export default function EditPayment() {
  const { id } = useParams();
  const axios = useAxiosClient();
  const [payment, setPayment] = useState(null);
  const [paymentForm, setPaymentForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    loadPayment();
  }, [id]);

  const loadPayment = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/payments/${id}`);
      setPayment(res.data);
      setPaymentForm({
        amount: res.data.amount || "",
        type: res.data.type || "",
        status: res.data.status || "",
        formSlug: res.data.formSlug || "",
        receiptUrl: res.data.receiptUrl || "",
        paymentDate: res.data.paymentDate || "",
      });
    } catch (e) {
      alert("Erreur lors du chargement du paiement");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm((f) => ({ ...f, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(`/api/payments/${id}`, paymentForm);
      await loadPayment();
      alert("Paiement modifié");
    } catch (e) {
      alert("Erreur lors de la modification du paiement");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = () => setShowEditForm(true);
  const handleDelete = async () => {
    if (window.confirm("Supprimer ce paiement ?")) {
      await axios.delete(`/api/payments/${id}`);
      alert("Paiement supprimé");
      // Redirection ou autre logique ici
    }
  };
  const handleUserNavigate = () => {
    if (payment?.user?.id) {
      window.location.href = `/users/${payment.user.id}`;
    }
  };
  const handleCancelEdit = () => setShowEditForm(false);

  const handleLinkUser = async (userId) => {
    setSaving(true);
    try {
      await axios.put(`/api/payments/${id}`, { ...paymentForm, userId });
      await loadPayment();
      alert("Utilisateur lié au paiement");
    } catch (e) {
      alert("Erreur lors de la liaison de l'utilisateur");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateAndLinkUser = async (userId) => {
    await handleLinkUser(userId);
  };

  const paymentFields = [
    {
      name: "amount",
      label: "Montant",
      type: "number",
      required: true,
      defaultValue: paymentForm.amount,
    },
    {
      name: "type",
      label: "Type",
      type: "text",
      required: true,
      defaultValue: paymentForm.type,
    },
    {
      name: "status",
      label: "Statut",
      type: "text",
      required: true,
      defaultValue: paymentForm.status,
    },
    {
      name: "formSlug",
      label: "Slug formulaire",
      type: "text",
      required: false,
      defaultValue: paymentForm.formSlug,
    },
    {
      name: "receiptUrl",
      label: "URL reçu",
      type: "text",
      required: false,
      defaultValue: paymentForm.receiptUrl,
    },
    {
      name: "paymentDate",
      label: "Date de paiement",
      type: "date",
      required: false,
      defaultValue: paymentForm.paymentDate,
    },
  ];

  if (loading) return <div>Chargement...</div>;

  if (!showEditForm) {
    return (
      <DetailsPayment
        payment={payment}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onUserNavigate={handleUserNavigate}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto space-y-6"
    >
      <Title label="Modifier le paiement" />
      <div className="bg-surface border border-border rounded-lg p-6">
        <MyForm
          fields={paymentFields}
          onSubmit={handleSave}
          onChange={handleChange}
          loading={saving}
          submitButtonLabel="Enregistrer le paiement"
          onCancel={handleCancelEdit}
          cancelButtonLabel="Annuler"
        />
      </div>
      <div className="bg-surface border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text mb-4">
          Lier un utilisateur
        </h3>
        <LinkUser
          onLink={handleLinkUser}
          onCreateAndLink={handleCreateAndLinkUser}
          loading={saving}
        />
      </div>
    </motion.div>
  );
}
