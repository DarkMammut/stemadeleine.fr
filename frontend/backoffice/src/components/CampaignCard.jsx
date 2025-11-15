"use client";

import React from "react";
import Card from "@/components/ui/Card";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import Currency from "@/components/ui/Currency";

export default function CampaignCard({ campaign, onClick }) {
  const getStatusColor = (state) => {
    switch (state) {
      case "Public":
        return "bg-green-50 text-green-700 border-green-200";
      case "Private":
        return "bg-orange-50 text-orange-700 border-orange-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  return (
    <Card onClick={onClick}>
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 mt-1">
          <BanknotesIcon className="h-6 w-6 text-gray-400" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-base font-medium text-gray-900 line-clamp-2">
              {campaign.title}
            </h3>
            <span
              className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(campaign.state)}`}
            >
              {campaign.state}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Montant collecté</span>
              <span className="text-sm font-medium text-gray-900">
                <Currency
                  value={campaign.collectedAmount}
                  currency={campaign.currency}
                />
              </span>
            </div>

            {campaign.url && (
              <div className="text-xs text-blue-600 truncate">
                Ouvrir la campagne →
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
