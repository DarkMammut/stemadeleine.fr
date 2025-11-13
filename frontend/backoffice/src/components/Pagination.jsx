import React from "react";

export default function Pagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null;

  const handlePrev = () => onChange(Math.max(0, page - 1));
  const handleNext = () => onChange(Math.min(totalPages - 1, page + 1));

  const pages = [];
  const start = Math.max(0, page - 2);
  const end = Math.min(totalPages - 1, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center justify-center space-x-2 py-4">
      <button
        className="px-3 py-1 rounded border"
        onClick={handlePrev}
        disabled={page === 0}
      >
        Prev
      </button>

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`px-3 py-1 rounded border ${p === page ? "bg-gray-200" : ""}`}
        >
          {p + 1}
        </button>
      ))}

      <button
        className="px-3 py-1 rounded border"
        onClick={handleNext}
        disabled={page === totalPages - 1}
      >
        Next
      </button>
    </div>
  );
}
