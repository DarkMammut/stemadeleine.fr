import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import Select from "@/components/ui/Select";

export default function Pagination({
  page,
  totalPages,
  onChange,
  pageSize,
  onPageSizeChange,
  totalElements,
}) {
  if (!totalPages || totalPages <= 1) return null;

  const handlePrev = () => onChange(Math.max(0, page - 1));
  const handleNext = () => onChange(Math.min(totalPages - 1, page + 1));

  const pages = [];
  const start = Math.max(0, page - 2);
  const end = Math.min(totalPages - 1, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  const safePageSize = pageSize || 10;
  const showingFrom = page * safePageSize + 1;
  const showingTo = Math.min(
    totalElements || totalPages * safePageSize,
    (page + 1) * safePageSize,
  );

  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      {/* Mobile: simple previous / next */}
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          type="button"
          onClick={handlePrev}
          disabled={page === 0}
          className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
            page === 0
              ? "text-gray-400 cursor-not-allowed"
              : "text-gray-700 hover:bg-gray-50 cursor-pointer"
          }`}
        >
          Previous
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={page === totalPages - 1}
          className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
            page === totalPages - 1
              ? "text-gray-400 cursor-not-allowed"
              : "text-gray-700 hover:bg-gray-50 cursor-pointer"
          }`}
        >
          Next
        </button>
      </div>

      {/* Desktop: full pagination */}
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between w-full">
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{showingFrom}</span> to{" "}
            <span className="font-medium">{showingTo}</span> of{" "}
            <span className="font-medium">
              {totalElements ?? totalPages * safePageSize}
            </span>{" "}
            results
          </p>
        </div>

        <div>
          <nav
            aria-label="Pagination"
            className="isolate inline-flex -space-x-px rounded-md shadow-sm"
          >
            <button
              type="button"
              onClick={handlePrev}
              disabled={page === 0}
              className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 bg-white focus:z-20 focus:outline-offset-0 ${
                page === 0
                  ? "cursor-not-allowed"
                  : "hover:bg-gray-50 cursor-pointer"
              }`}
            >
              <span className="sr-only">Previous</span>
              <ChevronLeftIcon aria-hidden="true" className="h-5 w-5" />
            </button>

            {pages[0] > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => onChange(0)}
                  className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 bg-white hover:bg-gray-50 focus:z-20 focus:outline-offset-0 cursor-pointer"
                >
                  1
                </button>
                {pages[0] > 1 && (
                  <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700">
                    ...
                  </span>
                )}
              </>
            )}

            {pages.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onChange(p)}
                aria-current={p === page ? "page" : undefined}
                className={
                  p === page
                    ? "relative z-10 inline-flex items-center bg-indigo-600 px-4 py-2 text-sm font-semibold text-white cursor-default"
                    : "relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 bg-white hover:bg-gray-50 focus:z-20 focus:outline-offset-0 cursor-pointer"
                }
              >
                {p + 1}
              </button>
            ))}

            {pages[pages.length - 1] < totalPages - 1 && (
              <>
                {pages[pages.length - 1] < totalPages - 2 && (
                  <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700">
                    ...
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => onChange(totalPages - 1)}
                  className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 bg-white hover:bg-gray-50 focus:z-20 focus:outline-offset-0 cursor-pointer"
                >
                  {totalPages}
                </button>
              </>
            )}

            <button
              type="button"
              onClick={handleNext}
              disabled={page === totalPages - 1}
              className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 bg-white focus:z-20 focus:outline-offset-0 ${
                page === totalPages - 1
                  ? "cursor-not-allowed"
                  : "hover:bg-gray-50 cursor-pointer"
              }`}
            >
              <span className="sr-only">Next</span>
              <ChevronRightIcon aria-hidden="true" className="h-5 w-5" />
            </button>
          </nav>
        </div>

        <div className="ml-4 flex items-center space-x-2">
          {onPageSizeChange && (
            <Select
              value={pageSize}
              onValueChange={(v) => onPageSizeChange(Number(v))}
              options={[
                { value: 10, label: "10 / page" },
                { value: 20, label: "20 / page" },
                { value: 50, label: "50 / page" },
              ]}
              className="border border-gray-300 bg-white px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          )}
        </div>
      </div>
    </div>
  );
}
