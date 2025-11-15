"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAxiosClient } from "@/utils/axiosClient";
import Title from "@/components/ui/Title";
import EditablePanel from "@/components/ui/EditablePanel";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";
import Notification from "@/components/ui/Notification";
import { useNotification } from "@/hooks/useNotification";
import SceneLayout from "@/components/ui/SceneLayout";
import { usePaymentOperations } from "@/hooks/usePaymentOperations";
import LinkUser from "@/components/LinkUser";

export default function EditPayment() {
  const { id } = useParams();
  const router = useRouter();
  const axios = useAxiosClient();
  const [payment, setPayment] = useState(null);
  const [paymentForm, setPaymentForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [paymentEnums, setPaymentEnums] = useState({ status: [], type: [] });
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();
  const { attachUser, detachUser } = usePaymentOperations();

  useEffect(() => {
    loadPayment();
    loadEnums();
  }, [id]);

  const loadPayment = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/payments/${id}`);
      // Mettre à jour à la fois le formulaire et l'objet payment utilisé par la vue
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

  const handleSave = async (formValues) => {
    setSaving(true);
    try {
      await axios.put(`/api/payments/${id}`, formValues);
      await loadPayment();
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

  // Si le paiement n'est pas trouvé et que ce n'est pas (encore) en chargement, afficher l'erreur
  if (!payment && !loading) {
    return (
      <SceneLayout>
        <Title label="Modifier le paiement" />
        <div className="text-gray-600">Paiement introuvable.</div>
        <Notification
          show={notification.show}
          onClose={hideNotification}
          type={notification.type}
          message={notification.message}
        />
      </SceneLayout>
    );
  }

  return (
    <SceneLayout>
      <Title label="Modifier le paiement" />

      {/* Editable panel for payment (fields defined below) */}
      {(() => {
        const paymentFields = [
          {
            name: "amount",
            label: "Montant",
            type: "currency",
            currency: "EUR",
            required: true,
            defaultValue: paymentForm.amount,
          },
          {
            name: "type",
            label: "Type",
            type: "select",
            required: true,
            defaultValue: paymentForm.type,
            options: (paymentEnums.type || []).map((v) => ({
              label: v,
              value: v,
            })),
          },
          {
            name: "status",
            label: "Statut",
            type: "select",
            required: true,
            defaultValue: paymentForm.status,
            flag: true,
            flagKey: "statusFlag",
            options: (paymentEnums.status || []).map((v) => ({
              label: v,
              value: v,
            })),
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
            type: "url",
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

        return (
          <EditablePanel
            title={payment ? `Paiement #${payment.id}` : "Paiement"}
            icon={CurrencyDollarIcon}
            canEdit={true}
            initialValues={paymentForm}
            fields={paymentFields}
            displayColumns={2}
            onSubmit={handleSave}
            onCancelExternal={() => loadPayment()}
            onDelete={handleDelete}
            loading={loading}
          />
        );
      })()}

      {/* Lier / Détacher un utilisateur - section séparée */}
      <LinkUser
        title="Emetteur"
        onLink={handleLinkUser}
        onCreateAndLink={handleCreateAndLinkUser}
        onLinked={loadPayment}
        currentUser={payment?.user || null}
        loading={loading || saving}
        operations={{
          // attach expects just userId
          attach: async (userId) => {
            const updated = await attachUser(id, userId);
            // if API returned full payment, use it to update local state
            if (updated && typeof updated === "object") {
              setPayment(updated);
            } else {
              // fallback: optimistic minimal update
              setPayment((p) => (p ? { ...p, user: { id: userId } } : p));
            }
          },
          // detach expects no args
          detach: async () => {
            const updated = await detachUser(id);
            if (updated && typeof updated === "object") {
              setPayment(updated);
            } else {
              setPayment((p) => (p ? { ...p, user: null } : p));
            }
          },
          updateLocal: (user) => {
            if (!user) return setPayment((p) => (p ? { ...p, user: null } : p));
            const resolved =
              typeof user === "string"
                ? { id: user }
                : user.id
                  ? { id: user.id }
                  : user;
            setPayment((p) => (p ? { ...p, user: resolved } : p));
          },
        }}
      />

      {/* Modal de confirmation pour la modification */}
      {/* Notifications */}
      <Notification
        show={notification.show}
        onClose={hideNotification}
        type={notification.type}
        message={notification.message}
      />
    </SceneLayout>
  );
}
