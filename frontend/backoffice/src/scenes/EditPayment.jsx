import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAxiosClient } from "@/utils/axiosClient";
import { motion } from "framer-motion";
import Title from "@/components/Title";
import Utilities from "@/components/Utilities";
import MyForm from "@/components/MyForm";
import UserLink from "@/components/UserLink";

export default function EditPayment() {
  const { id } = useParams();
  const axios = useAxiosClient();
  const [payment, setPayment] = useState(null);
  const [paymentForm, setPaymentForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto space-y-6"
    >
      <Title label="Modifier le paiement" />
      <Utilities actions={[]} />
      <div className="bg-surface border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text mb-4">
          Informations du paiement
        </h3>
        <MyForm
          fields={paymentFields}
          onSubmit={handleSave}
          onChange={handleChange}
          loading={saving}
          submitButtonLabel="Enregistrer le paiement"
        />
      </div>
      {payment?.user && (
        <div className="bg-surface border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-text mb-4">
            Utilisateur associé
          </h3>
          <UserLink user={payment.user} />
        </div>
      )}
    </motion.div>
  );
}
