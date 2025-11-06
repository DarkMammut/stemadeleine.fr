"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowPathIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useAxiosClient } from "@/utils/axiosClient";
import Title from "@/components/Title";
import Utilities from "@/components/Utilities";
import { usePaymentOperations } from "@/hooks/usePaymentOperations";
import CardList from "@/components/CardList";
import PaymentCard from "@/components/PaymentCard";
import Notification from "@/components/Notification";
import { useNotification } from "@/hooks/useNotification";

export default function Payments() {
  const router = useRouter();
  const axios = useAxiosClient();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleCreatePayment = async () => {
    try {
      await createPayment({
        label: "Nouveau Paiement",
        amount: 0,
        date: new Date().toISOString(),
        user: null,
        type: "",
      });
      await loadPayments();
      showSuccess(
        "Paiement créé",
        "Un nouveau paiement a été créé avec succès",
      );
    } catch (error) {
      console.error("Erreur lors de la création du paiement:", error);
      showError("Erreur de création", "Impossible de créer le paiement");
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto space-y-6"
    >
      <Title label="Paiements" />

      <Utilities
        actions={[
          {
            icon: PlusIcon,
            label: "Nouveau Paiement",
            callback: handleCreatePayment,
          },
          {
            icon: ArrowPathIcon,
            label: "Actualiser HelloAsso",
            callback: handleImportHelloAsso,
            variant: "refresh",
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

      <Notification
        show={notification.show}
        onClose={hideNotification}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </motion.div>
  );
}
