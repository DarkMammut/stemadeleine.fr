"use client";

import React from "react";
import SceneLayout from "@/components/ui/SceneLayout";
import Title from "@/components/ui/Title";
import BigButton from "@/components/ui/BigButton";
import { useRouter } from "next/navigation";
import {
  BuildingOffice2Icon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";

export default function Settings() {
  const router = useRouter();

  const tabs = [
    {
      label: "Organisation",
      icon: BuildingOffice2Icon,
      href: "/settings/organization",
      bg: "bg-blue-600",
      color: "white",
    },
    {
      label: "Site",
      icon: WrenchScrewdriverIcon,
      href: "/settings/site",
      bg: "bg-green-600",
      color: "white",
    },
    {
      label: "Comptes",
      icon: UserGroupIcon,
      href: "/settings/accounts",
      bg: "bg-orange-600", // shorthand -> bg-blue-300
      color: "white", // shorthand -> text-purple-600
    },
  ];

  return (
    <SceneLayout>
      <Title label="Paramètres" />

      <div className="space-y-6">
        <p className="sr-only text-gray-600">
          Choisissez une section des paramètres :
        </p>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tabs.map((tab) => (
            <li key={tab.href}>
              <BigButton
                label={tab.label}
                icon={tab.icon}
                onClick={() => router.push(tab.href)}
                bg={tab.bg}
                color={tab.color}
                className="w-full"
              />
            </li>
          ))}
        </ul>
      </div>
    </SceneLayout>
  );
}
