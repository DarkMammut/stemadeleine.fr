"use client";
import { usePathname, useRouter } from "next/navigation";
import React, { useMemo } from "react";

export default function PagesTabs({ pageId }) {
  const router = useRouter();

  const tabs = useMemo(
    () => [
      { label: "Basics", url: `/pages/${pageId}` },
      { label: "Content", url: `/pages/${pageId}/content` },
    ],
    [pageId],
  );

  const pathname = usePathname();
  const activeIndex =
    tabs.findIndex((tab) => pathname.startsWith(tab.url)) || 0;

  const handleTabClick = (url) => {
    router.push(url);
  };

  return (
    <div>
      <div className="flex border-b border-gray-200">
        {tabs.map((tab, idx) => (
          <button
            key={idx}
            className={`px-4 py-2 -mb-px font-medium border-b-2 ${
              idx === activeIndex
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
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
