"use client";
import { useRouter } from "next/navigation";
import {
  Cog6ToothIcon,
  CreditCardIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  HomeIcon,
  InboxIcon,
  NewspaperIcon,
  UserCircleIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { useContactsContext } from "@/contexts/ContactsContext";

export default function Sidebar({ current, setCurrent }) {
  const router = useRouter();
  const { unreadCount } = useContactsContext();
  const items = [
    {
      label: "Dashboard",
      icon: <HomeIcon className="w-5 h-5" />,
      url: "/dashboard",
      key: "dashboard",
    },
    {
      label: "Website",
      icon: <DocumentTextIcon className="w-5 h-5" />,
      url: "/pages",
      key: "website",
    },
    {
      label: "Actualités",
      icon: <NewspaperIcon className="w-5 h-5" />,
      url: "/news",
      key: "news",
    },
    {
      label: "Newsletters",
      icon: <EnvelopeIcon className="w-5 h-5" />,
      url: "/newsletters",
      key: "newsletters",
    },
    {
      label: "Demandes",
      icon: <InboxIcon className="w-5 h-5" />,
      url: "/contacts",
      key: "contacts",
    },
    {
      label: "Adhérents",
      icon: <UserGroupIcon className="w-5 h-5" />,
      url: "/users",
      key: "users",
    },
    {
      label: "Paiements",
      icon: <CreditCardIcon className="w-5 h-5" />,
      url: "/payments",
      key: "payments",
    },
    {
      label: "Settings",
      icon: <Cog6ToothIcon className="w-5 h-5" />,
      url: "/settings",
      key: "settings",
    },
    {
      label: "Profil",
      icon: <UserCircleIcon className="w-5 h-5" />,
      url: "/profile",
      key: "profile",
    },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white h-screen">
      <nav className="flex flex-col p-4 space-y-2">
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => {
              router.push(item.url);
              setCurrent(item.key);
            }}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer ${
              current === item.key ? "bg-gray-700" : "hover:bg-gray-800"
            }`}
          >
            {item.icon}
            <span className="flex-1 text-left">{item.label}</span>
            {item.key === "contacts" && unreadCount > 0 && (
              <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </nav>
    </aside>
  );
}
