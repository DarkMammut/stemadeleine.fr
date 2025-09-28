"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowPathIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useAxiosClient } from "@/utils/axiosClient";
import Title from "@/components/Title";
import Utilities from "@/components/Utilities";
import { usePaymentOperations } from "@/hooks/usePaymentOperations";
import ListPayments from "@/components/ListPayments";

export default function Payments() {
  const router = useRouter();
  const axios = useAxiosClient();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const { getAllPayments, createPayment, deletePayment } =
    usePaymentOperations();

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
      alert("Erreur lors du chargement des paiements");
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
      console.log("Paiement créé avec succès");
    } catch (error) {
      console.error("Erreur lors de la création du paiement:", error);
      alert("Erreur lors de la création du paiement");
    }
  };

  const handleDeletePayment = async (payment) => {
    try {
      await deletePayment(payment.id);
      await loadPayments();
      console.log("Paiement supprimé avec succès");
    } catch (error) {
      console.error("Erreur lors de la suppression du paiement:", error);
      alert("Erreur lors de la suppression du paiement");
    }
  };

  const handleEditPayment = (payment) => {
    router.push(`/payments/${payment.id}`);
  };

  const handleImportHelloAsso = async () => {
    try {
      await axios.post("/api/payments/import");
      await loadPayments();
      alert("Import HelloAsso terminé avec succès.");
    } catch (error) {
      console.error("Erreur lors de l'import HelloAsso:", error);
      alert("Erreur lors de l'import HelloAsso");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Chargement des paiements...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-6xl mx-auto p-6 space-y-6"
    >
      <Title label="Gestion des Paiements" />

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
          },
        ]}
      />

      <ListPayments
        payments={payments}
        onEdit={handleEditPayment}
        onDelete={handleDeletePayment}
      />
    </motion.div>
  );
}
