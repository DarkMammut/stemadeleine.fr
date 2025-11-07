"use client";

import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { usePathname, useRouter } from 'next/navigation';

/**
 * BackButton - Bouton de retour intelligent
 *
 * @param {string} to - URL de destination (optionnel, utilise router.back() par défaut)
 * @param {string} label - Texte du bouton (défaut: "Retour")
 * @param {boolean} autoHide - Cache automatiquement le bouton sur les pages principales (défaut: true)
 * @param {string[]} mainPages - Liste des pages principales où le bouton doit être caché (défaut: ['/pages', '/news', '/newsletters', '/users', '/contacts', '/sections'])
 */
export default function BackButton({
  to,
  label = "Retour",
  autoHide = true,
  mainPages = [
    "/pages",
    "/news",
    "/newsletters",
    "/users",
    "/contacts",
    "/sections",
    "/payments",
  ],
}) {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = () => {
    if (to) {
      router.push(to);
    } else {
      router.back();
    }
  };

  // Si autoHide est activé, vérifie si on est sur une page principale
  if (autoHide) {
    const isMainPage = mainPages.some((page) => pathname === page);
    if (isMainPage) {
      return null; // Ne rien afficher sur les pages principales
    }
  }

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
    >
      <ArrowLeftIcon className="w-5 h-5" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
