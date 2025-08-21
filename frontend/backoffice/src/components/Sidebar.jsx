"use client";
import { useRouter } from "next/navigation";
import {
  Cog6ToothIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  HomeIcon,
  InboxIcon,
  NewspaperIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

export default function Sidebar({ current, setCurrent }) {
  const router = useRouter();
  const items = [
    {
      label: "Dashboard",
      icon: <HomeIcon className="w-5 h-5" />,
      url: "/dashboard",
      key: "dashboard",
    },
    {
      label: "Pages",
      icon: <DocumentTextIcon className="w-5 h-5" />,
      url: "/pages",
      key: "pages",
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
            className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              current === item.key ? "bg-gray-700" : "hover:bg-gray-800"
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
