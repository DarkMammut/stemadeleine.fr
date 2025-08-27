// GenericTabs
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function Tabs({ tabs, defaultIndex = 0 }) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);
  const router = useRouter();

  const handleTabClick = (tab, idx) => {
    setActiveIndex(idx);
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
