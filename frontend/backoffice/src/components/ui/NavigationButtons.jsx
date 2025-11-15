"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

export default function NavigationButtons({
  onPrevious,
  onNext,
  hasPrevious = true,
  hasNext = true,
  previousLabel = "Précédent",
  nextLabel = "Suivant",
}) {
  return (
    <div className="flex items-center justify-center gap-3 py-4 border-t border-gray-200">
      <button
        onClick={onPrevious}
        disabled={!hasPrevious}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
      >
        <ChevronLeftIcon className="w-4 h-4" />
        <span>{previousLabel}</span>
      </button>

      <button
        onClick={onNext}
        disabled={!hasNext}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
      >
        <span>{nextLabel}</span>
        <ChevronRightIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
