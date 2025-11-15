"use client";
import { usePathname } from "next/navigation";
import React, { useMemo } from "react";
import Tabs from "@/components/ui/Tabs";

export default function PagesTabs({ pageId }) {
  const pathname = usePathname();

  const tabs = useMemo(
    () => [
      { label: "Informations", url: `/pages/${pageId}` },
      { label: "Contenu", url: `/pages/${pageId}/sections` },
    ],
    [pageId],
  );

  // Déterminer l'onglet actif en fonction de l'URL
  const activeIndex = useMemo(() => {
    // Vérifier d'abord une correspondance exacte
    const exactMatch = tabs.findIndex((tab) => pathname === tab.url);
    if (exactMatch !== -1) return exactMatch;

    // Ensuite vérifier si le pathname commence par l'URL de l'onglet
    const partialMatch = tabs.findIndex((tab) => pathname.startsWith(tab.url));
    return partialMatch !== -1 ? partialMatch : 0;
  }, [pathname, tabs]);

  return <Tabs tabs={tabs} defaultIndex={activeIndex} />;
}
