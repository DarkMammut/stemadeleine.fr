"use client";

import React from "react";
import Card from "@/components/ui/Card";
import Currency from "@/components/ui/Currency";
import {
  BanknotesIcon,
  CreditCardIcon,
  HeartIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

export default function KpiCards({
  kpis = {},
  containerClass = "",
  cardClass = "",
}) {
  const {
    loading = true,
    activeMembers = 0,
    membershipAmount = 0,
    donorsCount = 0,
    donationsAmount = 0,
  } = kpis || {};

  return (
    <div className={`grid grid-cols-2 gap-4 ${containerClass}`}>
      <Card
        as="div"
        className={`rounded-2xl shadow-md bg-blue-100 p-4 ${cardClass}`}
      >
        <div className="flex flex-col items-center text-center gap-2">
          <div className="rounded-full bg-blue-200 p-3">
            <UsersIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-sm text-gray-500">Adhérents actifs</div>
          <div className="text-2xl font-semibold text-gray-900">
            {loading ? "—" : activeMembers}
          </div>
        </div>
      </Card>

      <Card
        as="div"
        className={`rounded-2xl shadow-md bg-green-100 p-4 ${cardClass}`}
      >
        <div className="flex flex-col items-center text-center gap-2">
          <div className="rounded-full bg-green-200 p-3">
            <CreditCardIcon className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-sm text-gray-500">Montant adhésions</div>
          <div className="text-2xl font-semibold text-gray-900">
            {loading ? (
              "—"
            ) : (
              <Currency value={membershipAmount} currency="EUR" />
            )}
          </div>
        </div>
      </Card>

      <Card
        as="div"
        className={`rounded-2xl shadow-md bg-red-100 p-4 ${cardClass}`}
      >
        <div className="flex flex-col items-center text-center gap-2">
          <div className="rounded-full bg-red-200 p-3">
            <HeartIcon className="w-6 h-6 text-red-600" />
          </div>
          <div className="text-sm text-gray-500">Donateurs</div>
          <div className="text-2xl font-semibold text-gray-900">
            {loading ? "—" : donorsCount}
          </div>
        </div>
      </Card>

      <Card
        as="div"
        className={`rounded-2xl shadow-md bg-yellow-100 p-4 ${cardClass}`}
      >
        <div className="flex flex-col items-center text-center gap-2">
          <div className="rounded-full bg-yellow-200 p-3">
            <BanknotesIcon className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="text-sm text-gray-500">Montant dons</div>
          <div className="text-2xl font-semibold text-gray-900">
            {loading ? (
              "—"
            ) : (
              <Currency value={donationsAmount} currency="EUR" />
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
