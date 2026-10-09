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
    labelKey: "navigation.dashboard",
    icon: <HomeIcon className="w-5 h-5" />,
    url: "/dashboard",
    key: "dashboard",
  },
  {
    labelKey: "navigation.website",
    icon: <DocumentTextIcon className="w-5 h-5" />,
    url: "/pages",
    key: "website",
  },
  {
    labelKey: "navigation.news",
    icon: <NewspaperIcon className="w-5 h-5" />,
    url: "/news",
    key: "news",
  },
  {
    labelKey: "navigation.newsletters",
    icon: <EnvelopeIcon className="w-5 h-5" />,
    url: "/newsletters",
    key: "newsletters",
  },
  {
    labelKey: "navigation.contacts",
    icon: <InboxIcon className="w-5 h-5" />,
    url: "/contacts",
    key: "contacts",
  },
  {
    labelKey: "navigation.users",
    icon: <UserGroupIcon className="w-5 h-5" />,
    url: "/users",
    key: "users",
  },
  {
    labelKey: "navigation.payments",
    icon: <CreditCardIcon className="w-5 h-5" />,
    url: "/payments",
    key: "payments",
  },
  {
    labelKey: "navigation.settings",
    icon: <Cog6ToothIcon className="w-5 h-5" />,
    url: "/settings",
    key: "settings",
  },
];

export default NAV_ITEMS;
