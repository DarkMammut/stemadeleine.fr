"use client";

import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

/**
 * Modal de prévisualisation de newsletter
 */
export default function NewsletterPreviewModal({
  isOpen,
  onClose,
  newsletterData,
}) {
  if (!isOpen) return null;

  const visibleContents =
    newsletterData?.contents?.filter((content) => content.isVisible) || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Aperçu de la newsletter
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-140px)] px-6 py-6">
            {/* Newsletter Header */}
            <div className="mb-8">
              {newsletterData?.media?.url && (
                <img
                  src={newsletterData.media.url}
                  alt={newsletterData.title}
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />
              )}

              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {newsletterData?.title || "Sans titre"}
              </h1>

              {newsletterData?.description && (
                <p className="text-lg text-gray-600 mb-4">
                  {newsletterData.description}
                </p>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-500">
                {newsletterData?.author && (
                  <span>
                    Par {newsletterData.author.firstname}{" "}
                    {newsletterData.author.lastname}
                  </span>
                )}
                {newsletterData?.publishedDate && (
                  <span>
                    Publié le{" "}
                    {new Date(
                      newsletterData.publishedDate,
                    ).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            {/* Newsletter Contents */}
            {visibleContents.length > 0 ? (
              <div className="space-y-8">
                {visibleContents.map((content) => (
                  <article
                    key={content.id}
                    className="border-b border-gray-200 pb-8 last:border-0"
                  >
                    {content.title && (
                      <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                        {content.title}
                      </h2>
                    )}

                    {content.medias && content.medias.length > 0 && (
                      <div className="mb-4 grid grid-cols-2 gap-4">
                        {content.medias.map((media) => (
                          <img
                            key={media.id}
                            src={media.url}
                            alt={media.name || ""}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    )}

                    {content.body?.html && (
                      <div
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: content.body.html }}
                      />
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Aucun contenu visible dans cette newsletter
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{visibleContents.length} contenu(s) visible(s)</span>
              {newsletterData?.updatedAt && (
                <span>
                  Dernière modification :{" "}
                  {new Date(newsletterData.updatedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
