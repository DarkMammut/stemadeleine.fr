"use client";

import React from "react";
import PropTypes from "prop-types";
import Card from "@/components/ui/Card";
import CardSkeleton from "@/components/ui/CardSkeleton";
import { CreditCardIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import Currency from "@/components/ui/Currency";
import { useTranslation } from "@/i18n/I18nContext";

const resolveIntlLocale = (locale) => (locale === "en" ? "en-US" : "fr-FR");

export default function PaymentCard({ payment, onClick, loading = false }) {
  const { locale, t } = useTranslation();

  if (loading) return <CardSkeleton showActions={false} />;

  const translateEnum = (group, value) => {
    if (!value) return "";
    const key = `payments.enums.${group}.${String(value).toUpperCase()}`;
    const translated = t(key);
    return translated === key ? value : translated;
  };

  const formatDate = (date) => {
    if (!date) return t("payments.card.noDate");
    return new Date(date).toLocaleDateString(resolveIntlLocale(locale), {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "authorized":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "refunded":
      case "canceled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card onClick={onClick}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">
          <CreditCardIcon className="h-6 w-6 text-gray-400" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-medium text-gray-900">
              {payment.label || `${t("payments.card.paymentLabelPrefix")} #${payment.id}`}
            </h3>
            <span className="text-base font-semibold text-gray-900">
              <Currency value={payment.amount} currency={payment.currency} />
            </span>
          </div>

          <div className="space-y-1 mb-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>
                {t("payments.card.dateLabel")}: {formatDate(payment.paymentDate)}
              </span>
              {payment.type && (
                <>
                  <span>•</span>
                  <span>
                    {t("payments.card.typeLabel")}: {translateEnum("type", payment.type)}
                  </span>
                </>
              )}
            </div>

            {payment.user && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <UserCircleIcon className="h-4 w-4" />
                <span>
                  {payment.user.firstname} {payment.user.lastname}
                </span>
              </div>
            )}
          </div>

          {payment.status && (
            <div>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}
              >
                {translateEnum("status", payment.status)}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

PaymentCard.propTypes = {
  payment: PropTypes.object,
  onClick: PropTypes.func,
  loading: PropTypes.bool,
};
