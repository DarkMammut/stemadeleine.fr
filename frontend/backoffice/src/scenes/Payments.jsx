"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon } from "@heroicons/react/24/outline";
import Title from "@/components/ui/Title";
import Utilities from "@/components/Utilities";
import { usePaymentOperations } from "@/hooks/usePaymentOperations";
import CardList from "@/components/CardList";
import PaymentCard from "@/components/PaymentCard";
import Notification from "@/components/Notification";
import { useNotification } from "@/hooks/useNotification";
import PaymentFormModal from "@/components/PaymentFormModal";
import SceneLayout from "@/components/ui/SceneLayout";
import { useAxiosClient } from "@/utils/axiosClient";

export default function Payments() {
  const router = useRouter();
  const axios = useAxiosClient();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const { getAllPayments, createPayment } = usePaymentOperations();
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const data = await getAllPayments();
      setPayments(data);
    } catch (error) {
      console.error("Erreur lors du chargement des paiements:", error);
      showError("Erreur de chargement", "Impossible de charger les paiements");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePayment = async (paymentData) => {
    try {
      setIsCreating(true);
      await createPayment(paymentData);
      await loadPayments();
      setIsModalOpen(false);
      showSuccess("Paiement créé", "Le paiement a été créé avec succès");
    } catch (error) {
      console.error("Erreur lors de la création du paiement:", error);
      showError("Erreur de création", "Impossible de créer le paiement");
    } finally {
      setIsCreating(false);
    }
  };

  const handleImportHelloAsso = async () => {
    try {
      await axios.post("/api/payments/import");
      await loadPayments();
      showSuccess(
        "Import HelloAsso terminé",
        "Les paiements ont été importés avec succès",
      );
    } catch (error) {
      console.error("Erreur lors de l'import HelloAsso:", error);
      showError(
        "Erreur d'import",
        "Impossible d'importer les paiements HelloAsso",
      );
    }
  };

  const handlePaymentClick = (payment) => {
    router.push(`/payments/${payment.id}`);
  };

  if (loading) {
    return <div className="text-center py-8">Chargement des paiements...</div>;
  }

  return (
    <SceneLayout>
      <Title label="Paiements" />

      <Utilities
        actions={[
          {
            icon: PlusIcon,
            label: "Nouveau Paiement",
            callback: () => setIsModalOpen(true),
          },
          {
            variant: "refresh",
            label: "Actualiser HelloAsso",
            callback: handleImportHelloAsso,
            hoverExpand: true,
          },
        ]}
      />

      <CardList emptyMessage="Aucun paiement trouvé.">
        {payments.map((payment) => (
          <PaymentCard
            key={payment.id}
            payment={payment}
            onClick={() => handlePaymentClick(payment)}
          />
        ))}
      </CardList>

      <PaymentFormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreatePayment}
        isLoading={isCreating}
      />

      <Notification
        show={notification.show}
        onClose={hideNotification}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </SceneLayout>
  );
}
