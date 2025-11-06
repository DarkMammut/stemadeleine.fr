"use client";

import React from "react";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

export default function Card({ onClick, children, className = "" }) {
  return (
    <li
      className={`px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors cursor-pointer ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">{children}</div>
        <ChevronRightIcon className="h-5 w-5 text-gray-400 flex-shrink-0 ml-4" />
      </div>
    </li>
  );
}
