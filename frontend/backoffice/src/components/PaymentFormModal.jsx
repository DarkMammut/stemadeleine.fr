"use client";

import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { CreditCardIcon } from '@heroicons/react/24/outline';
import MyForm from '@/components/ui/MyForm';
import { useEffect, useState } from 'react';
import { useAxiosClient } from '@/utils/axiosClient';

/**
 * Modal de création/modification de paiement
 *
 * @param {boolean} open - Contrôle l'état d'ouverture du modal
 * @param {function} onClose - Callback appelé lors de la fermeture du modal
 * @param {function} onSubmit - Callback appelé lors de la validation du formulaire
 * @param {object} payment - Paiement à éditer (null pour création)
 * @param {boolean} isLoading - Indique si l'opération est en cours
 */
export default function PaymentFormModal({
  open,
  onClose,
  onSubmit,
  payment = null,
  isLoading = false,
}) {
  const axios = useAxiosClient();
  const [users, setUsers] = useState([]);
  const [paymentEnums, setPaymentEnums] = useState({ status: [], type: [] });
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (open) {
      loadFormData();
    }
  }, [open]);

  const loadFormData = async () => {
    try {
      setLoadingData(true);
      // Charger les utilisateurs et les enums en parallèle
      const [usersRes, enumsRes] = await Promise.all([
        axios.get("/api/users"),
        axios.get("/api/payments/enums"),
      ]);
      // L'API peut renvoyer soit un tableau d'utilisateurs, soit une structure paginée { content: [...] }
      const rawUsers = usersRes?.data;
      const normalizedUsers = Array.isArray(rawUsers)
        ? rawUsers
        : (rawUsers?.content ?? rawUsers?.users ?? []);
      setUsers(normalizedUsers);
      setPaymentEnums(enumsRes.data);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDateForInput = (date) => {
    if (!date) return getCurrentDate();
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getTypeLabel = (type) => {
    const labels = {
      DONATION: "Don",
      MEMBERSHIP: "Adhésion",
      EVENT: "Événement",
      OTHER: "Autre",
    };
    return labels[type] || type;
  };

  const getStatusLabel = (status) => {
    const labels = {
      PENDING: "En attente",
      AUTHORIZED: "Autorisé",
      PAID: "Payé",
      REFUNDED: "Remboursé",
      CANCELED: "Annulé",
      FAILED: "Échoué",
      DELETED: "Supprimé",
      ARCHIVED: "Archivé",
    };
    return labels[status] || status;
  };

  const initialValues = payment
    ? {
        amount: payment.amount || 0,
        currency: payment.currency || "EUR",
        paymentDate: formatDateForInput(payment.paymentDate),
        status: payment.status || "PENDING",
        type: payment.type || "MEMBERSHIP",
        formSlug: payment.formSlug || "",
        receiptUrl: payment.receiptUrl || "",
        userId: payment.user?.id || "",
      }
    : {
        amount: 0,
        currency: "EUR",
        paymentDate: getCurrentDate(),
        status: "PENDING",
        type: "MEMBERSHIP",
        formSlug: "",
        receiptUrl: "",
        userId: "",
      };

  // normalize users source to always be an array for fields/options
  const usersArray = Array.isArray(users)
    ? users
    : (users?.content ?? users?.users ?? []);

  const fields = [
    {
      name: "amount",
      label: "Montant",
      type: "currency",
      currency: "EUR",
      required: true,
      fullWidth: false,
    },
    {
      name: "paymentDate",
      label: "Date du paiement",
      type: "date",
      required: true,
      fullWidth: false,
    },
    {
      name: "type",
      label: "Type de paiement",
      type: "select",
      required: true,
      fullWidth: false,
      options: paymentEnums.type.map((type) => ({
        value: type,
        label: getTypeLabel(type),
      })),
    },
    {
      name: "status",
      label: "Statut",
      type: "select",
      required: true,
      fullWidth: false,
      options: paymentEnums.status.map((status) => ({
        value: status,
        label: getStatusLabel(status),
      })),
    },
    {
      name: "userId",
      label: "Utilisateur",
      type: "select",
      required: false,
      fullWidth: true,
      options: usersArray.map((user) => ({
        value: user.id,
        label: `${user.firstname} ${user.lastname}${user.email ? ` (${user.email})` : ""}`,
      })),
      placeholder: "Sélectionner un utilisateur (optionnel)",
    },
    {
      name: "formSlug",
      label: "Identifiant du formulaire",
      type: "text",
      required: false,
      fullWidth: true,
      placeholder: "Ex: don-2025",
    },
    {
      name: "receiptUrl",
      label: "URL du reçu",
      type: "url",
      required: false,
      fullWidth: true,
      placeholder: "https://...",
    },
  ];

  const handleSubmit = (formData) => {
    // Préparer les données pour l'API
    const paymentData = {
      amount: formData.amount,
      currency: formData.currency,
      paymentDate: formData.paymentDate,
      status: formData.status,
      type: formData.type,
      formSlug: formData.formSlug || null,
      receiptUrl: formData.receiptUrl || null,
      userId: formData.userId || null,
    };
    onSubmit(paymentData);
  };

  return (
    <Dialog open={open} onClose={onClose} className="relative z-[9999]">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-2xl data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6">
              <div className="sm:flex sm:items-start mb-4">
                <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:size-10">
                  <CreditCardIcon
                    aria-hidden="true"
                    className="size-6 text-blue-600"
                  />
                </div>
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <DialogTitle
                    as="h3"
                    className="text-base font-semibold text-gray-900"
                  >
                    {payment ? "Modifier le paiement" : "Nouveau paiement"}
                  </DialogTitle>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {payment
                        ? "Modifiez les informations du paiement ci-dessous."
                        : "Remplissez les informations pour créer un nouveau paiement."}
                    </p>
                  </div>
                </div>
              </div>

              {loadingData ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Chargement des données...</p>
                </div>
              ) : (
                <MyForm
                  fields={fields}
                  initialValues={initialValues}
                  onSubmit={handleSubmit}
                  loading={isLoading}
                  submitButtonLabel={
                    payment ? "Enregistrer" : "Créer le paiement"
                  }
                  onCancel={onClose}
                  cancelButtonLabel="Annuler"
                  successMessage={
                    payment
                      ? "Le paiement a été mis à jour avec succès"
                      : "Le paiement a été créé avec succès"
                  }
                  errorMessage="Impossible d'enregistrer le paiement"
                />
              )}
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
