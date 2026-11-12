"use client";

import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/i18n/I18nContext";

export default function Breadcrumbs({ items = [], className = "" }) {
  const router = useRouter();
  const { t } = useTranslation();

  if (!items.length) return null;

  return (
    <nav aria-label={t("breadcrumbs.ariaLabel")} className={className}>
      <ol role="list" className="flex items-center space-x-4">
        {items.map((item, index) => {
          const isFirst = index === 0;
          const isCurrent = item.current || index === items.length - 1;

          const content = (
            <div className="flex items-center">
              {item.icon && (
                <item.icon
                  aria-hidden="true"
                  className="h-5 w-5 shrink-0 text-gray-400 mr-2"
                />
              )}

              {isCurrent ? (
                <span
                  aria-current="page"
                  className="text-sm font-medium text-gray-500"
                >
                  {item.name}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (item.href) {
                      router.push(item.href);
                    }
                  }}
                  disabled={!item.href}
                  className="text-sm font-medium text-gray-500 hover:text-gray-700 disabled:cursor-default cursor-pointer"
                >
                  {item.name}
                </button>
              )}
            </div>
          );

          return (
            <li key={item.href ?? `${item.name}-${index}`}>
              {isFirst ? (
                content
              ) : (
                <div className="flex items-center">
                  <ChevronRightIcon
                    aria-hidden="true"
                    className="h-5 w-5 shrink-0 text-gray-400"
                  />
                  <div className="ml-4">{content}</div>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
