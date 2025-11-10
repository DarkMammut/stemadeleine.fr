"use client";

import React from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { ChevronRightIcon, DocumentTextIcon } from "@heroicons/react/16/solid";
import { useBreadcrumbData } from "@/hooks/useBreadcrumbData";

export default function NavigationStepper() {
  const pathname = usePathname();
  const params = useParams();

  const { pageId, sectionId, moduleId } = params;
  const { page, section, module, loading, error } = useBreadcrumbData({
    pageId,
    sectionId,
    moduleId,
  });

  // Ne pas afficher le stepper sur la page d'accueil ou les pages sans context
  if (
    pathname === "/" ||
    pathname === "/pages" ||
    (!pageId && !sectionId && !moduleId)
  ) {
    return null;
  }

  const buildBreadcrumbs = () => {
    const breadcrumbs = [
      {
        name: "Website",
        href: "/pages",
        icon: DocumentTextIcon,
        current: false,
      },
    ];

    // Ajouter la page si elle existe
    if (page) {
      breadcrumbs.push({
        name: page.name || "Page sans nom",
        href: `/pages/${pageId}`,
        current: !sectionId && !moduleId,
      });

      // Ajouter "Sections" si on est dans les sections
      if (sectionId || pathname.includes("/sections")) {
        breadcrumbs.push({
          name: "Sections",
          href: `/pages/${pageId}/sections`,
          current: !sectionId,
        });
      }
    }

    // Ajouter la section si elle existe
    if (section) {
      breadcrumbs.push({
        name: section.name || "Section sans nom",
        href: `/pages/${pageId}/sections/${sectionId}`,
        current: !moduleId,
      });
    }

    // Ajouter le module si il existe
    if (module) {
      breadcrumbs.push({
        name: module.name || "Module sans nom",
        href: `/pages/${pageId}/sections/${sectionId}/modules/${moduleId}`,
        current: true,
      });
    }

    return breadcrumbs;
  };

  if (loading) {
    return (
      <nav className="flex mb-4" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          <li className="flex items-center">
            <div className="h-4 w-20 bg-gray-200 animate-pulse rounded"></div>
          </li>
        </ol>
      </nav>
    );
  }

  if (error) {
    return (
      <nav className="flex mb-4" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          <li className="text-red-500 text-sm">
            Erreur de navigation: {error}
          </li>
        </ol>
      </nav>
    );
  }

  const breadcrumbs = buildBreadcrumbs();

  return (
    <nav className="flex mb-6" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbs.map((breadcrumb, index) => (
          <li
            key={`breadcrumb-${index}-${breadcrumb.href}`}
            className="flex items-center"
          >
            {index > 0 && (
              <ChevronRightIcon className="h-4 w-4 text-gray-400 mx-2" />
            )}
            {breadcrumb.current ? (
              <span className="flex items-center text-sm font-medium text-gray-900">
                {breadcrumb.icon && (
                  <breadcrumb.icon className="h-4 w-4 mr-1" />
                )}
                {breadcrumb.name}
              </span>
            ) : (
              <Link
                href={breadcrumb.href}
                className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                {breadcrumb.icon && (
                  <breadcrumb.icon className="h-4 w-4 mr-1" />
                )}
                {breadcrumb.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
