"use client";

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import { DocumentArrowDownIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

/**
 * Composant de prévisualisation et d'actions pour une newsletter
 * @param {Object} newsletterData - Les données de la newsletter
 * @param {Function} onDownloadPDF - Callback pour télécharger en PDF
 * @param {Function} onSend - Callback pour envoyer (publipostage)
 */
export default function NewsletterPreview({
  newsletterData,
  onDownloadPDF,
  onSend,
}) {
  const [downloading, setDownloading] = useState(false);
  const [sending, setSending] = useState(false);

  const handleDownload = async () => {
    if (!onDownloadPDF) return;
    try {
      setDownloading(true);
      await onDownloadPDF();
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Erreur lors du téléchargement du PDF");
    } finally {
      setDownloading(false);
    }
  };

  const handleSend = async () => {
    if (!onSend) {
      alert("Fonction d'envoi non implémentée pour le moment");
      return;
    }
    try {
      setSending(true);
      await onSend();
    } catch (error) {
      console.error("Error sending newsletter:", error);
      alert("Erreur lors de l'envoi de la newsletter");
    } finally {
      setSending(false);
    }
  };

  if (!newsletterData) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header with actions */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Aperçu de la newsletter
          </h3>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDownload}
              disabled={downloading}
              icon={DocumentArrowDownIcon}
            >
              {downloading ? "Téléchargement..." : "Télécharger PDF"}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSend}
              disabled={sending || newsletterData.status !== "PUBLISHED"}
              icon={PaperAirplaneIcon}
            >
              {sending ? "Envoi..." : "Envoyer"}
            </Button>
          </div>
        </div>
        {newsletterData.status !== "PUBLISHED" && (
          <p className="text-sm text-gray-500 mt-2">
            La newsletter doit être publiée pour pouvoir être envoyée
          </p>
        )}
      </div>

      {/* Preview content */}
      <div className="p-6">
        <div className="max-w-3xl mx-auto">
          {/* Newsletter header */}
          <div className="mb-6">
            {newsletterData.media && (
              <div className="mb-4 rounded-lg overflow-hidden">
                <img
                  src={newsletterData.media.url}
                  alt={newsletterData.media.name}
                  className="w-full h-auto object-cover max-h-64"
                />
              </div>
            )}
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {newsletterData.title}
            </h1>
            {newsletterData.description && (
              <p className="text-lg text-gray-600">
                {newsletterData.description}
              </p>
            )}
            <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
              {newsletterData.author && (
                <span>
                  Par {newsletterData.author.firstname}{" "}
                  {newsletterData.author.lastname}
                </span>
              )}
              {newsletterData.publishedDate && (
                <span>
                  Publié le{" "}
                  {new Date(newsletterData.publishedDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          {/* Newsletter contents */}
          <div className="space-y-6">
            {newsletterData.contents && newsletterData.contents.length > 0 ? (
              newsletterData.contents
                .filter((content) => content.isVisible)
                .map((content, index) => (
                  <div
                    key={content.contentId || index}
                    className="border-t border-gray-200 pt-6"
                  >
                    {content.title && (
                      <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                        {content.title}
                      </h2>
                    )}
                    {content.medias && content.medias.length > 0 && (
                      <div className="mb-4 grid grid-cols-1 gap-4">
                        {content.medias.map((media) => (
                          <div
                            key={media.id}
                            className="rounded-lg overflow-hidden"
                          >
                            <img
                              src={media.url}
                              alt={media.name}
                              className="w-full h-auto object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    {content.body && content.body.html && (
                      <div
                        className="prose prose-gray max-w-none"
                        dangerouslySetInnerHTML={{ __html: content.body.html }}
                      />
                    )}
                  </div>
                ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>Aucun contenu à afficher dans cette newsletter.</p>
                <p className="text-sm mt-2">
                  Ajoutez des contenus pour prévisualiser votre newsletter.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            {newsletterData.contents
              ? newsletterData.contents.filter((c) => c.isVisible).length
              : 0}{" "}
            contenu(s) visible(s)
          </span>
          <span>
            Dernière modification :{" "}
            {new Date(newsletterData.updatedAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}
