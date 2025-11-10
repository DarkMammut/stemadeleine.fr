// GenericTabs
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function Tabs({ tabs, defaultIndex = 0, persistKey }) {
  const [activeIndex, setActiveIndex] = useState(() => {
    // Si persistKey est fourni, récupérer l'onglet actif depuis sessionStorage
    if (persistKey && typeof window !== "undefined") {
      const savedTab = sessionStorage.getItem(persistKey);
      return savedTab ? parseInt(savedTab, 10) : defaultIndex;
    }
    return defaultIndex;
  });
  const router = useRouter();

  const handleTabClick = (tab, idx) => {
    setActiveIndex(idx);

    // Sauvegarder l'onglet actif si persistKey est fourni
    if (persistKey && typeof window !== "undefined") {
      sessionStorage.setItem(persistKey, idx.toString());
    }

    if (tab.url) {
      router.push(tab.url);
    }
  };

  return (
    <div>
      <div className="flex border-b border-gray-200">
        {tabs.map((tab, idx) => (
          <button
            key={idx}
            className={`px-4 py-2 -mb-px font-medium border-b-2 cursor-pointer ${
              idx === activeIndex
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => handleTabClick(tab, idx)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4">{tabs[activeIndex].content}</div>
    </div>
  );
}
