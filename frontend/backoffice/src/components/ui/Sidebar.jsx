"use client";
import { useRouter } from "next/navigation";
import { useContactsContext } from "@/contexts/ContactsContext";
import NAV_ITEMS from "../../utils/navigation";

export default function Sidebar({ current, setCurrent }) {
  const router = useRouter();
  const { unreadCount } = useContactsContext();
  const items = NAV_ITEMS;

  return (
    // Hidden on small screens, fixed under the header on md+
    <aside className="hidden md:block fixed top-14 left-0 w-64 h-[calc(100vh-3.5rem)] bg-gray-900 text-white">
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
