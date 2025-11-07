import { useState } from 'react';
import Flag from '@/components/ui/Flag';
import IconButton from '@/components/ui/IconButton';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';

/**
 * Composant de bouton d'envoi réutilisable
 * @param {Function} onSend - Fonction appelée lors du clic sur envoyer
 * @param {boolean} disabled - Désactive le bouton
 * @param {string} sendLabel - Texte du bouton d'envoi
 * @param {string} sentLabel - Texte affiché quand envoyé
 * @param {string} size - Taille du bouton ("sm", "md", "lg")
 * @param {boolean} resetAfterDelay - Remet le bouton à l'état initial après un délai
 * @param {boolean} hoverExpand - Si true, le label apparaît au survol
 */
export default function SendButton({
  onSend,
  disabled = false,
  sendLabel = "Envoyer",
  sentLabel = "Envoyé",
  size = "md",
  resetAfterDelay = true,
  hoverExpand = false,
}) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!onSend) return;
    try {
      setLoading(true);
      await onSend();
      setSent(true);

      // Optionnel : remettre à l'état initial après un délai
      if (resetAfterDelay) {
        setTimeout(() => {
          setSent(false);
        }, 3000); // 3 secondes
      }
    } catch (err) {
      console.error("Erreur envoi :", err);
      setSent(false);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <Flag variant="success" size={size}>
        {sentLabel}
      </Flag>
    );
  }

  return (
    <IconButton
      onClick={handleSend}
      variant="primary"
      size={size}
      icon={PaperAirplaneIcon}
      label={loading ? "Envoi..." : sendLabel}
      disabled={disabled || loading}
      hoverExpand={hoverExpand}
    />
  );
}
