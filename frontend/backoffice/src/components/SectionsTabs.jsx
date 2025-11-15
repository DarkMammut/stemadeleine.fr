"use client";
import { usePathname } from "next/navigation";
import React, { useMemo } from "react";
import Tabs from "@/components/ui/Tabs";

export default function SectionsTabs({ pageId, sectionId }) {
  const pathname = usePathname();

  const tabs = useMemo(
    () => [
      {
        label: "Informations",
        url: `/pages/${pageId}/sections/${sectionId}`,
      },
      {
        label: "Contenus",
        url: `/pages/${pageId}/sections/${sectionId}/modules`,
      },
    ],
    [pageId, sectionId],
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
