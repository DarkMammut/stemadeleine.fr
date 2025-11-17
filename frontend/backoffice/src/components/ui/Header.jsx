"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { Dialog, Menu, Transition } from "@headlessui/react";
import { BellIcon, Cog6ToothIcon, UserIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

import useLogout from "@/utils/auth/useLogout";
import NAV_ITEMS from "@/utils/navigation";

import SearchBar from "@/components/ui/SearchBar";

export default function Header() {
  const [hoverOpen, setHoverOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { signout, loading } = useLogout();
  const router = useRouter();
  // helper to fetch suggestions for global search in header
  const fetchSuggestions = async (q) => {
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) return [];
      const data = await res.json();
      // normalize into a flat list of suggestions
      let suggestions = [];
      // example backend shape: { users: [...], payments: [...], articles: [...] }
      if (data.users && Array.isArray(data.users)) {
        data.users.slice(0, 6).forEach((u) =>
          suggestions.push({
            id: `user-${u.id}`,
            title: u.title || u.name || u.displayName || u.email,
            subtitle: u.subtitle || u.email,
            url: u.url || `/users/${u.id}`,
            type: u.type || "Utilisateur",
            kind: u.kind || "user",
          }),
        );
      }
      if (data.payments && Array.isArray(data.payments)) {
        data.payments.slice(0, 6).forEach((p) =>
          suggestions.push({
            id: `payment-${p.id}`,
            title: p.title || p.reference || p.id,
            subtitle: p.subtitle || (p.amount ? `${p.amount} €` : undefined),
            url: p.url || `/payments/${p.id}`,
            type: p.type || "Compte",
            kind: p.kind || "payment",
          }),
        );
      }
      if (data.articles && Array.isArray(data.articles)) {
        data.articles.slice(0, 6).forEach((a) =>
          suggestions.push({
            id: `article-${a.id}`,
            title: a.title || a.name,
            subtitle: a.subtitle || a.excerpt || undefined,
            url: a.url || `/news/${a.id}`,
            type: a.type || "Article",
            kind: a.kind || "article",
          }),
        );
      }
      if (data.news && Array.isArray(data.news)) {
        data.news.slice(0, 6).forEach((n) =>
          suggestions.push({
            id: `news-${n.id}`,
            title: n.title || n.name,
            subtitle: n.subtitle || undefined,
            url: n.url || `/news/${n.id}`,
            type: n.type || "News",
            kind: n.kind || "news",
          }),
        );
      }
      if (data.sections && Array.isArray(data.sections)) {
        data.sections.slice(0, 6).forEach((s) =>
          suggestions.push({
            id: `section-${s.id}`,
            title: s.title || s.name,
            subtitle: s.subtitle || undefined,
            url:
              s.url ||
              (s.pageId
                ? `/pages/${s.pageId}#section-${s.sectionId}`
                : undefined),
            type: s.type || "Section",
            kind: s.kind || "section",
          }),
        );
      }
      if (data.pages && Array.isArray(data.pages)) {
        data.pages.slice(0, 6).forEach((p) =>
          suggestions.push({
            id: `page-${p.id}`,
            title: p.title || p.name || p.slug,
            subtitle: p.subtitle || p.slug || undefined,
            url: p.url || `/pages/${p.id}`,
            type: p.type || "Page",
            kind: p.kind || "page",
          }),
        );
      }
      if (data.modules && Array.isArray(data.modules)) {
        data.modules.slice(0, 6).forEach((m) =>
          suggestions.push({
            id: `module-${m.id}`,
            title: m.title || m.name,
            subtitle: m.subtitle || m.type || undefined,
            url: m.url || `/modules/${m.id}`,
            type: m.type || "Module",
            kind: m.kind || "module",
          }),
        );
      }
      if (data.contacts && Array.isArray(data.contacts)) {
        data.contacts.slice(0, 6).forEach((c) =>
          suggestions.push({
            id: `contact-${c.id}`,
            title: c.title || `${c.firstName || ""} ${c.lastName || ""}`.trim(),
            subtitle: c.subtitle || c.email || undefined,
            url: c.url || `/contacts/${c.id}`,
            type: c.type || "Contact",
            kind: c.kind || "contact",
          }),
        );
      }
      if (data.newsletters && Array.isArray(data.newsletters)) {
        data.newsletters.slice(0, 6).forEach((n) =>
          suggestions.push({
            id: `newsletter-${n.id}`,
            title: n.title || n.name,
            subtitle: n.subtitle || undefined,
            url: n.url || `/newsletters/${n.id}`,
            type: n.type || "Newsletter",
            kind: n.kind || "newsletter",
          }),
        );
      }
      // fallback: if backend returns an array
      if (Array.isArray(data) && suggestions.length === 0) {
        suggestions = data.map((it, i) => ({
          id: it.id ?? i,
          title: it.title || it.name || it.label,
          subtitle: it.subtitle,
          url: it.url,
          type: it.type,
        }));
      }
      return suggestions;
    } catch (e) {
      return [];
    }
  };

  const handleSelect = (item) => {
    if (!item) return;

    // if backend provides a direct url, use it
    if (item.url) {
      router.push(item.url);
      return;
    }

    const k = String(item.kind || item.type || "").toLowerCase();
    let target = null;

    if (
      (k.includes("user") || k.includes("utilisateur") || k === "user") &&
      item.id
    ) {
      const id = String(item.id).replace(/^user-/, "");
      target = `/users/${id}`;
    } else if (
      (k.includes("payment") || k.includes("compte") || k === "payment") &&
      item.id
    ) {
      const id = String(item.id).replace(/^payment-/, "");
      target = `/payments/${id}`;
    } else if (
      (k.includes("article") ||
        k.includes("news") ||
        k === "article" ||
        k === "news") &&
      item.id
    ) {
      target = `/news/${item.id}`;
    } else if ((k.includes("page") || k === "page") && item.id) {
      target = `/pages/${item.id}`;
    } else if ((k.includes("module") || k === "module") && item.id) {
      target = `/modules/${item.id}`;
    } else if ((k.includes("contact") || k === "contact") && item.id) {
      target = `/contacts/${item.id}`;
    } else if ((k.includes("newsletter") || k === "newsletter") && item.id) {
      target = `/newsletters/${item.id}`;
    }

    if (target) router.push(target);
  };

  const containerRef = useRef(null);
  const menuButtonRef = useRef(null);
  const leaveTimerRef = useRef(null);

  const handleSignOut = async () => {
    const result = await signout();
    setHoverOpen(false);
    return result;
  };

  useEffect(() => {
    const onOutside = (e) => {
      if (!containerRef.current) return;
      if (containerRef.current.contains(e.target)) return;
      setHoverOpen(false);
    };

    const onKey = (e) => {
      if (e.key === "Escape") setHoverOpen(false);
    };

    document.addEventListener("mousedown", onOutside);
    document.addEventListener("touchstart", onOutside);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("touchstart", onOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // focus management: focus first actionable item when opened, restore focus to avatar when closed
  useEffect(() => {
    if (hoverOpen) {
      // clear any pending close timer
      if (leaveTimerRef.current) {
        clearTimeout(leaveTimerRef.current);
        leaveTimerRef.current = null;
      }
      // focus first button inside the menu
      const first = containerRef.current?.querySelector(
        '[role="menu"] button:not([disabled])',
      );
      first?.focus();
    } else {
      // restore focus to menu button when menu closes
      menuButtonRef.current?.focus();
    }
  }, [hoverOpen]);

  const handleMouseEnter = () => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    setHoverOpen(true);
  };

  const handleMouseLeave = () => {
    // small delay to avoid flicker when moving between avatar and menu
    leaveTimerRef.current = setTimeout(() => {
      setHoverOpen(false);
      leaveTimerRef.current = null;
    }, 150);
  };

  const mobileItems = NAV_ITEMS;

  // prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-gray-900 shadow-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex justify-between items-center h-14">
          {/* Mobile burger - visible on small screens */}
          <div className="md:hidden flex items-center">
            <button
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              onClick={() => setMobileOpen((s) => !s)}
              className="p-2 rounded-md text-white hover:bg-gray-700"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          {/* Title - hidden on mobile */}
          <div className="hidden md:flex flex-shrink-0 mr-4">
            <div className="text-white font-semibold leading-tight text-xs md:text-sm">
              <span className="block">Les Amis de Sainte</span>
              <span className="block">Madeleine de la Jarrie</span>
            </div>
          </div>
          <div className="min-w-0 flex-1 md:px-8 lg:px-0">
            <div className="flex items-center px-6 py-3.5 md:mx-auto md:max-w-3xl lg:mx-0 lg:max-w-none">
              {/* SearchBar in header: provide fetchSuggestions and onSelect for global search */}
              <SearchBar
                placeholder="Rechercher..."
                fetchSuggestions={fetchSuggestions}
                onSelect={handleSelect}
                onSubmit={(q) =>
                  router.push(`/search?q=${encodeURIComponent(q)}`)
                }
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="relative rounded-full p-1 text-gray-400 hover:text-gray-500 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-600 cursor-pointer"
            >
              <span className="sr-only">View notifications</span>
              <BellIcon aria-hidden="true" className="w-6 h-6" />
            </button>

            <Menu
              as="div"
              className="relative"
              ref={containerRef}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <Menu.Button
                as="button"
                type="button"
                ref={menuButtonRef}
                onClick={() => {
                  router.push("/profile");
                  setHoverOpen(false);
                }}
                className="relative flex rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 cursor-pointer"
                aria-expanded={hoverOpen}
              >
                <span className="sr-only">Open user menu</span>
                {/* remplaced the avatar image with the UserIcon and a subtle circular bg */}
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-white" />
                </div>
              </Menu.Button>

              <Transition
                as={Fragment}
                show={hoverOpen}
                enter="transition ease-out duration-150"
                enterFrom="transform opacity-0 -translate-y-2"
                enterTo="transform opacity-100 translate-y-0"
                leave="transition ease-in duration-100"
                leaveFrom="transform opacity-100 translate-y-0"
                leaveTo="transform opacity-0 -translate-y-2"
              >
                <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg outline-1 outline-black/5 ring-1 ring-black/5">
                  <Menu.Item>
                    {() => (
                      <button
                        onClick={() => {
                          router.push("/profile");
                          setHoverOpen(false);
                        }}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <UserIcon className="w-5 h-5 mr-3 text-gray-500" />
                        Your Profile
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {() => (
                      <button
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          router.push("/settings");
                          setHoverOpen(false);
                        }}
                      >
                        <Cog6ToothIcon className="w-5 h-5 mr-3 text-gray-500" />
                        Settings
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {() => (
                      <button
                        type="button"
                        onClick={handleSignOut}
                        disabled={loading}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-5 h-5 mr-3 text-gray-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12H3m0 0l3-3m-3 3l3 3M21 12v6a2 2 0 01-2 2H13"
                          />
                        </svg>
                        {loading ? "Signing out..." : "Sign out"}
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>

      {/* Mobile overlay navigation */}
      <Transition show={mobileOpen} as={Fragment} appear>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 md:hidden"
          onClose={setMobileOpen}
          aria-modal={true}
        >
          <div
            className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm"
            aria-hidden="true"
          />

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in duration-200 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel
                id="mobile-menu"
                className="relative w-full bg-gray-900 bg-opacity-95 p-6 backdrop-blur-sm overflow-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title className="text-white font-semibold leading-tight text-sm">
                    <span className="block">Les Amis de Sainte</span>
                    <span className="block">Madeleine de la Jarrie</span>
                  </Dialog.Title>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="p-2 rounded-md text-white hover:bg-gray-800"
                    aria-label="Close menu"
                  >
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <nav className="flex flex-col space-y-3">
                  {mobileItems.map((it) => (
                    <button
                      key={it.key}
                      onClick={() => {
                        router.push(it.url);
                        setMobileOpen(false);
                      }}
                      className="text-left px-4 py-3 rounded-md hover:bg-gray-800 text-white"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-gray-300">{it.icon}</span>
                        <span className="text-white">{it.label}</span>
                      </div>
                    </button>
                  ))}
                </nav>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </header>
  );
}
