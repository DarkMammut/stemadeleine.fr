// GenericTabs
"use client";
import React, { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function Tabs({ tabs, defaultIndex = 0, persistKey }) {
  // état interne utilisé quand les tabs n'ont pas d'URL
  const [stateIndex, setStateIndex] = useState(() => {
    if (persistKey && typeof window !== "undefined") {
      const saved = sessionStorage.getItem(persistKey);
      return saved ? parseInt(saved, 10) : defaultIndex;
    }
    return defaultIndex;
  });
  const router = useRouter();
  const pathname = usePathname();

  const hasUrls = Array.isArray(tabs) && tabs.some((t) => t && t.url);

  // si des URLs sont présentes, calculer l'index actif depuis le pathname
  const urlActiveIndex = useMemo(() => {
    if (!hasUrls || !pathname) return -1;
    // exact match
    const exact = tabs.findIndex((tab) => tab && tab.url === pathname);
    if (exact !== -1) return exact;
    // startsWith match
    const partial = tabs.findIndex(
      (tab) => tab && pathname.startsWith(tab.url),
    );
    return partial !== -1 ? partial : 0;
  }, [tabs, pathname, hasUrls]);

  const activeIndex = hasUrls ? urlActiveIndex : stateIndex;

  // Sécuriser l'index pour éviter les accès hors-bornes (=> tabs[undefined])
  const safeIndex =
    Array.isArray(tabs) && tabs.length > 0
      ? Math.max(0, Math.min(activeIndex, tabs.length - 1))
      : -1;

  const handleTabClick = (tab, idx) => {
    // si l'onglet a une URL, on navigue — l'activeIndex sera calculé depuis le pathname
    if (tab && tab.url) {
      router.push(tab.url);
      return;
    }

    // sinon on gère localement l'onglet actif
    setStateIndex(idx);
    if (persistKey && typeof window !== "undefined") {
      sessionStorage.setItem(persistKey, idx.toString());
    }
  };

  return (
    <div>
      <div className="flex border-b border-gray-200">
        {Array.isArray(tabs) &&
          tabs.map((tab, idx) => (
            <button
              key={idx}
              className={`px-4 py-2 -mb-px font-medium border-b-2 cursor-pointer ${
                idx === safeIndex
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => handleTabClick(tab, idx)}
            >
              {tab && tab.label}
            </button>
          ))}
      </div>
      <div className="mt-4">
        {/* Protection: tabs peut être undefined ou l'index actif hors bornes */}
        {safeIndex >= 0 && Array.isArray(tabs) && tabs[safeIndex] ? (
          tabs[safeIndex].content
        ) : (
          <div className="text-gray-500">Aucun onglet disponible.</div>
        )}
      </div>
    </div>
  );
}
