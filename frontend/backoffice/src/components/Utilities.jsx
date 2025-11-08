import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import RefreshButton from '@/components/ui/RefreshButton';
import PublishButton from '@/components/ui/PublishButton';
import DownloadButton from '@/components/ui/DownloadButton';
import DeleteButton from '@/components/ui/DeleteButton';
import SendButton from '@/components/ui/SendButton';
import { useAxiosClient } from '@/utils/axiosClient';

/**
 * Composant Utilities - Affiche une barre d'actions avec boutons spécialisés
 * @param {Array} actions - Liste des actions à afficher
 *   - {string} variant - Type de bouton : 'refresh', 'publish', 'download', 'delete', 'send', ou variant Button classique
 *   - {string} label - Label du bouton
 *   - {function} callback - Fonction appelée au clic
 *   - {Object} icon - Icône Heroicons (pour boutons génériques uniquement)
 *   - {boolean} disabled - Désactive le bouton
 *   - {string} size - Taille du bouton (défaut: 'sm')
 *   - {boolean} hoverExpand - Label apparaît au survol (pour boutons spécialisés)
 * @param {string} apiUrl - URL pour sauvegarder les données
 * @param {Object} data - Données à sauvegarder (format { current, initial })
 */
export default function Utilities({ actions = [], apiUrl, data }) {
  const axios = useAxiosClient();
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (!data) return;
    setIsDirty(JSON.stringify(data.current) !== JSON.stringify(data.initial));
  }, [data]);

  const handleSave = async () => {
    if (!apiUrl || !data) return;
    try {
      setSaving(true);
      await axios.put(apiUrl, data.current);
    } catch (err) {
      console.error("Erreur sauvegarde :", err);
    } finally {
      setSaving(false);
    }
  };

  // Fonction pour rendre le bon type de bouton en fonction du variant
  const renderActionButton = (action, idx) => {
    const {
      variant,
      label,
      callback,
      disabled,
      size = "sm",
      hoverExpand = false,
      requireConfirmation,
      confirmTitle,
      confirmMessage,
      confirmLabel,
    } = action;

    // Boutons spécialisés
    switch (variant) {
      case "refresh":
        return (
          <RefreshButton
            key={idx}
            onRefresh={callback}
            refreshLabel={label}
            size={size}
            disabled={disabled}
            hoverExpand={hoverExpand}
          />
        );

      case "publish":
        return (
          <PublishButton
            key={idx}
            onPublish={callback}
            publishLabel={label}
            size={size}
            disabled={disabled}
          />
        );

      case "download":
        return (
          <DownloadButton
            key={idx}
            onDownload={callback}
            downloadLabel={label}
            size={size}
            disabled={disabled}
            hoverExpand={hoverExpand}
          />
        );

      case "delete":
        return (
          <DeleteButton
            key={idx}
            onDelete={callback}
            deleteLabel={label}
            size={size}
            disabled={disabled}
            hoverExpand={hoverExpand}
            requireConfirmation={
              requireConfirmation !== undefined ? requireConfirmation : true
            }
            confirmTitle={confirmTitle}
            confirmMessage={confirmMessage}
            confirmLabel={confirmLabel}
          />
        );

      case "send":
        return (
          <SendButton
            key={idx}
            onSend={callback}
            sendLabel={label}
            size={size}
            disabled={disabled}
          />
        );

      // Bouton générique par défaut
      default:
        const Icon = action.icon;
        return (
          <Button
            key={idx}
            onClick={callback}
            variant={variant || "primary"}
            size={size}
            disabled={disabled}
          >
            {Icon && <Icon className="w-4 h-4 mr-1" />}
            {label}
          </Button>
        );
    }
  };

  return (
    <div className="flex w-full justify-between my-4">
      <div className="flex gap-2">
        {actions.map((action, idx) => renderActionButton(action, idx))}
      </div>

      <div>
        {isDirty && (
          <Button
            onClick={handleSave}
            variant="secondary"
            size="sm"
            loading={saving}
          >
            Sauvegarder
          </Button>
        )}
      </div>
    </div>
  );
}
