import PublishButton from "@/components/ui/PublishButton";
import BackButton from "@/components/ui/BackButton";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/outline";
import IconButton from "@/components/ui/IconButton";
import ConfirmModal from "@/components/ui/ConfirmModal";

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("fr-FR") : "";

export default function Title({
  label = "Title",
  onPublish,
  badge = null,
  showBackButton = false,
  backTo = null,
  showBreadcrumbs = false,
  breadcrumbs = [],
  autoHideBackButton = true, // Nouvelle prop pour contrôler l'auto-hide
  loading = false, // nouvelle prop pour désactiver actions pendant le chargement
  rightActions = null, // nouveaux boutons à afficher à droite (React node ou array)
  publicationInfo = null, // { draftVersion, draftUpdatedAt, publishedVersion }
  onReset = null, // réinitialise le draft sur la version publiée
}) {
  const router = useRouter();
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleConfirmReset = async () => {
    try {
      setResetting(true);
      await onReset();
    } catch (err) {
      console.error("Erreur réinitialisation :", err);
    } finally {
      setResetting(false);
      setShowResetModal(false);
    }
  };

  return (
    <div className="w-full mb-8">
      {/* BackButton et Breadcrumbs sur la même ligne */}
      <div className="relative flex items-center justify-center mb-6">
        {/* BackButton à gauche */}
        <div className="absolute left-0">
          <BackButton
            to={backTo}
            autoHide={autoHideBackButton && !showBackButton}
          />
        </div>

        {/* Breadcrumbs centrés */}
        {showBreadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="sm:flex">
            <ol role="list" className="flex items-center space-x-4">
              {breadcrumbs.map((breadcrumb, index) => (
                <li key={index}>
                  {index === 0 ? (
                    <div className="flex items-center">
                      {breadcrumb.icon && (
                        <breadcrumb.icon className="h-5 w-5 shrink-0 text-gray-400 mr-2" />
                      )}
                      <button
                        onClick={() => router.push(breadcrumb.href)}
                        className="text-sm font-medium text-gray-500 hover:text-gray-700 cursor-pointer"
                      >
                        {breadcrumb.name}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <ChevronRightIcon
                        aria-hidden="true"
                        className="h-5 w-5 shrink-0 text-gray-400"
                      />
                      <div className="flex items-center ml-4">
                        {breadcrumb.icon && (
                          <breadcrumb.icon className="h-5 w-5 shrink-0 text-gray-400 mr-2" />
                        )}
                        {breadcrumb.current ? (
                          <span
                            aria-current="page"
                            className="text-sm font-medium text-gray-500"
                          >
                            {breadcrumb.name}
                          </span>
                        ) : (
                          <button
                            onClick={() => router.push(breadcrumb.href)}
                            className="text-sm font-medium text-gray-500 hover:text-gray-700 cursor-pointer"
                          >
                            {breadcrumb.name}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
      </div>

      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              {label}
            </h1>
            {badge !== null && badge > 0 && (
              <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {badge}
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 flex shrink-0 md:mt-0 md:ml-4 items-center gap-2">
          {rightActions}

          {onPublish && publicationInfo && (
            <div className="text-xs text-gray-500 text-right leading-tight mr-2">
              <div>
                Dernière modification : V{publicationInfo.draftVersion}{" "}
                {formatDate(publicationInfo.draftUpdatedAt)}
              </div>
              <div>
                Version publiée :{" "}
                {publicationInfo.publishedVersion != null
                  ? `V${publicationInfo.publishedVersion}`
                  : "non publié"}
              </div>
            </div>
          )}

          {onPublish && (
            <PublishButton
              onPublish={onPublish}
              publishLabel="Publier"
              publishedLabel="À jour"
              size="md"
              disabled={loading}
              upToDate={publicationInfo?.hasUnpublishedChanges === false}
            />
          )}

          {onPublish && onReset && (
            <IconButton
              icon={ArrowUturnLeftIcon}
              variant="secondary"
              size="md"
              title="Revenir à la version publiée"
              aria-label="Réinitialiser"
              onClick={() => setShowResetModal(true)}
              disabled={
                loading ||
                resetting ||
                !publicationInfo ||
                publicationInfo.publishedVersion == null ||
                !publicationInfo.hasUnpublishedChanges
              }
            />
          )}
        </div>
      </div>

      {onReset && (
        <ConfirmModal
          open={showResetModal}
          onClose={() => setShowResetModal(false)}
          onConfirm={handleConfirmReset}
          title="Réinitialiser les modifications"
          message="Toutes les modifications non publiées seront perdues : les données reviendront exactement à la dernière version publiée (y compris les éléments liés). Continuer ?"
          confirmLabel="Réinitialiser"
          isLoading={resetting}
          variant="danger"
        />
      )}
    </div>
  );
}
