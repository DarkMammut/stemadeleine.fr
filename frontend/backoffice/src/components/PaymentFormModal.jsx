"use client";

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { CreditCardIcon } from "@heroicons/react/24/outline";
import MyForm from "@/components/ui/MyForm";
import { useEffect, useState } from "react";
import { useAxiosClient } from "@/utils/axiosClient";
import { useTranslation } from "@/i18n/I18nContext";

export default function PaymentFormModal({
  open,
  onClose,
  onSubmit,
  payment = null,
  isLoading = false,
}) {
  const axios = useAxiosClient();
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [paymentEnums, setPaymentEnums] = useState({ status: [], type: [] });
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (open) {
      loadFormData();
    }
  }, [open]);

  const translateEnum = (group, value) => {
    if (!value) return "";
    const key = `payments.enums.${group}.${String(value).toUpperCase()}`;
    const translated = t(key);
    return translated === key ? value : translated;
  };

  const loadFormData = async () => {
    try {
      setLoadingData(true);
      const [usersRes, enumsRes] = await Promise.all([
        axios.get("/api/users"),
        axios.get("/api/payments/enums"),
      ]);
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

  const usersArray = Array.isArray(users)
    ? users
    : (users?.content ?? users?.users ?? []);

  const fields = [
    {
      name: "amount",
      label: t("payments.form.fields.amount"),
      type: "currency",
      currency: "EUR",
      required: true,
      fullWidth: false,
    },
    {
      name: "paymentDate",
      label: t("payments.form.fields.paymentDate"),
      type: "date",
      required: true,
      fullWidth: false,
    },
    {
      name: "type",
      label: t("payments.form.fields.type"),
      type: "select",
      required: true,
      fullWidth: false,
      options: paymentEnums.type.map((type) => ({
        value: type,
        label: translateEnum("type", type),
      })),
    },
    {
      name: "status",
      label: t("payments.form.fields.status"),
      type: "select",
      required: true,
      fullWidth: false,
      options: paymentEnums.status.map((status) => ({
        value: status,
        label: translateEnum("status", status),
      })),
    },
    {
      name: "userId",
      label: t("payments.form.fields.user"),
      type: "select",
      required: false,
      fullWidth: true,
      options: usersArray.map((user) => ({
        value: user.id,
        label: `${user.firstname} ${user.lastname}${user.email ? ` (${user.email})` : ""}`,
      })),
      placeholder: t("payments.form.placeholders.user"),
    },
    {
      name: "formSlug",
      label: t("payments.form.fields.formSlug"),
      type: "text",
      required: false,
      fullWidth: true,
      placeholder: t("payments.form.placeholders.formSlug"),
    },
    {
      name: "receiptUrl",
      label: t("payments.form.fields.receiptUrl"),
      type: "url",
      required: false,
      fullWidth: true,
      placeholder: t("payments.form.placeholders.receiptUrl"),
    },
  ];

  const handleSubmit = (formData) => {
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
                    {payment ? t("payments.form.editTitle") : t("payments.form.newTitle")}
                  </DialogTitle>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {payment
                        ? t("payments.form.editDescription")
                        : t("payments.form.newDescription")}
                    </p>
                  </div>
                </div>
              </div>

              {loadingData ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">{t("payments.form.loadingData")}</p>
                </div>
              ) : (
                <MyForm
                  fields={fields}
                  initialValues={initialValues}
                  onSubmit={handleSubmit}
                  loading={isLoading}
                  submitButtonLabel={
                    payment ? t("payments.form.submitSave") : t("payments.form.submitCreate")
                  }
                  onCancel={onClose}
                  cancelButtonLabel={t("payments.form.cancel")}
                  successMessage={
                    payment
                      ? t("payments.form.successUpdate")
                      : t("payments.form.successCreate")
                  }
                  errorMessage={t("payments.form.errorSave")}
                />
              )}
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
