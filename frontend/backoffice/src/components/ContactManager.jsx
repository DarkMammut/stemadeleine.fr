"use client";

import React, { useState } from "react";
import PropTypes from "prop-types";
import Utilities from "@/components/ui/Utilities";
import NavigationButtons from "@/components/ui/NavigationButtons";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Panel from "@/components/ui/Panel";
import { CheckIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "@/i18n/I18nContext";

export default function ContactManager({
  contact,
  loading = false,
  onDelete,
  onToggleRead,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
}) {
  const { locale, t } = useTranslation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const dateLocale = locale === "en" ? "en-US" : "fr-FR";

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (typeof onDelete === "function") {
        await onDelete();
      }
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div>
      {/* Utilities */}
      <Utilities
        actions={[
          {
            icon: contact?.isRead ? XMarkIcon : CheckIcon,
            label: contact?.isRead
              ? t("contacts.markUnread")
              : t("contacts.markRead"),
            callback: onToggleRead,
          },
          {
            icon: TrashIcon,
            label: t("contacts.delete"),
            callback: () => setShowDeleteModal(true),
            variant: "danger",
          },
        ]}
      />

      <Panel className="mt-4">
        <div className="px-4 py-5 sm:p-6">
          {/* Status badge */}
          <div className="mb-6">
            {loading ? (
              <div className="w-24">
                <div className="skeleton-light h-6 rounded-full" />
              </div>
            ) : (
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  contact?.isRead
                    ? "bg-gray-100 text-gray-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {contact?.isRead
                  ? t("contacts.statusRead")
                  : t("contacts.statusUnread")}
              </span>
            )}
          </div>

          {/* Contact info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("contacts.fullName")}
              </label>
              {loading ? (
                <div className="skeleton-light h-5 w-48" />
              ) : (
                <p className="text-base text-gray-900">
                  {(contact?.firstName || "") +
                    (contact?.lastName ? " " + contact.lastName : "") ||
                    t("contacts.anonymous")}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("contacts.fieldEmail")}
              </label>
              {loading ? (
                <div className="skeleton-light h-5 w-64" />
              ) : (
                <p className="text-base text-gray-900">
                  <a
                    href={`mailto:${contact?.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {contact?.email}
                  </a>
                </p>
              )}
            </div>

            {loading ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("contacts.subject")}
                  </label>
                  <div className="skeleton-light h-4 w-80" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("contacts.message")}
                  </label>
                  <div className="bg-gray-50 rounded-md p-4">
                    <div className="skeleton-light h-20 w-full" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("contacts.receivedAt")}
                  </label>
                  <div className="skeleton-light h-4 w-40" />
                </div>
              </>
            ) : (
              <>
                {contact?.subject && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("contacts.subject")}
                    </label>
                    <p className="text-base text-gray-900">{contact.subject}</p>
                  </div>
                )}

                {contact?.message && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("contacts.message")}
                    </label>
                    <div className="bg-gray-50 rounded-md p-4">
                      <p className="text-base text-gray-900 whitespace-pre-wrap">
                        {contact.message}
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("contacts.receivedAt")}
                  </label>
                  <p className="text-base text-gray-900">
                    {contact?.createdAt
                      ? new Date(contact.createdAt).toLocaleString(dateLocale, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : t("contacts.notProvided")}
                  </p>
                </div>

                {contact?.user && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("contacts.linkedUser")}
                    </label>
                    <div className="bg-green-50 rounded-md p-3">
                      <p className="text-sm text-green-900">
                        {contact.user.firstname} {contact.user.lastname} (
                        {contact.user.email})
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <NavigationButtons
          onPrevious={onPrevious}
          onNext={onNext}
          hasPrevious={hasPrevious}
          hasNext={hasNext}
        />
      </Panel>

      <ConfirmModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title={t("contacts.deleteModalTitle")}
        message={t("contacts.deleteModalMessage")}
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}

ContactManager.propTypes = {
  contact: PropTypes.object,
  loading: PropTypes.bool,
  onDelete: PropTypes.func,
  onToggleRead: PropTypes.func,
  onPrevious: PropTypes.func,
  onNext: PropTypes.func,
  hasPrevious: PropTypes.bool,
  hasNext: PropTypes.bool,
};

ContactManager.defaultProps = {
  contact: null,
  loading: false,
  onDelete: null,
  onToggleRead: null,
  onPrevious: null,
  onNext: null,
  hasPrevious: false,
  hasNext: false,
};
