"use client";

import React from "react";
import Card from "@/components/ui/Card";
import {
  EyeIcon,
  EyeSlashIcon,
  NewspaperIcon,
} from "@heroicons/react/24/outline";
import StatusTag from "@/components/ui/StatusTag";

export default function NewsCard({ news, onClick }) {
  const formatDate = (date) => {
    if (!date) return "Non renseignée";
    return new Date(date).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Card onClick={onClick}>
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 mt-1">
          <NewspaperIcon className="h-6 w-6 text-gray-400" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-medium text-gray-900">
              {news.title}
            </h3>
            <div className="flex items-center gap-2">
              {news.isVisible ? (
                <EyeIcon className="h-5 w-5 text-green-600" title="Visible" />
              ) : (
                <EyeSlashIcon
                  className="h-5 w-5 text-gray-400"
                  title="Masqué"
                />
              )}
            </div>
          </div>

          {news.description && (
            <p className="text-sm text-gray-500 mb-2 line-clamp-2">
              {news.description}
            </p>
          )}

          <div className="flex items-center gap-3 text-xs text-gray-500">
            <StatusTag status={news.status} />
            <span>Créée le: {formatDate(news.createdAt)}</span>
            {news.author && (
              <span>
                Par: {news.author.firstname} {news.author.lastname}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
