// Shared navigation items for Sidebar and mobile menu
import {
  Cog6ToothIcon,
  CreditCardIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  HomeIcon,
  InboxIcon,
  NewspaperIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

export const NAV_ITEMS = [
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
    label: "Paramètres",
    icon: <Cog6ToothIcon className="w-5 h-5" />,
    url: "/settings",
    key: "settings",
  },
];

export default NAV_ITEMS;
