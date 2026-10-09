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
import { useTranslation } from "@/i18n/I18nContext";

export default function EditPayment() {
  const { id } = useParams();
  const router = useRouter();
  const axios = useAxiosClient();
  const { t } = useTranslation();
  const [payment, setPayment] = useState(null);
  const [paymentForm, setPaymentForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [paymentEnums, setPaymentEnums] = useState({ status: [], type: [] });
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();
  const { attachUser, detachUser } = usePaymentOperations();

  const translateEnum = (group, value) => {
    if (!value) return "";
    const key = `payments.enums.${group}.${String(value).toUpperCase()}`;
    const translated = t(key);
    return translated === key ? value : translated;
  };

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
      showError(t("editPayment.loadErrorTitle"), t("editPayment.loadErrorMessage"));
    } finally {
      setLoading(false);
    }
  };

  const loadEnums = async () => {
    try {
      const res = await axios.get("/api/payments/enums");
      setPaymentEnums(res.data);
    } catch (e) {}
  };

  const handleSave = async (formValues) => {
    setSaving(true);
    try {
      await axios.put(`/api/payments/${id}`, formValues);
      await loadPayment();
      showSuccess(
        t("editPayment.saveSuccessTitle"),
        t("editPayment.saveSuccessMessage"),
      );
    } catch (e) {
      console.error("Erreur lors de la modification du paiement:", e);
      showError(t("editPayment.saveErrorTitle"), t("editPayment.saveErrorMessage"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/payments/${id}`);
      showSuccess(
        t("editPayment.deleteSuccessTitle"),
        t("editPayment.deleteSuccessMessage"),
      );
      setTimeout(() => {
        router.push("/payments");
      }, 1500);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      showError(
        t("editPayment.deleteErrorTitle"),
        t("editPayment.deleteErrorMessage"),
      );
    }
  };

  const handleLinkUser = async (userId) => {
    setSaving(true);
    try {
      await axios.put(`/api/payments/${id}`, { ...paymentForm, userId });
      await loadPayment();
      showSuccess(
        t("editPayment.linkSuccessTitle"),
        t("editPayment.linkSuccessMessage"),
      );
    } catch (e) {
      console.error("Erreur lors de la liaison de l'utilisateur:", e);
      showError(t("editPayment.linkErrorTitle"), t("editPayment.linkErrorMessage"));
    } finally {
      setSaving(false);
    }
  };

  const handleCreateAndLinkUser = async (userId) => {
    await handleLinkUser(userId);
  };

  if (!payment && !loading) {
    return (
      <SceneLayout>
        <Title label={t("editPayment.title")} />
        <div className="text-gray-600">{t("editPayment.notFound")}</div>
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
      <Title label={t("editPayment.title")} />

      {(() => {
        const paymentFields = [
          {
            name: "amount",
            label: t("editPayment.fields.amount"),
            type: "currency",
            currency: "EUR",
            required: true,
            defaultValue: paymentForm.amount,
          },
          {
            name: "type",
            label: t("editPayment.fields.type"),
            type: "select",
            required: true,
            defaultValue: paymentForm.type,
            options: (paymentEnums.type || []).map((value) => ({
              label: translateEnum("type", value),
              value,
            })),
          },
          {
            name: "status",
            label: t("editPayment.fields.status"),
            type: "select",
            required: true,
            defaultValue: paymentForm.status,
            flag: true,
            flagKey: "statusFlag",
            options: (paymentEnums.status || []).map((value) => ({
              label: translateEnum("status", value),
              value,
            })),
          },
          {
            name: "formSlug",
            label: t("editPayment.fields.formSlug"),
            type: "text",
            required: false,
            defaultValue: paymentForm.formSlug,
          },
          {
            name: "receiptUrl",
            label: t("editPayment.fields.receiptUrl"),
            type: "url",
            required: false,
            defaultValue: paymentForm.receiptUrl,
          },
          {
            name: "paymentDate",
            label: t("editPayment.fields.paymentDate"),
            type: "date",
            required: false,
            defaultValue: paymentForm.paymentDate,
          },
        ];

        return (
          <EditablePanel
            title={payment ? `${t("editPayment.panelTitlePrefix")} #${payment.id}` : t("editPayment.panelTitlePrefix")}
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

      <LinkUser
        title={t("editPayment.emitterTitle")}
        onLink={handleLinkUser}
        onCreateAndLink={handleCreateAndLinkUser}
        onLinked={loadPayment}
        currentUser={payment?.user || null}
        loading={loading || saving}
        operations={{
          attach: async (userId) => {
            const updated = await attachUser(id, userId);
            if (updated && typeof updated === "object") {
              setPayment(updated);
            } else {
              setPayment((p) => (p ? { ...p, user: { id: userId } } : p));
            }
          },
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

      <Notification
        show={notification.show}
        onClose={hideNotification}
        type={notification.type}
        message={notification.message}
      />
    </SceneLayout>
  );
}
