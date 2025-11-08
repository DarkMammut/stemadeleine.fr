import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAxiosClient } from "@/utils/axiosClient";
import { motion } from "framer-motion";
import Title from "@/components/Title";
import MyForm from "@/components/MyForm";
import PaymentDetails from "@/components/PaymentDetails";
import LinkUser from "@/components/LinkUser";
import Notification from "@/components/Notification";
import { useNotification } from "@/hooks/useNotification";

export default function EditPayment() {
  const { id } = useParams();
  const router = useRouter();
  const axios = useAxiosClient();
  const [payment, setPayment] = useState(null);
  const [paymentForm, setPaymentForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [paymentEnums, setPaymentEnums] = useState({ status: [], type: [] });
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();

  useEffect(() => {
    loadPayment();
    loadEnums();
  }, [id]);

  const loadPayment = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/payments/${id}`);
      setPayment(res.data);
      setPaymentForm({
        amount:
          typeof res.data.amount === "number"
            ? res.data.amount
            : Number(res.data.amount) || 0,
        type: res.data.type || "",
        status: res.data.status || "",
        formSlug: res.data.formSlug || "",
        receiptUrl: res.data.receiptUrl || "",
        paymentDate: res.data.paymentDate || "",
      });
    } catch (e) {
      console.error("Erreur lors du chargement du paiement:", e);
      showError("Erreur de chargement", "Impossible de charger le paiement");
    } finally {
      setLoading(false);
    }
  };

  const loadEnums = async () => {
    try {
      const res = await axios.get("/api/payments/enums");
      setPaymentEnums(res.data);
    } catch (e) {
      // Optionnel : gestion d'erreur
    }
  };

  const handleChange = (nameOrEvent, value) => {
    if (typeof nameOrEvent === "string") {
      // Appel direct depuis CurrencyInput ou MyForm
      setPaymentForm((f) => ({ ...f, [nameOrEvent]: value }));
    } else if (nameOrEvent && nameOrEvent.target) {
      // Appel depuis un input classique
      const { name, value: val, type, checked } = nameOrEvent.target;
      setPaymentForm((f) => ({
        ...f,
        [name]: type === "checkbox" ? checked : val,
      }));
    }
  };

  const handleSave = async (formValues) => {
    setSaving(true);
    try {
      await axios.put(`/api/payments/${id}`, formValues);
      await loadPayment();
      setShowEditForm(false);
      showSuccess(
        "Paiement modifié",
        "Les modifications ont été enregistrées avec succès",
      );
    } catch (e) {
      console.error("Erreur lors de la modification du paiement:", e);
      showError("Erreur de modification", "Impossible de modifier le paiement");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = () => {
    setShowEditForm(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/payments/${id}`);
      showSuccess(
        "Paiement supprimé",
        "Le paiement a été supprimé avec succès",
      );
      setTimeout(() => {
        router.push("/payments");
      }, 1500);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      showError("Erreur de suppression", "Impossible de supprimer le paiement");
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
      showSuccess(
        "Utilisateur lié",
        "L'utilisateur a été lié au paiement avec succès",
      );
    } catch (e) {
      console.error("Erreur lors de la liaison de l'utilisateur:", e);
      showError(
        "Erreur de liaison",
        "Impossible de lier l'utilisateur au paiement",
      );
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
      type: "select",
      required: true,
      defaultValue: paymentForm.type,
      options: paymentEnums.type.map((v) => ({ label: v, value: v })),
    },
    {
      name: "status",
      label: "Statut",
      type: "select",
      required: true,
      defaultValue: paymentForm.status,
      options: paymentEnums.status.map((v) => ({ label: v, value: v })),
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
      className="w-full max-w-4xl mx-auto space-y-8"
    >
      <Title label="Modifier le paiement" />

      {!showEditForm ? (
        <PaymentDetails
          payment={payment}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onUserNavigate={handleUserNavigate}
        />
      ) : (
        <>
          {/* Informations du paiement */}
          <MyForm
            fields={paymentFields}
            initialValues={paymentForm}
            onSubmit={handleSave}
            onChange={handleChange}
            loading={saving}
            submitButtonLabel="Enregistrer le paiement"
            onCancel={handleCancelEdit}
            cancelButtonLabel="Annuler"
          />

          {/* Section Lier un utilisateur */}
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Lier un utilisateur
            </h3>
            <LinkUser
              onLink={handleLinkUser}
              onCreateAndLink={handleCreateAndLinkUser}
              loading={saving}
            />
          </div>
        </>
      )}

      {/* Modal de confirmation pour la modification */}
      {/* Notifications */}
      <Notification
        show={notification.show}
        onClose={hideNotification}
        type={notification.type}
        message={notification.message}
      />
    </motion.div>
  );
}
