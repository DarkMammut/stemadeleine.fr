"use client";
import {usePathname, useRouter} from "next/navigation";
import React, {useMemo} from "react";

export default function PagesTabs({pageId}) {
    const router = useRouter();

    const tabs = useMemo(
        () => [
            {label: "Informations", url: `/pages/${pageId}`},
            {label: "Contenu", url: `/pages/${pageId}/sections`},
        ],
        [pageId],
    );

    const pathname = usePathname();

    // Correction de la logique pour l'onglet actif
    const getActiveIndex = () => {
        // Vérifier d'abord une correspondance exacte
        const exactMatch = tabs.findIndex((tab) => pathname === tab.url);
        if (exactMatch !== -1) return exactMatch;

        // Ensuite vérifier si le pathname commence par l'URL de l'onglet
        const partialMatch = tabs.findIndex((tab) => pathname.startsWith(tab.url));
        return partialMatch !== -1 ? partialMatch : 0;
    };

    const activeIndex = getActiveIndex();

    const handleTabClick = (url) => {
        router.push(url);
    };

    return (
        <div className="w-full mb-4">
            <div className="flex bg-slate-200 rounded-lg p-1 shadow-inner border border-gray-300">
                {tabs.map((tab, idx) => (
                    <button
                        key={idx}
                        className={`flex-1 px-4 py-2 rounded-md font-medium text-sm transition-all duration-300 cursor-pointer ${
                            idx === activeIndex
                                ? "bg-blue-600 text-white shadow-md"
                                : "bg-white text-gray-700 hover:text-blue-600 hover:bg-blue-50 shadow-sm border border-gray-200"
                        }`}
                        onClick={() => handleTabClick(tab.url)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
