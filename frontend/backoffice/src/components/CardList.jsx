"use client";

import React from "react";

export default function CardList({
  children,
  emptyMessage = "Aucun élément trouvé.",
}) {
  return (
    <div className="overflow-hidden bg-white shadow-sm sm:rounded-md">
      {React.Children.count(children) === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <ul role="list" className="divide-y divide-gray-200">
          {children}
        </ul>
      )}
    </div>
  );
}
