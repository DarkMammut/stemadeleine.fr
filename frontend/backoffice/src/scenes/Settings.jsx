"use client";

import React from "react";
import SceneLayout from "@/components/ui/SceneLayout";
import Title from "@/components/ui/Title";
import Link from "next/link";

export default function Settings() {
  const items = [
    { href: "/settings/organization", label: "Organisation" },
    { href: "/settings/site", label: "Paramètres du site" },
    { href: "/settings/accounts", label: "Comptes" },
  ];

  return (
    <SceneLayout>
      <Title label="Paramètres" />

      <div className="space-y-6">
        <p className="text-gray-600">Choisissez une section des paramètres :</p>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((it) => (
            <li key={it.href}>
              <Link
                href={it.href}
                className="block p-4 bg-white shadow-sm rounded-md hover:shadow-md border border-gray-100"
              >
                <div className="text-lg font-medium text-gray-900">
                  {it.label}
                </div>
                <div className="text-sm text-gray-500">Voir et modifier</div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </SceneLayout>
  );
}
